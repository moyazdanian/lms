<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderReceiptNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $orderNumber,
        public float $totalAmount,
        public string $currency,
        public string $paymentMethod,
        public array $items, // [{title, price, qty}]
        public ?string $receiptUrl = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $receiptUrl = $this->receiptUrl ?? $frontendUrl . '/dashboard/payments';

        return (new MailMessage)
            ->subject('Order Receipt #' . $this->orderNumber . ' - ' . config('app.name', 'LMS'))
            ->view('emails.order-receipt', [
                'orderNumber' => $this->orderNumber,
                'totalAmount' => $this->totalAmount,
                'currency' => $this->currency,
                'paymentMethod' => $this->paymentMethod,
                'items' => $this->items,
                'receiptUrl' => $receiptUrl,
                'frontendUrl' => $frontendUrl,
                'currencySymbol' => $this->getCurrencySymbol($this->currency),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Order Receipt #' . $this->orderNumber,
            'body'  => 'Your payment of ' . $this->formatAmount() . ' has been received. Thank you for your purchase!',
            'type'  => 'success',
            'data'  => [
                'order_number' => $this->orderNumber,
                'amount' => $this->totalAmount,
            ],
        ];
    }

    protected function formatAmount(): string
    {
        $symbol = $this->getCurrencySymbol($this->currency);
        return $symbol . number_format($this->totalAmount, 2);
    }

    protected function getCurrencySymbol(string $currency): string
    {
        return match (strtoupper($currency)) {
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'IRR' => '﷼',
            default => $currency . ' ',
        };
    }
}