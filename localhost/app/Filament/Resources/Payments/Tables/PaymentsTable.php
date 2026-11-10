<?php

namespace App\Filament\Resources\Payments\Tables;

use App\Models\Payment;
use App\Services\Payments\PaymentFinalizer;
use App\Services\Payments\PaymentResyncService;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;

class PaymentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('amount')
                    ->label('Amount')
                    ->money('usd', true)
                    ->sortable(),

                TextColumn::make('gateway')
                    ->label('Gateway')
                    ->badge()
                    ->colors([
                        'primary' => 'stripe',
                        'info' => 'paypal',
                        'secondary' => 'mollie',
                        'warning' => 'razorpay',
                        'success' => 'free',
                    ])
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->sortable(),

                TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'success' => 'paid',
                        'warning' => 'pending',
                        'danger' => 'failed',
                        'gray' => 'canceled',
                    ])
                    ->sortable(),

                TextColumn::make('gateway_reference')
                    ->label('Gateway Ref')
                    ->limit(24)
                    ->tooltip(fn (?string $state): ?string => $state)
                    ->placeholder('—')
                    ->toggleable(),

                TextColumn::make('transaction_id')
                    ->searchable()
                    ->limit(24)
                    ->placeholder('—')
                    ->toggleable(),

                TextColumn::make('order.order_number')
                    ->label('Order')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('coupon.code')
                    ->label('Coupon')
                    ->placeholder('—')
                    ->toggleable(),

                TextColumn::make('verified_via')
                    ->label('Verified Via')
                    ->state(fn (Payment $record): string => $record->meta['verified_via'] ?? '—')
                    ->badge()
                    ->color('gray')
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('gateway')
                    ->label('Payment gateway')
                    ->options([
                        'stripe' => 'Stripe',
                        'paypal' => 'PayPal',
                        'mollie' => 'Mollie',
                        'razorpay' => 'Razorpay',
                    ]),

                SelectFilter::make('status')
                    ->label('Payment status')
                    ->options([
                        'pending' => 'Pending',
                        'paid' => 'Paid',
                        'failed' => 'Failed',
                        'canceled' => 'Canceled',
                    ]),

                TrashedFilter::make(),
            ])
            ->filtersFormColumns(2)
            ->recordActions([
                Action::make('resync')
                    ->label('Resync')
                    ->icon(Heroicon::ArrowPath)
                    ->color('info')
                    ->visible(fn (Payment $record): bool => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->modalHeading('Resync from gateway')
                    ->modalDescription('Asks the gateway for the real status of this payment. If it was actually paid, the order is finalized and access is granted; otherwise the payment is canceled. Nothing is trusted except the gateway\'s answer.')
                    ->action(function (Payment $record, PaymentResyncService $resync): void {
                        $result = $resync->resync($record);

                        Notification::make()
                            ->title($result['success'] ? 'Resync completed' : 'Resync not possible')
                            ->body($result['message'])
                            ->status($result['success'] ? 'success' : 'warning')
                            ->send();
                    }),

                Action::make('markCanceled')
                    ->label('Cancel locally')
                    ->icon(Heroicon::XCircle)
                    ->color('danger')
                    ->visible(fn (Payment $record): bool => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->modalHeading('Cancel this payment locally?')
                    ->modalDescription('This marks the payment and its order as canceled WITHOUT asking the gateway. Only use this if the gateway is unreachable — resync is the safer option.')
                    ->action(function (Payment $record): void {
                        app(PaymentFinalizer::class)->markCanceled($record);

                        Notification::make()
                            ->title('Payment canceled')
                            ->body('The payment and its order were marked as canceled locally.')
                            ->warning()
                            ->send();
                    }),

                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('resyncSelected')
                        ->label('Resync selected')
                        ->icon(Heroicon::ArrowPath)
                        ->color('info')
                        ->requiresConfirmation()
                        ->modalHeading('Resync the selected payments from their gateways?')
                        ->modalDescription('Each payment is re-checked with its own gateway. Paid ones are finalized; unpaid ones are canceled.')
                        ->action(function (\Illuminate\Support\Collection $records): void {
                            $finalized = 0;
                            $canceled = 0;
                            $skipped = 0;

                            foreach ($records as $record) {
                                $result = app(PaymentResyncService::class)->resync($record);

                                if (!$result['success']) {
                                    $skipped++;

                                    continue;
                                }

                                // The service returns success for both outcomes;
                                // re-read the fresh status to count them.
                                $record->refresh();

                                if ($record->status === 'paid') {
                                    $finalized++;
                                } elseif ($record->status === 'canceled') {
                                    $canceled++;
                                } else {
                                    $skipped++;
                                }
                            }

                            Notification::make()
                                ->title('Bulk resync finished')
                                ->body("{$finalized} finalized, {$canceled} canceled, {$skipped} skipped (see each row's state).")
                                ->success()
                                ->send();
                        }),

                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
