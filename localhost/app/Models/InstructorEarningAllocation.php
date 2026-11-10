<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstructorEarningAllocation extends Model
{
    protected $fillable = ['instructor_earning_id', 'payout_request_id', 'amount'];

    protected $casts = ['amount' => 'decimal:2'];

    public function earning()
    {
        return $this->belongsTo(InstructorEarning::class, 'instructor_earning_id');
    }

    public function payoutRequest()
    {
        return $this->belongsTo(PayoutRequest::class);
    }
}
