<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

it('logs in an active user with a web session', function () {
    $user = User::factory()->create([
        'email' => 'student@example.com',
        'password' => Hash::make('password'),
        'status' => true,
    ]);

    $response = $this->postJson('/login', [
        'email' => 'student@example.com',
        'password' => 'password',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.email', $user->email);

    $this->assertAuthenticatedAs($user, 'web');
});

it('registers and authenticates a user with the same session contract', function () {
    Notification::fake();

    $response = $this->postJson('/register', [
        'name' => 'New Student',
        'email' => 'new.student@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('user.name', 'New Student')
        ->assertJsonPath('user.email', 'new.student@example.com');

    $this->assertAuthenticated('web');
    Notification::assertSentTo(User::where('email', 'new.student@example.com')->first(), \App\Notifications\WelcomeNotification::class);
});

it('returns the current session user from the sanctum api', function () {
    $user = User::factory()->create(['status' => true]);

    $this->actingAs($user, 'web')
        ->getJson('/api/v1/user')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);
});

it('logs out the web session', function () {
    $user = User::factory()->create(['status' => true]);

    $this->actingAs($user, 'web')
        ->postJson('/logout')
        ->assertOk();

    $this->assertGuest('web');
});
