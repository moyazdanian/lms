<?php

namespace App\Filament\Resources\InstructorApplications\Tables;

use App\Models\AdminNotification;
use App\Models\Instructors_profile;
use App\Notifications\InstructorApplicationApprovedNotification;
use App\Notifications\InstructorApplicationRejectedNotification;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\HtmlString;

class InstructorApplicationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')->label('Name')->sortable()->searchable(),
                TextColumn::make('user.email')->label('Email')->sortable()->searchable(),
                TextColumn::make('expertise')->label('Expertise')->searchable()->limit(40),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'approved' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('created_at')->label('Submitted At')->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ]),
            ])
            ->recordActions([
                Action::make('view')
                    ->label('View')
                    ->icon(Heroicon::Eye)
                    ->modalHeading(fn ($record) => 'Application from ' . $record->user->name)
                    ->modalContent(fn ($record) => new HtmlString(static::renderDetails($record)))
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Close'),

                Action::make('approve')
                    ->label('Approve')
                    ->icon(Heroicon::Check)
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->modalHeading('Approve instructor application')
                    ->modalDescription(fn ($record) => 'This will turn "' . $record->user->name . '" into an instructor and create their instructor profile.')
                    ->action(function ($record) {
                        DB::transaction(function () use ($record) {
                            $user = $record->user;
                            $user->role = 'instructor';
                            $user->save();

                            // Instructors_profile has no array cast, store JSON string.
                            Instructors_profile::firstOrCreate(
                                ['user_id' => $user->id],
                                [
                                    'bio' => $record->bio,
                                    'expertise' => $record->expertise,
                                    'social_links' => $record->social_links
                                        ? json_encode($record->social_links)
                                        : null,
                                    'rating' => 0,
                                ]
                            );

                            $record->update([
                                'status' => 'approved',
                                'admin_note' => null,
                            ]);

                            // Send email + database notification
                            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
                            $user->notify(new InstructorApplicationApprovedNotification(
                                $user->name,
                                $frontendUrl . '/dashboard/teaching'
                            ));
                        });

                        Notification::make()
                            ->success()
                            ->title('Application approved')
                            ->body($record->user->name . ' is now an instructor.')
                            ->send();
                    }),

                Action::make('reject')
                    ->label('Reject')
                    ->icon(Heroicon::XMark)
                    ->color('danger')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->modalHeading('Reject instructor application')
                    ->schema([
                        Textarea::make('admin_note')
                            ->label('Reason (shown to the user)')
                            ->rows(3)
                            ->maxLength(1000),
                    ])
                    ->action(function (array $data, $record) {
                        $note = $data['admin_note'] ?? null;

                        $record->update([
                            'status'     => 'rejected',
                            'admin_note' => $note,
                        ]);

                        // Send email + database notification
                        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
                        $record->user->notify(new InstructorApplicationRejectedNotification(
                            $record->user->name,
                            $note,
                            $frontendUrl . '/dashboard/become-instructor'
                        ));

                        Notification::make()
                            ->success()
                            ->title('Application rejected')
                            ->send();
                    }),
            ]);
    }

    protected static function renderDetails($record): string
    {
        $html = '<div class="space-y-4 text-sm">';

        $html .= '<div><p style="font-weight: 600;">Bio: </p><p style="margin-left: 1rem;">'
            . e($record->bio) . '</p></div>';

        $html .= '<div><p style="font-weight: 600;">Expertise: </p><p style="margin-left: 1rem;">'
            . e($record->expertise) . '</p></div>';

        if (! empty($record->social_links)) {
            $html .= '<div><p style="font-weight: 600;">Social Links: </p><ul style="list-style-type: disc; margin-left: 1rem;">';
            foreach ($record->social_links as $label => $url) {
                $html .= '<li><span style="text-transform: capitalize; background-color: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">' . e($label) . ':</span> <a href="'
                    . e($url) . '" target="_blank" rel="noopener" class="text-primary-600 underline">'
                    . e($url) . '</a></li>';
            }
            $html .= '</ul></div>';
        }

        if (filled($record->admin_note)) {
            $html .= '<div><p style="font-weight: 600;">Admin Note: </p><p class="whitespace-pre-line text-yellow-300">'
                . e($record->admin_note) . '</p></div>';
        }

        return $html . '</div>';
    }
}
