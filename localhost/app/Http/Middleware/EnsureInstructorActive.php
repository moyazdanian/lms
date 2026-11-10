<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks banned instructors from creating/modifying courses and lessons.
 * Blocks rejected instructors entirely (they should not reach here because
 * EnsureUserRole already gates on role=instructor|admin, but this provides
 * an extra layer keyed on the instructor profile status).
 *
 * Status meanings:
 *   active   → normal access
 *   banned   → can read own courses but cannot create/update anything new
 *   rejected → no access at all (403); their public courses are also hidden
 */
class EnsureInstructorActive
{
    // Mutating HTTP methods that a banned instructor may not use.
    private const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Admins are never blocked by this middleware.
        if ($user->role === 'admin') {
            return $next($request);
        }

        $profile = $user->instructor; // hasOne Instructors_profile

        if (! $profile) {
            return $next($request);
        }

        if ($profile->status === 'rejected') {
            return response()->json([
                'message' => 'Your instructor account has been rejected. Please contact support.',
            ], 403);
        }

        if ($profile->status === 'banned' && in_array($request->method(), self::WRITE_METHODS, true)) {
            return response()->json([
                'message' => 'Your account is currently banned. You cannot create or modify courses.',
            ], 403);
        }

        return $next($request);
    }
}
