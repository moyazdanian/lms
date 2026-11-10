<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Resolves the storage disk that actually holds a media file.
 *
 * Every video/attachment row now records the disk it was uploaded to
 * (lessons.media_disk / courses.media_disk / lesson_resources.media_disk,
 * stamped by model hooks). Rows uploaded before those columns existed are
 * "legacy": for them the resolver probes the previous locations in order —
 * the currently configured lesson disk, then the hard .env defaults — and
 * returns the first disk that has the file. A hit is also backfilled into
 * the row so every later request resolves instantly.
 */
class MediaDiskResolver
{
    /** Default disk when nothing else matches (same fallback the app used before). */
    public const FALLBACK_DISK = 'private';

    /** @var array<string, bool> per-request memo: "disk|path" => exists */
    protected static array $existenceCache = [];

    /**
     * The disk to store NEW uploads on (the panel/env-configured one).
     */
    public static function currentDisk(): string
    {
        return (string) config('filesystems.lesson_video_disk', self::FALLBACK_DISK);
    }

    /**
     * Record the disk a file was uploaded to, so it can always be resolved
     * back later. No-ops when the row was created before the column existed
     * or already carries a value.
     */
    public static function stamp($model, string $pathColumn, string $disk): void
    {
        $path = $model->{$pathColumn};

        if (! $path || ! $model->isFillable('media_disk')) {
            return;
        }

        if ($model->getOriginal('media_disk') === $disk && ! $model->isDirty('media_disk')) {
            return;
        }

        $model->forceFill(['media_disk' => $disk])->saveQuietly();
    }

    /**
     * Resolve which disk holds the given row's media file.
     *
     * @param  object  $model  Lesson / Course / LessonAttachment row
     * @param  string  $pathColumn  name of the column holding the relative path
     * @return string the disk name (guaranteed to exist as a filesystem disk)
     */
    public static function resolve($model, string $pathColumn): string
    {
        $path = $model->{$pathColumn};

        if (! $path) {
            return self::FALLBACK_DISK;
        }

        // Rows uploaded after this feature: trust the stamp.
        $stamped = isset($model->media_disk) ? (string) $model->media_disk : '';

        if ($stamped !== '' && self::diskIsConfigured($stamped)) {
            return $stamped;
        }

        // Legacy rows: probe where the file could live.
        foreach (self::candidateDisks() as $diskName) {
            if (self::fileExists($diskName, $path)) {
                self::backfill($model, $diskName);

                return $diskName;
            }
        }

        // Not found anywhere — behave exactly like the old code did
        // (points at the configured disk so the streamer 404s).
        return self::currentDisk();
    }

    /**
     * Resolve the disk for a raw path that has no row of its own — e.g. the
     * old/new preview snapshot inside a course edit request, or a file queued
     * for deletion that the course no longer references. Probes the candidate
     * disks for THAT path (no backfill — there is nothing to backfill onto).
     */
    public static function resolveForPath(?string $path): string
    {
        if (! $path) {
            return self::FALLBACK_DISK;
        }

        foreach (self::candidateDisks() as $diskName) {
            if (self::fileExists($diskName, $path)) {
                return $diskName;
            }
        }

        return self::currentDisk();
    }

    /**
     * True when the file exists on ANY known disk — used by the admin UI to
     * show "File not found" instead of a wrong byte size for missing files.
     */
    public static function existsOnAnyDisk($model, string $pathColumn): bool
    {
        $path = $model->{$pathColumn};

        if (! $path) {
            return false;
        }

        foreach (self::candidateDisks($model->media_disk ?? null) as $diskName) {
            if (self::fileExists($diskName, $path)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Public access to the candidate probe order — used by the storage
     * report to classify legacy rows without triggering a backfill.
     *
     * @return array<string>
     */
    public static function candidateDisksFor(?string $stamped = null): array
    {
        return self::candidateDisks($stamped ?? '');
    }

    /**
     * Public read-only existence probe against the resolver's memoized
     * cache (same cache the streaming path uses, so the report stays cheap).
     */
    public static function fileExistsOn(string $diskName, string $path): bool
    {
        return self::fileExists($diskName, $path);
    }

    /**
     * True when a disk with this name is defined in filesystems config.
     */
    public static function diskNameIsConfigured(string $diskName): bool
    {
        return self::diskIsConfigured($diskName);
    }

    /**
     * Where a legacy file could be, most likely first: the disk that is
     * configured right now (it was current before the switch too), then the
     * static env defaults, then S3 and the other local disks.
     *
     * @return array<string>
     */
    protected static function candidateDisks(?string $stamped = null): array
    {
        $candidates = [
            self::currentDisk(),
            (string) env('LESSON_VIDEO_DISK', self::FALLBACK_DISK),
            (string) env('LESSON_ATTACHMENT_DISK', ''),
            's3',
            'private',
            'public',
            'videos',
        ];

        if ($stamped !== '') {
            array_unshift($candidates, $stamped);
        }

        // Deduplicate, keep order, drop empty names.
        $candidates = array_values(array_unique(array_filter($candidates)));

        // Skip disks that are not configured at all (e.g. the S3 disk on an
        // install without S3 — probing it would throw).
        return array_values(array_filter(
            $candidates,
            fn (string $diskName) => self::diskIsConfigured($diskName),
        ));
    }

    protected static function diskIsConfigured(string $diskName): bool
    {
        if ($diskName === '') {
            return false;
        }

        return array_key_exists($diskName, (array) config('filesystems.disks', []));
    }

    protected static function fileExists(string $diskName, string $path): bool
    {
        $key = $diskName.'|'.$path;

        if (! array_key_exists($key, self::$existenceCache)) {
            try {
                self::$existenceCache[$key] = Storage::disk($diskName)->exists($path);
            } catch (\Throwable) {
                self::$existenceCache[$key] = false;
            }
        }

        return self::$existenceCache[$key];
    }

    protected static function backfill($model, string $diskName): void
    {
        if ($model->isFillable('media_disk')) {
            $model->forceFill(['media_disk' => $diskName])->saveQuietly();
        }
    }

    public static function flushCache(): void
    {
        self::$existenceCache = [];
    }
}
