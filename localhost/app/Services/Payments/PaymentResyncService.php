<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Support\Facades\Log;

/**
 * Manual reconciliation used by the admin panel: ask the gateway for the
 * current state of a payment and either finalize it (grant access) or cancel
 * it locally. Same rule as everywhere else — the browser and even this
 * trigger are never trusted; the gateway is the source of truth.
 */
class PaymentResyncService
{
    public function resync(Payment $payment): array
    {
        if ($payment->status === 'paid') {
            return [
                'success' => false,
                'message' => 'This payment is already paid — nothing to resync.',
            ];
        }

        if ($payment->status !== 'pending') {
            return [
                'success' => false,
                'message' => "Only pending payments can be resynced (current status: {$payment->status}).",
            ];
        }

        // Free checkouts never touched a gateway — there is nothing to ask.
        if ($payment->gateway === 'free') {
            return [
                'success' => false,
                'message' => 'Free checkouts have no gateway to resync from.',
            ];
        }

        $reference = $payment->gateway_reference;

        if (!$reference) {
            return [
                'success' => false,
                'message' => 'No gateway reference is stored for this payment — it never reached the gateway. Cancel it instead.',
            ];
        }

        try {
            $gateway = PaymentGatewayManager::make($payment->gateway);

            $result = $gateway->verify($reference);
        } catch (\Throwable $e) {
            Log::warning('Admin resync failed', [
                'payment_id' => $payment->id,
                'gateway' => $payment->gateway,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Could not reach the gateway: '.$e->getMessage(),
            ];
        }

        if ($result['paid']) {
            $finalized = app(PaymentFinalizer::class)->finalize(
                $payment,
                $result['transaction_id'],
                ['verified_via' => 'admin_resync'],
                $result['amount_total'] ?? null,
                $result['currency'] ?? null
            );

            if (!$finalized) {
                return [
                    'success' => false,
                    'message' => 'The gateway reports a paid amount that does not match this payment — left under review. Check the logs.',
                ];
            }

            return [
                'success' => true,
                'message' => "Payment marked as paid (transaction {$result['transaction_id']}). Access, enrollment and instructor earnings were granted.",
            ];
        }

        // Gateway says it was never paid → safe to cancel. The finalize
        // pipeline stays untouched for paid payments, so this can never
        // revoke an existing enrollment.
        app(PaymentFinalizer::class)->markCanceled($payment);

        return [
            'success' => true,
            'message' => 'The gateway confirms this payment was never completed — it has been canceled.',
        ];
    }
}
