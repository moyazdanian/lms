<?php

use App\Models\General_setting;
use App\Models\InstructorEarning;
use App\Models\InstructorEarningAllocation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use App\Models\PayoutRequest;

it('keeps the unrequested balance available through allocations', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    General_setting::create(['currency' => 'usd', 'instructor_commission_percent' => 20, 'minimum_payout_amount' => 50]);
    $earning = InstructorEarning::create([
        'instructor_id' => $instructor->id, 'payment_id' => Payment::factory()->create()->id,
        'order_id' => Order::factory()->create()->id, 'order_item_id' => OrderItem::factory()->create()->id,
        'gross_amount' => 250, 'commission_percent' => 20, 'commission_amount' => 50,
        'net_amount' => 200, 'status' => 'available',
    ]);

    $this->actingAs($instructor, 'web')->postJson('/api/v1/instructor/payout-requests', [
        'amount' => 180, 'payment_details' => 'Bank account',
    ])->assertCreated();

    $payout = PayoutRequest::where('instructor_id', $instructor->id)->first();
    expect(InstructorEarning::find($earning->id)->net_amount)->toBe('200.00')
        ->and(InstructorEarningAllocation::where('payout_request_id', $payout->id)->sum('amount'))->toBe('180.00')
        ->and($this->getJson('/api/v1/instructor/earnings')->json('summary.available'))->toBe('20.00');
});
