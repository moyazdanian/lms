<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    /**
     * Pin the dashboard to the very top of the admin sidebar — Filament's
     * default Dashboard page is a clone and sorts late; this override sorts
     * it before every resource group.
     */
    public static function getNavigationSort(): ?int
    {
        return -100;
    }
}
