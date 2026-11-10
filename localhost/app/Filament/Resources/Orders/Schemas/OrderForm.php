<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user')
                    ->label('User')
                    ->relationship('user', 'name')
                    ->disabled(),
                TextInput::make('order_number')
                    ->required(),
                TextInput::make('total_amount')
                    ->required()
                    ->numeric(),
                TextInput::make('discount_amount')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('coupon_id')
                    ->numeric(),
                TextInput::make('coupon_discount')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('payment_method')
                    ->required()
                    ->default('online'),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
            ]);
    }
}
