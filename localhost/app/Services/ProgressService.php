<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Lesson_progress;
use App\Models\Section;

class ProgressService
{
    public function updateCourseProgress(int $userId, int $courseId): float
    {
        $totalLessons = Lesson::whereHas('section', function ($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })->count();

        if ($totalLessons === 0) {
            return 0;
        }

        $completedLessons = Lesson_progress::where('user_id', $userId)
            ->where('status', 'completed')
            ->whereHas('lesson.section', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->count();

        $progress = round(($completedLessons / $totalLessons) * 100, 2);

        Enrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->update(['progress' => $progress]);

        return $progress;
    }

    public function getResumeLesson(int $userId, int $courseId)
{
    // 1. آخرین درس در حال انجام (eager-load lesson.section — no lazy load)
    $inProgress = Lesson_progress::where('user_id', $userId)
        ->where('course_id', $courseId)
        ->where('status', 'in_progress')
        ->with('lesson.section')
        ->orderByDesc('updated_at')
        ->first();

    if ($inProgress && $inProgress->lesson) {
        return [
            'lesson' => $inProgress->lesson->slug ,
            'section' => $inProgress->lesson->section?->slug ,
            'watched_seconds' => $inProgress->watched_seconds,
            'status' => 'in_progress'
        ];
    }

    // 2. آخرین درس کامل‌شده (eager-load lesson.section — no lazy load)
    $completed = Lesson_progress::where('user_id', $userId)
        ->where('course_id', $courseId)
        ->where('status', 'completed')
        ->with('lesson.section')
        ->orderByDesc('updated_at')
        ->first();

    if ($completed && $completed->lesson) {
        return [
            'lesson' => $completed->lesson->slug ,
            'section' => $completed->lesson->section?->slug ,
            'watched_seconds' => $completed->watched_seconds,
            'status' => 'completed'
        ];
    }

    // 3. اولین درس دوره — null-safe: a freshly created course has no
    // lessons yet and the resume endpoint must answer with nulls, not a 500.
    $lesson = Lesson::whereHas('section', function ($q) use ($courseId) {
        $q->where('course_id', $courseId);
    })->with('section')->orderBy('id')->first();

    if (!$lesson) {
        return null;
    }

    return [
        'lesson' => $lesson->slug ,
        'section' => $lesson->section?->slug ,
        'watched_seconds' => 0,
        'status' => 'not_started'
    ];
}
}