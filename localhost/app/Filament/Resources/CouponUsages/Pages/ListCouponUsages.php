<?php

namespace App\Filament\Resources\CouponUsages\Pages;

use App\Filament\Resources\CouponUsages\CouponUsageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCouponUsages extends ListRecords
{
    protected static string $resource = CouponUsageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // CreateAction::make(),
        ];
    }
}
