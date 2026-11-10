<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayoutRequest extends Model
{
    protected $fillable = [
        'instructor_id', 'amount', 'currency', 'status', 'payment_details',
        'rejection_reason', 'reviewed_by', 'reviewed_at', 'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'reviewed_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function instructor() { return $this->belongsTo(User::class, 'instructor_id'); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }

    public function allocations()
    {
        return $this->hasMany(InstructorEarningAllocation::class);
    }

    public function availableEarnings(): float
    {
        if (! $this->instructor) {
            return 0.0;
        }

        return (float) $this->instructor->instructorEarnings()
            ->where('status', 'available')
            ->withSum(['allocations as active_allocated_amount' => function ($query) {
                $query->whereHas('payoutRequest', fn ($payout) => $payout->whereIn('status', ['pending', 'approved']));
            }], 'amount')
            ->get()
            ->sum(fn ($earning) => max(0, (float) $earning->net_amount - (float) ($earning->active_allocated_amount ?? 0)));
    }
}
