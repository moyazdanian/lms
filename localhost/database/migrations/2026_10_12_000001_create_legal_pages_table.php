<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single-row config table for the admin-written legal texts:
     * Terms of Service, Privacy Policy and the cookie-consent banner
     * copy (title + body shown above the Accept/Necessary buttons).
     */
    public function up(): void
    {
        Schema::create('legal_pages', function (Blueprint $table) {
            $table->id();
            $table->string('terms_title');
            $table->longText('terms')->nullable();        // RichEditor HTML
            $table->string('privacy_title');
            $table->longText('privacy')->nullable();      // RichEditor HTML
            $table->string('banner_title');
            $table->text('banner_body');
            $table->string('banner_accept_label')->nullable();
            $table->string('banner_necessary_label')->nullable();
            $table->string('banner_link_label')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_pages');
    }
};
