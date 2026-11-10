<?php

use App\Models\Cart_item;
use App\Models\Coupon;
use App\Models\Course;
use App\Models\General_setting;
use App\Models\InstructorEarning;
use App\Models\Payment;
use App\Models\User;
use App\Services\OrderService;
use App\Services\Payments\PaymentFinalizer;
use Illuminate\Support\Facades\Notification;

it('allocates an order coupon across items and records instructor earnings from item snapshots', function () {
    Notification::fake();

    $instructorOne = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $instructorTwo = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $buyer = User::factory()->create(['status' => true]);

    $courseOne = Course::create([
        'instructor_id' => $instructorOne->id,
        'title' => 'Course One',
        'slug' => 'course-one-'.uniqid(),
        'description' => 'Description',
        'price' => 100,
        'discount_price' => 80,
        'level' => 'beginner',
        'is_active' => true,
    ]);
    $courseTwo = Course::create([
        'instructor_id' => $instructorTwo->id,
        'title' => 'Course Two',
        'slug' => 'course-two-'.uniqid(),
        'description' => 'Description',
        'price' => 50,
        'discount_price' => 40,
        'level' => 'beginner',
        'is_active' => true,
    ]);

    General_setting::create([
        'currency' => 'usd',
        'instructor_commission_percent' => 20,
        'minimum_payout_amount' => 50,
    ]);

    $coupon = Coupon::create([
        'code' => 'MULTI-'.uniqid(),
        'title' => 'Multi instructor discount',
        'type' => 'fixed',
        'amount' => 30,
        'min_order_amount' => 0,
        'start_date' => now()->subDay(),
        'end_date' => now()->addDay(),
        'is_active' => true,
    ]);

    foreach ([$courseOne, $courseTwo] as $course) {
        Cart_item::create([
            'user_id' => $buyer->id,
            'course_id' => $course->id,
            'price' => 1,
            'discount_price' => 1,
            'final_price' => 1,
            'quantity' => 1,
        ]);
    }

    session(['applied_coupon' => ['coupon_id' => $coupon->id]]);

    $result = app(OrderService::class)->store($buyer);
    $order = $buyer->orders()->with('items')->findOrFail($result['order_id']);

    expect($result['total'])->toBe('90.00')
        ->and($order->items)->toHaveCount(2)
        ->and((float) $order->items[0]->subtotal_before_coupon)->toBe(80.0)
        ->and((float) $order->items[0]->allocated_coupon_discount)->toBe(20.0)
        ->and((float) $order->items[0]->final_amount)->toBe(60.0)
        ->and((float) $order->items[1]->subtotal_before_coupon)->toBe(40.0)
        ->and((float) $order->items[1]->allocated_coupon_discount)->toBe(10.0)
        ->and((float) $order->items[1]->final_amount)->toBe(30.0)
        ->and((float) $order->items[0]->commission_percent)->toBe(20.0)
        ->and((float) $order->items[0]->commission_amount)->toBe(12.0)
        ->and((float) $order->items[0]->instructor_net_amount)->toBe(48.0)
        ->and($order->items->sum(fn ($item) => (float) $item->allocated_coupon_discount))->toBe(30.0)
        ->and($order->items->sum(fn ($item) => (float) $item->final_amount))->toBe(90.0);

    // Later catalog/settings changes must not affect this completed sale.
    $courseOne->update(['price' => 1000, 'discount_price' => 900]);
    General_setting::query()->update(['instructor_commission_percent' => 90]);

    $payment = Payment::create([
        'user_id' => $buyer->id,
        'order_id' => $order->id,
        'amount' => 90,
        'gateway' => 'stripe',
        'status' => 'pending',
        'meta' => ['currency' => 'usd'],
    ]);

    app(PaymentFinalizer::class)->finalize($payment, 'pi-multi-'.uniqid(), [], 9000, 'usd');

    $earnings = InstructorEarning::where('payment_id', $payment->id)->orderBy('instructor_id')->get();

    expect($earnings)->toHaveCount(2)
        ->and($earnings->sum(fn ($earning) => (float) $earning->gross_amount))->toBe(90.0)
        ->and($earnings->sum(fn ($earning) => (float) $earning->commission_amount))->toBe(18.0)
        ->and($earnings->sum(fn ($earning) => (float) $earning->net_amount))->toBe(72.0)
        ->and((float) $earnings[0]->gross_amount)->toBe(60.0)
        ->and((float) $earnings[0]->net_amount)->toBe(48.0)
        ->and((float) $earnings[1]->gross_amount)->toBe(30.0)
        ->and((float) $earnings[1]->net_amount)->toBe(24.0);
});
