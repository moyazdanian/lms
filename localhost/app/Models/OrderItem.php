<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $casts = [
        'price' => 'decimal:2',
        'catalog_price' => 'decimal:2',
        'course_discount_amount' => 'decimal:2',
        'subtotal_before_coupon' => 'decimal:2',
        'allocated_coupon_discount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'commission_percent' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'instructor_net_amount' => 'decimal:2',
    ];

    protected $fillable = [
        'order_id',
        'course_id',
        'instructor_id',
        'title',
        'price',
        'catalog_price',
        'course_discount_amount',
        'subtotal_before_coupon',
        'allocated_coupon_discount',
        'final_amount',
        'commission_percent',
        'commission_amount',
        'instructor_net_amount',
        'quantity',
        'total',
    ];

    public function course(){
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function order(){
        return $this->belongsTo(Order::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function getAccountingAmountAttribute(): string
    {
        return (string) ($this->final_amount ?? $this->total ?? $this->price ?? '0.00');
    }
}
