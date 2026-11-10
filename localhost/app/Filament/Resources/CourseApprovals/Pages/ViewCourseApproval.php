<?php

namespace App\Filament\Resources\CourseApprovals\Pages;

use App\Filament\Resources\CourseApprovals\CourseApprovalResource;
use App\Models\Course;
use App\Services\CourseApprovalService;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewCourseApproval extends ViewRecord
{
    protected static string $resource = CourseApprovalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('approve')
                ->label('Approve')
                ->color('success')
                ->icon('heroicon-o-check')
                ->requiresConfirmation()
                ->modalHeading('Approve course')
                ->modalDescription('The course will be published and the instructor will be notified.')
                ->visible(fn (): bool => $this->getRecord()->approval_status === Course::APPROVAL_PENDING)
                ->action(function () {
                    app(CourseApprovalService::class)->approveCourse($this->getRecord(), (int) auth()->id());

                    Notification::make()
                        ->success()
                        ->title('Course approved and instructor notified.')
                        ->send();

                    $this->redirect(static::getResource()::getUrl('index'));
                }),

            Action::make('reject')
                ->label('Reject')
                ->color('danger')
                ->icon('heroicon-o-x-mark')
                ->visible(fn (): bool => $this->getRecord()->approval_status === Course::APPROVAL_PENDING)
                ->schema([
                    Textarea::make('reason')
                        ->label('Rejection Reason')
                        ->required()
                        ->minLength(3)
                        ->maxLength(2000)
                        ->helperText('This reason is sent to the instructor by email.'),
                ])
                ->action(function (array $data) {
                    app(CourseApprovalService::class)->rejectCourse($this->getRecord(), (int) auth()->id(), $data['reason']);

                    Notification::make()
                        ->success()
                        ->title('Course rejected and instructor notified.')
                        ->send();

                    $this->redirect(static::getResource()::getUrl('index'));
                }),
        ];
    }
}
