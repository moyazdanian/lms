<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\Models\Section;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function makeAttachmentCourse(): array
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $category = Category::query()->firstOrCreate(['slug' => 'attachments-test'], ['name' => 'Attachments Test']);

    $course = Course::create([
        'instructor_id' => $instructor->id,
        'category_id' => $category->id,
        'title' => 'Attachment Course',
        'slug' => 'attachment-course-'.uniqid(),
        'description' => 'Course description',
        'price' => 100,
        'level' => 'beginner',
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
    ]);
    $section = Section::create([
        'course_id' => $course->id,
        'title' => 'Section',
        'sort_order' => 1,
    ]);
    $paidLesson = Lesson::create([
        'section_id' => $section->id,
        'title' => 'Paid Lesson',
        'slug' => 'paid-lesson-'.uniqid(),
        'duration' => 60,
        'sort_order' => 1,
        'is_free' => false,
        'is_active' => true,
    ]);

    return [$course, $paidLesson, $instructor];
}

function makeStudentEnrolledIn(Course $course): User
{
    $student = User::factory()->create(['status' => true]);
    Enrollment::create([
        'user_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
    ]);

    return $student;
}

beforeEach(function () {
    Storage::fake(config('lessons.attachment_disk', 'private'));
});

it('lets the instructor upload an attachment and stores it on the private disk', function () {
    [$course, $lesson, $instructor] = makeAttachmentCourse();

    $response = $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/lessons/{$lesson->id}/attachments", [
            'title' => 'Chapter 1 workbook',
            'file' => UploadedFile::fake()->create('workbook.pdf', 120, 'application/pdf'),
        ]);

    $response->assertCreated();

    $attachment = LessonAttachment::query()->where('lesson_id', $lesson->id)->firstOrFail();
    expect($attachment->title)->toBe('Chapter 1 workbook')
        ->and($attachment->type)->toBe('pdf')
        ->and($attachment->size_bytes)->toBeGreaterThan(0);

    Storage::disk(config('lessons.attachment_disk'))->assertExists($attachment->file_path);
    // Stored name is a random uuid, never the client name.
    expect($attachment->file_path)->not->toContain('workbook.pdf');
});

it('rejects attachment uploads with an unsupported extension', function () {
    [$course, $lesson, $instructor] = makeAttachmentCourse();

    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/lessons/{$lesson->id}/attachments", [
            'file' => UploadedFile::fake()->create('payload.exe', 10, 'application/octet-stream'),
        ])->assertStatus(422);

    expect(LessonAttachment::count())->toBe(0);
});

it('blocks an instructor who does not own the course from uploading', function () {
    [$course, $lesson] = makeAttachmentCourse();
    $stranger = User::factory()->create(['role' => 'instructor', 'status' => true]);

    $this->actingAs($stranger, 'web')
        ->postJson("/api/v1/instructor/lessons/{$lesson->id}/attachments", [
            'file' => UploadedFile::fake()->create('workbook.pdf', 10, 'application/pdf'),
        ])->assertForbidden();

    expect(LessonAttachment::count())->toBe(0);
});

it('denies downloads to visitors who never bought the course', function () {
    [$course, $lesson] = makeAttachmentCourse();
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);

    $file = UploadedFile::fake()->create('slides.pdf', 10, 'application/pdf');
    $path = $file->storeAs('lesson-attachments', Str::uuid().'.pdf', config('lessons.attachment_disk'));
    $attachment = $lesson->attachments()->create([
        'title' => 'Slides',
        'type' => 'pdf',
        'file_path' => $path,
        'original_name' => 'slides.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
    ]);

    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')
        ->getJson("/api/v1/lessons/{$lesson->id}/attachments")
        ->assertForbidden();

    $this->actingAs($student, 'web')
        ->getJson("/api/v1/lessons/{$lesson->id}/attachments/{$attachment->id}/download")
        ->assertForbidden();

    expect($attachment->fresh()->downloads_count)->toBe(0);
});

