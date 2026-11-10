<?php

namespace App\Filament\Resources\Orders\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;

class OrderItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items'; 

    protected static ?string $title = 'Order Items';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Course Name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('subtotal_before_coupon')
                    ->label('Before Coupon')
                    ->money('usd', true),

                TextColumn::make('allocated_coupon_discount')
                    ->label('Coupon Share')
                    ->money('usd', true),

                TextColumn::make('final_amount')
                    ->label('Paid Amount')
                    ->money('usd', true),

            ])
            ->headerActions([]) // جلوگیری از افزودن محصول از اینجا
            ->actions([]); // فقط نمایش
    }
}
