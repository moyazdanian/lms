<?php

namespace App\Filament\Resources\SiteContents\Schemas;

use App\Models\Course;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section as FormSection;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class SiteContentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('section')
                    ->disabled()
                    ->dehydrated(),

                Toggle::make('visible')
                    ->label('Show this section on the homepage')
                    ->live()
                    ->default(true)
                    ->columnSpanFull(),

                // Everything the section renders, editable per section.
                FormSection::make('Content')
                    ->columns(2)
                    ->visible(fn (Get $get) => ! in_array($get('section'), ['features_strip']))
                    ->components([
                        TextInput::make('title')
                            ->label('Title')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        // Gradient span inside the hero headline.
                        TextInput::make('highlight')
                            ->label('Highlight (gradient text)')
                            ->visible(fn (Get $get) => $get('section') === 'hero')
                            ->maxLength(255)
                            ->helperText('Shown right after the title in the signature gradient.'),

                        Textarea::make('content')
                            ->label('Subtitle / description')
                            ->rows(3)
                            ->columnSpanFull(),

                        TextInput::make('badge')
                            ->label('Badge / link label')
                            ->visible(fn (Get $get) => in_array($get('section'), ['hero', 'popular', 'latest_courses', 'instructors', 'blog', 'call']))
                            ->maxLength(255)
                            ->helperText('Hero: the small badge above the title. Sections: the "View all" link label. CTA: the trust line under the buttons.'),

                        TextInput::make('search_placeholder')
                            ->label('Search input placeholder')
                            ->visible(fn (Get $get) => $get('section') === 'hero')
                            ->maxLength(255),

                        TextInput::make('btn_text')
                            ->label('Primary button text')
                            ->visible(fn (Get $get) => $get('section') === 'call'),

                        TextInput::make('btn_link')
                            ->label('Primary button link')
                            ->visible(fn (Get $get) => $get('section') === 'call'),

                        TextInput::make('btn_text_2')
                            ->label('Secondary button text')
                            ->visible(fn (Get $get) => $get('section') === 'call'),

                        TextInput::make('btn_link_2')
                            ->label('Secondary button link')
                            ->visible(fn (Get $get) => $get('section') === 'call'),
                    ]),

                // The three-item features strip, managed directly here.
                FormSection::make('Features strip')
                    ->description('The three items under the hero: title, subtitle and icon of each.')
                    ->visible(fn (Get $get) => $get('section') === 'features_strip')
                    ->columns(2)
                    ->components([
                        TextInput::make('first_title')->required()->maxLength(255),
                        TextInput::make('first_subtitle')->required()->maxLength(255),
                        \Guava\IconPicker\Forms\Components\IconPicker::make('first_icon')
                            ->sets(['heroicons'])
                            ->required(),
                        TextInput::make('second_title')->required()->maxLength(255),
                        TextInput::make('second_subtitle')->required()->maxLength(255),
                        \Guava\IconPicker\Forms\Components\IconPicker::make('second_icon')
                            ->sets(['heroicons'])
                            ->required(),
                        TextInput::make('third_title')->required()->maxLength(255),
                        TextInput::make('third_subtitle')->required()->maxLength(255),
                        \Guava\IconPicker\Forms\Components\IconPicker::make('third_icon')
                            ->sets(['heroicons-solid'])
                            ->required(),
                    ]),

                // The two floating hero course cards.
                FormSection::make('Hero course cards')
                    ->description('Pick the two courses shown as floating cards. Leave empty to fall back to the most popular courses automatically.')
                    ->visible(fn (Get $get) => $get('section') === 'hero')
                    ->columns(2)
                    ->components([
                        Select::make('hero_course_1_id')
                            ->label('Floating card 1 (big)')
                            ->options(fn () => self::courseOptions())
                            ->searchable()
                            ->preload()
                            ->nullable(),

                        Select::make('hero_course_2_id')
                            ->label('Floating card 2')
                            ->options(fn () => self::courseOptions())
                            ->searchable()
                            ->preload()
                            ->nullable(),
                    ]),
            ]);
    }

    /**
     * Selectable courses: publicly visible ones first (approved + active),
     * then the rest so admins can still preview drafts on the homepage.
     */
    private static function courseOptions(): array
    {
        return Course::query()
            ->withCount('enrollments')
            // approved first, then pending, then draft/rejected
            ->orderByRaw("CASE WHEN approval_status = 'approved' THEN 0 WHEN approval_status = 'pending_approval' THEN 1 ELSE 2 END")
            ->orderByDesc('enrollments_count')
            ->limit(200)
            ->get()
            ->mapWithKeys(fn (Course $course) => [
                $course->id => sprintf(
                    '#%d · %s%s',
                    $course->id,
                    $course->title,
                    $course->approval_status !== Course::APPROVAL_APPROVED ? ' (' . str_replace('_', ' ', $course->approval_status) . ')' : '',
                ),
            ])
            ->toArray();
    }
}
