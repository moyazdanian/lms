<?php

namespace App\Filament\Resources\PayoutRequests;

use App\Filament\Resources\PayoutRequests\Pages\ListPayoutRequests;
use App\Filament\Resources\PayoutRequests\Schemas\PayoutRequestForm;
use App\Filament\Resources\PayoutRequests\Tables\PayoutRequestsTable;
use App\Models\PayoutRequest;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class PayoutRequestResource extends Resource
{
    protected static ?string $model = PayoutRequest::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Banknotes;
    protected static ?string $navigationLabel = 'Payout Requests';

    protected static UnitEnum|string|null $navigationGroup = 'Payments';

    public static function getNavigationBadge(): ?string
    {
        $pending = static::getModel()::where('status', 'pending')->count();
        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema { return PayoutRequestForm::configure($schema); }
    public static function table(Table $table): Table { return PayoutRequestsTable::configure($table); }
    public static function getPages(): array { return ['index' => ListPayoutRequests::route('/')]; }
    public static function canCreate(): bool { return false; }
    // public static function canDelete(): bool { return false; }
    public static function canDeleteAny(): bool { return false; }
}
