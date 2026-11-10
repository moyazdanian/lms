<?php

namespace App\Filament\Resources\Instructors\RelationManager;

use Filament\Actions\Action;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\HtmlString;

class Instructor_profileRelationManager extends RelationManager
{
    protected static string $relationship = 'instructor';

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Textarea::make('bio')
                ->required()
                ->rows(4)
                ->maxLength(5000),
            TextInput::make('expertise')
                ->required()
                ->maxLength(255),
            Textarea::make('social_links')
                ->maxLength(1000),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('bio')
                    ->limit(60)
                    ->tooltip(fn ($record) => $record->bio),
                TextColumn::make('expertise'),
                TextColumn::make('rating')
                    ->numeric(decimalPlaces: 1),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active'   => 'success',
                        'banned'   => 'warning',
                        'rejected' => 'danger',
                        default    => 'gray',
                    }),
                TextColumn::make('social_links')
                    ->label('Social Links')
                    ->formatStateUsing(fn ($state) => static::formatSocialLinks($state))
                    ->html()
                    ->limit(80),
            ])
            ->filters([])
            ->headerActions([])
            ->actions([
                // ─── View full profile ──────────────────────────────────────
                Action::make('view')
                    ->label('View Profile')
                    ->icon(Heroicon::Eye)
                    ->color('gray')
                    ->modalHeading('Instructor Profile')
                    ->modalContent(fn ($record) => new HtmlString(static::renderProfile($record)))
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Close'),

                // ─── Ban ────────────────────────────────────────────────────
                Action::make('ban')
                    ->label('Ban')
                    ->icon(Heroicon::NoSymbol)
                    ->color('warning')
                    ->visible(fn ($record) => $record->status === 'active')
                    ->requiresConfirmation()
                    ->modalHeading('Ban this instructor?')
                    ->modalDescription('The instructor will no longer be able to create or modify courses and lessons. Their existing courses remain visible. You can lift the ban at any time.')
                    ->action(function ($record) {
                        $record->update(['status' => 'banned']);

                        Notification::make()
                            ->warning()
                            ->title('Instructor banned')
                            ->send();
                    }),

                // ─── Reject (severe) ────────────────────────────────────────
                Action::make('reject')
                    ->label('Reject')
                    ->icon(Heroicon::XCircle)
                    ->color('danger')
                    ->visible(fn ($record) => in_array($record->status, ['active', 'banned']))
                    ->requiresConfirmation()
                    ->modalHeading('Reject this instructor?')
                    ->modalDescription('This will permanently block their login and hide all their courses from the public site. This action can be reversed by setting the status back to Active.')
                    ->action(function ($record) {
                        $record->update(['status' => 'rejected']);

                        Notification::make()
                            ->danger()
                            ->title('Instructor rejected')
                            ->body('Their courses are now hidden and they cannot log in.')
                            ->send();
                    }),

                // ─── Restore / Unban ────────────────────────────────────────
                Action::make('restore')
                    ->label('Restore to Active')
                    ->icon(Heroicon::ArrowPath)
                    ->color('success')
                    ->visible(fn ($record) => in_array($record->status, ['banned', 'rejected']))
                    ->requiresConfirmation()
                    ->modalHeading('Restore this instructor?')
                    ->modalDescription('The instructor will be set back to Active and will regain full access.')
                    ->action(function ($record) {
                        $record->update(['status' => 'active']);

                        Notification::make()
                            ->success()
                            ->title('Instructor restored to active')
                            ->send();
                    }),

                EditAction::make()->label('Edit Profile'),
            ])
            ->bulkActions([
                DeleteBulkAction::make(),
            ]);
    }

    protected static function formatSocialLinks(mixed $raw): string
    {
        if (empty($raw)) {
            return '—';
        }

        $links = is_array($raw) ? $raw : json_decode($raw, true);

        if (! is_array($links)) {
            return e($raw);
        }

        $parts = [];
        foreach ($links as $label => $url) {
            if (filled($url)) {
                $parts[] = '<a href="' . e($url) . '" target="_blank" rel="noopener" class="text-primary-600 underline capitalize">'
                    . e($label) . '</a>';
            }
        }

        return $parts ? implode(' · ', $parts) : '—';
    }

    protected static function renderProfile($record): string
    {
        $html = '<div class="space-y-4 text-sm">';
        $html .= '<div><p class="font-semibold mb-1">Expertise</p><p>' . e($record->expertise) . '</p></div>';
        $html .= '<div><p class="font-semibold mb-1">Bio</p><p class="whitespace-pre-line">' . e($record->bio) . '</p></div>';
        $html .= '<div><p class="font-semibold mb-1">Rating</p><p>' . number_format((float) $record->rating, 1) . ' / 5</p></div>';

        $links = is_array($record->social_links)
            ? $record->social_links
            : json_decode($record->social_links ?? '{}', true);

        if (! empty($links)) {
            $html .= '<div><p class="font-semibold mb-1">Social Links</p><ul class="list-disc ms-4">';
            foreach ($links as $label => $url) {
                if (filled($url)) {
                    $html .= '<li><span class="capitalize">' . e($label) . ':</span> '
                        . '<a href="' . e($url) . '" target="_blank" rel="noopener" class="text-primary-600 underline">' . e($url) . '</a></li>';
                }
            }
            $html .= '</ul></div>';
        }

        $html .= '</div>';

        return $html;
    }
}
