<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $userName,
        public string $loginUrl
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        return (new MailMessage)
            ->subject('Your Password Has Been Reset - ' . config('app.name', 'LMS'))
            ->view('emails.password-reset-confirmation', [
                'userName' => $this->userName,
                'loginUrl' => $this->loginUrl,
                'frontendUrl' => $frontendUrl,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Password Reset Successful',
            'body'  => 'Your password has been successfully reset. You can now log in with your new password.',
            'type'  => 'info',
        ];
    }
}