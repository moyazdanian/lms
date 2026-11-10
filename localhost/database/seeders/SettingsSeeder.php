<?php

namespace Database\Seeders;

use App\Models\General_setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * A fresh install has no general_settings row, but /api/v1/settings (and
     * therefore every storefront page: title, logo, currency) reads one.
     * Without it the API answers 500 until an admin saves the settings page,
     * so the defaults are created here and then edited in the panel.
     */
    public function run(): void
    {
        General_setting::firstOrCreate([], [
            'site_name' => config('app.name') ?: 'LMS',
            'language' => 'en',
            'currency' => 'USD',
            'instructor_commission_percent' => 20,
            'minimum_payout_amount' => 50,
            'quiz_default_pass_mark' => 70,
            'certificates_enabled' => true,
        ]);
    }
}
