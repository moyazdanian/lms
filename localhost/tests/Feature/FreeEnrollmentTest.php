<?php

use App\Models\Cart_item;
use App\Models\Coupon;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\General_setting;
use App\Models\Payment;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Support\Facades\Notification;

function makeFreeCourse(User $instructor, array $overrides = []): Course
{
    return Course::create(array_merge([
        'instructor_id' => $instructor->id,
        'category_id' => null,
        'title' => 'Free Course '.uniqid(),
        'slug' => 'free-course-'.uniqid(),
        'description' => 'Description',
        'price' => 0,
        'level' => 'beginner',
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
        'status' => 'ongoing',
    ], $overrides));
}

function makeFreeCourseInstructor(): User
{
    return User::factory()->create(['role' => 'instructor', 'status' => true]);
}

it('enrolls a user in a free course with one click and no payment record', function () {
    Notification::fake();

    $instructor = makeFreeCourseInstructor();
    $course = makeFreeCourse($instructor);
    $student = User::factory()->create(['status' => true]);

    $response = $this->actingAs($student, 'web')
        ->postJson("/api/v1/courses/{$course->id}/enroll")
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('enrolled', true)
        ->assertJsonPath('already_enrolled', false);

    expect($course->enrollments()->where('user_id', $student->id)->exists())->toBeTrue();

    $enrollment = Enrollment::where('user_id', $student->id)->where('course_id', $course->id)->first();
    expect($enrollment->status)->toBe('active')
        ->and($enrollment->payment_id)->toBeNull();

    // No financial rows are created for a free enrollment.
    expect(Payment::where('user_id', $student->id)->exists())->toBeFalse();

    Notification::assertSentTo($student, \App\Notifications\EnrollmentConfirmationNotification::class);
});

it('is idempotent — enrolling twice creates one enrollment and one notification', function () {
    Notification::fake();

    $instructor = makeFreeCourseInstructor();
    $course = makeFreeCourse($instructor);
    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')->postJson("/api/v1/courses/{$course->id}/enroll")->assertOk();
    $this->actingAs($student, 'web')->postJson("/api/v1/courses/{$course->id}/enroll")
        ->assertOk()
        ->assertJsonPath('already_enrolled', true);

    expect(Enrollment::where('user_id', $student->id)->where('course_id', $course->id)->count())->toBe(1);

    Notification::assertSentTo(
        $student,
        \App\Notifications\EnrollmentConfirmationNotification::class,
        1
    );
});

it('refuses to enroll through the free endpoint when the course is not actually free', function () {
    $instructor = makeFreeCourseInstructor();
    $course = makeFreeCourse($instructor, ['price' => 49.99]);
    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')
        ->postJson("/api/v1/courses/{$course->id}/enroll")
        ->assertStatus(422);

    expect(Enrollment::where('user_id', $student->id)->where('course_id', $course->id)->exists())->toBeFalse();
});

it('treats a zero sale price as free even when the list price is positive', function () {
    $instructor = makeFreeCourseInstructor();
    // Sale price 0 < list price 100 → free.
    $course = makeFreeCourse($instructor, ['price' => 100, 'discount_price' => 0]);
    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')
        ->postJson("/api/v1/courses/{$course->id}/enroll")
        ->assertOk()
        ->assertJsonPath('enrolled', true);

    expect($course->enrollments()->where('user_id', $student->id)->exists())->toBeTrue();
});

it('refuses enrollment in a course that is not publicly visible', function () {
    $instructor = makeFreeCourseInstructor();
    // Unapproved (private draft) course must never be enrollable.
    $course = makeFreeCourse($instructor, [
        'approval_status' => Course::APPROVAL_PENDING,
        'approved_at' => null,
    ]);
    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')
        ->postJson("/api/v1/courses/{$course->id}/enroll")
        ->assertStatus(422);

    expect(Enrollment::where('user_id', $student->id)->where('course_id', $course->id)->exists())->toBeFalse();
});

