<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'secret' => env('STRIPE_SECRET_KEY'),
        'public' => env('STRIPE_PUBLIC_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'frontend' => [
        'url' => env('FRONTEND_URL', 'http://app.lms.test:3000'),
    ],

    /*
    |----------------------------------------------------------------------
    | Social Login (Google OAuth)
    |----------------------------------------------------------------------
    | Credentials are configured in the admin panel (general_settings).
    | These env keys are only a fallback for installs that prefer .env
    | or have not opened the panel yet. The panel values always win.
    */
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        // Google requires an absolute redirect URI and it must match the
        // Authorized redirect URI registered in the Google Cloud Console.
        'redirect' => rtrim((string) env('APP_URL', 'http://localhost'), '/').'/auth/google/callback',
    ],

];
