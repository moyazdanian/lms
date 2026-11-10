<?php

namespace App\Filament\Resources\CouponUsages\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CouponUsagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')->label('User')->searchable()->sortable(),
                TextColumn::make('coupon.code')->label('Coupon Code')->sortable()->searchable(),
                TextColumn::make('payment_id')->label('Payment ID')->sortable()->searchable(),
                TextColumn::make('payment.amount')->label('Amount')->sortable()->money('usd', true),
                TextColumn::make('created_at')->label('Used At')->dateTime()->sortable(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                // EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    // DeleteBulkAction::make(),
                ]),
            ]);
    }
}
