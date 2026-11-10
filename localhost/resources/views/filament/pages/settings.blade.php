<x-filament-panels::page>
    {{ $this->form }}

    @if (property_exists($this, 's3TestResult') && $this->s3TestResult)
        @php
            $result = $this->s3TestResult;
        @endphp

        <div class="mt-4 rounded-xl p-4 text-sm ring-1 {{ $result['ok']
            ? 'bg-success-50 text-success-800 ring-success-600/20 dark:bg-success-400/10 dark:text-success-300 dark:ring-success-400/20'
            : 'bg-danger-50 text-danger-800 ring-danger-600/20 dark:bg-danger-400/10 dark:text-danger-300 dark:ring-danger-400/20' }}">
            <p class="font-semibold">
                {{ $result['ok'] ? 'S3 connection test passed' : 'S3 connection test failed' }}
                <span class="font-normal opacity-75">· {{ number_format($result['duration_ms']) }} ms</span>
            </p>

            <p class="mt-1">{{ $result['message'] }}</p>

            <ul class="mt-3 space-y-1">
                @foreach ($result['steps'] as $step)
                    <li class="flex items-start gap-2">
                        <span class="mt-0.5">{{ $step['ok'] ? '✓' : '✗' }}</span>
                        <span>
                            {{ $step['label'] }}
                            @if ($step['detail'])
                                <span class="block text-xs opacity-80">{{ $step['detail'] }}</span>
                            @endif
                        </span>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="mt-4 flex flex-wrap items-center gap-3">
        <x-filament::button wire:click="save">
            Save Settings
        </x-filament::button>

        @if (method_exists($this, 'testConnection'))
            <x-filament::button color="gray" wire:click="testConnection">
                Test Connection
            </x-filament::button>
        @endif
    </div>
</x-filament-panels::page>
