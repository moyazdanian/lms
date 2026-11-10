<?php

namespace App\Filament\Resources\Footers\Pages;

use App\Filament\Resources\Footers\FooterResource;
use App\Models\Footer;
use Filament\Resources\Pages\ListRecords;

class ListFooters extends ListRecords
{
    protected static string $resource = FooterResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Single-row config table — nothing to create here.
        ];
    }

    public function mount(): void
    {
        parent::mount();

        // A one-row config table has nothing to list: jump straight to the
        // editor of the (self-healing) footer row.
        $footer = Footer::current();

        $this->redirect(FooterResource::getUrl('edit', ['record' => $footer->id]));
    }
}
