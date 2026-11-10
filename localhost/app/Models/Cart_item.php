<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart_item extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'price',
        'discount_price',
        'final_price',
        'quantity',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
