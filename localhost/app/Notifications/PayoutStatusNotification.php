<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PayoutStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $payoutId,
        public string $amount,
        public string $currency,
        public string $status,
        public ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = match ($this->status) {
            'approved' => 'Your payout request was approved',
            'paid' => 'Your payout has been paid',
            'rejected' => 'Your payout request was rejected',
            default => 'Your payout request status changed',
        };

        return (new MailMessage)
            ->subject($subject . ' - ' . config('app.name', 'LMS'))
            ->view('emails.payout-status', [
                'userName' => $notifiable->name,
                'payoutId' => $this->payoutId,
                'amount' => $this->amount,
                'currency' => strtoupper($this->currency),
                'status' => $this->status,
                'reason' => $this->reason,
                'frontendUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->reason
                ? 'Payout Rejected'
                : 'Payout Status Updated',

            'body' => $this->reason
                ? 'Your payout request was rejected: ' . $this->reason
                : 'Your payout request for ' . $this->amount . ' ' .
                strtoupper($this->currency) .
                ' is now ' . $this->status . '.',

            'type' => 'info',
        ];
    }
}
