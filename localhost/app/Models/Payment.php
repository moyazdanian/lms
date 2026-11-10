<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'amount',
        'status',
        'user_id',
        'order_id',
        'gateway',
        'transaction_id',
        'coupon_id',
        'coupon_amount',
        'meta',
        'idempotency_key',
    ];

    protected $casts = [
        'meta' => 'array',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * The gateway-side identifier this payment was created with, regardless
     * of which gateway it used (sessions carry the same value under the
     * legacy stripe_session_id key for backwards compatibility).
     */
    public function getGatewayReferenceAttribute(): ?string
    {
        return $this->meta['stripe_session_id']
            ?? $this->meta['mollie_payment_id']
            ?? $this->meta['razorpay_order_id']
            ?? null;
    }
}
