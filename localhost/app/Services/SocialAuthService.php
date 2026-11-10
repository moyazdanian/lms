<?php

namespace App\Services;

use App\Exceptions\EmailClaimedException;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as OAuthUser;

class SocialAuthService
{
    /**
     * Providers the application accepts. Anything else 404s before Socialite
     * is ever called, so arbitrary provider names cannot reach the driver.
     */
    public const PROVIDERS = ['google'];

    /**
     * Find the local user for an OAuth identity, or create/link one.
     *
     * Resolution order:
     *  1. (provider, provider_user_id) — the same Google account again.
     *  2. Same email -> auto-link. The provider email is verified, so the
     *     Google-account owner and the e-mail owner are the same person.
     *     This covers passwordless AND regular password accounts —
     *     "sign in with Google" must just work for existing users.
     *  3. No match -> new student account, email trusted as verified.
     *
     * @throws \App\Exceptions\EmailClaimedException
     */
    public function findOrCreateUser(string $provider, OAuthUser $oauthUser): User
    {
        $providerUserId = (string) $oauthUser->getId();
        $email = strtolower((string) $oauthUser->getEmail());

        // 1. Returning social user.
        $socialAccount = SocialAccount::query()
            ->where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->first();

        if ($socialAccount) {
            $user = $socialAccount->user;

            // The linked account was deleted (soft delete) — never resurrect it.
            if (! $user) {
                throw new EmailClaimedException((string) $socialAccount->provider_email);
            }

            // Keep the stored avatar fresh; it is used by /profile.
            $this->syncAvatar($socialAccount, $oauthUser);

            return $user;
        }

        if ($email !== '') {
            // 2. Same email, different provider id. The provider email is
            //    verified, so linking is safe — for passwordless AND for
            //    regular password accounts alike.
            $existing = User::query()->where('email', $email)->first();

            if ($existing) {
                if (! $this->providerEmailVerified($oauthUser)) {
                    throw new EmailClaimedException($email);
                }

                $this->attachProvider($existing, $provider, $oauthUser);

                return $existing;
            }

            // A soft-deleted account still owns the email (the unique index
            // covers trashed rows) — refuse instead of crashing on insert.
            if (User::withTrashed()->where('email', $email)->exists()) {
                throw new EmailClaimedException($email);
            }
        }

        // 3. Brand new user. role/status/email_verified_at are guarded
        //    attributes, and database defaults are NOT hydrated onto the
        //    freshly created model — set them explicitly so the caller
        //    (which checks $user->status) sees the real values.
        $user = new User([
            'name' => $oauthUser->getName() ?: ($oauthUser->getNickname() ?: 'User'),
            'email' => $email !== '' ? $email : null,
            'password' => null,
        ]);

        $user->forceFill([
            'role' => 'student',
            'status' => true,
            'email_verified_at' => now(), // Google has already verified this email.
        ])->save();

        $this->attachProvider($user, $provider, $oauthUser);

        return $user;
    }

    /**
     * Link (or refresh) a provider identity on an existing user.
     */
    public function attachProvider(User $user, string $provider, OAuthUser $oauthUser): SocialAccount
    {
        $avatarPath = $this->storeAvatar($oauthUser);

        /** @var SocialAccount $socialAccount */
        $socialAccount = $user->socialAccounts()->firstOrNew([
            'provider' => $provider,
            'provider_user_id' => (string) $oauthUser->getId(),
        ]);

        $socialAccount->fill([
            'provider_email' => $oauthUser->getEmail(),
            'avatar' => $avatarPath ?? $socialAccount->avatar,
            'token' => $oauthUser->token,
            'refresh_token' => $oauthUser->refreshToken,
        ]);
        $socialAccount->save();

        return $socialAccount;
    }

    /**
     * Only a VERIFIED provider email may auto-link to an existing account.
     * Google always reports email_verified for the primary e-mail; the
     * default (true) covers providers that omit the claim entirely.
     */
    protected function providerEmailVerified(OAuthUser $oauthUser): bool
    {
        $raw = (array) $oauthUser->getRaw();

        return (bool) ($raw['email_verified'] ?? true);
    }

    /**
     * True when the provider identity is already linked to a DIFFERENT
     * local user — used by the connect flow to refuse a double link.
     */
    public function providerBelongsToOtherUser(string $provider, string $providerUserId, User $except): bool
    {
        return SocialAccount::query()
            ->where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->where('user_id', '!=', $except->id)
            ->exists();
    }

    /**
     * Disconnect a provider identity. The user must keep at least one other
     * way in: a password, or another linked provider.
     */
    public function canDisconnect(User $user, SocialAccount $socialAccount): bool
    {
        $otherProviders = $user->socialAccounts()
            ->where('id', '!=', $socialAccount->id)
            ->exists();

        return $user->password !== null || $otherProviders;
    }

    /**
     * Store the provider avatar on the public disk and return its path.
     * Returns null on any failure — a missing avatar is cosmetic.
     */
    protected function storeAvatar(OAuthUser $oauthUser): ?string
    {
        $avatarUrl = $oauthUser->getAvatar();

        if (! $avatarUrl) {
            return null;
        }

        try {
            $response = Http::timeout(10)->get($avatarUrl);

            if (! $response->successful()) {
                return null;
            }

            $filename = 'avatars/'.Str::uuid().'.jpg';
            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $response->body());

            return $filename;
        } catch (\Throwable $e) {
            Log::warning('Social avatar download failed', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Refresh the local avatar copy if the provider picture changed.
     */
    protected function syncAvatar(SocialAccount $socialAccount, OAuthUser $oauthUser): void
    {
        if ($oauthUser->getAvatar() && ! $socialAccount->avatar) {
            $path = $this->storeAvatar($oauthUser);

            if ($path) {
                $socialAccount->update(['avatar' => $path]);
            }
        }
    }
}
