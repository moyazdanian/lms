<x-filament-panels::page>
    {{ $this->form }}

    <div class="mt-4 flex flex-wrap items-center gap-3">
        <x-filament::button wire:click="save">
            Save Legal Pages
        </x-filament::button>
    </div>
</x-filament-panels::page>
