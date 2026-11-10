<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Lesson_progress;
use App\Services\CertificateService;
use App\Services\ProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonProgressController extends Controller
{
    public function update(Request $request, Lesson $lesson)
    {
        $data = $request->validate([
            'watched_seconds' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'in:not_started,in_progress,completed'],
        ]);

        $lesson->loadMissing('section');
        $courseId = $lesson->section?->course_id;

        abort_unless($courseId, 404);
        abort_unless(
            Enrollment::query()
                ->where('user_id', $request->user()->id)
                ->where('course_id', $courseId)
                ->whereIn('status', ['active', 'completed'])
                ->exists(),
            403,
            'User is not enrolled in this course.'
        );

        $existing = Lesson_progress::query()
            ->where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        // Completed is sticky; otherwise the client's status wins.
        $status = $existing?->status === 'completed'
            ? 'completed'
            : ($data['status'] ?? 'in_progress');

        // Auto-complete at 80% watched: a student who closes the tab near
        // the end (or whose 'ended' event never fires) still gets credit.
        // NOTE: lessons.duration is stored in MINUTES (instructor form field),
        // watched_seconds is in SECONDS — convert before comparing.
        $completionThreshold = (int) round(((float) $lesson->duration) * 60 * 0.8);

        if (
            $status !== 'completed'
            && $completionThreshold > 0
            && (int) $data['watched_seconds'] >= $completionThreshold
        ) {
            $status = 'completed';
        }

        $progress = Lesson_progress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'course_id' => $courseId,
                'watched_seconds' => DB::raw(
                    'GREATEST(COALESCE(watched_seconds, 0), ' . (int) $data['watched_seconds'] . ')'
                ),
                'status' => $status,
            ]
        );

        if ($status === 'completed') {
            app(ProgressService::class)->updateCourseProgress(
                $request->user()->id,
                $courseId
            );

            // Last requirement met? The service is idempotent and no-ops
            // when quizzes are still pending or a certificate already exists.
            app(CertificateService::class)->checkAndIssue(
                $request->user()->id,
                $courseId
            );
        }

        return response()->json($progress->fresh());
    }

    public function show(Lesson $lesson, Request $request)
    {
        $lesson->loadMissing('section');
        $courseId = $lesson->section?->course_id;

        abort_unless($courseId, 404);
        abort_unless(
            Enrollment::query()
                ->where('user_id', $request->user()->id)
                ->where('course_id', $courseId)
                ->whereIn('status', ['active', 'completed'])
                ->exists(),
            403,
            'User is not enrolled in this course.'
        );

        $lessonProgress = Lesson_progress::query()
            ->where('lesson_id', $lesson->id)
            ->where('course_id', $courseId)
            ->where('user_id', $request->user()->id)
            ->first();

        return response()->json($lessonProgress);
    }
}
