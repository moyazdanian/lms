<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeatureSeeder extends Seeder
{
    /**
     * The features strip lives on the features_strip row of site_contents
     * (merged from the old standalone `features` table).
     */
    public function run(): void
    {
        $features = [
            'first_title' => 'professional instructors',
            'first_subtitle' => 'learn from industry experts',
            'first_icon' => 'heroicon-c-user-group',
            'second_title' => 'flexible learning',
            'second_subtitle' => 'learn at your own pace, anytime, anywhere',
            'second_icon' => 'heroicon-c-book-open',
            'third_title' => 'certified courses',
            'third_subtitle' => 'earn skills that are recognized',
            'third_icon' => 'heroicon-c-academic-cap',
        ];

        DB::table('site_contents')
            ->where('section', 'features_strip')
            ->update($features + ['updated_at' => now()]);
    }
}
