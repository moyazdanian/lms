<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\EmailClaimedException;
use App\Http\Controllers\Controller;
use App\Models\General_setting;
use App\Services\SocialAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;

class SocialAuthController extends Controller
{
    /**
     * Session key holding the flow metadata (intent + post-login redirect)
     * between redirect() and callback(). The backend session survives the
     * whole browser round-trip to Google because the flow happens entirely
     * on the backend domain — no CORS, no token handoff, no extra query
     * params (Google only echoes "code" and "state" back to the callback).
     */
    private const META_KEY = 'oauth.meta';

    public function __construct(private SocialAuthService $socialAuth)
    {
    }

    /**
     * Kick off the OAuth flow. The frontend links here with a plain
     * <a href> — browser navigation, same contract as any web login.
     *
     * Query params:
     *  - redirect: optional in-app path ("/dashboard") applied after login.
     *  - intent:   "login" (default) or "connect" (link to logged-in user).
     */
    public function redirect(Request $request, string $provider): RedirectResponse
    {
        if (! in_array($provider, SocialAuthService::PROVIDERS, true)) {
            abort(404);
        }

        if (! $this->providerConfigured($provider)) {
            return $this->toFrontend(['status' => 'error', 'error' => 'provider_disabled']);
        }

        $intent = $request->query('intent') === 'connect' ? 'connect' : 'login';
        $redirectTo = $request->query('redirect');

        // Only in-app paths are ever honoured — never an open redirect.
        if (! is_string($redirectTo) || ! str_starts_with($redirectTo, '/')) {
            $redirectTo = null;
        }

        if ($intent === 'connect' && ! Auth::guard('web')->check()) {
            return $this->toFrontend(['status' => 'error', 'error' => 'not_authenticated']);
        }

        $request->session()->put(self::META_KEY, [
            'intent' => $intent,
            'redirect' => $redirectTo,
        ]);

        $this->applyProviderConfig();

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Google calls back here. Socialite validates the anti-CSRF "state"
     * parameter against the session before we touch any account.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        if (! in_array($provider, SocialAuthService::PROVIDERS, true)) {
            abort(404);
        }

        if (! $this->providerConfigured($provider)) {
            return $this->toFrontend(['status' => 'error', 'error' => 'provider_disabled']);
        }

        $meta = $request->session()->pull(self::META_KEY, []);
        $intent = ($meta['intent'] ?? null) === 'connect' ? 'connect' : 'login';

        $this->applyProviderConfig();

        try {
            $oauthUser = Socialite::driver($provider)->user();
        } catch (InvalidStateException $e) {
            Log::warning('OAuth state validation failed', ['provider' => $provider]);

            return $this->toFrontend(['status' => 'error', 'error' => 'oauth_invalid_state']);
        } catch (\Throwable $e) {
            Log::error('OAuth callback failed', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return $this->toFrontend(['status' => 'error', 'error' => 'provider_error']);
        }

        try {
            return $intent === 'connect'
                ? $this->connect($request, $provider, $oauthUser)
                : $this->login($request, $provider, $oauthUser, $meta['redirect'] ?? null);
        } catch (EmailClaimedException $e) {
            return $this->toFrontend([
                'status' => 'error',
                'error' => 'email_exists',
                'email' => $e->email,
            ]);
        }
    }

    /**
     * intent=connect: link the Google identity to the signed-in user.
     */
    protected function connect(Request $request, string $provider, \Laravel\Socialite\Contracts\User $oauthUser): RedirectResponse
    {
        $user = Auth::guard('web')->user();

        if (! $user) {
            return $this->toFrontend(['status' => 'error', 'error' => 'not_authenticated']);
        }

        if ($this->socialAuth->providerBelongsToOtherUser($provider, (string) $oauthUser->getId(), $user)) {
            return $this->toFrontend(['status' => 'error', 'error' => 'provider_already_connected']);
        }

        $this->socialAuth->attachProvider($user, $provider, $oauthUser);

        return $this->toFrontend([
            'status' => 'success',
            'action' => 'connected',
            'provider' => $provider,
        ]);
    }

    /**
     * intent=login: authenticate the user behind the Google identity.
     */
    protected function login(
        Request $request,
        string $provider,
        \Laravel\Socialite\Contracts\User $oauthUser,
        ?string $redirectTo,
    ): RedirectResponse {
        $user = $this->socialAuth->findOrCreateUser($provider, $oauthUser);

        // Same gates as CookieAuthController::login.
        if (! $user->status) {
            return $this->toFrontend(['status' => 'error', 'error' => 'account_inactive']);
        }

        if ($user->role === 'instructor') {
            $profile = $user->instructor;

            if ($profile && $profile->status === 'rejected') {
                return $this->toFrontend(['status' => 'error', 'error' => 'instructor_rejected']);
            }
        }

        Auth::guard('web')->login($user, remember: true);

        // Prevent session fixation after successful authentication.
        $request->session()->regenerate();

        $payload = [
            'status' => 'success',
            'action' => 'login',
            'provider' => $provider,
        ];

        if ($redirectTo) {
            $payload['redirect'] = $redirectTo;
        }

        return $this->toFrontend($payload);
    }

    /**
     * Send the browser back to the SPA with a machine-readable result.
     */
    protected function toFrontend(array $params): RedirectResponse
    {
        $base = rtrim((string) config('services.frontend.url'), '/');

        return redirect()->away($base.'/auth/callback?'.http_build_query($params));
    }

    /**
     * Panel-first credentials: push the admin-panel values into the runtime
     * config so Socialite (which reads services.google.*) uses them. .env
     * values already in the config act as the fallback. Works even with a
     * cached config because this is a runtime override per request.
     */
    protected function applyProviderConfig(): void
    {
        $settings = General_setting::query()->first();

        if (filled($settings?->google_client_id)) {
            config(['services.google.client_id' => $settings->google_client_id]);
        }

        if (filled($settings?->google_client_secret)) {
            config(['services.google.client_secret' => $settings->google_client_secret]);
        }
    }

    /**
     * The provider must be enabled either in the admin panel or via .env
     * fallback, and credentials must be present.
     */
    protected function providerConfigured(string $provider): bool
    {
        if ($provider !== 'google') {
            return false;
        }

        $settings = General_setting::query()->first();

        $clientId = $settings?->google_client_id ?: config('services.google.client_id');
        $clientSecret = $settings?->google_client_secret ?: config('services.google.client_secret');

        if (! filled($clientId) || ! filled($clientSecret)) {
            return false;
        }

        return (bool) ($settings?->google_enabled ?? false)
            || filled(config('services.google.client_id'));
    }
}
