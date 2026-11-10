<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CoursePolicy
{
    /**
     * Determine whether the user can view any courses.
     */
    public function viewAny(User $user): bool
    {
        return true; // Public courses list
    }

    /**
     * Determine whether the user can view the course.
     */
    public function view(User $user, Course $course): bool
    {
        // Published courses are public
        if ($course->is_active && $course->status === 'published') {
            return true;
        }

        // Instructor can view their own courses
        if ($user->id === $course->instructor_id) {
            return true;
        }

        // Admin can view all
        if ($user->role === 'admin') {
            return true;
        }

        // Enrolled students can view
        return $course->enrollments()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create courses.
     */
    public function create(User $user): bool
    {
        return ($user->role === 'instructor' || $user->role === 'admin') && $user->instructor?->status === 'approved';
    }

    /**
     * Determine whether the user can update the course.
     */
    public function update(User $user, Course $course): bool
    {
        // Owner or admin
        return $user->id === $course->instructor_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the course.
     */
    public function delete(User $user, Course $course): bool
    {
        // Owner or admin - but only if no enrollments
        if ($user->id === $course->instructor_id || $user->role === 'admin') {
            return !$course->enrollments()->exists();
        }
        return false;
    }

    /**
     * Determine whether the user can manage sections/lessons.
     */
    public function manageContent(User $user, Course $course): bool
    {
        return $user->id === $course->instructor_id || $user->role === 'admin';
    }
}