<?php

namespace App\Filament\Resources\CourseEditRequests\Schemas;

use App\Filament\Resources\Courses\CourseResource;
use App\Filament\Support\PrivateVideoUpload;
use App\Models\Category;
use App\Models\Course;
use App\Models\InstructorEarning;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section as ComponentsSection;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;

class CourseEditRequestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            ComponentsSection::make('Current Course (Live Data)')
                ->description('What students see right now. Cards highlighted in amber are exactly the fields this request wants to change — approving replaces them, rejecting keeps them untouched.')
                ->columns(2)
                ->schema([
                    Placeholder::make('live_overview')
                        ->label('')
                        ->columnSpanFull()
                        ->content(fn ($record) => self::liveOverviewHtml($record)),

                    Textarea::make('short_description')
                        ->label('Short Description')
                        ->formatStateUsing(fn ($state, $record) => $record?->course?->short_description)
                        ->disabled()
                        ->dehydrated(false)
                        ->rows(2)
                        ->columnSpanFull(),
                    RichEditor::make('description')
                        ->label('Description')
                        ->formatStateUsing(fn ($state, $record) => $record?->course?->description)
                        ->disabled()
                        ->dehydrated(false)
                        ->columnSpanFull(),
                    PrivateVideoUpload::coursePreview()
                        ->formatStateUsing(fn ($state, $record) => $record?->course?->preview_video)
                ])
                ->columnSpanFull(),

            ComponentsSection::make('Requested Changes')
                ->description('Old value → new value for every sensitive field. Approving applies the new values to the live course; rejecting keeps the current data.')
                ->schema([
                    Placeholder::make('changes_review')
                        ->label('')
                        ->content(function ($record) {
                            $changes = $record?->changes;

                            if (empty($changes) || !is_array($changes)) {
                                return new HtmlString('<span style="color:#6b7280;">No field changes recorded.</span>');
                            }

                            $labels = Course::sensitiveFieldLabels();
                            $rows = '';

                            foreach ($changes as $field => $change) {
                                $label = $labels[$field] ?? $field;

                                $rows .= '<tr>'
                                    . '<td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;">' . e($label) . '</td>'
                                    . '<td style="padding:6px 12px;vertical-align:top;">' . self::diffCell($record, $field, 'old', $change['old'] ?? null) . '</td>'
                                    . '<td style="padding:6px 4px;color:#6b7280;vertical-align:top;">&rarr;</td>'
                                    . '<td style="padding:6px 12px;vertical-align:top;">' . self::diffCell($record, $field, 'new', $change['new'] ?? null) . '</td>'
                                    . '</tr>';
                            }

                            return new HtmlString(
                                '<table style="border-collapse:separate;border-spacing:0 4px;width:100%;">' . $rows . '</table>'
                            );
                        }),
                ])
                ->columnSpanFull(),
        ]);
    }

    /**
     * Snapshot of the live course as it is published right now, with the
     * fields affected by this request visually highlighted.
     */
    protected static function liveOverviewHtml($record): HtmlString
    {
        $course = $record?->course;

        if (!$course) {
            return new HtmlString('<span style="color:#6b7280;">Course not found.</span>');
        }

        $affected = collect(is_array($record->changes) ? $record->changes : [])->keys();
        $isAffected = fn (string $field): bool => $affected->contains($field);

        $currency = $course->currency ?: 'USD';
        $revenue = InstructorEarning::query()
            ->join('order_items', 'order_items.id', '=', 'instructor_earnings.order_item_id')
            ->where('order_items.course_id', $course->id)
            ->where('instructor_earnings.instructor_id', $course->instructor_id)
            ->where('instructor_earnings.status', '!=', 'reversed')
            ->whereHas('payment', fn ($payment) => $payment->where('status', 'paid'))
            ->sum('instructor_earnings.net_amount');

        $students = $course->enrollments()->count();
        $approvalLabel = match ($course->approval_status) {
            Course::APPROVAL_APPROVED => 'Approved',
            Course::APPROVAL_PENDING => 'In review',
            Course::APPROVAL_REJECTED => 'Rejected',
            default => (string) $course->approval_status,
        };

        $categoryName = $course->category?->name
            ?? (Category::find((int) $course->category_id)?->name ?? '#' . $course->category_id);

        $thumbnailHtml = '';
        if ($course->thumbnail) {
            $src = url('storage/' . $course->thumbnail);
            $thumbnailHtml = '<img src="' . e($src) . '" alt="Thumbnail" style="max-width:140px;max-height:90px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;">';
        }

        $cards = [
            self::card('Instructor', e($course->instructor?->name ?? '—') . '<div style="font-weight:400;font-size:12px;color:#6b7280;">' . e($course->instructor?->email ?? '') . '</div>'),
            self::card('Category', e($categoryName), $isAffected('category_id')),
            self::card('Price', e(number_format((float) $course->price, 2) . ' ' . $currency), $isAffected('price')),
            self::card('Discount price', $course->discount_price !== null ? e(number_format((float) $course->discount_price, 2) . ' ' . $currency) : '—', $isAffected('discount_price')),
            self::card('Level', e(ucfirst((string) $course->level) ?: '—'), $isAffected('level')),
            self::card('Language', e((string) $course->language ?: '—'), $isAffected('language')),
            self::card('Title', e($course->title), $isAffected('title')),
            self::card('Status', e($approvalLabel . ' · ' . ($course->is_active ? 'Published' : 'Hidden'))),
            self::card('Students', (string) $students),
            self::card('Instructor revenue', e(number_format((float) $revenue, 2) . ' ' . $currency)),
        ];

        $adminUrl = CourseResource::getUrl('edit', ['record' => $course->id]);

        return new HtmlString(
            '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">'
            . $thumbnailHtml
            . '</div>'
            . '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-top:12px;">'
            . implode('', $cards)
            . '</div>'
            . '<div style="margin-top:12px;"><a href="' . e($adminUrl) . '" target="_blank" style="font-size:13px;">Open this course in the admin editor &rarr;</a></div>'
        );
    }

    protected static function card(string $label, string $value, bool $affected = false): string
    {
        $border = $affected ? '#f59e0b' : '#e5e7eb';
        $background = $affected ? '#fffbeb' : '#ffffff';
        $tag = $affected
            ? '<span style="display:inline-block;margin-left:6px;padding:1px 6px;border-radius:9999px;background:#fde68a;color:#92400e;font-size:10px;font-weight:600;text-transform:uppercase;">Under review</span>'
            : '';

        return '<div style="border:1px solid ' . $border . ';background:' . $background . ';border-radius:8px;padding:8px 12px;">'
            . '<div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">' . e($label) . $tag . '</div>'
            . '<div style="margin-top:2px;font-weight:600;">' . $value . '</div>'
            . '</div>';
    }

    /**
     * One side (old/new) of a diff cell. Media fields render the actual
     * image/video so the admin can compare them visually instead of reading
     * file names.
     */
    protected static function diffCell($record, string $field, string $which, mixed $value): string
    {
        $accent = $which === 'old' ? '#b91c1c' : '#047857';
        $background = $which === 'old' ? '#fef2f2' : '#ecfdf5';

        if ($field === 'thumbnail') {
            $inner = $value
                ? '<img src="' . e(url('storage/' . $value)) . '" alt="" style="max-width:180px;max-height:110px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;display:block;">'
                : '<span style="color:#9ca3af;">— (none)</span>';
        } elseif ($field === 'preview_video') {
            $inner = $value
                ? '<video controls preload="metadata" src="' . e(route('filament.admin.media.edit-request-preview', ['editRequest' => $record->getKey(), 'which' => $which])) . '" style="max-width:280px;border-radius:6px;display:block;"></video>'
                : '<span style="color:#9ca3af;">— (none)</span>';
        } else {
            $inner = e(self::formatValue($field, $value));
        }

        return '<div style="color:' . $accent . ';background:' . $background . ';border-radius:6px;padding:6px 10px;display:inline-block;">' . $inner . '</div>';
    }

    protected static function formatValue(string $field, mixed $value): string
    {
        if ($value === null || $value === '') {
            return '— (none)';
        }

        if (in_array($field, ['thumbnail', 'preview_video'], true)) {
            return '(file) ' . basename((string) $value);
        }

        if ($field === 'category_id') {
            $name = Category::find((int) $value)?->name;

            return $name ? $name . ' (#' . $value . ')' : '#' . $value;
        }

        return (string) $value;
    }
}
