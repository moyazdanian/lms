<?php

namespace App\Services\Marketplace;

use App\Models\InstructorEarning;
use App\Models\Payment;

class InstructorEarningService
{
    public function recordForPayment(Payment $payment): void
    {
        $payment->loadMissing('order.items');
        foreach ($payment->order->items as $item) {
            // Marketplace accounting uses immutable order-item snapshots.
            // Never recalculate from the current course, cart, or current settings.
            $instructorId = $item->instructor_id;
            $grossCents = (int) round(((float) $item->final_amount) * 100);
            $snapshotPercent = (float) $item->commission_percent;
            $commissionCents = (int) round($grossCents * $snapshotPercent / 100);
            $netCents = $grossCents - $commissionCents;

            if (!$instructorId || $grossCents < 0 || $snapshotPercent < 0 || $snapshotPercent > 100 || $commissionCents < 0 || $netCents < 0) {
                continue;
            }

            // Free checkouts create $0 order items — there is no earning to
            // record, and a row of zeros would only pollute payout reports.
            if ($grossCents === 0) {
                continue;
            }

            InstructorEarning::firstOrCreate(
                [
                    'payment_id' => $payment->id,
                    'order_item_id' => $item->id,
                ],
                [
                    'instructor_id' => $instructorId,
                    'order_id' => $payment->order_id,
                    'gross_amount' => number_format($grossCents / 100, 2, '.', ''),
                    'commission_percent' => number_format($snapshotPercent, 2, '.', ''),
                    'commission_amount' => number_format($commissionCents / 100, 2, '.', ''),
                    'net_amount' => number_format($netCents / 100, 2, '.', ''),
                    'status' => 'available',
                ]
            );
        }
    }
}
