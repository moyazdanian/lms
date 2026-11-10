<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'description',
        'type',
        'title',
        'amount',
        'usage_limit',
        'used_count',
        'min_order_amount',
        'start_date',
        'end_date',
        'expires_at',
        'is_active',
        'is_first_order',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'coupon_usages', 'coupon_id', 'user_id')
                    ->withTimestamps();
    }
}
