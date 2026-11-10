<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CookieAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::guard('web')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::guard('web')->user();

        if (!$user->status) {
            Auth::guard('web')->logout();

            return response()->json([
                'message' => 'Your account is inactive. Please contact support.',
            ], 403);
        }

        // Reject login for instructors whose profile has been rejected by admin.
        if ($user->role === 'instructor') {
            $profile = $user->instructor;
            if ($profile && $profile->status === 'rejected') {
                Auth::guard('web')->logout();

                return response()->json([
                    'message' => 'Your instructor account has been rejected. Please contact support.',
                ], 403);
            }
        }

        // Prevent session fixation after a successful authentication.
        $request->session()->regenerate();

        return response()->json(['user' => new UserResource($user)]);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user->status) {
            Auth::guard('web')->logout();

            return response()->json([
                'message' => 'Your account is inactive. Please contact support.',
            ], 403);
        }

        if (
            $user->role === 'instructor'
            && $user->instructor
            && $user->instructor->status === 'rejected'
        ) {
            Auth::guard('web')->logout();

            return response()->json([
                'message' => 'Your instructor account has been rejected. Please contact support.',
            ], 403);
        }

        return new UserResource($user);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}
