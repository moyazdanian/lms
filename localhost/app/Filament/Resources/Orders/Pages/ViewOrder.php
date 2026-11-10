<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Schemas\Components\Section as ComponentsSection;
use Filament\Schemas\Schema;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    protected static ?string $title = ' Order Items';

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function infolist(Schema $schema): Schema
{
    return $schema->components([
        // ComponentsSection::make('Order Details')
        //     ->schema([
        //         TextEntry::make('order_number'),
        //         TextEntry::make('user.name'),
        //         TextEntry::make('status'),
        //         TextEntry::make('amount'),
        //     ]),
    ]);
}
}
