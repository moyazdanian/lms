<?php

namespace App\Services\Payments\Gateways;

use App\Models\Payment;
use App\Services\Payments\GatewayConfigService;
use Illuminate\Support\Facades\Http;

/**
 * Razorpay via the REST Orders API (no SDK dependency).
 *
 * request(): creates a Razorpay order and returns its id. Razorpay has no
 *            hosted redirect in this flow — the frontend opens Razorpay
 *            Checkout (their JS) with this order_id, then the browser comes
 *            back with razorpay_payment_id / razorpay_signature which the
 *            frontend sends to /payment/verify.
 * verify():  checks the HMAC-SHA256 signature (order_id|payment_id signed
 *            with the key secret) and confirms the payment server-side.
 */
class RazorpayGateway implements \App\Contracts\PaymentGatewaysInterface
{
    public function request(Payment $payment): array
    {
        $config = $this->config();

        $currency = strtoupper((string) (
            $payment->meta['currency']
            ?? \App\Models\General_setting::first()?->currency
            ?? 'INR'
        ));

        $response = Http::withBasicAuth($config['key_id'], $config['key_secret'])
            ->acceptJson()
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => (int) round(((float) $payment->amount) * 100),
                'currency' => $currency,
                'receipt' => (string) $payment->order_id,
                'notes' => [
                    'payment_id' => (string) $payment->id,
                    'order_id' => (string) $payment->order_id,
                ],
            ])
            ->throw()
            ->json();

        return [
            // Razorpay has no hosted redirect; session_id carries the order id
            // for the frontend Razorpay Checkout modal.
            'checkout_url' => null,
            'session_id' => $response['id'],
            'frontend_context' => [
                'key_id' => $config['key_id'],
                'razorpay_order_id' => $response['id'],
                'amount' => (int) round(((float) $payment->amount) * 100),
                'currency' => $currency,
                'name' => \App\Models\General_setting::first()?->site_name ?? config('app.name'),
                'description' => 'Order '.$payment->order->order_number,
            ],
        ];
    }

    public function verify(string $razorpayOrderId): array
    {
        $config = $this->config();

        $response = Http::withBasicAuth($config['key_id'], $config['key_secret'])
            ->acceptJson()
            ->get("https://api.razorpay.com/v1/orders/{$razorpayOrderId}/payments")
            ->throw()
            ->json();

        $captured = collect($response['items'] ?? [])
            ->firstWhere('status', 'captured');

        return [
            'paid' => $captured !== null,
            'status' => $captured ? 'captured' : ($response['items'][0]['status'] ?? null),
            'transaction_id' => $captured['id'] ?? null,
            'amount_total' => $captured['amount'] ?? null,
            'currency' => isset($captured['currency'])
                ? strtolower((string) $captured['currency'])
                : null,
        ];
    }

    /**
     * Verify the browser callback signature (frontend sends these fields to
     * /payment/verify after the Razorpay Checkout modal succeeds).
     */
    public function verifySignature(string $razorpayOrderId, string $razorpayPaymentId, string $razorpaySignature): bool
    {
        $config = $this->config();

        $expected = hash_hmac(
            'sha256',
            $razorpayOrderId.'|'.$razorpayPaymentId,
            $config['key_secret']
        );

        return hash_equals($expected, $razorpaySignature);
    }

    protected function config(): array
    {
        $config = app(GatewayConfigService::class)->razorpay();

        if (!$config['enabled'] || !$config['key_id'] || !$config['key_secret']) {
            abort(503, 'Razorpay is not configured.');
        }

        return $config;
    }
}
