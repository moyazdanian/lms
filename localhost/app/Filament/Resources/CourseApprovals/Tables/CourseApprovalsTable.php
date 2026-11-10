<?php

namespace App\Filament\Resources\CourseApprovals\Tables;

use App\Models\Course;
use App\Services\CourseApprovalService;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CourseApprovalsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            // Private instructor drafts never enter the review queue — the
            // admin only sees courses that were explicitly submitted.
            ->modifyQueryUsing(fn ($query) => $query
                ->where('approval_status', '!=', Course::APPROVAL_DRAFT)
                ->with(['instructor:id,name,email', 'category:id,name']))
            ->columns([
                TextColumn::make('id')->label('#')->sortable(),
                ImageColumn::make('thumbnail')
                    ->disk('public')
                    ->visibility('public')
                    ->circular(),
                TextColumn::make('title')
                    ->searchable()
                    ->limit(40)
                    ->tooltip(fn ($record) => $record->title),
                TextColumn::make('instructor.name')
                    ->label('Instructor')
                    ->searchable(),
                TextColumn::make('instructor.email')
                    ->label('Email')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('category.name')
                    ->label('Category'),
                TextColumn::make('price')
                    ->money(fn ($record) => strtolower($record->currency ?: 'usd'))
                    ->sortable(),
                TextColumn::make('approval_status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        Course::APPROVAL_PENDING => 'Pending',
                        Course::APPROVAL_APPROVED => 'Approved',
                        Course::APPROVAL_REJECTED => 'Rejected',
                        Course::APPROVAL_DRAFT => 'Draft',
                        default => (string) $state,
                    })
                    ->color(fn ($state) => match ($state) {
                        Course::APPROVAL_PENDING => 'warning',
                        Course::APPROVAL_APPROVED => 'success',
                        Course::APPROVAL_REJECTED => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('submitted_for_approval_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable()
                    ->since(),
            ])
            ->filters([
                SelectFilter::make('approval_status')
                    ->label('Status')
                    ->options([
                        Course::APPROVAL_PENDING => 'Pending',
                        Course::APPROVAL_APPROVED => 'Approved',
                        Course::APPROVAL_REJECTED => 'Rejected',
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->icon('heroicon-o-check')
                    ->requiresConfirmation()
                    ->modalDescription('The course will be published and the instructor notified.')
                    ->action(function ($record) {
                        app(CourseApprovalService::class)->approveCourse($record, (int) auth()->id());
                        Notification::make()->success()->title('Course approved and instructor notified.')->send();
                    }),
                Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->icon('heroicon-o-x-mark')
                    ->schema([
                        Textarea::make('reason')
                            ->label('Rejection Reason')
                            ->required()
                            ->minLength(3)
                            ->maxLength(2000)
                            ->helperText('This reason is sent to the instructor by email.'),
                    ])
                    ->action(function ($record, array $data) {
                        app(CourseApprovalService::class)->rejectCourse($record, (int) auth()->id(), $data['reason']);
                        Notification::make()->success()->title('Course rejected and instructor notified.')->send();
                    }),
            ])
            ->actionsColumnLabel('Actions')
            ->defaultSort('submitted_for_approval_at', 'desc')
            ->poll('30s');
    }
}
