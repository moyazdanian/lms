<?php

namespace App\Filament\Widgets;

use App\Models\Payment;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class SalesTrendChart extends ChartWidget
{
    protected ?string $heading = 'Sales Revenue';
    protected ?string $pollingInterval = null;
    protected int|string|array $columnSpan = 2;

    protected function getFilters(): ?array
    {
        return [
            '7' => 'Last 7 days',
            '30' => 'Last 30 days',
            '90' => 'Last 90 days',
            '365' => 'Last 12 months',
        ];
    }

    protected function getData(): array
    {
        $days = (int) ($this->filter ?? 7);
        $start = now()->subDays($days - 1)->startOfDay();
        $groupByMonth = $days > 90;
        $format = $groupByMonth ? '%Y-%m' : '%Y-%m-%d';
        $labelFormat = $groupByMonth ? 'M Y' : 'M j';

        $rows = Payment::query()
            ->where('status', 'paid')
            ->whereBetween('created_at', [$start, now()])
            ->selectRaw("DATE_FORMAT(created_at, '{$format}') as period, SUM(amount) as total")
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('total', 'period');

        $labels = [];
        $values = [];
        $cursor = $start->copy();
        $end = now()->startOfDay();
        while ($cursor <= $end) {
            $key = $cursor->format($groupByMonth ? 'Y-m' : 'Y-m-d');
            $labels[] = $cursor->format($labelFormat);
            $values[] = (float) ($rows[$key] ?? 0);
             $cursor = $groupByMonth
                ? $cursor->addMonth()
                : $cursor->addDay();
        }

        return [
            'datasets' => [['label' => 'Revenue', 'data' => $values, 'borderColor' => '#f59e0b', 'backgroundColor' => 'rgba(245, 158, 11, .15)']],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
