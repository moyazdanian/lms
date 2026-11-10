<?php

use App\Models\General_setting;
use App\Models\SocialAccount;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as OAuthUser;

function fakeGoogleUser(array $overrides = []): OAuthUser
{
    $user = new OAuthUser;

    $user->id = $overrides['id'] ?? 'google-sub-123';
    $user->name = $overrides['name'] ?? 'Google User';
    $user->email = $overrides['email'] ?? 'google.user@gmail.com';
    $user->avatar = $overrides['avatar'] ?? null;
    $user->token = $overrides['token'] ?? 'access-token';

    if (array_key_exists('email_verified', $overrides)) {
        // Mirror GoogleProvider::mapUserToObject: the raw payload keeps the
        // userinfo fields, and email_verified drives the auto-link decision.
        $user->setRaw([
            'email' => $user->email,
            'email_verified' => $overrides['email_verified'],
        ]);
    }

    return $user;
}

function mockGoogleUser(?OAuthUser $oauthUser = null): void
{
    $driver = Mockery::mock(GoogleProvider::class);
    $driver->shouldReceive('user')->once()->andReturn($oauthUser ?? fakeGoogleUser());

    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);
}

function enableGoogle(bool $enabled = true, array $overrides = []): void
{
    General_setting::query()->create(array_merge([
        'google_enabled' => $enabled,
        'google_client_id' => 'panel-client-id',
        'google_client_secret' => 'panel-client-secret',
    ], $overrides));
}

/**
 * Seed the flow meta exactly like redirect() does, so the test can call
 * callback() directly without an HTTP hop to Google.
 */
function withFlowMeta(): array
{
    return ['oauth.meta' => ['intent' => 'login', 'redirect' => null]];
}

