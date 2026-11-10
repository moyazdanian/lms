<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        

        $this->call(SettingsSeeder::class);
        $this->call(Site_contentSeeder::class);
        $this->call(FeatureSeeder::class);
        $this->call(AdminSeeder::class);

    }
}
