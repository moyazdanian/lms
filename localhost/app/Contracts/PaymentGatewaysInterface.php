<?php

namespace App\Contracts;

use App\Models\Payment;

interface PaymentGatewaysInterface
{
    /**
     * Create a checkout session on the gateway.
     *
     * @return array{checkout_url: string, session_id: string}
     */
    public function request(Payment $payment): array;

    /**
     * Retrieve the session from the gateway and report its state.
     *
     * @return array{paid: bool, transaction_id: string|null, amount_total: int|null, currency: string|null}
     */
    public function verify(string $sessionId): array;
}