it('creates a new student user from a fresh google identity', function () {
    enableGoogle();

    mockGoogleUser();

    $response = $this->withSession(withFlowMeta())
        ->get('/auth/google/callback');

    $response->assertRedirect();
    expect(str_contains((string) $response->getTargetUrl(), 'status=success'))->toBeTrue();

    $this->assertAuthenticated('web');

    $user = User::query()->where('email', 'google.user@gmail.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->role)->toBe('student')
        ->and((bool) $user->status)->toBeTrue()
        ->and($user->password)->toBeNull()
        ->and($user->email_verified_at)->not->toBeNull();

    expect($user->socialAccounts()->where('provider', 'google')->exists())->toBeTrue();
});

it('links google to an existing password account with the same email', function () {
    enableGoogle();

    $existing = User::factory()->create([
        'email' => 'google.user@gmail.com',
        'password' => 'secret-password',
    ]);

    mockGoogleUser();

    $response = $this->withSession(withFlowMeta())
        ->get('/auth/google/callback');

    $response->assertRedirect();
    expect(str_contains((string) $response->getTargetUrl(), 'status=success'))->toBeTrue();

    $this->assertAuthenticatedAs($existing, 'web');

    expect($existing->socialAccounts()->where('provider', 'google')->count())->toBe(1)
        ->and($existing->refresh()->password)->not->toBeNull();
});

it('links google to an existing passwordless account with the same email', function () {
    enableGoogle();

    $existing = User::factory()->create([
        'email' => 'google.user@gmail.com',
        'password' => null,
    ]);

    mockGoogleUser();

    $this->withSession(withFlowMeta())
        ->get('/auth/google/callback');

    expect($existing->socialAccounts()->where('provider', 'google')->count())->toBe(1);

    $this->assertAuthenticatedAs($existing, 'web');
});

it('refuses auto-linking when the provider email is not verified', function () {
    enableGoogle();

    User::factory()->create([
        'email' => 'google.user@gmail.com',
        'password' => 'secret-password',
    ]);

    mockGoogleUser(fakeGoogleUser(['email_verified' => false]));

    $response = $this->withSession(withFlowMeta())
        ->get('/auth/google/callback');

    $this->assertGuest('web');
    expect(str_contains((string) $response->getTargetUrl(), 'error=email_exists'))->toBeTrue();
});

it('refuses login when the email belongs to a soft-deleted account', function () {
    enableGoogle();

    $deleted = User::factory()->create([
        'email' => 'google.user@gmail.com',
        'password' => 'secret-password',
    ]);
    $deleted->delete();

    mockGoogleUser();

    $response = $this->withSession(withFlowMeta())
        ->get('/auth/google/callback');

    $this->assertGuest('web');
    expect(str_contains((string) $response->getTargetUrl(), 'error=email_exists'))->toBeTrue()
        ->and(User::withTrashed()->where('email', 'google.user@gmail.com')->count())->toBe(1);
});

it('signs in the owner when the google identity was linked before', function () {
    enableGoogle();

    $owner = User::factory()->create(['password' => null]);
    SocialAccount::create([
        'user_id' => $owner->id,
        'provider' => 'google',
        'provider_user_id' => 'google-sub-123',
    ]);

    mockGoogleUser();

    $this->withSession(withFlowMeta())
        ->get('/auth/google/callback');

    $this->assertAuthenticatedAs($owner, 'web');
});

it('rejects inactive users at oauth login', function () {
    enableGoogle();

    User::factory()->create([
        'email' => 'google.user@gmail.com',
        'password' => null,
        'status' => false,
    ]);

    mockGoogleUser();

    $response = $this->withSession(withFlowMeta())
        ->get('/auth/google/callback');

    $this->assertGuest('web');
    expect(str_contains((string) $response->getTargetUrl(), 'error=account_inactive'))->toBeTrue();
});

it('redirects with provider_disabled when the panel toggle is off', function () {
    enableGoogle(false, ['google_client_id' => null, 'google_client_secret' => null]);

    $response = $this->get('/auth/google/redirect');

    $response->assertRedirect();
    expect(str_contains((string) $response->getTargetUrl(), 'error=provider_disabled'))->toBeTrue();
});

it('404s unknown providers before touching socialite', function () {
    $this->get('/auth/facebook/redirect')->assertNotFound();
    $this->get('/auth/facebook/callback')->assertNotFound();
});

it('lists and disconnects linked accounts for the signed-in user', function () {
    $user = User::factory()->create(['password' => 'secret']);
    $account = SocialAccount::create([
        'user_id' => $user->id,
        'provider' => 'google',
        'provider_user_id' => 'google-sub-123',
    ]);

    $this->actingAs($user, 'web')
        ->getJson('/api/v1/auth/social-accounts')
        ->assertOk()
        ->assertJsonPath('social_accounts.0.provider', 'google')
        ->assertJsonPath('has_password', true);

    $this->actingAs($user, 'web')
        ->deleteJson("/api/v1/auth/social-accounts/{$account->id}")
        ->assertOk();

    expect(SocialAccount::find($account->id))->toBeNull();
});

it('refuses disconnecting the only sign-in method', function () {
    $user = User::factory()->create(['password' => null]);
    $account = SocialAccount::create([
        'user_id' => $user->id,
        'provider' => 'google',
        'provider_user_id' => 'google-sub-123',
    ]);

    $this->actingAs($user, 'web')
        ->deleteJson("/api/v1/auth/social-accounts/{$account->id}")
        ->assertStatus(422);

    expect(SocialAccount::find($account->id))->not->toBeNull();
});

it('cannot disconnect another users social account', function () {
    $attacker = User::factory()->create();
    $victim = User::factory()->create();
    $account = SocialAccount::create([
        'user_id' => $victim->id,
        'provider' => 'google',
        'provider_user_id' => 'google-sub-123',
    ]);

    $this->actingAs($attacker, 'web')
        ->deleteJson("/api/v1/auth/social-accounts/{$account->id}")
        ->assertForbidden();
});
