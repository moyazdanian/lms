<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEditRequest;
use App\Models\Lesson;
use App\Support\MediaDiskResolver;
use App\Support\MediaStreamer;
use Illuminate\Http\Request;

class FilamentMediaController extends Controller
{
    public function lessonVideo(Request $request, Lesson $lesson)
    {
        return MediaStreamer::serve(
            $request,
            MediaDiskResolver::resolve($lesson, 'video_url'),
            $lesson->video_url,
            'lesson-' . $lesson->getKey() . '.mp4'
        );
    }

    public function coursePreview(Request $request, Course $course)
    {
        return MediaStreamer::serve(
            $request,
            MediaDiskResolver::resolve($course, 'preview_video'),
            $course->preview_video,
            'course-preview-' . $course->getKey() . '.mp4'
        );
    }

    /**
     * Stream the OLD (live) or NEW (proposed) preview video of a course edit
     * request inside the admin review screen. The path is never taken from the
     * request — it is resolved from the stored request record, so an admin can
     * only ever reach files referenced by a real review queue entry.
     */
    public function editRequestPreview(Request $request, CourseEditRequest $editRequest, string $which)
    {
        abort_unless(in_array($which, ['old', 'new'], true), 404);

        $changes = is_array($editRequest->changes) ? $editRequest->changes : [];

        $path = $which === 'old'
            ? ($changes['preview_video']['old'] ?? null)
            : ($changes['preview_video']['new'] ?? null);

        // Fall back to the live file when the request predates the snapshot.
        if ($which === 'old' && ! $path) {
            $path = $editRequest->course?->preview_video;
        }

        // Edit-request snapshots have no row of their own — resolve the disk
        // by probing for the exact old/new path being streamed.
        return MediaStreamer::serve(
            $request,
            MediaDiskResolver::resolveForPath($path),
            $path,
            'edit-request-' . $editRequest->getKey() . '-' . $which . '.mp4'
        );
    }
}
