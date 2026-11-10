<?php

namespace App\Filament\Resources\SupportTickets\Tables;

use Filament\Actions\Action;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SupportTicketsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->label('#')->sortable(),

                TextColumn::make('user.name')
                    ->label('User')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable(),

                TextColumn::make('subject')
                    ->label('Subject')
                    ->limit(50)
                    ->searchable(),

                TextColumn::make('priority')
                    ->label('Priority')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'high'   => 'danger',
                        'normal' => 'warning',
                        default  => 'gray',
                    }),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'open'   => 'success',
                        'closed' => 'gray',
                        default  => 'gray',
                    }),

                TextColumn::make('messages_count')
                    ->label('Replies')
                    ->counts('messages')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'open'   => 'Open',
                        'closed' => 'Closed',
                    ])
                    ->default('open'),

                SelectFilter::make('priority')
                    ->options([
                        'low'    => 'Low',
                        'normal' => 'Normal',
                        'high'   => 'High',
                    ]),
            ])
            ->recordUrl(
                fn ($record) => \App\Filament\Resources\SupportTickets\SupportTicketResource::getUrl('view', ['record' => $record])
            );
    }
}
