<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

/**
 * Covers the full "forgot password" flow: request link -> email with a
 * FRONTEND url -> POST /reset-password with the token.
 */
it('sends a password reset email linking to the frontend page', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->postJson('/forgot-password', ['email' => $user->email])
        ->assertOk()
        ->assertJsonPath('status', __('passwords.sent'));

    Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification, $channels) use ($user) {
        return str_contains($notification->toMail($user)->actionUrl, '/reset-password?token=')
            && str_contains($notification->toMail($user)->actionUrl, 'email=');
    });
});

it('resets the password with a valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->postJson('/forgot-password', ['email' => $user->email])->assertOk();

    $token = null;
    Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    $this->postJson('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])->assertOk()
        ->assertJsonPath('status', __('passwords.reset'));

    $user->refresh();

    expect(Hash::check('new-secure-password', $user->password))->toBeTrue();
});

it('rejects an invalid reset token', function () {
    $user = User::factory()->create();

    $this->postJson('/reset-password', [
        'token' => 'definitely-invalid',
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])->assertStatus(422);

    $user->refresh();

    expect(Hash::check('new-secure-password', $user->password))->toBeFalse();
});

it('requires the password fields on reset', function () {
    $user = User::factory()->create();

    $this->postJson('/reset-password', [
        'token' => 'anything',
        'email' => $user->email,
    ])->assertStatus(422);
});
