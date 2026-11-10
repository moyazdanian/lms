<?php

namespace App\Services\Payments\Gateways;

use App\Contracts\PaymentGatewaysInterface;
use App\Models\General_setting;
use App\Models\Payment;
use App\Services\Payments\GatewayConfigService;
use Stripe\StripeClient;

class StripeGateway implements PaymentGatewaysInterface
{
    protected StripeClient $stripe;

    public function __construct()
    {
        // Credentials come from the admin panel (DB) with the .env value as
        // fallback for existing installations.
        $secret = app(GatewayConfigService::class)->stripe()['secret'];

        if (!filled($secret)) {
            abort(503, 'Stripe is not configured.');
        }

        $this->stripe = new StripeClient($secret);
    }

    public function request(Payment $payment): array
    {
        $frontendUrl = rtrim(config('services.frontend.url'), '/');
        $currency = strtolower((string) (
            $payment->meta['currency']
            ?? General_setting::first()?->currency
            ?? 'usd'
        ));

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [
                [
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => $currency,
                        'unit_amount' => (int) round($payment->amount * 100),
                        'product_data' => [
                            'name' => 'Order ' . $payment->order->order_number,
                        ],
                    ],
                ],
            ],
            'customer_email' => $payment->user->email,
            'client_reference_id' => (string) $payment->id,
            'metadata' => [
                'payment_id' => (string) $payment->id,
                'order_id' => (string) $payment->order_id,
            ],
            'success_url' => $frontendUrl . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $frontendUrl . '/payment/failed?session_id={CHECKOUT_SESSION_ID}',
        ]);

        return [
            'checkout_url' => $session->url,
            'session_id' => $session->id,
        ];
    }

    public function verify(string $sessionId): array
    {
        $session = $this->stripe->checkout->sessions->retrieve($sessionId);

        return [
            'paid' => $session->payment_status === 'paid',
            'status' => $session->status,
            'payment_status' => $session->payment_status,
            'transaction_id' => $session->payment_intent,
            'amount_total' => $session->amount_total,
            'currency' => strtolower((string) $session->currency),
        ];
    }
}
