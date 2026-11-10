<?php

namespace App\Filament\Resources\AdminNotifications\Schemas;

use App\Models\User;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AdminNotificationForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('user_id')
                ->label('Recipient')
                ->helperText('Leave empty to send to ALL users')
                ->options(User::whereIn('role', ['instructor', 'student'])->pluck('name', 'id'))
                ->searchable()
                ->nullable(),

            TextInput::make('title')
                ->label('Title')
                ->required()
                ->maxLength(255),

            Textarea::make('body')
                ->label('Message')
                ->required()
                ->rows(4),

            Select::make('type')
                ->label('Type')
                ->options([
                    'info'    => 'Info (blue)',
                    'success' => 'Success (green)',
                    'warning' => 'Warning (yellow)',
                    'danger'  => 'Danger (red)',
                ])
                ->default('info')
                ->required(),
        ]);
    }
}
