<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnrollmentConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $courseTitle,
        public string $courseSlug,
        public ?string $instructorName = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $courseUrl = $frontendUrl . '/courses/' . $this->courseSlug;

        return (new MailMessage)
            ->subject('You\'re enrolled in: ' . $this->courseTitle)
            ->view('emails.enrollment-confirmation', [
                'courseTitle' => $this->courseTitle,
                'courseUrl' => $courseUrl,
                'instructorName' => $this->instructorName,
                'frontendUrl' => $frontendUrl,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Enrollment Confirmed',
            'body'  => 'You are now enrolled in "' . $this->courseTitle . '". Start learning now!',
            'type'  => 'success',
            'data'  => [
                'course_slug' => $this->courseSlug,
            ],
        ];
    }
}