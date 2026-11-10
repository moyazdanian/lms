<?php

namespace App\Filament\Resources\CouponUsages;

use App\Filament\Resources\CouponUsages\Pages\CreateCouponUsage;
use App\Filament\Resources\CouponUsages\Pages\EditCouponUsage;
use App\Filament\Resources\CouponUsages\Pages\ListCouponUsages;
use App\Filament\Resources\CouponUsages\Schemas\CouponUsageForm;
use App\Filament\Resources\CouponUsages\Tables\CouponUsagesTable;
use App\Models\Coupon_usage;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class CouponUsageResource extends Resource
{
    protected static ?string $model = Coupon_usage::class;

    protected static ?string $label = 'Coupon Usage';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::QuestionMarkCircle;

    protected static string|UnitEnum|null $navigationGroup = 'Coupons';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return CouponUsageForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CouponUsagesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCouponUsages::route('/'),
            'edit' => EditCouponUsage::route('/{record}/edit'),
        ];
    }
}
