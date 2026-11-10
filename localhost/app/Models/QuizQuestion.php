<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    protected $fillable = [
        'quiz_id',
        'question',
        'explanation',
        'points',
        'sort_order',
    ];

    protected $casts = [
        'points' => 'integer',
        'sort_order' => 'integer',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * The FK column is `question_id` (see the quiz migration), not the
     * Laravel-guessed `quiz_question_id`, so it must be stated explicitly.
     */
    public function options()
    {
        return $this->hasMany(QuizOption::class, 'question_id')->orderBy('sort_order');
    }

    public function correctOptions(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->options()->where('is_correct', true)->get();
    }
}
