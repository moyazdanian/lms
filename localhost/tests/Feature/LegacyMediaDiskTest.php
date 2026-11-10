<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\Models\Section;
use App\Models\User;
use App\Support\MediaDiskResolver;
use Illuminate\Support\Facades\Storage;

/**
 * Simulates the admin switching the lesson-video disk (local -> s3) in the
 * panel and verifies that:
 *  - NEW uploads land on (and are served from) the new disk;
 *  - OLD (legacy) videos keep playing from the old disk;
 *  - deletions hit the disk the file actually lives on.
 *
 * The s3 disk is backed by a local fake directory, so no network is needed.
 */
beforeEach(function () {
    config(['filesystems.disks.s3' => [
        'driver' => 'local',
        'root' => storage_path('framework/testing/s3-fake'),
    ]]);

    Storage::fake('s3');
    Storage::fake('private');

    MediaDiskResolver::flushCache();

    // role/status are guarded attributes — the factory cannot set them.
    // forceFill + refresh so the in-memory instance carries real values
    // for the role middleware and actingAs().
    $this->instructor = User::factory()->create();
    $this->instructor->forceFill(['role' => 'instructor', 'status' => true])->save();
    $this->instructor = $this->instructor->refresh();

    $this->student = User::factory()->create();
    $this->student->forceFill(['role' => 'student', 'status' => true])->save();
    $this->student = $this->student->refresh();

    $this->course = Course::create([
        'instructor_id' => $this->instructor->id,
        'title' => 'Media Disk Test',
        'slug' => 'media-disk-test',
        'description' => 'desc',
        'price' => 10,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    $this->section = Section::create([
        'course_id' => $this->course->id,
        'title' => 'S1',
        'sort_order' => 1,
    ]);

    Enrollment::create([
        'user_id' => $this->student->id,
        'course_id' => $this->course->id,
        'status' => 'active',
    ]);
});

it('stamps the upload disk on new lessons and serves from it', function () {
    config(['filesystems.lesson_video_disk' => 'private']);

    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/old.mp4',
        'sort_order' => 1,
        'is_free' => false,
    ]);

    Storage::disk('private')->put('lessons-videos/old.mp4', 'legacy-bytes');
    MediaDiskResolver::flushCache();

    // Model hook stamped the disk at creation time.
    expect($lesson->refresh()->media_disk)->toBe('private');

    // Admin switches the panel disk to s3.
    config(['filesystems.lesson_video_disk' => 's3']);

    // Legacy video keeps playing from the old disk even after the switch.
    $response = $this->actingAs($this->student, 'sanctum')
        ->get('/api/v1/lessons/'.$lesson->id.'/video');

    $response->assertOk();
    expect($response->getContent())->toContain('legacy-bytes');

    // New uploads land on the new disk and get stamped with it.
    $lesson2 = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L2',
        'video_url' => 'lessons-videos/new.mp4',
        'sort_order' => 2,
        'is_free' => false,
    ]);

    Storage::disk('s3')->put('lessons-videos/new.mp4', 'new-bytes');
    MediaDiskResolver::flushCache();

    expect($lesson2->refresh()->media_disk)->toBe('s3')
        ->and(MediaDiskResolver::resolve($lesson2, 'video_url'))->toBe('s3')
        ->and(MediaDiskResolver::resolve($lesson, 'video_url'))->toBe('private');
});

it('deletes legacy videos from the disk they actually live on', function () {
    config(['filesystems.lesson_video_disk' => 'private']);

    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/legacy.mp4',
        'sort_order' => 1,
        'is_free' => false,
    ]);

    Storage::disk('private')->put('lessons-videos/legacy.mp4', 'bytes');

    config(['filesystems.lesson_video_disk' => 's3']);
    MediaDiskResolver::flushCache();

    $this->actingAs($this->instructor, 'sanctum')
        ->deleteJson('/api/v1/instructor/lessons/'.$lesson->id)
        ->assertOk();

    // Gone from the REAL disk (private), untouched elsewhere.
    expect(Storage::disk('private')->exists('lessons-videos/legacy.mp4'))->toBeFalse()
        ->and(Lesson::find($lesson->id))->toBeNull();
});

it('resolves attachments per attachment row', function () {
    config(['filesystems.lesson_video_disk' => 'private']);
    config(['lessons.attachment_disk' => 'private']);

    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/v.mp4',
        'sort_order' => 1,
        'is_free' => false,
    ]);

    $attachment = LessonAttachment::create([
        'lesson_id' => $lesson->id,
        'title' => 'Slide',
        'type' => 'pdf',
        'file_path' => 'lesson-attachments/a.pdf',
        'original_name' => 'a.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 4,
    ]);

    Storage::disk('private')->put('lesson-attachments/a.pdf', '%PDF');

    config(['filesystems.lesson_video_disk' => 's3']);
    config(['lessons.attachment_disk' => 's3']);
    MediaDiskResolver::flushCache();

    expect($attachment->disk())->toBe('private');

    $response = $this->actingAs($this->student, 'sanctum')
        ->get('/api/v1/lessons/'.$lesson->id.'/attachments/'.$attachment->id.'/download');

    $response->assertOk();
    expect($response->getContent())->toContain('%PDF');
});

it('stamps a fresh disk when a legacy video is re-uploaded', function () {
    config(['filesystems.lesson_video_disk' => 'private']);

    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/v1.mp4',
        'sort_order' => 1,
        'is_free' => false,
    ]);

    expect($lesson->media_disk)->toBe('private');

    // Instructor replaces the video; the new file lands on the s3 disk.
    config(['filesystems.lesson_video_disk' => 's3']);

    $lesson->update(['video_url' => 'lessons-videos/v2.mp4']);

    expect($lesson->refresh()->media_disk)->toBe('s3');
});