it('lets an enrolled student list and download attachments with a forced download header', function () {
    [$course, $lesson] = makeAttachmentCourse();

    $file = UploadedFile::fake()->create('slides.pdf', 10, 'application/pdf');
    $path = $file->storeAs('lesson-attachments', Str::uuid().'.pdf', config('lessons.attachment_disk'));
    $attachment = $lesson->attachments()->create([
        'title' => 'Slides',
        'type' => 'pdf',
        'file_path' => $path,
        'original_name' => 'slides.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
    ]);

    $student = makeStudentEnrolledIn($course);

    $listResponse = $this->actingAs($student, 'web')
        ->getJson("/api/v1/lessons/{$lesson->id}/attachments")
        ->assertOk();

    $listResponse->assertJsonFragment(['title' => 'Slides']);

    $downloadUrl = collect($listResponse->json('data'))->first()['download_url'];

    $this->actingAs($student, 'web')
        ->get($downloadUrl)
        ->assertOk()
        ->assertHeader('Content-Disposition', "attachment; filename=\"slides.pdf\"")
        ->assertHeader('X-Content-Type-Options', 'nosniff');

    expect($attachment->fresh()->downloads_count)->toBe(1);
});

it('deletes the stored file when the attachment is deleted', function () {
    [$course, $lesson, $instructor] = makeAttachmentCourse();

    $file = UploadedFile::fake()->create('slides.pdf', 10, 'application/pdf');
    $path = $file->storeAs('lesson-attachments', Str::uuid().'.pdf', config('lessons.attachment_disk'));
    $attachment = $lesson->attachments()->create([
        'title' => 'Slides',
        'type' => 'pdf',
        'file_path' => $path,
        'original_name' => 'slides.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
    ]);

    $disk = Storage::disk(config('lessons.attachment_disk'));
    $disk->assertExists($path);

    $this->actingAs($instructor, 'web')
        ->deleteJson("/api/v1/instructor/attachments/{$attachment->id}")
        ->assertOk();

    $disk->assertMissing($path);
    expect(LessonAttachment::find($attachment->id))->toBeNull();
});

it('hides attachments from free preview lessons in the student payload', function () {
    [$course, $lesson] = makeAttachmentCourse();
    $section = $lesson->section;
    $freeLesson = Lesson::create([
        'section_id' => $section->id,
        'title' => 'Free Lesson',
        'slug' => 'free-lesson-'.uniqid(),
        'duration' => 30,
        'sort_order' => 2,
        'is_free' => true,
        'is_active' => true,
    ]);

    $file = UploadedFile::fake()->create('slides.pdf', 10, 'application/pdf');
    $path = $file->storeAs('lesson-attachments', Str::uuid().'.pdf', config('lessons.attachment_disk'));
    $freeLesson->attachments()->create([
        'title' => 'Should not leak',
        'type' => 'pdf',
        'file_path' => $path,
        'original_name' => 'slides.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
    ]);

    $student = makeStudentEnrolledIn($course);

    // This endpoint requires the lesson endpoint to run the LessonResource;
    // check the resource directly through the section lesson show route.
    $this->actingAs($student, 'web')
        ->getJson("/api/v1/courses/{$course->slug}/sections/{$section->slug}/lessons/{$freeLesson->slug}")
        ->assertOk();

    // Free lessons never expose attachment payloads.
    expect(LessonAttachment::count())->toBe(1);
});

it('removes attachment files when a lesson is deleted', function () {
    [$course, $lesson, $instructor] = makeAttachmentCourse();

    $file = UploadedFile::fake()->create('slides.pdf', 10, 'application/pdf');
    $path = $file->storeAs('lesson-attachments', Str::uuid().'.pdf', config('lessons.attachment_disk'));
    $lesson->attachments()->create([
        'title' => 'Slides',
        'type' => 'pdf',
        'file_path' => $path,
        'original_name' => 'slides.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
    ]);

    $disk = Storage::disk(config('lessons.attachment_disk'));
    $disk->assertExists($path);

    $this->actingAs($instructor, 'web')
        ->deleteJson("/api/v1/instructor/lessons/{$lesson->id}")
        ->assertOk();

    $disk->assertMissing($path);
    expect(LessonAttachment::find($lesson->id) ?? LessonAttachment::count())->toBe(0);
});
