<?php

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\User;

/**
 * A course with one lesson and one enrolled student. `status` is the public
 * lifecycle (ongoing/completed), independent of the approval workflow.
 */
function makeCertificateCourse(string $status = 'ongoing'): array
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);

    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Certificate Course',
        'slug' => 'certificate-course-'.uniqid(),
        'description' => 'Course description',
        'price' => 0,
        'level' => 'beginner',
        'status' => $status,
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
        'duration' => 10,
        'sort_order' => 1,
        'is_free' => false,
        'is_active' => true,
    ]);

    $student = User::factory()->create(['status' => true]);

    Enrollment::create([
        'user_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress' => 0,
    ]);

    return [$course, $lesson, $student];
}

function completeCertificateLesson($test, Lesson $lesson, User $student): void
{
    $test->actingAs($student, 'web')
        ->postJson("/api/v1/lessons/{$lesson->id}/progress", [
            'watched_seconds' => 0,
            'status' => 'completed',
        ])
        ->assertOk();
}

it('does not issue a certificate while the course is still ongoing', function () {
    [$course, $lesson, $student] = makeCertificateCourse('ongoing');

    completeCertificateLesson($this, $lesson, $student);

    expect(Certificate::query()
        ->where('user_id', $student->id)
        ->where('course_id', $course->id)
        ->exists())->toBeFalse();
});

it('reports the course as not eligible for a certificate while it is ongoing', function () {
    [$course, $lesson, $student] = makeCertificateCourse('ongoing');

    completeCertificateLesson($this, $lesson, $student);

    $this->actingAs($student, 'web')
        ->getJson("/api/v1/courses/{$course->slug}/certificate-eligibility")
        ->assertOk()
        ->assertJsonPath('eligible', false)
        ->assertJsonPath('certificate', null);
});

it('issues the certificate once the course is marked completed', function () {
    [$course, $lesson, $student] = makeCertificateCourse('ongoing');

    // The student finished the course while it was still running.
    completeCertificateLesson($this, $lesson, $student);
    expect(Certificate::count())->toBe(0);

    // The instructor closes the course.
    $course->update(['status' => 'completed']);

    $certificate = Certificate::query()
        ->where('user_id', $student->id)
        ->where('course_id', $course->id)
        ->first();

    expect($certificate)->not->toBeNull()
        ->and($certificate->isValid())->toBeTrue();

    $this->actingAs($student, 'web')
        ->getJson("/api/v1/courses/{$course->slug}/certificate-eligibility")
        ->assertOk()
        ->assertJsonPath('eligible', true)
        ->assertJsonPath('certificate.code', $certificate->code);
});

it('still issues immediately when the course was already completed', function () {
    [$course, $lesson, $student] = makeCertificateCourse('completed');

    completeCertificateLesson($this, $lesson, $student);

    expect(Certificate::query()
        ->where('user_id', $student->id)
        ->where('course_id', $course->id)
        ->exists())->toBeTrue();
});
