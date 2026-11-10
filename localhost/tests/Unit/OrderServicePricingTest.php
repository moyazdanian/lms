<?php

use App\Models\Cart_item;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;

function makePricingFixture(): array
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Pricing Course',
        'slug' => 'pricing-course-'.uniqid(),
        'description' => 'Course description',
        'price' => 100,
        'discount_price' => 70,
        'level' => 'beginner',
        'is_active' => true,
    ]);

    return [$course, $instructor];
}

it('ignores manipulated cart prices and uses the current course price', function () {
    [$course] = makePricingFixture();
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
    $order = Order::findOrFail($result['order_id']);

    expect((float) $order->total_amount)->toBe(70.0)
        ->and((float) $order->discount_amount)->toBe(30.0);
});

it('rejects checkout for a course already owned by the user', function () {
    [$course] = makePricingFixture();
    $user = User::factory()->create(['status' => true]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
    ]);

    Cart_item::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'price' => 70,
        'discount_price' => 70,
        'final_price' => 70,
        'quantity' => 1,
    ]);

    expect(app(OrderService::class)->store($user))
        ->toMatchArray([
            'success' => false,
            'msg' => 'Your cart contains a course you already own.',
        ]);
});