it('requires authentication to enroll', function () {
    $instructor = makeFreeCourseInstructor();
    $course = makeFreeCourse($instructor);

    $this->postJson("/api/v1/courses/{$course->id}/enroll")->assertUnauthorized();
});

it('keeps free courses out of the cart', function () {
    $instructor = makeFreeCourseInstructor();
    $course = makeFreeCourse($instructor);
    $student = User::factory()->create(['status' => true]);

    $this->actingAs($student, 'web')
        ->postJson('/api/v1/cart', ['course_id' => $course->id])
        ->assertStatus(422);

    expect(Cart_item::where('user_id', $student->id)->count())->toBe(0);
});

it('completes a paid cart as a free checkout when a 100 percent coupon zeroes the total', function () {
    Notification::fake();

    $instructor = makeFreeCourseInstructor();
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Paid Course '.uniqid(),
        'slug' => 'paid-course-'.uniqid(),
        'description' => 'Description',
        'price' => 80,
        'level' => 'beginner',
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
        'status' => 'ongoing',
    ]);
    $buyer = User::factory()->create(['status' => true]);

    General_setting::create([
        'currency' => 'usd',
        'instructor_commission_percent' => 20,
        'minimum_payout_amount' => 50,
    ]);

    $coupon = Coupon::create([
        'code' => 'FREE100-'.uniqid(),
        'title' => '100 percent off',
        'type' => 'percent',
        'amount' => 100,
        'min_order_amount' => 0,
        'start_date' => now()->subDay(),
        'end_date' => now()->addDay(),
        'is_active' => true,
    ]);

    Cart_item::create([
        'user_id' => $buyer->id,
        'course_id' => $course->id,
        'price' => $course->price,
        'discount_price' => null,
        'final_price' => $course->price,
        'quantity' => 1,
    ]);

    session(['applied_coupon' => ['coupon_id' => $coupon->id]]);

    $this->actingAs($buyer, 'web')
        ->postJson('/api/v1/payment', ['method' => 'free'])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('free', true);

    // The order was completed without a gateway and the buyer is enrolled.
    $order = $buyer->orders()->latest('id')->first();
    expect($order->status)->toBe('paid')
        ->and($order->payment_method)->toBe('free');

    $payment = Payment::where('order_id', $order->id)->first();
    expect($payment->gateway)->toBe('free')
        ->and($payment->status)->toBe('paid')
        ->and((float) $payment->amount)->toBe(0.0);

    expect($course->enrollments()->where('user_id', $buyer->id)->exists())->toBeTrue();

    // Coupon usage is recorded exactly like a paid checkout.
    expect(\App\Models\Coupon_usage::where('user_id', $buyer->id)->where('coupon_id', $coupon->id)->exists())->toBeTrue();

    // The cart was cleared for the purchased course.
    expect(Cart_item::where('user_id', $buyer->id)->count())->toBe(0);

    Notification::assertSentTo($buyer, \App\Notifications\EnrollmentConfirmationNotification::class);
});

it('still refuses to charge below the gateway minimum for a nonzero total', function () {
    $instructor = makeFreeCourseInstructor();
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Tiny Course '.uniqid(),
        'slug' => 'tiny-course-'.uniqid(),
        'description' => 'Description',
        'price' => 0.3,
        'level' => 'beginner',
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
        'status' => 'ongoing',
    ]);
    $buyer = User::factory()->create(['status' => true]);

    General_setting::create([
        'currency' => 'usd',
        'instructor_commission_percent' => 20,
        'minimum_payout_amount' => 50,
    ]);

    Cart_item::create([
        'user_id' => $buyer->id,
        'course_id' => $course->id,
        'price' => $course->price,
        'discount_price' => null,
        'final_price' => $course->price,
        'quantity' => 1,
    ]);

    $this->actingAs($buyer, 'web')
        ->postJson('/api/v1/payment', ['method' => 'free'])
        ->assertStatus(422)
        ->assertJsonPath('message', 'Order total is below the minimum chargeable amount.');

    // The order was canceled, not silently completed.
    $order = $buyer->orders()->latest('id')->first();
    expect($order->status)->toBe('canceled');
});
