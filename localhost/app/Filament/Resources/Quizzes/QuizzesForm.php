<?php

namespace App\Filament\Resources\Quizzes;

use App\Models\General_setting;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class QuizzesForm
{
    public static function configure(Schema $schema): Schema
    {
        $defaultPassMark = (float) (General_setting::query()->value('quiz_default_pass_mark') ?? 70);

        return $schema->components([
            Section::make('Supervision')
                ->description('Only admins control the pass mark, attempt limit and activation. The instructor manages questions and options only.')
                ->columns(2)
                ->schema([
                    Toggle::make('is_active')
                        ->label('Quiz Active')
                        ->helperText('Inactive quizzes are hidden from students and block certificate issuance.'),

                    TextInput::make('pass_mark')
                        ->label('Pass Mark (%)')
                        ->numeric()
                        ->minValue(0)
                        ->maxValue(100)
                        ->step(0.01)
                        ->suffix('%')
                        ->helperText("Set 0 to use the global default ({$defaultPassMark}%). Only admins can change this."),

                    TextInput::make('max_attempts')
                        ->label('Max Attempts')
                        ->numeric()
                        ->minValue(1)
                        ->maxValue(100)
                        ->nullable()
                        ->helperText('Leave empty for unlimited attempts.'),

                    TextInput::make('title')
                        ->label('Quiz Title')
                        ->maxLength(255)
                        ->required(),
                ]),
        ]);
    }
}
