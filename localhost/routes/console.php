<?php

use Illuminate\Foundation\Inspiring;
use App\Models\Lesson;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('videos:migrate-to-private {--dry-run}', function () {
    $privateDiskName = config('filesystems.lesson_video_disk', 'private');

    if ($privateDiskName === 'public') {
        $this->error('LESSON_VIDEO_DISK cannot be set to the public disk.');
        return Command::FAILURE;
    }

    $public = Storage::disk('public');
    $private = Storage::disk($privateDiskName);
    $dryRun = (bool) $this->option('dry-run');
    $migrated = 0;
    $skipped = 0;

    Lesson::query()
        ->whereNotNull('video_url')
        ->chunkById(100, function ($lessons) use ($public, $private, $dryRun, &$migrated, &$skipped) {
            foreach ($lessons as $lesson) {
                $path = $lesson->video_url;

                if (!$public->exists($path)) {
                    $skipped++;
                    $this->warn("Public file not found for lesson {$lesson->id}: {$path}");
                    continue;
                }

                if ($dryRun) {
                    $migrated++;
                    $this->line("Would move lesson {$lesson->id}: {$path}");
                    continue;
                }

                $stream = $public->readStream($path);
                if (!is_resource($stream)) {
                    throw new \RuntimeException("Unable to read public video: {$path}");
                }

                try {
                    if (!$private->writeStream($path, $stream)) {
                        throw new \RuntimeException("Unable to write private video: {$path}");
                    }
                } finally {
                    fclose($stream);
                }

                $public->delete($path);
                $migrated++;
                $this->info("Moved lesson {$lesson->id}: {$path}");
            }
        });

    $this->info(($dryRun ? 'Would migrate' : 'Migrated')." {$migrated} video(s); skipped {$skipped}.");

    return Command::SUCCESS;
})->purpose('Move existing lesson videos from the public disk to the private lesson-video disk');
