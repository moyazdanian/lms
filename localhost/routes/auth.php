<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\CookieAuthController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware(['guest' , 'throttle:auth'])
    ->name('register');

Route::post('/login', [CookieAuthController::class, 'login'])
    ->middleware(['guest' , 'throttle:auth'])
    ->name('login');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware(['guest' , 'throttle:auth'])
    ->name('password.email');

Route::post('/reset-password', [ResetPasswordController::class, 'store'])
    ->middleware(['guest' , 'throttle:auth'])
    ->name('password.store');

Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

Route::post('/logout', [CookieAuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| Social login (Google OAuth)
|--------------------------------------------------------------------------
| These are full-page browser navigations (not XHR), so they intentionally
| live on the backend domain: the OAuth session and anti-CSRF state are
| kept in the backend session and CORS never comes into play. After the
| flow, the browser is redirected back to the Next.js frontend at
| {FRONTEND_URL}/auth/callback with a machine-readable query string.
*/
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])
    ->middleware('throttle:auth')
    ->name('social.redirect');

Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])
    ->middleware('throttle:auth')
    ->name('social.callback');
