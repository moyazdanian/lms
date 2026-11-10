<?php

namespace App\Filament\Resources\CourseEditRequests\Tables;

use App\Models\CourseEditRequest;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CourseEditRequestsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with([
                'course:id,title,currency,thumbnail,instructor_id',
                'course.instructor:id,name,email',
            ]))
            ->columns([
                TextColumn::make('id')->label('#')->sortable(),
                TextColumn::make('course.title')
                    ->label('Course')
                    ->limit(40)
                    ->tooltip(fn ($record) => $record->course?->title)
                    ->searchable(),
                TextColumn::make('course.instructor.name')
                    ->label('Instructor')
                    ->searchable(),
                TextColumn::make('changed_fields')
                    ->label('Changed Fields')
                    ->badge()
                    ->state(fn ($record) => collect($record->changes ?? [])
                        ->map(fn ($_, $field) => \App\Models\Course::sensitiveFieldLabels()[$field] ?? $field)
                        ->values()
                        ->all()),
                TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        CourseEditRequest::STATUS_PENDING => 'Pending',
                        CourseEditRequest::STATUS_APPROVED => 'Approved',
                        CourseEditRequest::STATUS_REJECTED => 'Rejected',
                        default => (string) $state,
                    })
                    ->color(fn ($state) => match ($state) {
                        CourseEditRequest::STATUS_PENDING => 'warning',
                        CourseEditRequest::STATUS_APPROVED => 'success',
                        CourseEditRequest::STATUS_REJECTED => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('submitted_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable()
                    ->since(),
                TextColumn::make('reviewed_at')
                    ->label('Reviewed')
                    ->dateTime()
                    ->since()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        CourseEditRequest::STATUS_PENDING => 'Pending',
                        CourseEditRequest::STATUS_APPROVED => 'Approved',
                        CourseEditRequest::STATUS_REJECTED => 'Rejected',
                    ])
                    ->default(CourseEditRequest::STATUS_PENDING),
            ])
            ->recordActions([
                \Filament\Actions\ViewAction::make(),
            ])
            ->actionsColumnLabel('Actions')
            ->defaultSort('submitted_at', 'desc')
            ->poll('30s');
    }
}
