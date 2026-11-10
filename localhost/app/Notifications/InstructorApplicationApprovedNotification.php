<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InstructorApplicationApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $userName,
        public string $dashboardUrl
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('🎉 Your Instructor Application Was Approved!')
            ->view('emails.instructor-application-approved', [
                'userName' => $this->userName,
                'dashboardUrl' => $this->dashboardUrl,
                'frontendUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => '🎉 Your instructor application was approved!',
            'body'  => 'Congratulations! Your application to become an instructor has been approved. You can now create and publish courses from your dashboard.',
            'type'  => 'success',
        ];
    }
}