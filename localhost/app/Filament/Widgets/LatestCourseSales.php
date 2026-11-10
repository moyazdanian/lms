<?php

namespace App\Filament\Widgets;

use App\Models\OrderItem;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class LatestCourseSales extends TableWidget
{
    protected static ?string $heading = 'Latest Course Sales';
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(OrderItem::query()->whereHas('order', fn ($query) => $query->where('status', 'paid'))->with(['order.user', 'course']))
            ->defaultPaginationPageOption(10)
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Date')->dateTime()->sortable(),
                TextColumn::make('order.order_number')->label('Order')->searchable(),
                TextColumn::make('course.title')->label('Course')->limit(35),
                TextColumn::make('order.user.name')->label('Customer'),
                TextColumn::make('final_amount')->label('Paid')->money('usd', true),
            ]);
    }
}
