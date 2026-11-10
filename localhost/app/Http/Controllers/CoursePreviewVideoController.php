<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Support\MediaDiskResolver;
use App\Support\MediaStreamer;
use Illuminate\Http\Request;

class CoursePreviewVideoController extends Controller
{
    public function show(Request $request, Course $course)
    {
        $user = $request->user();

        abort_unless(
            $user && ((int) $user->id === (int) $course->instructor_id || $user->role === 'admin'),
            403
        );

        return MediaStreamer::serve(
            $request,
            MediaDiskResolver::resolve($course, 'preview_video'),
            $course->preview_video,
            'course-preview-' . $course->id . '.mp4'
        );
    }
}
