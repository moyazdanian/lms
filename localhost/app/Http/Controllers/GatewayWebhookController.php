<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\Payments\PaymentFinalizer;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Generic gateway webhook endpoint. Mollie POSTs the payment id in the body
 * (no signature — security comes from asking Mollie for the current state
 * before finalizing, never trusting the webhook body). Razorpay webhooks can
 * be wired here later with X-Razorpay-Signature validation.
 */
class GatewayWebhookController extends Controller
{
    public function mollie(Request $request, PaymentFinalizer $finalizer)
    {
        $molliePaymentId = (string) $request->input('id');

        if (!$molliePaymentId) {
            return response('ignored', 200);
        }

        $payment = Payment::where('gateway', 'mollie')
            ->where('meta->mollie_payment_id', $molliePaymentId)
            ->with('order')
            ->first();

        if (!$payment) {
            Log::warning('Mollie webhook: payment not found', ['id' => $molliePaymentId]);

            return response('ignored', 200);
        }

        if ($payment->status !== 'pending') {
            return response('ok', 200);
        }

        try {
            $gateway = PaymentGatewayManager::make('mollie');
            $result = $gateway->verify($molliePaymentId);
        } catch (\Throwable $e) {
            Log::error('Mollie webhook verify failed', ['error' => $e->getMessage()]);

            // Ask Mollie to retry later.
            return response('retry', 500);
        }

        if ($result['paid']) {
            $finalizer->finalize(
                $payment,
                $result['transaction_id'],
                ['verified_via' => 'mollie_webhook'],
                $result['amount_total'] ?? null,
                $result['currency'] ?? null
            );
        }

        return response('ok', 200);
    }
}
