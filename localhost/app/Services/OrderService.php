<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Coupon_usage;
use App\Models\Enrollment;
use App\Models\General_setting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class OrderService
{
    /**
     * Create the only customer-facing order representation used by checkout.
     * Prices are always read from the current course records, never trusted
     * from cart snapshots or the browser.
     */
    public function store(User $user): array
    {
        $cartItems = $user->cartItems()->with('course')->get();

        if ($cartItems->isEmpty()) {
            return ['success' => false, 'msg' => 'Cart is empty'];
        }

        $unavailableCourse = $cartItems->first(
            fn ($item) => !$item->course || !$item->course->is_active
        );
        if ($unavailableCourse) {
            return ['success' => false, 'msg' => 'One of the courses in your cart is no longer available.'];
        }

        $pricing = $this->priceCart($cartItems);

        $alreadyEnrolled = Enrollment::query()
            ->where('user_id', $user->id)
            ->whereIn('course_id', $pricing['course_ids'])
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        if ($alreadyEnrolled) {
            return [
                'success' => false,
                'msg' => 'Your cart contains a course you already own.',
            ];
        }

        // $pendingPurchase = OrderItem::query()
        //     ->whereIn('course_id', $pricing['course_ids'])
        //     ->whereHas('order', function ($query) use ($user) {
        //         $query->where('user_id', $user->id)->where('status', 'pending');
        //     })
        //     ->exists();

        // if ($pendingPurchase) {
        //     return [
        //         'success' => false,
        //         'msg' => 'A payment for one of these courses is already in progress.',
        //     ];
        // }

        $coupon = $this->resolveCoupon($user, $pricing['subtotal']);
        if (!$coupon['valid']) {
            return ['success' => false, 'msg' => $coupon['message']];
        }

        $order = DB::transaction(function () use ($user, $cartItems, $pricing, $coupon) {
            $couponDiscountCents = (int) round(((float) $coupon['discount']) * 100);
            $subtotalCents = (int) round(((float) $pricing['subtotal']) * 100);
            $commissionPercent = (float) (General_setting::first()?->instructor_commission_percent ?? 20);
            $commissionPercent = max(0, min(100, $commissionPercent));
            $couponAllocations = $this->allocateCoupon(
                $cartItems,
                $pricing['lines'],
                $couponDiscountCents,
                $subtotalCents
            );
            $order = Order::create([
                'order_number' => 'TMP-'.Str::uuid(),
                'user_id' => $user->id,
                // Subtotal after course-level sale prices, before coupon.
                'total_amount' => $pricing['subtotal'],
                'discount_amount' => $pricing['course_discount'],
                'coupon_id' => $coupon['coupon']?->id,
                'coupon_discount' => $coupon['discount'],
                'payment_method' => 'stripe',
                'status' => 'pending',
            ]);

            $order->update([
                'order_number' => $this->generateOrderNumber($order->id),
            ]);

            foreach ($cartItems as $item) {
                $line = $pricing['lines'][$item->course_id];
                $itemSubtotalCents = $line['unit_price_cents'];
                $itemCouponCents = $couponAllocations[$item->course_id] ?? 0;
                $finalAmountCents = $itemSubtotalCents - $itemCouponCents;
                $commissionCents = (int) round($finalAmountCents * $commissionPercent / 100);

                // Courses are single-purchase products, so quantity is one.
                $order->items()->create([
                    'course_id' => $item->course_id,
                    'instructor_id' => $item->course->instructor_id,
                    'title' => $item->course->title,
                    'price' => $this->amount($itemSubtotalCents),
                    'catalog_price' => $line['catalog_price'],
                    'course_discount_amount' => $line['course_discount_amount'],
                    'subtotal_before_coupon' => $this->amount($itemSubtotalCents),
                    'allocated_coupon_discount' => $this->amount($itemCouponCents),
                    'final_amount' => $this->amount($finalAmountCents),
                    'commission_percent' => $this->amount((int) round($commissionPercent * 100)),
                    'commission_amount' => $this->amount($commissionCents),
                    'instructor_net_amount' => $this->amount($finalAmountCents - $commissionCents),
                ]);
            }

            return $order;
        });

        return [
            'success' => true,
            'order_id' => $order->id,
            'subtotal' => $pricing['subtotal'],
            'coupon_discount' => $coupon['discount'],
            'total' => $coupon['total'],
        ];
    }

    /**
     * Calculate prices in integer cents to avoid float errors at checkout.
     */
    protected function priceCart($cartItems): array
    {
        $subtotalCents = 0;
        $courseDiscountCents = 0;
        $lines = [];
        $courseIds = [];

        foreach ($cartItems as $item) {
            $course = $item->course;
            $catalogPriceCents = max(0, (int) round(((float) $course->price) * 100));
            $salePrice = $course->discount_price;

            $unitPriceCents = $salePrice !== null
                && (float) $salePrice >= 0
                && (float) $salePrice < (float) $course->price
                ? max(0, (int) round(((float) $salePrice) * 100))
                : $catalogPriceCents;

            $subtotalCents += $unitPriceCents;
            $courseDiscountCents += max(0, $catalogPriceCents - $unitPriceCents);
            $courseIds[] = $course->id;
            $lines[$course->id] = [
                'unit_price' => $this->amount($unitPriceCents),
                'unit_price_cents' => $unitPriceCents,
                'catalog_price' => $this->amount($catalogPriceCents),
                'course_discount_amount' => $this->amount(max(0, $catalogPriceCents - $unitPriceCents)),
            ];
        }

        return [
            'course_ids' => $courseIds,
            'lines' => $lines,
            'subtotal' => $this->amount($subtotalCents),
            'course_discount' => $this->amount($courseDiscountCents),
        ];
    }

    /**
     * Allocate a whole-order coupon across items using the largest-remainder
     * method, keeping all calculations in cents and preserving the exact total.
     */
    protected function allocateCoupon($cartItems, array $lines, int $couponCents, int $subtotalCents): array
    {
        $allocations = [];
        $remainders = [];
        $allocated = 0;

        foreach ($cartItems->values() as $index => $item) {
            $lineCents = (int) $lines[$item->course_id]['unit_price_cents'];
            $numerator = $couponCents * $lineCents;
            $base = $subtotalCents > 0 ? intdiv($numerator, $subtotalCents) : 0;
            $allocations[$item->course_id] = min($base, $lineCents);
            $allocated += $allocations[$item->course_id];
            $remainders[$item->course_id] = [
                'remainder' => $subtotalCents > 0 ? $numerator % $subtotalCents : 0,
                'index' => $index,
            ];
        }

        $remaining = max(0, $couponCents - $allocated);
        uasort($remainders, function (array $a, array $b): int {
            return ($b['remainder'] <=> $a['remainder']) ?: ($a['index'] <=> $b['index']);
        });

        foreach (array_keys($remainders) as $courseId) {
            if ($remaining <= 0) {
                break;
            }

            $capacity = (int) $lines[$courseId]['unit_price_cents'] - $allocations[$courseId];
            if ($capacity > 0) {
                $allocations[$courseId]++;
                $remaining--;
            }
        }

        return $allocations;
    }

    /**
     * Re-read and validate the coupon at order creation. Session values are
     * only a reference to the selected coupon and are never trusted for money.
     */
    protected function resolveCoupon(User $user, string $subtotal): array
    {
        $selected = session('applied_coupon');
        if (!$selected) {
            return [
                'valid' => true,
                'coupon' => null,
                'discount' => '0.00',
                'total' => $subtotal,
            ];
        }

        $coupon = Coupon::query()
            ->whereKey($selected['coupon_id'] ?? 0)
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return ['valid' => false, 'message' => 'The selected coupon is no longer valid.'];
        }

        $now = now();
        if (($coupon->start_date && Carbon::parse($coupon->start_date)->isAfter($now))
            || ($coupon->end_date && Carbon::parse($coupon->end_date)->isBefore($now))
            || ($coupon->expires_at && Carbon::parse($coupon->expires_at)->isBefore($now))) {
            return ['valid' => false, 'message' => 'Coupon is not valid at this time.'];
        }

        if ((float) $coupon->min_order_amount > (float) $subtotal) {
            return ['valid' => false, 'message' => 'Minimum order amount not met.'];
        }

        if ($coupon->usage_limit && Coupon_usage::where('coupon_id', $coupon->id)->count() >= $coupon->usage_limit) {
            return ['valid' => false, 'message' => 'Coupon usage limit reached.'];
        }

        if ($coupon->is_first_order && $user->orders()->where('status', 'paid')->exists()) {
            return ['valid' => false, 'message' => 'Coupon only valid for your first paid order.'];
        }

        if (Coupon_usage::where('coupon_id', $coupon->id)->where('user_id', $user->id)->exists()) {
            return ['valid' => false, 'message' => 'You already used this coupon.'];
        }

        $subtotalCents = (int) round(((float) $subtotal) * 100);
        $discountCents = $coupon->type === 'percent'
            ? (int) round($subtotalCents * ((float) $coupon->amount / 100))
            : min((int) round(((float) $coupon->amount) * 100), $subtotalCents);
        $discountCents = max(0, min($discountCents, $subtotalCents));

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $this->amount($discountCents),
            'total' => $this->amount($subtotalCents - $discountCents),
        ];
    }

    protected function amount(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }

    protected function generateOrderNumber(int $id): string
    {
        return 'ORD-'.str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}