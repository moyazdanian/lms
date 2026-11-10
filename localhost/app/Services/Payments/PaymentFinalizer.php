<?php

namespace App\Services\Payments;

use App\Models\Coupon;
use App\Models\Coupon_usage;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Notifications\EnrollmentConfirmationNotification;
use App\Notifications\OrderReceiptNotification;
use App\Services\Marketplace\InstructorEarningService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentFinalizer
{
    /**
     * Mark a payment as paid and grant the user access.
     *
     * Shared by the Stripe webhook and the success-page verify endpoint,
     * so it must stay idempotent: whichever path runs second becomes a no-op.
     */
    public function __construct(
        protected InstructorEarningService $earningService
    ) {}

    public function finalize(
        Payment $payment,
        ?string $transactionId,
        array $meta = [],
        ?int $gatewayAmountMinor = null,
        ?string $gatewayCurrency = null
    ): bool {
        return DB::transaction(function () use ($payment, $transactionId, $meta, $gatewayAmountMinor, $gatewayCurrency) {
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if (!$locked) {
                return false;
            }

            if ($locked->status !== 'pending') {
                return true;
            }

            $order = $locked->order;
            if (!$order) {
                Log::error('Cannot finalize payment without an order', ['payment_id' => $locked->id]);
                return false;
            }

            $expectedAmountMinor = (int) round(((float) $locked->amount) * 100);
            $expectedCurrency = strtolower((string) ($locked->meta['currency'] ?? 'usd'));

            if ($gatewayAmountMinor !== null && (int) $gatewayAmountMinor !== $expectedAmountMinor) {
                Log::error('Payment amount mismatch during finalization', [
                    'payment_id' => $locked->id,
                    'expected' => $expectedAmountMinor,
                    'received' => $gatewayAmountMinor,
                ]);
                return false;
            }

            if ($gatewayCurrency !== null && strtolower($gatewayCurrency) !== $expectedCurrency) {
                Log::error('Payment currency mismatch during finalization', [
                    'payment_id' => $locked->id,
                    'expected' => $expectedCurrency,
                    'received' => $gatewayCurrency,
                ]);
                return false;
            }

            $locked->update([
                'status' => 'paid',
                'transaction_id' => $transactionId,
                'meta' => array_merge($locked->meta ?? [], $meta),
            ]);

            $order->update(['status' => 'paid']);
            $this->earningService->recordForPayment($locked);

            $orderItems = $order->items()->with('course')->get();
            $user = $locked->user;

            // Send Order Receipt notification
            $receiptItems = $orderItems->map(function ($item) {
                return [
                    'title' => $item->course->title ?? 'Unknown Course',
                    'price' => $item->final_amount ?? $item->price,
                    'qty' => $item->quantity ?? 1,
                ];
            })->toArray();

            $user->notify(new OrderReceiptNotification(
                $order->order_number,
                (float) $locked->amount,
                strtoupper((string) ($locked->meta['currency'] ?? 'USD')),
                $locked->gateway ?? 'stripe',
                $receiptItems
            ));

            foreach ($orderItems as $item) {
                $enrollment = Enrollment::firstOrCreate(
                    [
                        'user_id' => $locked->user_id,
                        'course_id' => $item->course_id,
                    ],
                    [
                        'payment_id' => $locked->id,
                        'status' => 'active',
                    ]
                );

                // Send Enrollment Confirmation for each newly enrolled course
                if ($enrollment->wasRecentlyCreated) {
                    $course = $item->course;
                    $user->notify(new EnrollmentConfirmationNotification(
                        $course->title ?? 'Unknown Course',
                        $course->slug ?? '',
                        $course->instructor?->name ?? null
                    ));
                }
            }

            if ($locked->coupon_id) {
                $coupon = Coupon::whereKey($locked->coupon_id)->lockForUpdate()->first();
                $usageExists = Coupon_usage::where('user_id', $locked->user_id)
                    ->where('coupon_id', $locked->coupon_id)
                    ->exists();

                if ($coupon && !$usageExists) {
                    Coupon_usage::create([
                        'user_id' => $locked->user_id,
                        'coupon_id' => $locked->coupon_id,
                        'payment_id' => $locked->id,
                    ]);

                    $coupon->update([
                        'used_count' => ((int) $coupon->used_count) + 1,
                    ]);
                }

                session()->forget('applied_coupon');
                
            }

            // Only clear the purchased courses; items added mid-payment survive.
            $locked->user->cartItems()
                ->whereIn('course_id', $orderItems->pluck('course_id'))
                ->delete();

            return true;
        });
    }

    public function markCanceled(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->first();

            session()->forget('applied_coupon');

            if (!$locked || $locked->status !== 'pending') {
                return;
            }

            $locked->update(['status' => 'canceled']);
            $locked->order?->update(['status' => 'canceled']);
        });
    }
}
