<?php

namespace App\Services\Payments;

use App\Models\General_setting;

/**
 * Resolves payment gateway credentials from the admin panel (database).
 * Stripe keeps an .env fallback so existing installations keep working.
 */
class GatewayConfigService
{
    public function settings(): ?General_setting
    {
        return General_setting::query()->first();
    }

    public function paypal(): array
    {
        $s = $this->settings();

        return [
            'enabled' => (bool) ($s?->paypal_enabled ?? false),
            'mode' => $s?->paypal_mode === 'live' ? 'live' : 'sandbox',
            'client_id' => $s?->paypal_client_id ?: null,
            'client_secret' => $s?->paypal_client_secret ?: null,
        ];
    }

    public function mollie(): array
    {
        $s = $this->settings();

        return [
            'enabled' => (bool) ($s?->mollie_enabled ?? false),
            'api_key' => $s?->mollie_api_key ?: null,
        ];
    }

    public function razorpay(): array
    {
        $s = $this->settings();

        $enabled = (bool) ($s?->razorpay_enabled ?? false)
            && filled($s?->razorpay_key_id)
            && filled($s?->razorpay_key_secret);

        return [
            'enabled' => $enabled,
            'key_id' => $s?->razorpay_key_id ?: null,
            'key_secret' => $s?->razorpay_key_secret ?: null,
        ];
    }

    public function stripe(): array
    {
        $s = $this->settings();

        $secret = $s?->stripe_secret ?: config('services.stripe.secret');

        return [
            'enabled' => filled($secret),
            'secret' => $secret,
        ];
    }

    /**
     * Gateways the storefront is allowed to offer, in display order.
     *
     * @return array<int, array{key: string, label: string, description: string}>
     */
    public function availableMethods(): array
    {
        $methods = [];

        if ($this->stripe()['enabled']) {
            $methods[] = [
                'key' => 'stripe',
                'label' => 'Pay with Card',
                'description' => 'Credit/Debit Cards via Stripe',
            ];
        }

        if ($this->paypal()['enabled']) {
            $methods[] = [
                'key' => 'paypal',
                'label' => 'Pay with PayPal',
                'description' => 'PayPal account balance or cards',
            ];
        }

        if ($this->mollie()['enabled']) {
            $methods[] = [
                'key' => 'mollie',
                'label' => 'Pay with Mollie',
                'description' => 'iDEAL, credit card and more',
            ];
        }

        if ($this->razorpay()['enabled']) {
            $methods[] = [
                'key' => 'razorpay',
                'label' => 'Pay with Razorpay',
                'description' => 'UPI, cards, net banking',
            ];
        }

        return $methods;
    }
}
