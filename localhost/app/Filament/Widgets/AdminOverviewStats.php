<?php

namespace App\Filament\Widgets;

use App\Models\InstructorEarning;
use App\Models\InstructorApplication;
use App\Models\PayoutRequest;
use App\Models\Order;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AdminOverviewStats extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Paid Revenue', number_format((float) InstructorEarning::whereHas('payment', fn ($query) => $query->where('status', 'paid'))->sum('gross_amount'), 2)),
            Stat::make('Paid Orders', Order::where('status', 'paid')->count()),
            Stat::make('Active Instructors', User::where('role', 'instructor')->where('status', true)->count()),
            Stat::make('Pending Payout Requests', PayoutRequest::where('status', 'pending')->count())
                ->url('/admin/payout-requests')
                ->color('warning'),
            Stat::make('Instructor Applications', InstructorApplication::where('status', 'pending')->count())
                ->url('/admin/instructor-applications')
                ->color('warning'),
        ];
    }
}
