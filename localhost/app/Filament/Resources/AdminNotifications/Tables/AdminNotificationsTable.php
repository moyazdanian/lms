<?php

namespace App\Filament\Resources\AdminNotifications\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class AdminNotificationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Recipient')
                    ->default('All Users')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('title')
                    ->label('Title')
                    ->limit(50)
                    ->searchable(),

                TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'success' => 'success',
                        'warning' => 'warning',
                        'danger'  => 'danger',
                        default   => 'info',
                    }),

                TextColumn::make('read_at')
                    ->label('Read At')
                    ->dateTime()
                    ->placeholder('Unread')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Sent At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('type')
                    ->options([
                        'info'    => 'Info',
                        'success' => 'Success',
                        'warning' => 'Warning',
                        'danger'  => 'Danger',
                    ]),
            ])
            ->recordActions([
                Action::make('view')
                    ->label('View')
                    ->icon(Heroicon::Eye)
                    ->modalHeading(fn ($record) => $record->title)
                    ->modalContent(fn ($record) => new \Illuminate\Support\HtmlString(
                        '<div style="font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.5rem;">'
                        . '<p style="color: rgb(107 114 128);">To: <strong>' . e($record->user?->name ?? 'All Users') . '</strong></p>'
                        . '<p style="white-space: pre-line; line-height: 1.5;">' . e($record->body) . '</p>'
                        . '</div>'
                    ))
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Close'),
            ])->recordActions([
                EditAction::make(),
                DeleteAction::make()
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);;
    }
}
