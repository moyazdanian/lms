<?php

namespace App\Filament\Resources\PayoutRequests\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PayoutRequestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('instructor.name')->label('Instructor')->disabled()->dehydrated(false),
            TextInput::make('amount')->numeric()->disabled()->dehydrated(false),
            TextInput::make('currency')->disabled()->dehydrated(false),
            TextInput::make('status')->disabled()->dehydrated(false),
            TextInput::make('instructor_total_earnings')->label('Total Earnings')->disabled()->dehydrated(false)->formatStateUsing(fn ($record) => number_format((float) $record->instructor?->instructorEarnings()->sum('net_amount'), 2)),
            TextInput::make('instructor_available_earnings')->label('Available Earnings')->disabled()->dehydrated(false)->formatStateUsing(fn ($record) => number_format((float) $record->availableEarnings(), 2)),
            TextInput::make('instructor_pending_payouts')->label('Pending/Approved Payouts')->disabled()->dehydrated(false)->formatStateUsing(fn ($record) => number_format((float) $record->instructor?->payoutRequests()->whereIn('status', ['pending', 'approved'])->sum('amount'), 2)),
            TextInput::make('instructor_paid_earnings')->label('Paid Out')->disabled()->dehydrated(false)->formatStateUsing(fn ($record) => number_format((float) $record->instructor?->payoutRequests()->where('status', 'paid')->sum('amount'), 2)),
            Textarea::make('payment_details')
                ->label('Payment Details / Banking Information')
                ->disabled()
                ->dehydrated(false)
                ->rows(6)
                ->columnSpanFull(),
            Textarea::make('rejection_reason')->label('Rejection Reason')->disabled()->dehydrated(false),
        ]);
    }
}
