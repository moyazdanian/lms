<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function defaultMethods(): array
    {
        return [
            [
                'value' => 'bank_transfer',
                'label' => 'Bank transfer',
                'account_label' => 'Bank name, account holder and IBAN / account number',
            ],
            [
                'value' => 'paypal',
                'label' => 'PayPal',
                'account_label' => 'Your PayPal email address',
            ],
            [
                'value' => 'wise',
                'label' => 'Wise',
                'account_label' => 'Your Wise email or account number',
            ],
        ];
    }
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('general_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->nullable();
            $table->string('logo')->nullable();
            $table->string('faveicon')->nullable();
            $table->string('language')->nullable();
            $table->string('currency')->nullable();
            $table->decimal('instructor_commission_percent', 5, 2)->default(20);
            $table->decimal('minimum_payout_amount', 10, 2)->default(50);
            $table->json('payout_methods')->nullable();
            $table->decimal('quiz_default_pass_mark', 5, 2)->default(70);
            $table->boolean('certificates_enabled')->default(true);
            $table->string('contact_email')->nullable();
            $table->boolean('stripe_enabled')->default(false);
            $table->string('stripe_secret')->nullable();
            $table->boolean('paypal_enabled')->default(false);
            $table->string('paypal_mode', 10)->default('sandbox');
            $table->string('paypal_client_id')->nullable();
            $table->string('paypal_client_secret')->nullable();
            $table->boolean('mollie_enabled')->default(false);
            $table->string('mollie_api_key')->nullable();
            $table->boolean('razorpay_enabled')->default(false);
            $table->string('razorpay_key_id')->nullable();
            $table->string('razorpay_key_secret')->nullable();
            $table->boolean('s3_enabled')->default(false);
            $table->string('s3_access_key_id')->nullable();
            $table->string('s3_secret_access_key')->nullable();
            $table->string('s3_region')->nullable();
            $table->string('s3_bucket')->nullable();
            $table->string('s3_url')->nullable();
            $table->string('s3_endpoint')->nullable();
            $table->boolean('s3_use_path_style_endpoint')->default(false);

            // null = fall back to the .env defaults
            // (LESSON_VIDEO_DISK / VIDEO_SERVING_MODE).
            $table->string('lesson_video_disk')->nullable();
            $table->string('video_serving_mode')->nullable();
            $table->boolean('google_enabled')->default(false);
            $table->string('google_client_id')->nullable();
            $table->string('google_client_secret')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_settings');
    }
};
