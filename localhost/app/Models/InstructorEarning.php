<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstructorEarning extends Model
{
    protected $fillable = [
        'instructor_id', 'payment_id', 'order_id', 'order_item_id',
        'gross_amount', 'commission_percent', 'commission_amount', 'net_amount', 'available_amount', 'status', 'payout_request_id',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'commission_percent' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'available_amount' => 'decimal:2',
    ];

    public function instructor() { return $this->belongsTo(User::class, 'instructor_id'); }
    public function payment() { return $this->belongsTo(Payment::class); }
    public function order() { return $this->belongsTo(Order::class); }
    public function orderItem() { return $this->belongsTo(OrderItem::class); }
    public function payoutRequest() { return $this->belongsTo(PayoutRequest::class); }

    public function allocations()
    {
        return $this->hasMany(InstructorEarningAllocation::class);
    }
}
