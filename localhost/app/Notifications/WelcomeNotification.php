<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $userName
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        return (new MailMessage)
            ->subject('Welcome to ' . config('app.name', 'LMS') . '!')
            ->view('emails.welcome', [
                'userName' => $this->userName,
                'frontendUrl' => $frontendUrl,
                'loginUrl' => $frontendUrl . '/login',
                'coursesUrl' => $frontendUrl . '/courses',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome to ' . config('app.name', 'LMS') . '!',
            'body'  => 'Thanks for joining. Start exploring courses and build your skills.',
            'type'  => 'info',
        ];
    }
}