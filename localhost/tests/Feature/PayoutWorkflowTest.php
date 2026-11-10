<?php

use App\Models\General_setting;
use App\Models\InstructorEarning;
use App\Models\PayoutRequest;
use App\Models\User;
use App\Notifications\PayoutStatusNotification;
use App\Services\Marketplace\PayoutService;
use Illuminate\Support\Facades\Notification;

it('rejects payout requests below the admin configured minimum', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    General_setting::create([
        'currency' => 'usd',
        'instructor_commission_percent' => 20,
        'minimum_payout_amount' => 100,
    ]);
    InstructorEarning::create([
        'instructor_id' => $instructor->id,
        'payment_id' => 1,
        'order_id' => 1,
        'order_item_id' => 1,
        'gross_amount' => 100,
        'commission_percent' => 20,
        'commission_amount' => 20,
        'net_amount' => 80,
        'status' => 'available',
    ]);

    $this->actingAs($instructor, 'web')
        ->postJson('/api/v1/instructor/payout-requests', [
            'amount' => 80,
            'payment_details' => 'Bank account',
        ])
        ->assertUnprocessable();
});

it('rejects a payout and releases only its reserved earnings', function () {
    Notification::fake();
    $admin = User::factory()->create(['role' => 'admin', 'status' => true]);
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $payout = PayoutRequest::create([
        'instructor_id' => $instructor->id,
        'amount' => 50,
        'currency' => 'usd',
        'status' => 'pending',
    ]);
    $earning = InstructorEarning::create([
        'instructor_id' => $instructor->id,
        'payment_id' => 1,
        'order_id' => 1,
        'order_item_id' => 1,
        'payout_request_id' => $payout->id,
        'gross_amount' => 62.50,
        'commission_percent' => 20,
        'commission_amount' => 12.50,
        'net_amount' => 50,
        'status' => 'requested',
    ]);

    app(PayoutService::class)->reject($payout, $admin->id, 'Invalid bank details');

    expect($payout->fresh()->status)->toBe('rejected')
        ->and($payout->fresh()->rejection_reason)->toBe('Invalid bank details')
        ->and($earning->fresh()->status)->toBe('available')
        ->and($earning->fresh()->payout_request_id)->toBeNull();

    Notification::assertSentTo($instructor, PayoutStatusNotification::class);
});
