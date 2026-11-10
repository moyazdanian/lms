<?php

namespace App\Services\Payments\Gateways;

use App\Models\General_setting;
use App\Models\Payment;
use App\Services\Payments\GatewayConfigService;
use Illuminate\Support\Facades\Http;

/**
 * PayPal via the REST Orders API (no SDK dependency).
 *
 * request(): creates an order and returns the approval (redirect) link.
 * verify():  captures the order server-side; only a COMPLETED capture
 *            reports paid. The capture is idempotent per order.
 */
class PaypalGateway implements \App\Contracts\PaymentGatewaysInterface
{
    public function request(Payment $payment): array
    {
        [$base, $clientId, $secret] = $this->credentials();

        $token = $this->accessToken($base, $clientId, $secret);

        $frontendUrl = rtrim(config('services.frontend.url'), '/');
        $currency = strtoupper((string) (
            $payment->meta['currency']
            ?? General_setting::first()?->currency
            ?? 'USD'
        ));

        $order = Http::withToken($token)
            ->acceptJson()
            ->post($base.'/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => (string) $payment->id,
                    'custom_id' => (string) $payment->id,
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => number_format((float) $payment->amount, 2, '.', ''),
                    ],
                ]],
                'payment_source' => [
                    'paypal' => [
                        'experience_context' => [
                            'user_action' => 'PAY_NOW',
                            'return_url' => $frontendUrl.'/payment/success?gateway=paypal&payment_id='.$payment->id,
                            'cancel_url' => $frontendUrl.'/payment/failed?gateway=paypal&payment_id='.$payment->id,
                        ],
                    ],
                ],
            ])
            ->throw()
            ->json();

        $approveLink = collect($order['links'] ?? [])
            ->firstWhere('rel', 'approve')['href'] ?? null;

        if (!$approveLink) {
            throw new \RuntimeException('PayPal approval link missing in response.');
        }

        return [
            'checkout_url' => $approveLink,
            'session_id' => $order['id'],
        ];
    }

    public function verify(string $orderId): array
    {
        [$base, $clientId, $secret] = $this->credentials();

        $token = $this->accessToken($base, $clientId, $secret);

        $response = Http::withToken($token)
            ->acceptJson()
            ->post($base."/v2/checkout/orders/{$orderId}/capture", [
                // Idempotent per order: replaying a captured order returns the
                // same COMPLETED capture instead of double-charging.
            ]);

        if ($response->status() === 422) {
            // ALREADY_CAPTURED / ORDER_ALREADY_CAPTURED → re-read the order.
            $order = $this->retrieve($orderId);
            $capture = $this->captureFromOrder($order);

            return [
                'paid' => $capture !== null,
                'transaction_id' => $capture['id'] ?? $orderId,
                'amount_total' => $capture ? $this->minorUnits($capture['amount']['value'] ?? null) : null,
                'currency' => isset($capture['amount']['currency_code'])
                    ? strtolower($capture['amount']['currency_code'])
                    : null,
            ];
        }

        $response->throw();

        $order = $response->json();
        $capture = $this->captureFromOrder($order);

        return [
            'paid' => ($order['status'] ?? null) === 'COMPLETED' && $capture !== null,
            'transaction_id' => $capture['id'] ?? $orderId,
            'amount_total' => $capture ? $this->minorUnits($capture['amount']['value'] ?? null) : null,
            'currency' => isset($capture['amount']['currency_code'])
                ? strtolower($capture['amount']['currency_code'])
                : null,
        ];
    }

    protected function retrieve(string $orderId): array
    {
        [$base, $clientId, $secret] = $this->credentials();
        $token = $this->accessToken($base, $clientId, $secret);

        return Http::withToken($token)
            ->acceptJson()
            ->get($base."/v2/checkout/orders/{$orderId}")
            ->throw()
            ->json();
    }

    protected function captureFromOrder(array $order): ?array
    {
        return $order['purchase_units'][0]['payments']['captures'][0] ?? null;
    }

    protected function accessToken(string $base, string $clientId, string $secret): string
    {
        $response = Http::asForm()
            ->withBasicAuth($clientId, $secret)
            ->post($base.'/v1/oauth2/token', ['grant_type' => 'client_credentials'])
            ->throw()
            ->json();

        return $response['access_token'];
    }

    /**
     * @return array{0: string, 1: string, 2: string} [base URL, client id, secret]
     */
    protected function credentials(): array
    {
        $config = app(GatewayConfigService::class)->paypal();

        if (!$config['enabled'] || !$config['client_id'] || !$config['client_secret']) {
            abort(503, 'PayPal is not configured.');
        }

        $base = $config['mode'] === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        return [$base, $config['client_id'], $config['client_secret']];
    }

    protected function minorUnits(?string $value): ?int
    {
        return $value === null ? null : (int) round(((float) $value) * 100);
    }
}
