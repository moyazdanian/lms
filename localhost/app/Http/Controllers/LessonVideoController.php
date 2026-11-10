<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Support\MediaDiskResolver;
use App\Support\MediaStreamer;
use Illuminate\Http\Request;

class LessonVideoController extends Controller
{
    /**
     * Stream a lesson video to an enrolled user, the course instructor, or an admin.
     */
    public function show(Request $request, Lesson $lesson)
    {
        $lesson->loadMissing('section.course');
        $course = $lesson->section?->course;
        $user = $request->user();

        abort_unless($course && $lesson->is_active, 404);

        $isInstructor = $course->instructor_id === $user->id;
        $isAdmin = $user->role === 'admin';
        $isEnrolled = $course->enrollments()
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        abort_unless($isInstructor || $isAdmin || $isEnrolled, 403);

        return $this->stream($request, $lesson);
    }

    /**
     * Stream the free preview of a lesson without authentication. Only
     * lessons explicitly flagged free or previewable are served here.
     */
    public function preview(Request $request, Lesson $lesson)
    {
        $lesson->loadMissing('section.course');

        abort_unless($lesson->is_active && ($lesson->is_free || $lesson->preview), 404);

        return $this->stream($request, $lesson);
    }

    protected function stream(Request $request, Lesson $lesson)
    {
        return MediaStreamer::serve(
            $request,
            MediaDiskResolver::resolve($lesson, 'video_url'),
            $lesson->video_url,
            'lesson-' . $lesson->id . '.mp4'
        );
    }
}
