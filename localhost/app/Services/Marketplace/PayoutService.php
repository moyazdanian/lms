<?php

namespace App\Services\Marketplace;

use App\Models\PayoutRequest;
use App\Notifications\PayoutStatusNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayoutService
{
    public function approve(PayoutRequest $payout, int $adminId): PayoutRequest
    {
        $updated = DB::transaction(function () use ($payout, $adminId) {
            $record = PayoutRequest::query()->lockForUpdate()->findOrFail($payout->id);
            if ($record->status !== 'pending') throw ValidationException::withMessages(['status' => 'Only pending payouts can be approved.']);
            $record->update(['status' => 'approved', 'reviewed_by' => $adminId, 'reviewed_at' => now()]);
            return $record->fresh('instructor');
        });
        $updated->instructor->notify(new PayoutStatusNotification($updated->id, (string) $updated->amount, $updated->currency, 'approved'));
        return $updated;
    }

    public function reject(PayoutRequest $payout, int $adminId, string $reason): PayoutRequest
    {
        $updated = DB::transaction(function () use ($payout, $adminId, $reason) {
            $record = PayoutRequest::query()->lockForUpdate()->findOrFail($payout->id);
            if ($record->status !== 'pending') throw ValidationException::withMessages(['status' => 'Only pending payouts can be rejected.']);
            $record->update(['status' => 'rejected', 'rejection_reason' => $reason, 'reviewed_by' => $adminId, 'reviewed_at' => now()]);
            return $record->fresh('instructor');
        });
        $updated->instructor->notify(new PayoutStatusNotification($updated->id, (string) $updated->amount, $updated->currency, 'rejected', $updated->rejection_reason));
        return $updated;
    }

    public function markPaid(PayoutRequest $payout, int $adminId): PayoutRequest
    {
        $updated = DB::transaction(function () use ($payout, $adminId) {
            $record = PayoutRequest::query()->lockForUpdate()->findOrFail($payout->id);
            if ($record->status !== 'approved') throw ValidationException::withMessages(['status' => 'Only approved payouts can be marked as paid.']);
            $record->update(['status' => 'paid', 'paid_at' => now()]);
            return $record->fresh('instructor');
        });
        $updated->instructor->notify(new PayoutStatusNotification($updated->id, (string) $updated->amount, $updated->currency, 'paid'));
        return $updated;
    }
}
