<?php

namespace App\Filament\Resources\CourseApprovals;

use App\Filament\Resources\CourseApprovals\Pages\ListCourseApprovals;
use App\Filament\Resources\CourseApprovals\Pages\ViewCourseApproval;
use App\Filament\Resources\CourseApprovals\Schemas\CourseApprovalForm;
use App\Filament\Resources\CourseApprovals\Tables\CourseApprovalsTable;
use App\Models\Course;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class CourseApprovalResource extends Resource
{
    protected static ?string $model = Course::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ClipboardDocumentCheck;

    protected static ?string $navigationLabel = 'Course Approvals';

    protected static UnitEnum|string|null $navigationGroup = 'Courses';

    protected static ?string $slug = 'course-approvals';

    public static function getNavigationBadge(): ?string
    {
        $pending = static::getModel()::where('approval_status', Course::APPROVAL_PENDING)->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getNavigationSort(): ?int
    {
        return 2;
    }

    public static function form(Schema $schema): Schema
    {
        return CourseApprovalForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CourseApprovalsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCourseApprovals::route('/'),
            'view' => ViewCourseApproval::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }
}
