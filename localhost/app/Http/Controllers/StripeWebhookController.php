<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\Payments\GatewayConfigService;
use App\Services\Payments\PaymentFinalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request, PaymentFinalizer $finalizer, GatewayConfigService $config)
    {
        // Signature verification needs the signing secret from the panel
        // (Settings > Payment Gateways), wherever Stripe is reachable.
        $secret = $config->stripe()['webhook_secret'];

        if (blank($secret)) {
            Log::error('Stripe webhook rejected: no signing secret configured', [
                'hint' => 'Settings > Payment Gateways > Stripe webhook signing secret',
            ]);

            return response()->json(['message' => 'Webhook signing secret is not configured'], 400);
        }

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature', ''),
                $secret
            );
        } catch (SignatureVerificationException|\UnexpectedValueException $e) {
            Log::warning('Stripe webhook rejected', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Invalid payload'], 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                $session = $event->data->object;

                if ($session->payment_status !== 'paid') {
                    break;
                }

                $payment = $this->resolvePayment($session);

                if (! $payment) {
                    Log::error('Stripe webhook: payment not found', ['session_id' => $session->id]);
                    break;
                }

                $finalized = $finalizer->finalize(
                    $payment,
                    $session->payment_intent,
                    ['verified_via' => 'webhook'],
                    $session->amount_total ?? null,
                    isset($session->currency) ? strtolower((string) $session->currency) : null
                );

                if (!$finalized) {
                    Log::error('Stripe webhook amount/currency mismatch', [
                        'payment_id' => $payment->id,
                        'session_id' => $session->id,
                    ]);
                }
                break;

            case 'checkout.session.expired':
            case 'checkout.session.async_payment_failed':
                $session = $event->data->object;

                $payment = $this->resolvePayment($session);

                if ($payment && $payment->status === 'pending') {
                    $finalizer->markCanceled($payment);
                }
                break;
        }

        // Always 200 for handled/ignored events so Stripe stops retrying.
        return response()->json(['received' => true]);
    }

    protected function resolvePayment(object $session): ?Payment
    {
        $paymentId = $session->metadata->payment_id ?? $session->client_reference_id ?? null;

        if ($paymentId) {
            return Payment::find($paymentId);
        }

        return Payment::where('meta->stripe_session_id', $session->id)->first();
    }
}
