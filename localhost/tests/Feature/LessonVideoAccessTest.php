<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

function makeLessonVideoFixture(bool $isFree = false, bool $isPreview = false): Lesson
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Video Course',
        'slug' => 'video-course-'.uniqid(),
        'description' => 'Course description',
        'price' => 100,
        'level' => 'beginner',
        'is_active' => true,
    ]);
    $section = Section::create([
        'course_id' => $course->id,
        'title' => 'First Section',
        'sort_order' => 1,
    ]);
    $lesson = Lesson::create([
        'section_id' => $section->id,
        'title' => 'First Lesson',
        'video_url' => 'lessons-videos/test-video.mp4',
        'duration' => 60,
        'sort_order' => 1,
        'is_free' => $isFree,
        'preview' => $isPreview,
        'is_active' => true,
    ]);

    Storage::disk('private')->put($lesson->video_url, 'video-content');

    return $lesson;
}

it('does not serve a paid video to a guest or an unenrolled user', function () {
    Storage::fake('private');
    $lesson = makeLessonVideoFixture();
    $student = User::factory()->create(['status' => true]);

    $this->getJson("/api/v1/lessons/{$lesson->id}/video")
        ->assertUnauthorized();

    $this->actingAs($student, 'web')
        ->getJson("/api/v1/lessons/{$lesson->id}/video")
        ->assertForbidden();
});

it('serves a paid video to an enrolled user and supports ranges', function () {
    Storage::fake('private');
    $lesson = makeLessonVideoFixture();
    $student = User::factory()->create(['status' => true]);

    Enrollment::create([
        'user_id' => $student->id,
        'course_id' => $lesson->section->course_id,
        'status' => 'active',
    ]);

    $this->actingAs($student, 'web')
        ->withHeader('Range', 'bytes=0-4')
        ->get("/api/v1/lessons/{$lesson->id}/video")
        ->assertStatus(206)
        ->assertHeader('Accept-Ranges', 'bytes')
        ->assertHeader('Content-Range', 'bytes 0-4/13')
        ->assertHeader('Content-Length', '5');
});

it('serves only free or explicitly previewable videos through the public preview endpoint', function () {
    Storage::fake('private');
    $paidLesson = makeLessonVideoFixture();
    $freeLesson = makeLessonVideoFixture(isFree: true);

    $this->getJson("/api/v1/lessons/{$paidLesson->id}/video/preview")
        ->assertForbidden();

    $this->get("/api/v1/lessons/{$freeLesson->id}/video/preview")
        ->assertOk()
        ->assertHeader('Content-Type', 'video/mp4');
});
