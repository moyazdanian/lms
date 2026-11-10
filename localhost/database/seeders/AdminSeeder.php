<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    /**
     * Create the first administrator from the credentials in .env.
     *
     * There is no shipped account and no generated password: ADMIN_EMAIL and
     * ADMIN_PASSWORD are required, and the seeder fails instead of inventing
     * one, so the owner always knows how to sign in to /admin. getenv() keeps
     * this working when the config is cached, which it is in production.
     *
     * Running it again is safe and is the recovery path for a forgotten
     * password: it restores a deleted account, promotes it to admin and sets
     * the password to the value currently in ADMIN_PASSWORD.
     */
    public function run(): void
    {
        $email = trim((string) getenv('ADMIN_EMAIL'));
        $password = (string) getenv('ADMIN_PASSWORD');

        if ($email === '' || trim($password) === '') {
            throw new RuntimeException(
                'ADMIN_EMAIL and ADMIN_PASSWORD are required. Copy .env.docker.example '
                .'to .env, set both values and run the stack again.'
            );
        }

        // A soft-deleted account still owns its email address and the unique
        // index would reject a second row, so look through the trash too.
        $admin = User::withTrashed()->firstOrNew(['email' => $email]);
        $isNew = ! $admin->exists;

        if (! $isNew && $admin->trashed()) {
            $admin->restore();
        }

        // Hashed by the model cast, never stored in plain text.
        $admin->forceFill([
            'name' => $admin->name ?: 'Administrator',
            'password' => $password,
            'role' => 'admin',
            'email_verified_at' => $admin->email_verified_at ?? now(),
        ])->save();

        $this->command?->info(
            ($isNew ? 'Administrator created: ' : 'Administrator updated: ').$email
        );
    }
}
