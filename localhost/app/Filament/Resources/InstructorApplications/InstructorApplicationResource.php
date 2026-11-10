<?php

namespace App\Filament\Resources\InstructorApplications;

use App\Filament\Resources\InstructorApplications\Pages\ListInstructorApplications;
use App\Filament\Resources\InstructorApplications\Tables\InstructorApplicationsTable;
use App\Models\InstructorApplication;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class InstructorApplicationResource extends Resource
{
    protected static ?string $model = InstructorApplication::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::AcademicCap;

    protected static ?string $navigationLabel = 'Instructor Applications';

    protected static string|UnitEnum|null $navigationGroup = 'Users';

    protected static ?int $navigationSort = 3;

    public static function table(Table $table): Table
    {
        return InstructorApplicationsTable::configure($table);
    }

    public static function getNavigationBadge(): ?string
    {
        $pending = static::getModel()::where('status', 'pending')->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListInstructorApplications::route('/'),
        ];
    }
}
