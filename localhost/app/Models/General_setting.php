<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class General_setting extends Model
{
    protected $casts = [
        'instructor_commission_percent' => 'decimal:2',
        'minimum_payout_amount' => 'decimal:2',
        'quiz_default_pass_mark' => 'decimal:2',
        'certificates_enabled' => 'boolean',
        'stripe_enabled' => 'boolean',
        'paypal_enabled' => 'boolean',
        'mollie_enabled' => 'boolean',
        'razorpay_enabled' => 'boolean',
        'google_enabled' => 'boolean',
        's3_enabled' => 'boolean',
        's3_use_path_style_endpoint' => 'boolean',
        // Admin-configurable payout methods:
        // [{ value, label, account_label }, ...]
        'payout_methods' => 'array',
    ];
    protected $fillable = [
        'site_name',
        'logo',
        'faveicon',
        'language',
        'currency',
        'instructor_commission_percent',
        'minimum_payout_amount',
        'payout_methods',
        'quiz_default_pass_mark',
        'certificates_enabled',
        'contact_email',
        'show_latest',
        'show_popular',
        'show_featured',

        // Payment gateway credentials (configured in the admin panel).
        'stripe_enabled',
        'stripe_secret',
        'paypal_enabled',
        'paypal_mode',
        'paypal_client_id',
        'paypal_client_secret',
        'mollie_enabled',
        'mollie_api_key',
        'razorpay_enabled',
        'razorpay_key_id',
        'razorpay_key_secret',

        // Social login credentials (configured in the admin panel).
        'google_enabled',
        'google_client_id',
        'google_client_secret',

        // Cloud storage (S3 / R2 / Wasabi / MinIO) configured in the panel.
        's3_enabled',
        's3_access_key_id',
        's3_secret_access_key',
        's3_region',
        's3_bucket',
        's3_url',
        's3_endpoint',
        's3_use_path_style_endpoint',
        'lesson_video_disk',
        'video_serving_mode',
    ];

    protected $hidden = [
        // Secrets must never leak to any API response.
        'stripe_secret',
        'paypal_client_secret',
        'mollie_api_key',
        'razorpay_key_secret',
        'google_client_secret',
        's3_secret_access_key',
    ];

    /**
     * Payout methods instructors can choose when requesting a withdrawal.
     * Falls back to the previous hardcoded trio so the payouts page keeps
     * working on installs that have not saved the new setting yet.
     */
    public function payoutMethods(): array
    {
        $methods = array_values(array_filter(
            (array) $this->payout_methods,
            fn ($method) => filled($method['value'] ?? null) && filled($method['label'] ?? null),
        ));

        if ($methods !== []) {
            return $methods;
        }

        return [
            ['value' => 'bank_transfer', 'label' => 'Bank transfer', 'account_label' => 'Bank name, account holder and IBAN / account number'],
            ['value' => 'paypal', 'label' => 'PayPal', 'account_label' => 'Your PayPal email address'],
            ['value' => 'wise', 'label' => 'Wise', 'account_label' => 'Your Wise email or account number'],
        ];
    }

    public function getShowLatestCoursesAttribute()
    {
        return (bool) $this->show_latest;
    }

    public function getShowPopularCoursesAttribute()
    {
        return (bool) $this->show_popular;
    }

    public function getShowFeaturedCoursesAttribute()
    {
        return (bool) $this->show_featured;
    }
}
