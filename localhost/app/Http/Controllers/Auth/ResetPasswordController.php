<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\PasswordResetConfirmationNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

/**
 * Completes the "forgot password" flow: the user arrives here from the
 * frontend page linked in the reset email, carrying the reset token.
 *
 * Note: NewPasswordController (/api/v1/password-reset) is the SEPARATE
 * "change password while signed in" flow and requires current_password.
 */
class ResetPasswordController extends Controller
{
    /**
     * Handle an incoming new password request (token-based).
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Attempt to consume the reset token. On success the closure stores
        // the new password; on failure the broker returns a translatable
        // status which we surface as a 422 field error.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->string('password')),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));

                $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

                $user->notify(new PasswordResetConfirmationNotification(
                    $user->name,
                    $frontendUrl.'/login'
                ));
            }
        );

        if ($status != Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['status' => __($status)]);
    }
}
