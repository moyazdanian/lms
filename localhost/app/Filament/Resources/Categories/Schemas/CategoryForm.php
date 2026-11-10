<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\Builder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('parent_id')
                    ->label('Parent Category')
                    ->relationship('parent', 'name' , fn ($query) => $query->where('parent_id', null))
                    ->searchable()
                    ->preload()
                    ->nullable()
                    ->placeholder('No Parent Category'),
                TextInput::make('name')
                    ->required()
                    ->live()
                    ->afterStateUpdated(fn (callable $set, $state) => $set('slug', \Str::slug($state)))
                    ->maxLength(255),
                TextInput::make('slug')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
            ]);
    }
}
