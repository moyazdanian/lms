<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EnrollmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Users can view their own enrollments
    }

    public function view(User $user, Enrollment $enrollment): bool
    {
        return $user->id === $enrollment->user_id
            || $user->role === 'admin'
            || $user->id === $enrollment->course->instructor_id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'student' || $user->role === 'instructor';
    }

    public function update(User $user, Enrollment $enrollment): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Enrollment $enrollment): bool
    {
        return $user->role === 'admin';
    }

    public function markComplete(User $user, Enrollment $enrollment): bool
    {
        return $user->id === $enrollment->user_id;
    }
}