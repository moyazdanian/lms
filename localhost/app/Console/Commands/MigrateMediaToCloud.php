<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

/**
 * Moves lesson videos, course previews and lesson attachments from the
 * current disk to a target disk (typically S3 or any S3-compatible service).
 *
 * Usage:
 *   php artisan media:migrate-to-cloud --target=s3 --dry-run
 *   php artisan media:migrate-to-cloud --target=s3
 *   php artisan media:migrate-to-cloud --target=s3 --prune
 *
 * The database stores relative paths, so after a successful migration the
 * only remaining step is pointing LESSON_VIDEO_DISK (and, when used,
 * LESSON_ATTACHMENT_DISK) at the target disk in .env.
 */
class MigrateMediaToCloud extends Command
{
    protected $signature = 'media:migrate-to-cloud
                            {--target=s3 : Destination disk name as defined in filesystems.php}
                            {--source= : Source disk name (defaults to the configured lesson video disk)}
                            {--dry-run : List what would be transferred without copying}
                            {--prune : Delete source files after a verified copy}';

    protected $description = 'Copy lesson videos, previews and attachments to a cloud disk and verify them';

    protected const DIRECTORIES = ['lessons-videos', 'course-previews', 'lesson-attachments'];

    public function handle(): int
    {
        $targetName = (string) $this->option('target');
        $sourceName = (string) ($this->option('source') ?: config('filesystems.lesson_video_disk', 'private'));

        if ($targetName === $sourceName) {
            $this->error("Source and target disk are the same ({$sourceName}). Nothing to do.");

            return self::FAILURE;
        }

        /** @var FilesystemAdapter $source */
        $source = Storage::disk($sourceName);
        /** @var FilesystemAdapter $target */
        $target = Storage::disk($targetName);

        // Fail fast on an unreachable/misconfigured cloud disk before any copy.
        try {
            $target->exists('__media_migration_probe__');
        } catch (\Throwable $e) {
            $this->error("Target disk [{$targetName}] is not reachable: " . $e->getMessage());

            return self::FAILURE;
        }

        $files = [];
        foreach (self::DIRECTORIES as $directory) {
            foreach ($source->allFiles($directory) as $file) {
                $files[] = $file;
            }
        }

        $files = array_values(array_unique($files));

        if ($files === []) {
            $this->info('No media files found on the source disk under: ' . implode(', ', self::DIRECTORIES));

            return self::SUCCESS;
        }

        $isDryRun = (bool) $this->option('dry-run');
        $doPrune = (bool) $this->option('prune');

        $this->info(sprintf(
            '%s %d file(s) from [%s] to [%s]%s',
            $isDryRun ? 'Would copy' : 'Copying',
            count($files),
            $sourceName,
            $targetName,
            $doPrune && ! $isDryRun ? ' (pruning verified source files)' : ''
        ));

        $bar = $this->output->createProgressBar(count($files));
        $bar->start();

        $copied = 0;
        $skipped = 0;
        $failed = [];
        $pruned = 0;

        foreach ($files as $path) {
            try {
                // Resume support: files already migrated (same size) are skipped.
                if ($target->exists($path)
                    && (int) $target->size($path) === (int) $source->size($path)) {
                    $skipped++;
                } else {
                    $stream = $source->readStream($path);

                    if (! is_resource($stream)) {
                        $failed[] = $path;
                        $bar->advance();

                        continue;
                    }

                    $target->writeStream($path, $stream);

                    if (is_resource($stream)) {
                        fclose($stream);
                    }

                    // Verify before counting the copy as done.
                    if ((int) $target->size($path) !== (int) $source->size($path)) {
                        $failed[] = $path . ' (size mismatch)';
                        $bar->advance();

                        continue;
                    }

                    $copied++;

                    if ($doPrune) {
                        $source->delete($path);
                        $pruned++;
                    }
                }
            } catch (\Throwable $e) {
                $failed[] = $path . ' — ' . $e->getMessage();
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Copied: {$copied} | Already present (skipped): {$skipped} | Failed: " . count($failed));

        if ($pruned > 0) {
            $this->info("Pruned from source: {$pruned}");
        }

        if ($failed !== []) {
            $this->warn('Failed files:');
            foreach (array_slice($failed, 0, 25) as $failure) {
                $this->line(' - ' . $failure);
            }

            if (count($failed) > 25) {
                $this->line(' ... and ' . (count($failed) - 25) . ' more.');
            }

            $this->newLine();
            $this->warn('Fix the issues and re-run the command — it resumes and re-checks every file.');

            return self::FAILURE;
        }

        if (! $isDryRun) {
            $this->newLine();
            $this->info('Next step: switch the Lesson Video Disk to [' . $targetName . '] in the admin panel (Settings > Storage), or set LESSON_VIDEO_DISK=' . $targetName . ' in your .env. Videos uploaded before the switch keep playing automatically.');
        }

        return self::SUCCESS;
    }
}
