<?php

namespace App\Filament\Resources\Coupons\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CouponForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('code')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
                Select::make('type')
                    ->options(['percent' => 'Percent', 'fixed' => 'Fixed'])
                    ->default('percent')
                    ->required()
                    ->hint('Type of discount'),
                TextInput::make('title')
                    ->required(),
                TextInput::make('amount')
                    ->required()
                    ->numeric()
                    ->hint('If type is percent, enter value between 0-100'),
                TextInput::make('usage_limit')
                    ->numeric()
                    ->hint('Leave empty for unlimited uses'),
                TextInput::make('min_order_amount')
                    ->required()
                    ->numeric()
                    ->default(0.0)
                    ->hint('Minimum order amount to apply coupon'),
                DateTimePicker::make('start_date')
                    ->required(),
                DateTimePicker::make('end_date')
                    ->required(),
                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true)
                    ->required(),
                Toggle::make('is_first_order')
                    ->required()
                    ->hint('If enabled, coupon can only be used for first order')
            ]);
    }


}
