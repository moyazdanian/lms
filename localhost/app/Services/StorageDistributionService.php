<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\Support\MediaDiskResolver;

/**
 * Powers the "Settings > Storage Report" admin page.
 *
 * Counts lesson videos, course preview videos and lesson attachments per
 * storage disk WITHOUT writing anything: legacy rows (uploaded before the
 * media_disk columns existed) are classified by probing the candidate
 * disks, but deliberately NOT backfilled here — backfilling would hide
 * the rows this very report is supposed to reveal. Only stamping during
 * normal playback/upload resolves them for real.
 *
 * Report shape:
 *   rows    — one line per disk: total files living there plus how many
 *             of them are located-legacy (no media_disk stamp).
 *   totals  — files (every row with a path), stamped (media_disk set),
 *             legacy (no stamp: uploaded before the columns existed) and
 *             missing (the subset of legacy whose file exists nowhere).
 *             stamped + legacy = files.
 */
class StorageDistributionService
{
    /**
     * Build the whole report.
     *
     * @return array{
     *     disks: array<string>,
     *     rows: array<int, array<string, int|string>>,
     *     totals: array{files: int, stamped: int, legacy: int, missing: int}
     * }
     */
    public function build(): array
    {
        // One bucket per media family: disk name => row count.
        $buckets = [
            'lessons' => [],
            'previews' => [],
            'attachments' => [],
        ];

        // Per family: how many legacy rows were located on each disk, plus
        // the flat counters for the summary cards.
        $legacyByDisk = ['lessons' => [], 'previews' => [], 'attachments' => []];
        $stamped = ['lessons' => 0, 'previews' => 0, 'attachments' => 0];
        $legacy = ['lessons' => 0, 'previews' => 0, 'attachments' => 0];
        $missing = ['lessons' => 0, 'previews' => 0, 'attachments' => 0];

        foreach (Lesson::query()
            ->whereNotNull('video_url')->where('video_url', '!=', '')
            ->get(['id', 'video_url', 'media_disk']) as $lesson) {
            $this->place(
                $this->classify($lesson, 'video_url'),
                $buckets['lessons'], $legacyByDisk['lessons'], $stamped['lessons'], $legacy['lessons'], $missing['lessons'],
            );
        }

        foreach (Course::withTrashed()
            ->whereNotNull('preview_video')->where('preview_video', '!=', '')
            ->get(['id', 'preview_video', 'media_disk']) as $course) {
            $this->place(
                $this->classify($course, 'preview_video'),
                $buckets['previews'], $legacyByDisk['previews'], $stamped['previews'], $legacy['previews'], $missing['previews'],
            );
        }

        foreach (LessonAttachment::query()
            ->whereNotNull('file_path')->where('file_path', '!=', '')
            ->get(['id', 'file_path', 'media_disk']) as $attachment) {
            $this->place(
                $this->classify($attachment, 'file_path'),
                $buckets['attachments'], $legacyByDisk['attachments'], $stamped['attachments'], $legacy['attachments'], $missing['attachments'],
            );
        }

        // One table row per disk seen anywhere, configured disks first so
        // the table is stable even when it is all zeros.
        $diskNames = array_values(array_unique(array_merge(
            $this->disksInUse(),
            ...array_map(fn (array $bucket) => array_keys($bucket), array_values($buckets)),
        )));

        $rows = [];

        foreach ($diskNames as $disk) {
            $row = ['disk' => $disk];

            foreach ($buckets as $family => $bucket) {
                $row[$family] = (int) ($bucket[$disk] ?? 0);
                // Of these, how many rows still have no media_disk stamp.
                $row[$family.'_legacy'] = (int) ($legacyByDisk[$family][$disk] ?? 0);
            }

            $row['total'] = $row['lessons'] + $row['previews'] + $row['attachments'];
            $row['total_legacy'] = $row['lessons_legacy'] + $row['previews_legacy'] + $row['attachments_legacy'];
            $rows[] = $row;
        }

        $totals = [
            'files' => array_sum($stamped) + array_sum($legacy),
            'stamped' => array_sum($stamped),
            'legacy' => array_sum($legacy),
            'missing' => array_sum($missing),
        ];

        return [
            'disks' => $diskNames,
            'rows' => $rows,
            'totals' => $totals,
        ];
    }

