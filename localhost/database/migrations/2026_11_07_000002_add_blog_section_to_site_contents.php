<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The homepage "blog" section, managed from the panel like every other
     * section (Content > Homepage Content). Runs as a migration so existing
     * installations get the row too — the seeder only runs on first boot.
     */
    public function up(): void
    {
        $exists = DB::table('site_contents')->where('section', 'blog')->exists();

        if ($exists) {
            return;
        }

        DB::table('site_contents')->insert([
            'section' => 'blog',
            'title' => 'From the blog',
            'content' => 'Guides, deep dives and notes from the people teaching here — written to be useful after you close the tab.',
            'badge' => 'Read all posts',
            'visible' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('site_contents')->where('section', 'blog')->delete();
    }
};
