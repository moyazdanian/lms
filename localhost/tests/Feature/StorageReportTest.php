<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\Models\Section;
use App\Models\User;
use App\Services\StorageDistributionService;
use App\Support\MediaDiskResolver;
use Illuminate\Support\Facades\Storage;

/**
 * The Settings > Storage Report page: file counts per disk and legacy rows
 * (rows whose media_disk is still empty — "legacy" per the report's
 * definition, whether their file was located by probing or not).
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
    Storage::fake('public');

    MediaDiskResolver::flushCache();

    // role/status are guarded attributes — the factory cannot set them.
    $this->instructor = User::factory()->create();
    $this->instructor->forceFill(['role' => 'instructor', 'status' => true])->save();
    $this->instructor = $this->instructor->refresh();

    $this->course = Course::create([
        'instructor_id' => $this->instructor->id,
        'title' => 'Storage Report Test',
        'slug' => 'storage-report-test',
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

    $this->service = app(StorageDistributionService::class);
});

/**
 * Simulate a row created before media_disk existed: write the file to its
 * historical disk and clear the stamp the model hook just set.
 */
function demoteToLegacy($model, string $disk, string $path, string $content = 'bytes'): void
{
    Storage::disk($disk)->put($path, $content);
    $model->forceFill(['media_disk' => null])->saveQuietly();
}

it('counts stamped files per disk', function () {
    config(['filesystems.lesson_video_disk' => 's3']);

    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/stamped.mp4',
        'sort_order' => 1,
    ]);

    LessonAttachment::create([
        'lesson_id' => $lesson->id,
        'title' => 'PDF',
        'type' => 'pdf',
        'file_path' => 'lesson-attachments/stamped.pdf',
        'original_name' => 'stamped.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 4,
    ]);

    $report = $this->service->build();
    $byDisk = collect($report['rows'])->keyBy('disk');

    expect($byDisk['s3']['lessons'])->toBe(1)
        ->and($byDisk['s3']['lessons_legacy'])->toBe(0)
        ->and($byDisk['s3']['attachments'])->toBe(1)
        ->and($byDisk['s3']['total'])->toBe(2)
        ->and($report['totals']['files'])->toBe(2)
        ->and($report['totals']['stamped'])->toBe(2)
        ->and($report['totals']['legacy'])->toBe(0)
        ->and($report['totals']['missing'])->toBe(0);
});

it('classifies legacy rows by probing without backfilling', function () {
    config(['filesystems.lesson_video_disk' => 's3']);

    // Created now → stamped s3, then demoted to a legacy row whose file
    // physically lives on the old (private) disk.
    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/legacy.mp4',
        'sort_order' => 1,
    ]);

    demoteToLegacy($lesson, 'private', 'lessons-videos/legacy.mp4', 'legacy-bytes');

    $report = $this->service->build();
    $byDisk = collect($report['rows'])->keyBy('disk');

    // The file lives on private — counted there, flagged as legacy.
    expect($byDisk['private']['lessons'])->toBe(1)
        ->and($byDisk['private']['lessons_legacy'])->toBe(1)
        ->and($byDisk['private']['total'])->toBe(1)
        ->and($report['totals']['legacy'])->toBe(1)
        ->and($report['totals']['missing'])->toBe(0);

    // Probing is read-only: the row must still have no stamp. It becomes
    // permanent only when the file is streamed or re-saved.
    expect($lesson->refresh()->media_disk)->toBeNull();
});

it('counts unstamped rows whose file is gone as missing', function () {
    config(['filesystems.lesson_video_disk' => 's3']);

    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/dead.mp4',
        'sort_order' => 1,
    ]);

    // Legacy row whose file exists nowhere.
    $lesson->forceFill(['media_disk' => null])->saveQuietly();

    $report = $this->service->build();

    // No disk row claims the file; totals say legacy=1, missing=1.
    expect(collect($report['rows'])->sum('total'))->toBe(0)
        ->and($report['totals']['files'])->toBe(1)
        ->and($report['totals']['legacy'])->toBe(1)
        ->and($report['totals']['missing'])->toBe(1);
});

it('includes soft-deleted course previews in the counts', function () {
    config(['filesystems.lesson_video_disk' => 'private']);

    $course = Course::create([
        'instructor_id' => $this->instructor->id,
        'title' => 'Trashed',
        'slug' => 'trashed-preview',
        'description' => 'desc',
        'price' => 5,
        'is_active' => true,
        'approval_status' => 'approved',
        'preview_video' => 'course-previews/keep.mp4',
    ]);

    // The created hook stamped private; the file physically lives there.
    Storage::disk('private')->put('course-previews/keep.mp4', 'bytes');

    // Deleting the course must not orphan its preview file from the report.
    $course->delete();

    $report = $this->service->build();
    $byDisk = collect($report['rows'])->keyBy('disk');

    expect($byDisk['private']['previews'])->toBe(1)
        ->and($report['totals']['files'])->toBe(1);
});

it('renders the storage report page for admins', function () {
    config(['filesystems.lesson_video_disk' => 'private']);

    $lesson = Lesson::create([
        'section_id' => $this->section->id,
        'title' => 'L1',
        'video_url' => 'lessons-videos/page.mp4',
        'sort_order' => 1,
    ]);

    Storage::disk('private')->put('lessons-videos/page.mp4', 'bytes');

    // Filament panel admin (role/status are guarded).
    $admin = User::factory()->create();
    $admin->forceFill(['role' => 'admin', 'status' => true])->save();
    $admin = $admin->refresh();

    $this->actingAs($admin, 'filament')
        ->get(\App\Filament\Pages\Settings\StorageReport::getUrl())
        ->assertSuccessful();
});
