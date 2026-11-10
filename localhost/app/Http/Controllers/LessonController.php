<?php

namespace App\Http\Controllers;

use App\Http\Resources\LessonResource;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function show( $courseSlug , $sectionSlug , $lessonSlug , Request $request)
    {
        $course = Course::where('slug' , $courseSlug)->firstOrFail();
        $section = Section::where('slug' , $sectionSlug)->where('course_id' , $course->id)->firstOrFail();
        $lesson = Lesson::where('slug' , $lessonSlug)->where('section_id' , $section->id)->firstOrFail();

         $user = $request->user();

        abort_if($lesson->section_id !== $section->id, 404);
        abort_if($section->course_id !== $course->id, 404);

        // abort_if(
        //     !$course->enrollments()->where('user_id', $user?->id)->exists() && !$lesson->is_free,
        //     403
        // );

        $lesson->load([
            'lesson_progress' => fn ($q) =>
                $q->where('user_id', $user?->id),
            'attachments' => fn ($q) => $q->orderBy('sort_order'),
        ]);

        return new LessonResource($lesson, $user);
    }
}
