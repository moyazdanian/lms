<?php

namespace App\Services\Payments;

use App\Models\Payment;

class PaymentService
{
    /**
     * @return array{checkout_url: string, session_id: string}
     */
    public function start(Payment $payment): array
    {
        $gateway = PaymentGatewayManager::make($payment->gateway);

        return $gateway->request($payment);
    }
}
