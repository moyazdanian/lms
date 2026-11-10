<?php

namespace App\Filament\Resources\Certificates\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CertificatesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with([
                'user:id,name,email',
                'course:id,title',
            ]))
            ->columns([
                TextColumn::make('serial')
                    ->label('Serial')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                TextColumn::make('user.name')
                    ->label('Student')
                    ->searchable(),
                TextColumn::make('snapshot.course_title')
                    ->label('Course')
                    ->limit(40)
                    ->tooltip(fn ($record) => $record->snapshot['course_title'] ?? null),
                TextColumn::make('status')
                    ->badge()
                    ->state(fn ($record) => $record->isValid() ? 'valid' : 'revoked')
                    ->color(fn ($state) => $state === 'valid' ? 'success' : 'danger'),
                TextColumn::make('issued_at')
                    ->label('Issued')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                TernaryFilter::make('revoked')
                    ->label('Status')
                    ->placeholder('All certificates')
                    ->trueLabel('Revoked only')
                    ->falseLabel('Valid only')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('revoked_at'),
                        false: fn ($query) => $query->whereNull('revoked_at'),
                    ),
            ])
            ->recordActions([
                \Filament\Actions\ViewAction::make(),
            ])
            ->actionsColumnLabel('Actions')
            ->defaultSort('issued_at', 'desc')
            ->poll('60s');
    }
}
