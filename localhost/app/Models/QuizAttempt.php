<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $fillable = [
        'quiz_id',
        'user_id',
        'answers',
        'score',
        'passed',
        'submitted_at',
    ];

    protected $casts = [
        'answers' => 'array',
        'score' => 'decimal:2',
        'passed' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Question ids answered correctly in this attempt (from the stored
     * grading snapshot). Handy for review screens and analytics.
     */
    public function correctQuestionIds(): array
    {
        $answers = collect($this->answers ?? []);

        return $answers
            ->filter(fn (array $answer) => (bool) ($answer['is_correct'] ?? false))
            ->pluck('question_id')
            ->all();
    }
}
