<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

it('streams a private lesson video to an authenticated admin with ranges', function () {
    Storage::fake('private');

    $admin = User::factory()->create([
        'role' => 'admin',
        'status' => true,
    ]);
    $instructor = User::factory()->create([
        'role' => 'instructor',
        'status' => true,
    ]);
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Admin video course',
        'slug' => 'admin-video-course',
        'description' => 'Course description',
        'price' => 100,
        'level' => 'beginner',
        'is_active' => true,
    ]);
    $section = Section::create([
        'course_id' => $course->id,
        'title' => 'Section',
        'sort_order' => 1,
    ]);
    $lesson = Lesson::create([
        'section_id' => $section->id,
        'title' => 'Lesson',
        'video_url' => 'lessons-videos/admin-test.mp4',
        'duration' => 10,
        'sort_order' => 1,
        'is_free' => false,
        'preview' => false,
        'is_active' => true,
    ]);

    Storage::disk('private')->put($lesson->video_url, 'video-content');

    $this->actingAs($admin, 'filament')
        ->withHeader('Range', 'bytes=0-4')
        ->get("/admin/media/lessons/{$lesson->id}/video")
        ->assertStatus(206)
        ->assertHeader('Content-Type', 'video/mp4')
        ->assertHeader('Content-Range', 'bytes 0-4/13')
        ->assertHeader('Content-Length', '5');
});

it('does not expose Filament media to a guest', function () {
    Storage::fake('private');

    $this->get('/admin/media/lessons/1/video')
        ->assertRedirect();
});
