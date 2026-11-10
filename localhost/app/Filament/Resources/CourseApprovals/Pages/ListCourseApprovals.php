<?php

namespace App\Filament\Resources\CourseApprovals\Pages;

use App\Filament\Resources\CourseApprovals\CourseApprovalResource;
use Filament\Resources\Pages\ListRecords;

class ListCourseApprovals extends ListRecords
{
    protected static string $resource = CourseApprovalResource::class;
}
