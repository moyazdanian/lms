<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\CertificateService;
use App\Services\QuizScoringService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Student-facing quiz endpoints. The correct answers NEVER leave the server
 * before an attempt is submitted — grading happens server-side only.
 */
class StudentQuizController extends Controller
{
    public function __construct(
        protected QuizScoringService $scoring,
        protected CertificateService $certificates,
    ) {}

    /**
     * Quiz meta + questions without correctness flags, for enrolled students.
     */
    public function show(Request $request, Course $course)
    {
        $user = $request->user();

        $this->authorizeAccess($user, $course);

        $quiz = Quiz::query()
            ->where('course_id', $course->id)
            ->where('is_active', true)
            ->first();

        if (!$quiz) {
            return response()->json(['quiz' => null]);
        }

        $questions = $quiz->questions()->with('options')->get();
        $bestAttempt = $quiz->bestAttemptFor($user->id);
        $attemptsUsed = $quiz->attemptsCountFor($user->id);
        $maxAttempts = $quiz->effectiveMaxAttempts();
        $hasPassed = $quiz->isPassedBy($user->id);

        return response()->json([
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'pass_mark' => (float) $quiz->effectivePassMark(),
                'max_attempts' => $maxAttempts,
                'attempts_used' => $attemptsUsed,
                'attempts_remaining' => $maxAttempts === null
                    ? null
                    : max(0, $maxAttempts - $attemptsUsed),
                'passed' => $hasPassed,
                // False once passed (and the certificate backing it is still
                // valid) — the frontend shows a results-only screen then.
                'can_attempt' => ! $hasPassed,
                'best_score' => $bestAttempt?->score ? (float) $bestAttempt->score : null,
                'questions_count' => $questions->count(),
                'total_points' => (int) $questions->sum(fn ($q) => max(1, (int) $q->points)),
                'questions' => $questions->map(fn ($question) => [
                    'id' => $question->id,
                    'question' => $question->question,
                    'points' => max(1, (int) $question->points),
                    'options' => $question->options->map(fn ($option) => [
                        'id' => $option->id,
                        'option_text' => $option->option_text,
                        // is_correct is intentionally omitted here.
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    /**
     * Submit an attempt: grade server-side, store the attempt, then trigger
     * certificate issuance (which no-ops when conditions are not met).
     */
    public function submit(Request $request, Course $course)
    {
        $user = $request->user();

        $this->authorizeAccess($user, $course);

        $quiz = Quiz::query()
            ->where('course_id', $course->id)
            ->where('is_active', true)
            ->firstOrFail();

        $data = $request->validate([
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.option_ids' => ['required', 'array'],
            'answers.*.option_ids.*' => ['integer'],
        ]);

        $result = $this->scoring->submitAttempt($quiz, $user->id, $data['answers']);

        // Passed the last requirement? Issue the certificate automatically.
        $certificate = $this->certificates->checkAndIssue($user->id, $course->id);

        return response()->json([
            'result' => $this->presentAttemptReview($quiz, $result['attempt']),
            'certificate' => $certificate ? $this->presentCertificate($certificate) : null,
        ]);
    }

    /**
     * Review of the user's best attempt — feeds the results-only screen
     * shown after passing (refresh-safe: it reads the stored attempt).
     */
    public function review(Request $request, Course $course)
    {
        $user = $request->user();

        $this->authorizeAccess($user, $course);

        $quiz = Quiz::query()
            ->where('course_id', $course->id)
            ->where('is_active', true)
            ->first();

        if (!$quiz) {
            return response()->json(['result' => null]);
        }

        $attempt = $quiz->bestAttemptFor($user->id);

        if (!$attempt || !$attempt->passed) {
            return response()->json(['result' => null]);
        }

        return response()->json([
            'result' => $this->presentAttemptReview($quiz, $attempt),
        ]);
    }

    /**
     * Full graded view of a stored attempt. Only ever exposed after the
     * attempt was submitted, so revealing the correct answers is safe.
     */
    protected function presentAttemptReview(Quiz $quiz, QuizAttempt $attempt): array
    {
        $gradedQuestions = collect($attempt->answers);

        $questionDetails = $quiz->questions()->with('options')->get()
            ->map(function ($question) use ($gradedQuestions) {
                $graded = $gradedQuestions->firstWhere('question_id', $question->id);

                return [
                    'question_id' => $question->id,
                    'question' => $question->question,
                    'explanation' => $question->explanation,
                    'selected_option_ids' => $graded['option_ids'] ?? [],
                    'correct_option_ids' => $question->options
                        ->filter(fn ($option) => $option->is_correct)
                        ->pluck('id')
                        ->values(),
                    'is_correct' => (bool) ($graded['is_correct'] ?? false),
                    'points' => max(1, (int) $question->points),
                    'earned_points' => (int) ($graded['earned_points'] ?? 0),
                    'options' => $question->options->map(fn ($option) => [
                        'id' => $option->id,
                        'option_text' => $option->option_text,
                        'is_correct' => (bool) $option->is_correct,
                    ])->values(),
                ];
            })->values();

        return [
            'score' => (float) $attempt->score,
            'passed' => (bool) $attempt->passed,
            'pass_mark' => (float) $quiz->effectivePassMark(),
            'attempts_used' => $quiz->attemptsCountFor($attempt->user_id),
            'submitted_at' => $attempt->submitted_at?->toIso8601String(),
            'questions' => $questionDetails,
        ];
    }

    /**
     * Attempt history of the current user for this course quiz.
     */
    public function history(Request $request, Course $course)
    {
        $user = $request->user();

        $this->authorizeAccess($user, $course);

        $quiz = Quiz::query()
            ->where('course_id', $course->id)
            ->where('is_active', true)
            ->first();

        if (!$quiz) {
            return response()->json(['attempts' => []]);
        }

        $attempts = $quiz->attempts()
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($attempt) => [
                'id' => $attempt->id,
                'score' => (float) $attempt->score,
                'passed' => (bool) $attempt->passed,
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
            ]);

        return response()->json(['attempts' => $attempts]);
    }

    /**
     * Certificate eligibility state for the course page banner.
     */
    public function eligibility(Request $request, Course $course)
    {
        $user = $request->user();

        $this->authorizeAccess($user, $course);

        $certificate = Certificate::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            // Several certificates can exist after revocations; the banner
            // reflects the latest one.
            ->orderByDesc('id')
            ->first();

        return response()->json([
            'eligible' => $this->certificates->isEligible($user->id, $course->id),
            'certificate' => $certificate ? $this->presentCertificate($certificate) : null,
        ]);
    }

    protected function authorizeAccess($user, Course $course): void
    {
        // Course owner (instructor) and admins can preview their own quiz;
        // everyone else needs an active/completed enrollment.
        $isOwner = (int) $course->instructor_id === (int) $user->id;
        $isAdmin = $user->role === 'admin';

        if ($isOwner || $isAdmin) {
            return;
        }

        abort_unless(
            Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->whereIn('status', ['active', 'completed'])
                ->exists(),
            403,
            'You must be enrolled in this course to access the quiz.'
        );
    }

    protected function presentCertificate(Certificate $certificate): array
    {
        return [
            'code' => $certificate->code,
            'serial' => $certificate->serial,
            'verify_url' => rtrim(config('app.frontend_url'), '/')."/certificates/{$certificate->code}",
            'download_url' => route('certificates.download', ['certificate' => $certificate->code]),
            'issued_at' => $certificate->issued_at?->toIso8601String(),
            'revoked_at' => $certificate->revoked_at?->toIso8601String(),
            'is_valid' => $certificate->isValid(),
        ];
    }
}
