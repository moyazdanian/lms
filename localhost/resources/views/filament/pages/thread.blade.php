<div class="space-y-4">
    @foreach ($messages as $message)
        @php
            $isAdmin = $message->sender?->role === 'admin';
        @endphp

        <div
            @class([
                'rounded-lg p-4',
                'bg-blue-50 dark:bg-blue-950' => $isAdmin,
                'bg-gray-50 dark:bg-gray-900' => ! $isAdmin,
            ])
        >
            <div class="mb-1 flex justify-between text-xs text-gray-500">
                <span class="font-semibold">
                    {{ $message->sender?->name ?? 'Unknown' }}

                    @if ($isAdmin)
                        (Admin)
                    @endif
                </span>

                <span>
                    {{ $message->created_at->format('Y-m-d H:i') }}
                </span>
            </div>

            <p class="whitespace-pre-line text-sm">
                {{ $message->body }}
            </p>
        </div>
    @endforeach
</div>