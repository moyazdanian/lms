<?php

namespace App\Filament\Resources\Enrollments\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class EnrollmentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->placeholder('Select a user'),
                Select::make('course_id')
                    ->relationship('course', 'title')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->placeholder('Select a course'),
                Select::make('payment_id')
                    ->relationship('payment', 'id')
                    ->searchable()
                    ->preload()
                    ->placeholder('Select a payment'),
                Select::make('status')
                    ->options(['active' => 'Active', 'completed' => 'Completed', 'canceled' => 'Canceled'])
                    ->default('active')
                    ->required(),
                TextInput::make('progress')
                    ->numeric()
                    ->default(0.0),
            ]);
    }
}
