<?php

namespace App\Filament\Resources\Certificates\Pages;

use App\Filament\Resources\Certificates\CertificateResource;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ViewCertificate extends ViewRecord
{
    protected static string $resource = CertificateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('download_pdf')
                ->label('Download PDF')
                ->color('gray')
                ->icon('heroicon-o-arrow-down-tray')
                ->visible(fn (): bool => $this->getRecord()->isValid())
                ->action(function () {
                    $certificate = $this->getRecord();

                    abort_unless(
                        class_exists(\Barryvdh\DomPDF\Facade\Pdf::class),
                        503,
                        'Install barryvdh/laravel-dompdf to enable PDF downloads.'
                    );

                    return \Barryvdh\DomPDF\Facade\Pdf::loadView('certificates.pdf', [
                        'certificate' => $certificate,
                        'studentName' => $certificate->snapshot['student_name'] ?? '—',
                        'courseTitle' => $certificate->snapshot['course_title'] ?? $certificate->course?->title,
                        'instructorName' => $certificate->snapshot['instructor_name'] ?? null,
                        'siteName' => $certificate->snapshot['site_name'] ?? config('app.name'),
                        'verifyUrl' => url("/certificates/{$certificate->code}"),
                    ])->setPaper('a4', 'landscape')->download("certificate-{$certificate->serial}.pdf");
                }),

            Action::make('revoke')
                ->label('Revoke')
                ->color('danger')
                ->icon('heroicon-o-x-circle')
                ->requiresConfirmation()
                ->modalHeading('Revoke certificate')
                ->modalDescription('The student will no longer be able to download this certificate and the public verification page will show it as revoked.')
                ->visible(fn (): bool => $this->getRecord()->isValid())
                ->schema([
                    Textarea::make('reason')
                        ->label('Revocation Reason')
                        ->required()
                        ->minLength(3)
                        ->maxLength(500)
                        ->helperText('Shown on the verification page metadata and stored for audit.'),
                ])
                ->action(function (array $data) {
                    $record = $this->getRecord();
                    $record->forceFill([
                        'revoked_at' => now(),
                        'revoke_reason' => $data['reason'],
                    ])->save();

                    Notification::make()
                        ->warning()
                        ->title('Certificate revoked.')
                        ->send();

                    $this->redirect(static::getResource()::getUrl('view', ['record' => $record]));
                }),

            Action::make('restore')
                ->label('Restore')
                ->color('success')
                ->icon('heroicon-o-arrow-path')
                ->requiresConfirmation()
                ->modalHeading('Restore certificate')
                ->modalDescription('The certificate becomes valid again.')
                ->visible(fn (): bool => !$this->getRecord()->isValid())
                ->action(function () {
                    $record = $this->getRecord();
                    $record->forceFill([
                        'revoked_at' => null,
                        'revoke_reason' => null,
                    ])->save();

                    Notification::make()
                        ->success()
                        ->title('Certificate restored.')
                        ->send();

                    $this->redirect(static::getResource()::getUrl('view', ['record' => $record]));
                }),
        ];
    }

    public function getTitle(): string
    {
        return 'Certificate ' . $this->getRecord()->serial;
    }
}
