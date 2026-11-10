<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The Stripe webhook signing secret belongs with the rest of the gateway
     * credentials: the admin panel writes it, and the webhook controller reads
     * it from there (with the .env value kept as a fallback for installs that
     * configured it before this column existed).
     */
    public function up(): void
    {
        Schema::table('general_settings', function (Blueprint $table) {
            $table->string('stripe_webhook_secret')->nullable()->after('stripe_secret');
        });
    }

    public function down(): void
    {
        Schema::table('general_settings', function (Blueprint $table) {
            $table->dropColumn('stripe_webhook_secret');
        });
    }
};
