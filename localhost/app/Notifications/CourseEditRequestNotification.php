<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CourseEditRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $courseId,
        public string $courseTitle,
        public string $status,
        public ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->status === 'approved'
            ? 'Your course edits was approved'
            : 'Your course edits needs changes';

        return (new MailMessage)
            ->subject($subject . ' - ' . config('app.name', 'LMS'))
            ->view('emails.course-approval-status', [
                'userName' => $notifiable->name,
                'courseId' => $this->courseId,
                'courseTitle' => $this->courseTitle,
                'status' => $this->status,
                'reason' => $this->reason,
                'frontendUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->status === 'approved'
                ? 'Course Edits approved'
                : 'Course Edits rejected',
            'body' => $this->status === 'approved'
                ? 'Your course Edits "' . $this->courseTitle . '" has been approved and is now live with new values.'
                : 'Your changes to "' . $this->courseTitle . '" were rejected: ' . $this->reason,
            'type' => $this->status === 'approved' ? 'success' : 'warning',
        ];
    }
}
