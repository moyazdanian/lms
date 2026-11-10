<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CouponController extends Controller
{
    public function apply(Request $request)
    {
    $request->validate([
        'code' => 'required|string'
    ]);

    $user = $request->user();
    $coupon = Coupon::where('code', $request->code)
        ->where('is_active', 1)
        ->first();

    if(!$coupon){
        abort(404 , 'This code does not exists!');
    }

    // 1. resolve cart subtotal
    $subtotal = $this->resolveSubtotal($request);

    // 2. validate coupon rules
    $this->validateCouponRules($coupon, $user, $subtotal);

    // 3. calculate discount
    $discount = $this->calculateDiscount($coupon, $subtotal);

    // 4. store in session
    session(['applied_coupon'=> [
        'coupon_id' => $coupon->id,
        'code' => $coupon->code,
        'type' => $coupon->type,
        'amount' => $coupon->amount,
        'discount' => $discount,
        'subtotal' => $subtotal,
        'final_amount' => max($subtotal - $discount, 0),
    ]]);

    return response()->json(session('applied_coupon'));
}

public function show(){
    $data = session("applied_coupon");
    return response()->json($data);
}

public function destroy()
{
    session()->forget('applied_coupon');
    return response()->noContent();
}

protected function resolveSubtotal(Request $request)
{
    if ($request->user()) {
        return $request->user()
            ->cartItems()
            ->with('course')
            ->get()
            ->sum(fn ($item) => $this->coursePrice($item->course));
    }

    // guest cart
    $guestCart = session('guest_cart', []);

    return collect($guestCart)->sum('final_price');
}

protected function validateCouponRules(Coupon $coupon, $user, $subtotal)
{
    $now = now();
    if (($coupon->start_date && Carbon::parse($coupon->start_date)->isAfter($now))
        || ($coupon->end_date && Carbon::parse($coupon->end_date)->isBefore($now))
        || ($coupon->expires_at && Carbon::parse($coupon->expires_at)->isBefore($now))) {
        abort(422, 'Coupon is not valid at this time.');
    }

    if ($coupon->min_order_amount > $subtotal) {
        abort(422, 'Minimum order amount not met.');
    }

    if ($coupon->usage_limit && $coupon->users()->count() >= $coupon->usage_limit) {
        abort(422, 'Coupon usage limit reached.');
    }

    if ($coupon->is_first_order && $user) {
        if ($user->orders()->where('status', 'paid')->exists()) {
            abort(422, 'Coupon only valid for first order.');
        }
    }

    if ($user) {
        if ($coupon->users()->where('user_id', $user->id)->exists()) {
            abort(422, 'You already used this coupon.');
        }
    }
}

protected function calculateDiscount(Coupon $coupon, $subtotal)
{
    $discount = $coupon->type === 'percent'
        ? ((float) $coupon->amount / 100) * (float) $subtotal
        : min((float) $coupon->amount, (float) $subtotal);

    return number_format(max(0, min($discount, (float) $subtotal)), 2, '.', '');
}

protected function coursePrice($course): float
{
    if (!$course) {
        return 0;
    }

    if ($course->discount_price !== null
        && (float) $course->discount_price >= 0
        && (float) $course->discount_price < (float) $course->price) {
        return (float) $course->discount_price;
    }

    return (float) $course->price;
}



}
