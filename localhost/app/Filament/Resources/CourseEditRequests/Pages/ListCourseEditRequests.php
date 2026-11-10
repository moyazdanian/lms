<?php

namespace App\Filament\Resources\CourseEditRequests\Pages;

use App\Filament\Resources\CourseEditRequests\CourseEditRequestResource;
use Filament\Resources\Pages\ListRecords;

class ListCourseEditRequests extends ListRecords
{
    protected static string $resource = CourseEditRequestResource::class;
}
