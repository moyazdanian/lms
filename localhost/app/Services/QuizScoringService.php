<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizAttempt;

/**
 * Grades quiz submissions. Grading is all-or-nothing per question: a
 * question earns its points only when the selected options exactly match
 * the set of correct options (supports multiple correct answers).
 */
class QuizScoringService
{
    /**
     * Grade a raw answers payload and store the attempt.
     *
     * Expected payload shape:
     * [
     *   ['question_id' => 1, 'option_ids' => [10, 12]],
     *   ...
     * ]
     *
     * @return array{attempt: QuizAttempt, score: float, passed: bool}
     */
    public function submitAttempt(Quiz $quiz, int $userId, array $answers): array
    {
        abort_unless($quiz->is_active, 404, 'Quiz is not available.');

        // Once passed (with a valid certificate to back it), the quiz is
        // closed for this user — no retakes. After a certificate revocation
        // the passed attempt stops counting (see Quiz::isPassedBy) and the
        // student may try again.
        abort_if(
            $quiz->isPassedBy($userId),
            403,
            'You have already passed this quiz and cannot retake it.'
        );

        // Attempt limit (null = unlimited). Only non-passed attempts count
        // towards the limit so a user can freely re-take a failed quiz only
        // while attempts remain.
        $maxAttempts = $quiz->effectiveMaxAttempts();

        if ($maxAttempts !== null) {
            $used = $quiz->attemptsCountFor($userId);

            abort_if(
                $used >= $maxAttempts && !$quiz->isPassedBy($userId),
                403,
                'You have used all available attempts for this quiz.'
            );
        }

        $graded = $this->grade($quiz, $answers);

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $userId,
            'answers' => $graded['answers'],
            'score' => $graded['score'],
            'passed' => $graded['passed'],
            'submitted_at' => now(),
        ]);

        return [
            'attempt' => $attempt,
            'score' => $graded['score'],
            'passed' => $graded['passed'],
        ];
    }

    /**
     * Grade a payload without persisting anything.
     *
     * @return array{answers: array, score: float, passed: bool}
     */
    public function grade(Quiz $quiz, array $answers): array
    {
        $questions = $quiz->questions()->with('options')->get();

        if ($questions->isEmpty()) {
            abort(422, 'This quiz has no questions yet.');
        }

        // Index the raw submission by question id.
        $submitted = [];
        foreach ($answers as $answer) {
            $questionId = (int) ($answer['question_id'] ?? 0);
            $optionIds = array_values(array_unique(array_map(
                'intval',
                (array) ($answer['option_ids'] ?? [])
            )));
            $submitted[$questionId] = $optionIds;
        }

        $totalPoints = 0;
        $earnedPoints = 0;
        $gradedAnswers = [];

        foreach ($questions as $question) {
            $totalPoints += max(1, (int) $question->points);

            $correctIds = $question->options
                ->filter(fn ($option) => $option->is_correct)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->sort()
                ->values()
                ->all();

            $selectedIds = collect($submitted[$question->id] ?? [])
                ->sort()
                ->values()
                ->all();

            // Only options that belong to this question are accepted.
            $validOptionIds = $question->options->pluck('id')->map(fn ($id) => (int) $id)->all();
            $selectedIds = array_values(array_intersect($selectedIds, $validOptionIds));

            $isCorrect = $selectedIds !== [] && $selectedIds === $correctIds;

            if ($isCorrect) {
                $earnedPoints += max(1, (int) $question->points);
            }

            $gradedAnswers[] = [
                'question_id' => $question->id,
                'option_ids' => $selectedIds,
                'is_correct' => $isCorrect,
                'earned_points' => $isCorrect ? max(1, (int) $question->points) : 0,
            ];
        }

        $score = $totalPoints > 0
            ? round(($earnedPoints / $totalPoints) * 100, 2)
            : 0.0;

        return [
            'answers' => $gradedAnswers,
            'score' => $score,
            'passed' => $score >= $quiz->effectivePassMark(),
        ];
    }
}
