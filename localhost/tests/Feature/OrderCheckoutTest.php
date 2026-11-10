<?php

use App\Models\Cart_item;
use App\Models\Course;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;

function makeOrderCourse(array $attributes = []): array
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = Course::create(array_merge([
        'instructor_id' => $instructor->id,
        'title' => 'Checkout Course',
        'slug' => 'checkout-course-'.uniqid(),
        'description' => 'Course description',
        'price' => 100,
        'discount_price' => 75,
        'level' => 'beginner',
        'is_active' => true,
    ], $attributes));

    return [$instructor, $course];
}

it('creates an order from current course prices and stores an item snapshot', function () {
    [$instructor, $course] = makeOrderCourse();
    $user = User::factory()->create(['status' => true]);

    Cart_item::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'price' => 1,
        'discount_price' => 1,
        'final_price' => 1,
        'quantity' => 1,
    ]);

    $result = app(OrderService::class)->store($user);
    $order = Order::with('items')->findOrFail($result['order_id']);

    expect($result['success'])->toBeTrue()
        ->and((float) $order->total_amount)->toBe(75.0)
        ->and((float) $order->discount_amount)->toBe(25.0)
        ->and((float) $order->coupon_discount)->toBe(0.0)
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->title)->toBe('Checkout Course')
        ->and((float) $order->items->first()->price)->toBe(75.0);
});

it('does not open a database transaction for an empty cart', function () {
    $user = User::factory()->create(['status' => true]);

    expect(app(OrderService::class)->store($user))
        ->toMatchArray(['success' => false, 'msg' => 'Cart is empty']);

    expect(Order::where('user_id', $user->id)->count())->toBe(0);
});
