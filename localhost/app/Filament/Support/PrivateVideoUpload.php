<?php

namespace App\Filament\Support;

use App\Models\Course;
use App\Models\Lesson;
use App\Support\MediaDiskResolver;
use Filament\Forms\Components\FileUpload;
use Illuminate\Support\Facades\Storage;

class PrivateVideoUpload
{
    public static function lesson(string $name = 'video_url'): FileUpload
    {
        return static::make($name, 'lesson')
            ->directory('lessons-videos')
            ->maxSize(512000)
            ->required();
    }

    public static function coursePreview(string $name = 'preview_video'): FileUpload
    {
        return static::make($name, 'course')
            ->directory('course-previews')
            ->maxSize(512000)
            ->nullable();
    }

    protected static function make(string $name, string $kind): FileUpload
    {
        // New uploads go to the currently configured disk; existing files are
        // read back from the disk recorded at their upload time.
        $disk = MediaDiskResolver::currentDisk();

        return FileUpload::make($name)
            ->disk($disk)
            ->visibility('private')
            ->acceptedFileTypes([
                'video/mp4',
                'video/webm',
                'video/quicktime',
                'video/mpeg',
                'video/x-msvideo',
                'video/x-matroska',
                'video/x-flv',
                'video/x-ms-wmv',
            ])
            ->previewable()
            ->openable()
            ->downloadable()
            ->getUploadedFileUsing(function ($component, string $file, string|array|null $storedFileNames) use ($kind): ?array {
                $record = $kind === 'course'
                    ? Course::query()->where('preview_video', $file)->first()
                    : Lesson::query()->where('video_url', $file)->first();

                if (! $record) {
                    return null;
                }

                // The file may live on the disk it was uploaded to, which is
                // not necessarily the currently configured one anymore.
                $storage = Storage::disk(MediaDiskResolver::resolve(
                    $record,
                    $kind === 'course' ? 'preview_video' : 'video_url',
                ));

                if (! $storage->exists($file)) {
                    return null;
                }

                $storedFileName = is_array($storedFileNames)
                    ? ($storedFileNames[$file] ?? null)
                    : $storedFileNames;

                return [
                    'name' => $storedFileName ?: basename($file),
                    'size' => $storage->size($file),
                    'type' => $storage->mimeType($file) ?: 'video/mp4',
                    'url' => $kind === 'course'
                        ? route('filament.admin.media.course-preview', ['course' => $record->getKey()])
                        : route('filament.admin.media.lesson-video', ['lesson' => $record->getKey()]),
                ];
            });
    }
}
