<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Instructor quiz editor. One quiz per course in v1. Saving replaces the
 * question set synchronously (same pattern as the curriculum sync). Editing
 * questions never touches the quiz pass_mark / max_attempts — those are
 * admin-controlled values.
 */
class InstructorQuizController extends Controller
{
    public function show(Request $request, Course $course)
    {
        $this->authorizeOwner($request, $course);

        $quiz = Quiz::query()
            ->where('course_id', $course->id)
            ->with(['questions' => fn ($q) => $q->orderBy('sort_order'), 'questions.options' => fn ($q) => $q->orderBy('sort_order')])
            ->first();

        if (!$quiz) {
            return response()->json(['quiz' => null]);
        }

        $attemptsCount = DB::table('quiz_attempts')->where('quiz_id', $quiz->id)->count();

        return response()->json([
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'pass_mark' => (float) $quiz->effectivePassMark(),
                'pass_mark_overridden' => (float) $quiz->pass_mark > 0,
                'max_attempts' => $quiz->max_attempts,
                'is_active' => (bool) $quiz->is_active,
                'attempts_count' => $attemptsCount,
                'questions' => $quiz->questions->map(fn ($question) => [
                    'id' => $question->id,
                    'question' => $question->question,
                    'explanation' => $question->explanation,
                    'points' => max(1, (int) $question->points),
                    'options' => $question->options->map(fn ($option) => [
                        'id' => $option->id,
                        'option_text' => $option->option_text,
                        'is_correct' => (bool) $option->is_correct,
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    public function save(Request $request, Course $course)
    {
        $this->authorizeOwner($request, $course);

        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'questions' => ['nullable', 'array', 'max:100'],
            'questions.*.question' => ['required', 'string', 'max:2000'],
            'questions.*.explanation' => ['nullable', 'string', 'max:2000'],
            'questions.*.points' => ['nullable', 'integer', 'min:1', 'max:100'],
            'questions.*.options' => ['required', 'array', 'min:2', 'max:10'],
            'questions.*.options.*.option_text' => ['required', 'string', 'max:1000'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
        ]);

        $questions = collect($data['questions'] ?? []);

        // Every question must have at least one correct option, and quiz must
        // not be activated without valid questions.
        foreach ($questions as $index => $question) {
            $correctCount = collect($question['options'])
                ->filter(fn ($option) => $option['is_correct'] === true)
                ->count();

            if ($correctCount === 0) {
                return response()->json([
                    'message' => "Question #{$index} must have at least one correct option.",
                    'errors' => ["questions.{$index}.options" => ['At least one correct option is required.']],
                ], 422);
            }
        }

        $quiz = DB::transaction(function () use ($course, $data, $questions) {
            $quiz = Quiz::query()->firstOrCreate(
                ['course_id' => $course->id],
                [
                    'title' => $data['title'] ?? 'Final Quiz',
                    'pass_mark' => 0, // 0 = use the global default pass mark
                    'is_active' => false,
                ]
            );

            if (array_key_exists('title', $data)) {
                $quiz->title = $data['title'];
            }

            if (array_key_exists('is_active', $data)) {
                // A quiz cannot go live without questions.
                if (($data['is_active'] ?? false) && $questions->isEmpty() && $quiz->questions()->count() === 0) {
                    abort(422, 'Add at least one question before activating the quiz.');
                }

                $quiz->is_active = (bool) $data['is_active'];
            }

            $quiz->save();

            if ($data['questions'] !== null) {
                // Sync replace: delete removed questions (options cascade),
                // upsert the rest by id when provided.
                $keptIds = $questions->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

                $quiz->questions()
                    ->whereNotIn('id', $keptIds ?: [0])
                    ->get()
                    ->each->delete();

                foreach ($questions->values() as $index => $questionData) {
                    $question = $quiz->questions()->updateOrCreate(
                        ['id' => $questionData['id'] ?? null],
                        [
                            'question' => $questionData['question'],
                            'explanation' => $questionData['explanation'] ?? null,
                            'points' => max(1, (int) ($questionData['points'] ?? 1)),
                            'sort_order' => $index,
                        ]
                    );

                    // Options are always replaced for simplicity and to keep
                    // correct-flags consistent.
                    $question->options()->delete();

                    foreach (collect($questionData['options'])->values() as $optionIndex => $optionData) {
                        $question->options()->create([
                            'option_text' => $optionData['option_text'],
                            'is_correct' => (bool) $optionData['is_correct'],
                            'sort_order' => $optionIndex,
                        ]);
                    }
                }
            }

            return $quiz;
        });

        return $this->show($request, $course);
    }

    protected function authorizeOwner(Request $request, Course $course): void
    {
        $user = $request->user();

        abort_unless(
            (int) $course->instructor_id === (int) $user->id || $user->role === 'admin',
            403,
            'You do not own this course.'
        );
    }
}
