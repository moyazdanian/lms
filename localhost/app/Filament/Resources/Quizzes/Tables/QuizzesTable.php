<?php

namespace App\Filament\Resources\Quizzes\Tables;

use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class QuizzesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query
                ->with('course:id,title,instructor_id')
                ->withCount(['questions', 'attempts']))
            ->columns([
                TextColumn::make('course.title')
                    ->label('Course')
                    ->limit(45)
                    ->searchable(),
                TextColumn::make('questions_count')
                    ->label('Questions')
                    ->alignCenter(),
                TextColumn::make('attempts_count')
                    ->label('Attempts')
                    ->alignCenter(),
                TextColumn::make('pass_mark_display')
                    ->label('Pass Mark')
                    ->state(fn ($record) => (float) $record->pass_mark > 0
                        ? ((float) $record->pass_mark) . '%'
                        : 'default')
                    ->badge()
                    ->color('gray'),
                TextColumn::make('max_attempts')
                    ->label('Max Attempts')
                    ->state(fn ($record) => $record->max_attempts
                        ? (string) $record->max_attempts
                        : '∞')
                    ->alignCenter(),
                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),
            ])
            ->filters([
                TernaryFilter::make('is_active')
                    ->label('Active'),
            ])
            ->recordActions([
                \Filament\Actions\EditAction::make(),
            ])
            ->actionsColumnLabel('Actions')
            ->defaultSort('created_at', 'desc');
    }
}
