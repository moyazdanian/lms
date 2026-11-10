<?php

namespace App\Filament\Widgets;

use App\Models\InstructorEarning;
use Filament\Widgets\ChartWidget;

class TopInstructorsChart extends ChartWidget
{
    protected ?string $heading = 'Top Instructors by Sales';
    protected int|string|array $columnSpan = 1;

    protected function getData(): array
    {
        $rows = InstructorEarning::query()
            ->whereHas('payment', fn ($query) => $query->where('status', 'paid'))
            ->with('instructor:id,name')
            ->selectRaw('instructor_id, SUM(gross_amount) as total')
            ->groupBy('instructor_id')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        return [
            'datasets' => [['label' => 'Sales', 'data' => $rows->pluck('total')->map(fn ($value) => (float) $value)->values()->all(), 'backgroundColor' => '#f59e0b']],
            'labels' => $rows->map(fn ($row) => $row->instructor?->name ?? 'Unknown')->values()->all(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
