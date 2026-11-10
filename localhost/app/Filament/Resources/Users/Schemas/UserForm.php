<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Card;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->required()->maxLength(255),
                TextInput::make('email')->required()->email()->maxLength(255),
                TextInput::make('password')->required()->password()->maxLength(255)->dehydrated(fn ($state) => filled($state))->hiddenOn('edit'),   
            ]);

        //    return Section::make('new user')->schema([
        //         TextInput::make('name')->required()->maxLength(255),
        //         TextInput::make('email')->required()->email()->maxLength(255),
        //         TextInput::make('password')->required()->password()->maxLength(255)->dehydrated(fn ($state) => filled($state))->hiddenOn('edit'),   
        //    ]);
    }
}