    /**
     * Human-readable summary of what the admin should do next.
     *
     * @param  array{totals: array{files: int, stamped: int, legacy: int, missing: int}}  $report
     */
    public function summary(array $report): string
    {
        $totals = $report['totals'];

        if ($totals['files'] === 0) {
            return 'No media files recorded yet — upload a lesson video or attachment and it will appear here.';
        }

        if ($totals['legacy'] === 0 && $totals['missing'] === 0) {
            return 'All '.$totals['files'].' file(s) have their disk recorded. Nothing to do.';
        }

        $parts = [];

        if ($totals['legacy'] > $totals['missing']) {
            $parts[] = ($totals['legacy'] - $totals['missing']).' row(s) still have no disk recorded (legacy) — the app finds their file by probing the disks, and the first stream or re-save makes that permanent.';
        }

        if ($totals['missing'] > 0) {
            $parts[] = $totals['missing'].' file(s) could not be found on any disk — usually deleted files; re-upload or remove those rows.';
        }

        return implode(' · ', $parts);
    }

    /**
     * Work out where one row's file lives without writing anything.
     *
     * @return array{status: string, disk: ?string}
     *         status: "stamped" (media_disk set) | "legacy" (located by
     *         probing, or missing) | "empty" (row has no path at all)
     */
    protected function classify($model, string $pathColumn): array
    {
        $disk = $model->media_disk ?? null;

        if (is_string($disk) && $disk !== '' && MediaDiskResolver::diskNameIsConfigured($disk)) {
            return ['status' => 'stamped', 'disk' => $disk];
        }

        $path = $model->{$pathColumn};

        if (! $path) {
            return ['status' => 'empty', 'disk' => null];
        }

        // Legacy row: where does the file actually live right now?
        foreach (MediaDiskResolver::candidateDisksFor(null) as $diskName) {
            if (MediaDiskResolver::fileExistsOn($diskName, $path)) {
                return ['status' => 'legacy', 'disk' => $diskName];
            }
        }

        // Not on any disk — dead path.
        return ['status' => 'legacy', 'disk' => null];
    }

    /**
     * Fold one classified row into its family's counters.
     */
    protected function place(array $result, array &$bucket, array &$legacyByDisk, int &$stamped, int &$legacy, int &$missing): void
    {
        switch ($result['status']) {
            case 'stamped':
                $bucket[$result['disk']] = ($bucket[$result['disk']] ?? 0) + 1;
                $stamped++;
                break;

            case 'legacy':
                $legacy++;

                if ($result['disk'] !== null) {
                    $bucket[$result['disk']] = ($bucket[$result['disk']] ?? 0) + 1;
                    $legacyByDisk[$result['disk']] = ($legacyByDisk[$result['disk']] ?? 0) + 1;
                } else {
                    $missing++;
                }
                break;
        }
    }

    /**
     * The disks this install could plausibly use, matching what
     * MigrateMediaToCloud and MediaDiskResolver know about.
     *
     * @return array<string>
     */
    protected function disksInUse(): array
    {
        return array_values(array_unique(array_filter([
            MediaDiskResolver::currentDisk(),
            (string) env('LESSON_VIDEO_DISK', MediaDiskResolver::FALLBACK_DISK),
            (string) env('LESSON_ATTACHMENT_DISK', ''),
            's3',
            'private',
            'public',
            'videos',
        ], fn (string $disk) => $disk !== '' && MediaDiskResolver::diskNameIsConfigured($disk))));
    }
}
