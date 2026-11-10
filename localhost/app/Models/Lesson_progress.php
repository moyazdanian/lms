<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson_progress extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'lesson_id',
        'status',
        'watched_seconds',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
