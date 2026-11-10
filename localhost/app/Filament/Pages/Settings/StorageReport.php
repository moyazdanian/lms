<?php

namespace App\Filament\Pages\Settings;

use App\Services\StorageDistributionService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * "Settings > Storage Report" — where do the media files actually live?
 *
 * Counts lesson videos, course previews and lesson attachments per disk.
 * Rows without a media_disk stamp are "legacy": the report tells them
 * apart by probing the disks read-only, without backfilling, so the
 * number stays visible until the file is streamed or re-saved once
 * (which stamps it for real via MediaDiskResolver).
 */
class StorageReport extends Page
{
    protected string $view = 'filament.pages.storage-report';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ChartBar;

    protected static UnitEnum|string|null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Storage Report';

    protected static ?int $navigationSort = 6;

    /** Cached per request so summary() and report() hit the disks once. */
    protected ?array $report = null;

    public function mount(): void
    {
        //
    }

    public function getHeading(): string
    {
        return 'Storage Report';
    }

    public function getSubheading(): string
    {
        return 'Which disk holds your lesson videos, course previews and attachments — and which rows still have no disk recorded.';
    }

    /**
     * The full distribution report (memoized for this request).
     */
    public function report(): array
    {
        return $this->report ??= app(StorageDistributionService::class)->build();
    }

    /**
     * One-sentence "what to do next" derived from the report.
     */
    public function summary(): string
    {
        return app(StorageDistributionService::class)->summary($this->report());
    }

    /**
     * Badge classes for the disk cell.
     */
    public function badgeFor(string $disk): string
    {
        return 'bg-info-50 text-info-600 ring-info-600/20 dark:bg-info-400/10 dark:text-info-400 dark:ring-info-400/20';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('refresh')
                ->label('Refresh')
                ->icon(Heroicon::ArrowPath)
                ->action(function () {
                    // Drop the memoized report so the re-render probes the
                    // disks again (files may have moved since page load).
                    $this->report = null;
                }),
        ];
    }
}
