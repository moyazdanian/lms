<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payments\PaymentFinalizer;
use Illuminate\Support\Facades\Notification;

function makeFinancialFixture(): array
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Paid Course',
        'slug' => 'paid-course-'.uniqid(),
        'description' => 'Course description',
        'price' => 100,
        'discount_price' => 80,
        'level' => 'beginner',
        'is_active' => true,
    ]);

    return [$instructor, $course];
}

it('returns only the authenticated user orders', function () {
    [$instructor, $course] = makeFinancialFixture();
    $owner = User::factory()->create(['status' => true]);
    $other = User::factory()->create(['status' => true]);

    $ownerOrder = Order::create([
        'user_id' => $owner->id,
        'order_number' => 'ORD-OWNER-'.uniqid(),
        'total_amount' => 80,
        'status' => 'paid',
    ]);
    Order::create([
        'user_id' => $other->id,
        'order_number' => 'ORD-OTHER-'.uniqid(),
        'total_amount' => 80,
        'status' => 'paid',
    ]);

    $this->actingAs($owner, 'web')
        ->getJson('/api/v1/get-orders')
        ->assertOk()
        ->assertJsonPath('data.0.id', $ownerOrder->id)
        ->assertJsonMissing(['user_id' => $other->id]);
});

it('finalizes a payment once and creates enrollment only once', function () {
    Notification::fake();
    [$instructor, $course] = makeFinancialFixture();
    $user = User::factory()->create(['status' => true]);
    $order = Order::create([
        'user_id' => $user->id,
        'order_number' => 'ORD-FINAL-'.uniqid(),
        'total_amount' => 80,
        'status' => 'pending',
    ]);
    $order->items()->create([
        'course_id' => $course->id,
        'title' => $course->title,
        'price' => 80,
    ]);
    $payment = Payment::create([
        'user_id' => $user->id,
        'order_id' => $order->id,
        'amount' => 80,
        'gateway' => 'stripe',
        'status' => 'pending',
        'meta' => ['currency' => 'usd'],
    ]);

    $finalizer = app(PaymentFinalizer::class);

    expect($finalizer->finalize($payment, 'pi_test', [], 8000, 'usd'))->toBeTrue()
        ->and($finalizer->finalize($payment->fresh(), 'pi_test', [], 8000, 'usd'))->toBeTrue();

    expect(Payment::find($payment->id)->status)->toBe('paid')
        ->and(Order::find($order->id)->status)->toBe('paid')
        ->and(Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->count())->toBe(1);
});

it('does not grant enrollment when the gateway amount is different', function () {
    Notification::fake();
    [$instructor, $course] = makeFinancialFixture();
    $user = User::factory()->create(['status' => true]);
    $order = Order::create([
        'user_id' => $user->id,
        'order_number' => 'ORD-MISMATCH-'.uniqid(),
        'total_amount' => 80,
        'status' => 'pending',
    ]);
    $order->items()->create([
        'course_id' => $course->id,
        'title' => $course->title,
        'price' => 80,
    ]);
    $payment = Payment::create([
        'user_id' => $user->id,
        'order_id' => $order->id,
        'amount' => 80,
        'gateway' => 'stripe',
        'status' => 'pending',
        'meta' => ['currency' => 'usd'],
    ]);

    expect(app(PaymentFinalizer::class)->finalize($payment, 'pi_bad', [], 7999, 'usd'))->toBeFalse()
        ->and(Payment::find($payment->id)->status)->toBe('pending')
        ->and(Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists())->toBeFalse();
});
