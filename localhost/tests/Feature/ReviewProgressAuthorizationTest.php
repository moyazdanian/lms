<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Review;
use App\Models\Section;
use App\Models\User;

function makeReviewProgressCourse(): array
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Authorization Course',
        'slug' => 'authorization-course-'.uniqid(),
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
        'duration' => 60,
        'sort_order' => 1,
        'is_free' => true,
        'is_active' => true,
    ]);

    return [$course, $lesson];
}

it('rejects reviews from users who are not enrolled in the course', function () {
    [$course] = makeReviewProgressCourse();
    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')
        ->postJson('/api/v1/review', [
            'course_id' => $course->id,
            'rating' => 5,
            'comment' => 'Great course',
        ])
        ->assertForbidden();

    expect(Review::count())->toBe(0);
});

it('accepts a review only for the enrolled course and rejects cross-course replies', function () {
    [$course, $otherLesson] = makeReviewProgressCourse();
    [$otherCourse] = makeReviewProgressCourse();
    $student = User::factory()->create(['status' => true]);

    Enrollment::create(['user_id' => $student->id, 'course_id' => $course->id, 'status' => 'active']);

    $this->actingAs($student, 'web')
        ->postJson('/api/v1/review', [
            'course_id' => $course->id,
            'rating' => 5,
            'comment' => 'Great course',
        ])
        ->assertCreated();

    $review = Review::firstOrFail();

    $this->actingAs($student, 'web')
        ->postJson('/api/v1/review', [
            'course_id' => $otherCourse->id,
            'rating' => 5,
            'comment' => 'Cross-course reply',
            'parent_id' => $review->id,
        ])
        ->assertForbidden();
});

it('derives progress course from the lesson instead of trusting request input', function () {
    [$course, $lesson] = makeReviewProgressCourse();
    [$otherCourse] = makeReviewProgressCourse();
    $student = User::factory()->create(['status' => true]);

    Enrollment::create(['user_id' => $student->id, 'course_id' => $course->id, 'status' => 'active']);

    $this->actingAs($student, 'web')
        ->postJson("/api/v1/lessons/{$lesson->id}/progress", [
            'course_id' => $otherCourse->id,
            'watched_seconds' => 30,
            'status' => 'in_progress',
        ])
        ->assertOk()
        ->assertJsonPath('course_id', $course->id);
});

it('rejects progress updates for an unenrolled user', function () {
    [$course, $lesson] = makeReviewProgressCourse();
    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')
        ->postJson("/api/v1/lessons/{$lesson->id}/progress", [
            'watched_seconds' => 10,
            'status' => 'in_progress',
        ])
        ->assertForbidden();
});
