<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Filament\Models\Contracts\FilamentUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;


class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable , HasApiTokens, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that are NOT mass assignable.
     * Defense in depth - explicitly guard sensitive fields.
     *
     * @var list<string>
     */
    protected $guarded = [
        'role',
        'email_verified_at',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Only allow admin users to access Filament panel.
     */
    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    public function instructor()
    {
        return $this->hasOne(Instructors_profile::class, 'user_id');
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart_item::class);
    }
    

    public function lessonProgress()
    {
        return $this->hasMany(Lesson_progress::class);
    }

    public function instructor_profile()
    {
        return $this->hasOne(Instructors_profile::class, 'user_id');
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function wishlist()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * OAuth identities linked to this account (google, github, ...).
     */
    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function instructorEarnings()
    {
        return $this->hasMany(InstructorEarning::class, 'instructor_id');
    }

    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class, 'instructor_id');
    }

    public function students()
    {
        if ($this->role !== 'instructor') {
            return User::query()->whereKey(null);
        }

        return User::query()
            ->where('role', 'student')
            ->whereHas('enrollments', function ($query) {
                $query->whereIn(
                    'course_id',
                    $this->courses()->select('id')
                );
            });
    }
}
