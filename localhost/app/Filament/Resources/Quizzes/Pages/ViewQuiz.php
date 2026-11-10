<?php

namespace App\Filament\Resources\Quizzes\Pages;

use App\Filament\Resources\Quizzes\QuizResource;
use Filament\Actions\Action;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Section;

class ViewQuiz extends ViewRecord
{
    protected static string $resource = QuizResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('edit_settings')
                ->label('Edit supervision settings')
                ->icon('heroicon-o-cog-6-tooth')
                ->url(static::getResource()::getUrl('edit', ['record' => $this->getRecord()])),
        ];
    }

    public function infolist(\Filament\Schemas\Schema $schema): \Filament\Schemas\Schema
    {
        return $schema->components([
            Section::make('Quiz')
                ->columns(3)
                ->schema([
                    TextEntry::make('course.title')->label('Course'),
                    TextEntry::make('title')->label('Quiz title'),
                    TextEntry::make('pass_mark_display')
                        ->label('Pass mark')
                        ->state(fn ($record) => (float) $record->pass_mark > 0
                            ? ((float) $record->pass_mark) . '%'
                            : 'global default'),
                    TextEntry::make('max_attempts')
                        ->label('Max attempts')
                        ->state(fn ($record) => $record->max_attempts
                            ? (string) $record->max_attempts
                            : 'unlimited'),
                    TextEntry::make('attempts_count')->label('Total attempts'),
                    TextEntry::make('is_active')
                        ->label('Active')
                        ->badge()
                        ->state(fn ($record) => $record->is_active ? 'yes' : 'no')
                        ->color(fn ($record) => $record->is_active ? 'success' : 'danger'),
                ]),

            Section::make('Questions')
                ->schema([
                    RepeatableEntry::make('questions')
                        ->hiddenLabel()
                        ->columnSpanFull()
                        ->schema([
                            TextEntry::make('question')
                                ->hiddenLabel()
                                ->weight('bold')
                                ->columnSpanFull(),
                            TextEntry::make('points')
                                ->label('Points')
                                ->badge(),
                            RepeatableEntry::make('options')
                                ->hiddenLabel()
                                ->columnSpanFull()
                                ->schema([
                                    TextEntry::make('option_text')
                                        ->hiddenLabel()
                                        ->state(fn ($record) => ((bool) $record->is_correct ? '✓ ' : '• ') . $record->option_text)
                                        ->color(fn ($record) => (bool) $record->is_correct ? 'success' : 'gray'),
                                ]),
                        ]),
                ]),
        ]);
    }

    public function getTitle(): string
    {
        return 'Quiz: ' . $this->getRecord()->course?->title;
    }
}
