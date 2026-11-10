<?php

namespace App\Filament\Resources\CourseEditRequests\Pages;

use App\Filament\Resources\CourseEditRequests\CourseEditRequestResource;
use App\Models\CourseEditRequest;
use App\Services\CourseApprovalService;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewCourseEditRequest extends ViewRecord
{
    protected static string $resource = CourseEditRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('approve')
                ->label('Approve')
                ->color('success')
                ->icon('heroicon-o-check')
                ->requiresConfirmation()
                ->modalHeading('Approve edit request')
                ->modalDescription('The new values will be applied to the live course and the instructor will be notified.')
                ->visible(fn (): bool => $this->getRecord()->status === CourseEditRequest::STATUS_PENDING)
                ->action(function () {
                    app(CourseApprovalService::class)->approveEditRequest($this->getRecord(), (int) auth()->id());

                    Notification::make()
                        ->success()
                        ->title('Changes applied and instructor notified.')
                        ->send();

                    $this->redirect(static::getResource()::getUrl('index'));
                }),

            Action::make('reject')
                ->label('Reject')
                ->color('danger')
                ->icon('heroicon-o-x-mark')
                ->visible(fn (): bool => $this->getRecord()->status === CourseEditRequest::STATUS_PENDING)
                ->schema([
                    Textarea::make('reason')
                        ->label('Rejection Reason')
                        ->required()
                        ->minLength(3)
                        ->maxLength(2000)
                        ->helperText('This reason is sent to the instructor by email. The course keeps running with its current data.'),
                ])
                ->action(function (array $data) {
                    app(CourseApprovalService::class)->rejectEditRequest($this->getRecord(), (int) auth()->id(), $data['reason']);

                    Notification::make()
                        ->success()
                        ->title('Request rejected; the course keeps its current data.')
                        ->send();

                    $this->redirect(static::getResource()::getUrl('index'));
                }),
        ];
    }

    // public function getRecord()
    // {
    //     return parent::getRecord();
    // }

    public function getTitle(): string
    {
        return 'Course Edit Request #' . $this->getRecord()->getKey();
    }
}
