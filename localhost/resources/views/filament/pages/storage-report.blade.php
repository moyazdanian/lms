<x-filament-panels::page>
    @php
        $report = $this->report();
        $totals = $report['totals'];

        $cards = [
            ['label' => 'Total files', 'value' => number_format($totals['files']), 'color' => 'text-gray-950 dark:text-white'],
            ['label' => 'Disk recorded', 'value' => number_format($totals['stamped']), 'color' => 'text-success-600 dark:text-success-400'],
            ['label' => 'Legacy (no disk)', 'value' => number_format($totals['legacy']), 'color' => 'text-warning-600 dark:text-warning-400'],
            ['label' => 'File not found', 'value' => number_format($totals['missing']), 'color' => 'text-danger-600 dark:text-danger-400'],
        ];

        $columns = [
            'lessons' => 'Lesson videos',
            'previews' => 'Preview videos',
            'attachments' => 'Attachments',
        ];
    @endphp

    <div class="space-y-4">
        {{-- Stat cards --}}
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            @foreach ($cards as $card)
                <div class="fi-ta-row rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {{ $card['label'] }}
                    </div>

                    <div class="mt-1 text-2xl font-bold {{ $card['color'] }}">
                        {{ $card['value'] }}
                    </div>
                </div>
            @endforeach
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $this->summary() }}
        </p>

        {{-- Per-disk distribution table --}}
        <div class="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <table class="w-full min-w-[36rem] text-sm">
                <thead>
                    <tr class="border-b border-gray-950/5 text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
                        <th class="px-4 py-3 text-start font-medium">Disk</th>

                        @foreach ($columns as $label)
                            <th class="px-4 py-3 text-center font-medium">{{ $label }}</th>
                        @endforeach

                        <th class="px-4 py-3 text-center font-medium">Total</th>
                    </tr>
                </thead>

                <tbody>
                    @forelse ($report['rows'] as $row)
                        <tr class="border-b border-gray-950/5 last:border-0 dark:border-white/10">
                            <td class="px-4 py-3">
                                <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset {{ $this->badgeFor($row['disk']) }}">
                                    {{ $row['disk'] }}
                                </span>
                            </td>

                            @foreach ($columns as $key => $label)
                                <td class="px-4 py-3 text-center tabular-nums">
                                    @if ($row[$key] > 0)
                                        <span class="font-semibold text-gray-950 dark:text-white">{{ number_format($row[$key]) }}</span>
                                        @if ($row[$key.'_legacy'] > 0)
                                            <span class="text-warning-600 dark:text-warning-400">({{ $row[$key.'_legacy'] }} legacy)</span>
                                        @endif
                                    @else
                                        <span class="text-gray-400 dark:text-gray-600">—</span>
                                    @endif
                                </td>
                            @endforeach

                            <td class="px-4 py-3 text-center font-bold tabular-nums text-gray-950 dark:text-white">
                                {{ number_format($row['total']) }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                No media files recorded yet.
                            </td>
                        </tr>
                    @endforelse
                </tbody>

                @if (count($report['rows']) > 1)
                    <tfoot>
                        <tr class="border-t border-gray-950/5 dark:border-white/10">
                            <td class="px-4 py-3 font-semibold text-gray-950 dark:text-white">All files</td>

                            @foreach ($columns as $key => $label)
                                <td class="px-4 py-3 text-center font-bold tabular-nums text-gray-950 dark:text-white">
                                    {{ number_format(array_sum(array_column($report['rows'], $key))) }}
                                    @if (($legacySum = array_sum(array_column($report['rows'], $key.'_legacy'))) > 0)
                                        <span class="font-medium text-warning-600 dark:text-warning-400">({{ number_format($legacySum) }} legacy)</span>
                                    @endif
                                </td>
                            @endforeach

                            <td class="px-4 py-3 text-center font-bold tabular-nums text-gray-950 dark:text-white">
                                {{ number_format(array_sum(array_column($report['rows'], 'total'))) }}
                            </td>
                        </tr>
                    </tfoot>
                @endif
            </table>
        </div>

        {{-- What to do next --}}
        @if ($totals['legacy'] > 0 || $totals['missing'] > 0)
            <div class="rounded-xl border border-warning-500/30 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-400/20 dark:bg-warning-400/10 dark:text-warning-300">
                <p class="font-medium">How legacy rows get resolved</p>

                <p class="mt-1">
                    Legacy rows keep playing: the app probes the disks in order until it finds the file,
                    then records the disk permanently on the row. Watching the lesson once (or re-saving
                    it) is enough. To move everything onto one disk, run
                    <code class="rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">php artisan media:migrate-to-cloud --target=s3</code>
                    and switch the disk under
                    <a href="{{ \App\Filament\Pages\Settings\StorageSettings::getUrl() }}" class="font-medium underline">Settings > Storage</a>.
                    Files counted as "File not found" exist on no disk — they show only in the cards above, usually because the file was deleted; re-upload or remove those rows.
                </p>
            </div>
        @endif
    </div>
</x-filament-panels::page>
