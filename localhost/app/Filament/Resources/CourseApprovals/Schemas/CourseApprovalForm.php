<?php

namespace App\Filament\Resources\CourseApprovals\Schemas;

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

class CourseApprovalForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            ComponentsSection::make('Current Course Snapshot')
                ->description('The submitted course as the instructor created it, with key stats to help you decide.')
                ->columns(2)
                ->schema([
                    Placeholder::make('course_snapshot')
                        ->label('')
                        ->columnSpanFull()
                        ->content(fn ($record) => self::courseSnapshotHtml($record)),

                    Textarea::make('short_description')->label('Short Description')->disabled()->dehydrated(false)->rows(2)->columnSpanFull(),
                    RichEditor::make('description')->label('Description')->disabled()->dehydrated(false)->columnSpanFull(),
                    PrivateVideoUpload::coursePreview('preview_video')
                        ->label('Preview Video')
                        ->disabled()
                        ->dehydrated(false)
                        ->columnSpanFull(),
                ])
                ->columnSpanFull(),

            ComponentsSection::make('New Course Submission')
                ->description('This is a brand-new course awaiting first-time admin approval. Approving publishes it; rejecting marks it rejected with a reason.')
                ->schema([
                    Placeholder::make('submission_notice')
                        ->label('')
                        ->content(function ($record) {
                            $pendingEdits = $record && method_exists($record, 'editRequests')
                                ? $record->editRequests()->where('status', 'pending')->count()
                                : 0;

                            $html = '<span style="color:#6b7280;">No pending field changes — this is a new course awaiting first-time approval.</span>';

                            if ($pendingEdits > 0) {
                                $html .= '<br><span style="color:#92400e;">Note: this course also has ' . $pendingEdits . ' pending edit request(s) — review them under Course Edit Requests.</span>';
                            }

                            return new HtmlString($html);
                        }),
                ])
                ->columnSpanFull(),
        ]);
    }

    /**
     * Compact stat snapshot of the submitted course so the admin sees the
     * full picture (content size, pricing, instructor history) in one place.
     */
    protected static function courseSnapshotHtml($record): HtmlString
    {
        $course = $record;

        if (!$course instanceof Course) {
            return new HtmlString('');
        }

        $currency = $course->currency ?: 'USD';
        $categoryName = $course->category?->name
            ?? (Category::find((int) $course->category_id)?->name ?? '#' . $course->category_id);

        $students = $course->enrollments()->count();
        $sectionsCount = $course->sections()->count();
        $lessonsCount = $course->sections()->with('lessons')->get()->sum(fn ($section) => $section->lessons->count());

        $revenue = InstructorEarning::query()
            ->join('order_items', 'order_items.id', '=', 'instructor_earnings.order_item_id')
            ->where('order_items.course_id', $course->id)
            ->where('instructor_earnings.instructor_id', $course->instructor_id)
            ->where('instructor_earnings.status', '!=', 'reversed')
            ->whereHas('payment', fn ($payment) => $payment->where('status', 'paid'))
            ->sum('instructor_earnings.net_amount');

        $instructor = $course->instructor;
        $instructorCourses = $instructor
            ? Course::where('instructor_id', $instructor->id)->count()
            : 0;

        $thumbnailHtml = '';
        if ($course->thumbnail) {
            $src = url('storage/' . $course->thumbnail);
            $thumbnailHtml = '<img src="' . e($src) . '" alt="Thumbnail" style="max-width:140px;max-height:90px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;">';
        }

        $cards = [
            self::card('Instructor', e($instructor?->name ?? '—') . '<div style="font-weight:400;font-size:12px;color:#6b7280;">' . e($instructor?->email ?? '') . '</div>'),
            self::card('Category', e($categoryName)),
            self::card('Price', e(number_format((float) $course->price, 2) . ' ' . $currency)),
            self::card('Discount price', $course->discount_price !== null ? e(number_format((float) $course->discount_price, 2) . ' ' . $currency) : '—'),
            self::card('Level', e(ucfirst((string) $course->level) ?: '—')),
            self::card('Language', e((string) $course->language ?: '—')),
            self::card('Title', e($course->title)),
            self::card('Content', e($sectionsCount . ' section(s) · ' . $lessonsCount . ' lesson(s)')),
            self::card('Enrollments', (string) $students),
            self::card('Instructor revenue', e(number_format((float) $revenue, 2) . ' ' . $currency)),
            self::card('Instructor courses', (string) $instructorCourses),
        ];

        $adminUrl = CourseResource::getUrl('edit', ['record' => $course->id]);

        return new HtmlString(
            '<style>'
            . '@media (prefers-color-scheme: dark) {'
            . '  .course-approval-card {'
            . '    border-color: #374151 !important;'
            . '    background: #111827 !important;'
            . '    color: #f9fafb !important;'
            . '  }'
            . '  .course-approval-card-label {'
            . '    color: #9ca3af !important;'
            . '  }'
            . '  .course-approval-card-value {'
            . '    color: #f9fafb !important;'
            . '  }'
            . '}'
            . '</style>'
            . '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">'
            . $thumbnailHtml
            . '</div>'
            . '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-top:12px;">'
            . implode('', $cards)
            . '</div>'
            . '<div style="margin-top:12px;"><a href="' . e($adminUrl) . '" target="_blank" style="font-size:13px;">Open this course in the admin editor &rarr;</a></div>'
        );
    }

    protected static function card(string $label, string $value): string
    {
        return '<div class="course-approval-card" style="border:1px solid #e5e7eb;background:#ffffff;border-radius:8px;padding:8px 12px;color:#111827;">'
            . '<div class="course-approval-card-label" style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">' . e($label) . '</div>'
            . '<div class="course-approval-card-value" style="margin-top:2px;font-weight:600;color:#111827;">' . $value . '</div>'
            . '</div>';
    }
}

