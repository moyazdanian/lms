<?php

namespace App\Services\Payments\Gateways;

use App\Models\Payment;
use App\Services\Payments\GatewayConfigService;
use Illuminate\Support\Facades\Http;

/**
 * Mollie via the REST Orders/Payments API (no SDK dependency).
 *
 * request(): creates a Mollie payment; the checkout URL hosted by Mollie is
 *            returned for the redirect. The webhook URL asks Mollie to call
 *            us back when the payment state changes.
 * verify():  fetches the payment; only `paid`/`pending`→`paid` states report
 *            paid. Mollie is the source of truth (status transitions are
 *            server-side only).
 */
class MollieGateway implements \App\Contracts\PaymentGatewaysInterface
{
    public function request(Payment $payment): array
    {
        $apiKey = $this->apiKey();

        $frontendUrl = rtrim(config('services.frontend.url'), '/');
        $currency = strtoupper((string) (
            $payment->meta['currency']
            ?? \App\Models\General_setting::first()?->currency
            ?? 'USD'
        ));

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->post('https://api.mollie.com/v2/payments', [
                'amount' => [
                    'currency' => $currency,
                    'value' => number_format((float) $payment->amount, 2, '.', ''),
                ],
                'description' => 'Order '.$payment->order->order_number,
                'redirectUrl' => $frontendUrl.'/payment/success?gateway=mollie&payment_id='.$payment->id,
                'cancelUrl' => $frontendUrl.'/payment/failed?gateway=mollie&payment_id='.$payment->id,
                // 'webhookUrl' => route('webhooks.mollie'),
                'metadata' => [
                    'payment_id' => (string) $payment->id,
                    'order_id' => (string) $payment->order_id,
                ],
            ])
            ->throw()
            ->json();

        return [
            'checkout_url' => $response['_links']['checkout']['href'],
            'session_id' => $response['id'],
        ];
    }

    public function verify(string $paymentId): array
    {
        $response = Http::withToken($this->apiKey())
            ->acceptJson()
            ->get("https://api.mollie.com/v2/payments/{$paymentId}")
            ->throw()
            ->json();

        $status = $response['status'] ?? null;

        return [
            'paid' => $status === 'paid',
            'status' => $status,
            'transaction_id' => $response['id'] ?? null,
            'amount_total' => isset($response['amount']['value'])
                ? (int) round(((float) $response['amount']['value']) * 100)
                : null,
            'currency' => strtolower((string) ($response['amount']['currency'] ?? '')) ?: null,
        ];
    }

    protected function apiKey(): string
    {
        $config = app(GatewayConfigService::class)->mollie();

        if (!$config['enabled'] || !$config['api_key']) {
            abort(503, 'Mollie is not configured.');
        }

        return $config['api_key'];
    }
}
