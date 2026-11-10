<?php

namespace App\Filament\Resources\AdminNotifications;

use App\Filament\Resources\AdminNotifications\Pages\ListAdminNotifications;
use App\Filament\Resources\AdminNotifications\Pages\CreateAdminNotification;
use App\Models\AdminNotification;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Schemas\Schema;
use Filament\Tables\Table;

class AdminNotificationResource extends Resource
{
    protected static ?string $model = AdminNotification::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Bell;

    protected static ?string $navigationLabel = 'Send Notifications';

    protected static string|UnitEnum|null $navigationGroup = 'Communication';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return \App\Filament\Resources\AdminNotifications\Schemas\AdminNotificationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return \App\Filament\Resources\AdminNotifications\Tables\AdminNotificationsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index'  => ListAdminNotifications::route('/'),
            'create' => CreateAdminNotification::route('/create'),
        ];
    }
}
