<?php

namespace App\Http\Controllers;

use App\Models\General_setting;
use App\Models\Order;
use App\Models\Payment;
use App\Services\OrderService;
use App\Services\Payments\GatewayConfigService;
use App\Services\Payments\PaymentFinalizer;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    // Gateways reject charges below ~$0.50; free checkouts are out of scope.
    protected const MIN_CHARGE_AMOUNT = 0.5;

    protected GatewayConfigService $gatewayConfig;

    public function __construct(GatewayConfigService $gatewayConfig)
    {
        $this->gatewayConfig = $gatewayConfig;
    }

    /**
     * Which payment methods the storefront may offer right now. The frontend
     * renders its checkout buttons from this list — enabling a gateway in the
     * admin panel instantly offers it in the shop.
     */
    public function methods(Request $request)
    {
        return response()->json([
            'methods' => $this->gatewayConfig->availableMethods(),
        ]);
    }

    public function initiate(Request $request, OrderService $orderService)
    {
        $request->validate([
            'method' => 'required|string|in:'.implode(',', array_merge(PaymentGatewayManager::supported(), ['free'])),
            // Optional idempotency key to prevent double-click duplicate payments
            'idempotency_key' => 'sometimes|string|max:100',
        ]);

        $method = $request->input('method');

        // The chosen gateway must also be enabled in the admin panel — the
        // virtual "free" method is the only exception: a zero-total cart
        // must stay enrollable even with every gateway disabled.
        abort_unless(
            $method === 'free' || in_array($method, array_column($this->gatewayConfig->availableMethods(), 'key'), true),
            422,
            'This payment method is not available.'
        );

        $user = $request->user();
        $idempotencyKey = $request->input('idempotency_key') ?: (string) Str::uuid();

        // A payment left pending by an abandoned attempt (e.g. a dismissed
        // Razorpay modal before the cancel endpoint ran) must not block new
        // checkouts forever: reconcile any stale pending payment first.
        $this->releaseStalePendingPayments($user);

        // Return the existing checkout session when the browser retries the
        // same payment attempt instead of creating another order/payment.
        $existingPayment = Payment::where('user_id', $user->id)
            ->where('idempotency_key', $idempotencyKey)
            ->with('order')
            ->first();

        if ($existingPayment?->status === 'pending') {
            return response()->json([
                'success' => true,
                'order_id' => $existingPayment->order_id,
                'checkout_url' => $existingPayment->meta['checkout_url'] ?? null,
                'gateway' => $existingPayment->gateway,
                'frontend_context' => $existingPayment->meta['frontend_context'] ?? null,
                'message' => 'Payment already in progress',
            ]);
        }

        if ($existingPayment) {
            return response()->json([
                'success' => false,
                'message' => 'This payment attempt has already been '.$existingPayment->status.'. Start a new checkout attempt.',
            ], 422);
        }

        $orderProccess = $orderService->store($user);

        if ($orderProccess['success'] !== true) {
            return response()->json([
                'success' => false,
                'message' => $orderProccess['msg'] ?? 'Order could not be created',
            ], 422);
        }

        $order = $user->orders()
            ->where('id', $orderProccess['order_id'])
            ->where('status', 'pending')
            ->firstOrFail();

        $chargeAmount = number_format(
            max((float) $order->total_amount - (float) $order->coupon_discount, 0),
            2,
            '.',
            ''
        );

        // A total of zero (all-free cart or a 100% coupon) needs no gateway:
        // mark the order paid and enroll the buyer through the regular
        // finalizer so every downstream side effect (earnings skip, coupon
        // usage, cart cleanup, notifications) stays identical.
        if ((float) $chargeAmount == 0.0) {
            return $this->completeFreeOrder($order, $request->user(), $method);
        }

        if ($chargeAmount < self::MIN_CHARGE_AMOUNT) {
            $order->update(['status' => 'canceled']);

            return response()->json([
                'success' => false,
                'message' => 'Order total is below the minimum chargeable amount.',
            ], 422);
        }

        $currency = strtolower(General_setting::first()?->currency ?: 'usd');

        $payment = Payment::create([
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'amount' => $chargeAmount,
            'gateway' => $method,
            'status' => 'pending',
            'coupon_id' => $order->coupon_id,
            'coupon_amount' => $order->coupon_discount,
            'idempotency_key' => $idempotencyKey,
            'meta' => [
                'idempotency_key' => $idempotencyKey,
                'currency' => $currency,
            ],
        ]);

        try {
            $gateway = PaymentGatewayManager::make($method);

            $session = $gateway->request($payment);
        } catch (\Throwable $e) {
            Log::error('Payment initiation failed', [
                'payment_id' => $payment->id,
                'gateway' => $method,
                'error' => $e->getMessage(),
            ]);

            $payment->update(['status' => 'failed']);
            $order->update(['status' => 'canceled']);

            return response()->json([
                'success' => false,
                'message' => 'Could not start the payment. Please try again.',
            ], 502);
        }

        $payment->update([
            'meta' => array_merge($payment->meta ?? [], [
                // Keep the stripe_session_id/stripe_checkout_url keys for
                // backwards compatibility; checkout_url is the generic key.
                'stripe_session_id' => $session['session_id'],
                'stripe_checkout_url' => $session['checkout_url'],
                'checkout_url' => $session['checkout_url'],
                'mollie_payment_id' => $method === 'mollie' ? $session['session_id'] : null,
                'razorpay_order_id' => $method === 'razorpay' ? $session['session_id'] : null,
                'frontend_context' => $session['frontend_context'] ?? null,
            ]),
        ]);

        return response()->json([
            'success' => true,
            'order_id' => $order->id,
            'gateway' => $method,
            'checkout_url' => $session['checkout_url'],
            'frontend_context' => $session['frontend_context'] ?? null,
        ]);
    }

    /**
     * Complete a zero-total order without any gateway. Creates a paid
     * "free" payment row (an audit trail, but never counted as revenue)
     * and runs the shared finalizer so enrollments and coupon usage behave
     * exactly like a paid checkout.
     */
    protected function completeFreeOrder($order, $user, string $requestedMethod)
    {
        $payment = DB::transaction(function () use ($order, $user, $requestedMethod) {
            $order = Order::whereKey($order->getKey())->lockForUpdate()->firstOrFail();

            if ($order->status !== 'pending') {
                return null;
            }

            $payment = Payment::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'amount' => 0,
                'gateway' => 'free',
                'status' => 'pending',
                'coupon_id' => $order->coupon_id,
                'coupon_amount' => $order->coupon_discount,
                'idempotency_key' => (string) Str::uuid(),
                'meta' => [
                    'currency' => strtolower(General_setting::first()?->currency ?: 'usd'),
                    'requested_method' => $requestedMethod,
                    'free_checkout' => true,
                ],
            ]);

            $order->update(['payment_method' => 'free']);

            return $payment;
        });

        if (!$payment) {
            // Someone else already completed this order — treat it as done.
            return response()->json([
                'success' => true,
                'free' => true,
                'order_id' => $order->id,
                'message' => 'Order already completed.',
            ]);
        }

        app(PaymentFinalizer::class)->finalize(
            $payment,
            'free-'.Str::uuid(),
            ['verified_via' => 'free_checkout']
        );

        return response()->json([
            'success' => true,
            'free' => true,
            'order_id' => $order->id,
        ]);
    }

    /**
     * Verify a payment after the browser returns from the gateway. Works for
     * every redirect gateway (session id lookup) plus Razorpay's modal flow
     * (HMAC signature verification with the razorpay_* fields).
     */
    public function verify(Request $request, PaymentFinalizer $finalizer)
    {
        $payment = $this->resolvePayment($request);

        if ($payment->status === 'paid') {
            return $this->paidResponse($payment);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'status' => $payment->status,
                'order_id' => $payment->order_id,
            ]);
        }

        if ($payment->gateway === 'razorpay') {
            return $this->verifyRazorpay($request, $payment, $finalizer);
        }

        // PayPal/Mollie returns carry no gateway token in the URL — fall back
        // to the session id stored at initiation time.
        $sessionId = $request->input('session_id')
            ?? $payment->meta['stripe_session_id']
            ?? null;

        $gateway = PaymentGatewayManager::make($payment->gateway);

        $result = $gateway->verify($sessionId);

        if ($result['paid']) {
            $finalized = $finalizer->finalize(
                $payment,
                $result['transaction_id'],
                ['verified_via' => 'success_page'],
                $result['amount_total'] ?? null,
                $result['currency'] ?? null
            );

            if (!$finalized) {
                return response()->json([
                    'status' => 'pending',
                    'order_id' => $payment->order_id,
                    'message' => 'Payment is under review.',
                ]);
            }

            session()->forget('applied_coupon');

            return $this->paidResponse($payment);
        }

        return response()->json([
            'status' => 'pending',
            'order_id' => $payment->order_id,
        ]);
    }

    public function userPayments(Request $request)
    {
        $validated = $request->validate([
            'search' => 'sometimes|nullable|string|max:100',
            'page' => 'sometimes|integer|min:1',
            'perPage' => 'sometimes|integer|min:1|max:100',
            'period' => 'sometimes|nullable|string|in:all,7d,30d,3m,6m,12m',
            'status' => 'sometimes|nullable|string|in:all,pending,paid,failed,canceled',
        ]);

        $user = $request->user();

        $query = $user->payments()->with('order');

        if (!empty($validated['status']) && $validated['status'] !== 'all') {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($query) use ($search) {
                $query->where('status', 'like', "%{$search}%")
                    ->orWhere('gateway', 'like', "%{$search}%")
                    ->orWhereHas('order', function ($query) use ($search) {
                        $query->where('order_number', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($validated['period']) && $validated['period'] !== 'all') {
            $start = match ($validated['period']) {
                '7d' => now()->subDays(7),
                '30d' => now()->subDays(30),
                '3m' => now()->subMonths(3),
                '6m' => now()->subMonths(6),
                '12m' => now()->subMonths(12),
                default => null,
            };

            if ($start) {
                $query->where('created_at', '>=', $start);
            }
        }

        $payments = $query->latest()->paginate(
            $validated['perPage'] ?? 10,
            ['*'],
            'page',
            $validated['page'] ?? 1
        );

        return response()->json([
            'data' => $payments,
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function cancel(Request $request, PaymentFinalizer $finalizer)
    {
        $payment = $this->resolvePayment($request);

        /*
         * If the payment was already finalized by a webhook
         * or another request, never overwrite it.
         */
        if ($payment->status === 'paid') {
            return $this->paidResponse($payment);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'status' => $payment->status,
                'order_id' => $payment->order_id,
            ]);
        }

        /*
         * Do not blindly mark the payment as canceled.
         * Ask the gateway for the real status first — the user may have
         * actually paid while coming back through the cancel URL.
         */
        $gateway = PaymentGatewayManager::make($payment->gateway);

        $sessionId = $request->input('session_id')
            ?? $payment->meta['stripe_session_id']
            ?? null;

        $result = $gateway->verify($sessionId);

        if ($result['paid']) {
            $finalized = $finalizer->finalize(
                $payment,
                $result['transaction_id'],
                ['verified_via' => 'cancel_page'],
                $result['amount_total'] ?? null,
                $result['currency'] ?? null
            );

            if (!$finalized) {
                return response()->json([
                    'status' => 'pending',
                    'order_id' => $payment->order_id,
                    'message' => 'Payment is under review.',
                ]);
            }

            return $this->paidResponse($payment);
        }

        /*
         * The gateway confirms the session has NOT been paid.
         * Cancel our local pending payment.
         */
        $finalizer->markCanceled($payment);

        return response()->json([
            'status' => 'canceled',
            'order_id' => $payment->order_id,
        ]);
    }

    /**
     * Abandoned pending payments would otherwise block the user forever:
     * OrderService::store refuses to create a new order while any of the
     * cart's courses sits inside a pending order. A pending payment older
     * than 30 minutes is almost certainly abandoned (gateways expire their
     * sessions well before that), so we ask the gateway for its real state
     * and then close it out: finalize if actually paid, otherwise cancel.
     * The gateway call is best-effort — a failure here must not break the
     * new checkout attempt.
     */
    protected function releaseStalePendingPayments($user): void
    {
        $stale = Payment::where('user_id', $user->id)
            ->where('status', 'pending')
            // Free checkouts complete synchronously; a pending one is a bug,
            // not an abandoned gateway session — leave it for support.
            ->where('gateway', '!=', 'free')
            ->where('created_at', '<', now()->subMinutes(30))
            ->with('order')
            ->orderBy('id')
            ->get();

        foreach ($stale as $payment) {
            try {
                $gateway = PaymentGatewayManager::make($payment->gateway);

                $result = $gateway->verify(
                    $payment->meta['stripe_session_id']
                        ?? $payment->meta['mollie_payment_id']
                        ?? $payment->meta['razorpay_order_id']
                        ?? ''
                );

                if ($result['paid']) {
                    app(PaymentFinalizer::class)->finalize(
                        $payment,
                        $result['transaction_id'],
                        ['verified_via' => 'stale_sweep'],
                        $result['amount_total'] ?? null,
                        $result['currency'] ?? null
                    );
                } else {
                    app(PaymentFinalizer::class)->markCanceled($payment);
                }
            } catch (\Throwable $e) {
                // Gateway unreachable or credentials changed — leave this one
                // pending and try again on the next checkout attempt.
                Log::warning('Stale payment sweep skipped', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Find the current user's payment. Three lookup styles are supported:
     * - session_id (Stripe/Mollie/PayPal gateway token, generic or legacy key)
     * - razorpay_order_id (Razorpay modal flow)
     * - payment_id (redirect gateways like PayPal/Mollie that return no token
     *   in the URL — ownership is enforced by user_id scoping)
     */
    protected function resolvePayment(Request $request): Payment
    {
        $request->validate([
            'session_id' => 'nullable|string',
            'razorpay_order_id' => 'nullable|string',
            'payment_id' => 'nullable|integer',
        ]);

        $user = $request->user();

        if ($request->filled('payment_id')) {
            return Payment::where('user_id', $user->id)
                ->whereKey((int) $request->input('payment_id'))
                ->with('order')
                ->firstOrFail();
        }

        if ($request->filled('razorpay_order_id')) {
            return Payment::where('user_id', $user->id)
                ->where('meta->razorpay_order_id', $request->input('razorpay_order_id'))
                ->with('order')
                ->firstOrFail();
        }

        return Payment::where('user_id', $user->id)
            ->where(function ($query) use ($request) {
                $query->where('meta->stripe_session_id', $request->input('session_id'))
                    ->orWhere('meta->checkout_session_id', $request->input('session_id'));
            })
            ->with('order')
            ->firstOrFail();
    }

    protected function verifyRazorpay(Request $request, Payment $payment, PaymentFinalizer $finalizer)
    {
        $request->validate([
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $gateway = PaymentGatewayManager::make('razorpay');

        $signatureValid = $gateway->verifySignature(
            $request->input('razorpay_order_id'),
            $request->input('razorpay_payment_id'),
            $request->input('razorpay_signature')
        );

        if (!$signatureValid) {
            Log::warning('Razorpay signature mismatch', ['payment_id' => $payment->id]);

            return response()->json([
                'status' => 'pending',
                'order_id' => $payment->order_id,
                'message' => 'Signature verification failed.',
            ]);
        }

        $result = $gateway->verify($request->input('razorpay_order_id'));

        if ($result['paid']) {
            $finalizer->finalize(
                $payment,
                $result['transaction_id'],
                ['verified_via' => 'razorpay_modal'],
                $result['amount_total'] ?? null,
                $result['currency'] ?? null
            );

            session()->forget('applied_coupon');

            return $this->paidResponse($payment);
        }

        return response()->json([
            'status' => 'pending',
            'order_id' => $payment->order_id,
        ]);
    }

    protected function paidResponse(Payment $payment): array
    {
        return [
            'status' => 'paid',
            'order_id' => $payment->order_id,
            'order_number' => $payment->order->order_number,
        ];
    }
}
