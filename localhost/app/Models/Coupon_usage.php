<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon_usage extends Model
{
    protected $fillable = [
        'user_id',
        'coupon_id',
        'payment_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
