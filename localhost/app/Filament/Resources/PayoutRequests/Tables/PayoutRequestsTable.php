<?php

namespace App\Filament\Resources\PayoutRequests\Tables;

use App\Services\Marketplace\PayoutService;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Actions\BulkActionGroup;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PayoutRequestsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('instructor'))
            ->columns([
                TextColumn::make('id')->label('#')->sortable(),
                TextColumn::make('instructor.name')->label('Instructor')->searchable()->sortable(),
                TextColumn::make('instructor.email')->label('Email')->searchable(),
                TextColumn::make('instructor_total')->label('Total Earnings')->state(fn ($record) => number_format((float) $record->instructor?->instructorEarnings()->sum('net_amount'), 2))->money(fn ($record) => strtolower($record->currency)),
                TextColumn::make('instructor_available')->label('Available Earnings')->state(fn ($record) => number_format($record->availableEarnings(), 2))->money(fn ($record) => strtolower($record->currency)),
                TextColumn::make('instructor_pending')->label('Pending Payouts')->state(fn ($record) => number_format((float) $record->instructor?->payoutRequests()->whereIn('status', ['pending', 'approved'])->sum('amount'), 2))->money(fn ($record) => strtolower($record->currency)),
                TextColumn::make('amount')->money(fn ($record) => strtolower($record->currency))->sortable(),
                TextColumn::make('payment_details')->label('Payment Details')->limit(35)->tooltip(fn ($record) => $record->payment_details),
                TextColumn::make('status')->badge(),
                TextColumn::make('rejection_reason')->label('Reason')->limit(40),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                    'paid' => 'Paid',
                ]),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->action(function ($record) {
                        app(PayoutService::class)->approve($record, auth()->id());
                        Notification::make()->success()->title('Payout approved and instructor notified.')->send();
                    }),
                Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->schema([
                        Textarea::make('reason')->label('Reason')->required()->minLength(3)->maxLength(2000),
                    ])
                    ->action(function ($record, array $data) {
                        app(PayoutService::class)->reject($record, auth()->id(), $data['reason']);
                        Notification::make()->success()->title('Payout rejected and instructor notified.')->send();
                    }),
                Action::make('mark_paid')
                    ->label('Mark Paid')
                    ->color('primary')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->status === 'approved')
                    ->action(function ($record) {
                        app(PayoutService::class)->markPaid($record, auth()->id());
                        Notification::make()->success()->title('Payout marked as paid and instructor notified.')->send();
                    }),
            ])
            ->defaultSort('created_at', 'desc')
            ->toolbarActions([
                BulkActionGroup::make([]),
            ]);
    }
}
