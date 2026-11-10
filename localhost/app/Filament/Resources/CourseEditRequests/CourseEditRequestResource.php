<?php

namespace App\Filament\Resources\CourseEditRequests;

use App\Filament\Resources\CourseEditRequests\Pages\ListCourseEditRequests;
use App\Filament\Resources\CourseEditRequests\Pages\ViewCourseEditRequest;
use App\Filament\Resources\CourseEditRequests\Schemas\CourseEditRequestForm;
use App\Filament\Resources\CourseEditRequests\Tables\CourseEditRequestsTable;
use App\Models\CourseEditRequest;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class CourseEditRequestResource extends Resource
{
    protected static ?string $model = CourseEditRequest::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::PencilSquare;

    protected static ?string $navigationLabel = 'Course Edit Requests';

    protected static UnitEnum|string|null $navigationGroup = 'Courses';

    protected static ?string $slug = 'course-edit-requests';

    public static function getNavigationBadge(): ?string
    {
        $pending = static::getModel()::where('status', CourseEditRequest::STATUS_PENDING)->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getNavigationSort(): ?int
    {
        return 3;
    }

    public static function form(Schema $schema): Schema
    {
        return CourseEditRequestForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CourseEditRequestsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCourseEditRequests::route('/'),
            'view' => ViewCourseEditRequest::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }
}
