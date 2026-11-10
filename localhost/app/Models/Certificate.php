<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Certificate extends Model
{
    protected $fillable = [
        'code',
        'serial',
        'user_id',
        'course_id',
        'snapshot',
        'issued_at',
        'revoked_at',
        'revoke_reason',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'issued_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function isValid(): bool
    {
        return $this->revoked_at === null;
    }

    protected static function booted(): void
    {
        static::creating(function (Certificate $certificate) {
            if (!$certificate->code) {
                $certificate->code = (string) Str::uuid();
            }
        });
    }
}
