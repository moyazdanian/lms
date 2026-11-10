<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InstructorApplicationRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $userName,
        public ?string $reason = null,
        public string $reapplyUrl
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        return (new MailMessage)
            ->subject('Update on Your Instructor Application')
            ->view('emails.instructor-application-rejected', [
                'userName' => $this->userName,
                'reason' => $this->reason,
                'reapplyUrl' => $this->reapplyUrl,
                'frontendUrl' => $frontendUrl,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $body = 'Unfortunately, your instructor application has not been approved.';
        if ($this->reason) {
            $body .= ' Reason: ' . $this->reason;
        }
        $body .= ' You can submit a new application from your dashboard.';

        return [
            'title' => 'Your instructor application was not approved',
            'body'  => $body,
            'type'  => 'danger',
        ];
    }
}