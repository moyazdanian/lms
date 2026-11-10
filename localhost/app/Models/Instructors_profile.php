<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Instructors_profile extends Model
{
    protected $table = 'instructors_profiles';

    protected $fillable = [
        'user_id',
        'bio',
        'expertise',
        'social_links',
        'rating',
        'status',
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class);
    }
}
