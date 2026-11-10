<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The whole footer in ONE standalone table: identity copy, the quick
     * links and the social media links all live on a single `footers` row.
     * Nothing is tied to site_contents anymore.
     */
    public function up(): void
    {
        Schema::create('footers', function (Blueprint $table) {
            $table->id();
            $table->string('about')->nullable();
            $table->string('copyright')->nullable();
            $table->json('links')->nullable();
            $table->json('social_links')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed the one and only footer row with the storefront defaults.
        // DB::table('footers')->insert([
        //     'about' => 'is your gateway to explore knowledge, learn from experts, and build your future.',
        //     'copyright' => 'All rights reserved.',
        //     'links' => json_encode([
        //         ['label' => 'Courses', 'url' => '/courses'],
        //         ['label' => 'Instructors', 'url' => '/instructors'],
        //         ['label' => 'Privacy Policy', 'url' => '/privacy'],
        //         ['label' => 'Terms of Service', 'url' => '/terms'],
        //     ]),
        //     'social_links' => json_encode([
        //         ['platform' => 'twitter', 'label' => 'Follow us on X (Twitter)', 'url' => 'https://x.com/'],
        //         ['platform' => 'instagram', 'label' => 'Follow us on Instagram', 'url' => 'https://instagram.com/'],
        //     ]),
        //     'is_active' => true,
        //     'created_at' => now(),
        //     'updated_at' => now(),
        // ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('footers');
    }
};
