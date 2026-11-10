<?php

namespace App\Filament\Resources\Courses\Schemas;

use App\Filament\Support\PrivateVideoUpload;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CourseForm
{
    public static function configure(Schema $schema): Schema
{
    return $schema->components([
        Select::make('category_id')
            ->label('Category')
            ->relationship('category', 'name')
            ->searchable()
            ->preload()
            ->required()
            ->placeholder('Select a category'),

        Select::make('instructor_id')
            ->label('Instructor')
            ->relationship('instructor', 'name', fn($query) => $query->whereIn('role', ['instructor', 'admin']))
            ->searchable()
            ->preload()
            ->required()
            ->placeholder('Select an instructor'),

        TextInput::make('title')
            ->required()
            ->maxLength(255)
            ->live()
            ->afterStateUpdated(fn(callable $set, $state) => $set('slug', \Str::slug($state))),

        TextInput::make('slug')
            ->required()
            ->maxLength(255)
            ->unique(ignoreRecord: true),

        FileUpload::make('thumbnail')
            ->image()
            ->required()
            ->maxSize(2048)
            ->disk('public')
            ->directory('course-thumbnails')
            ->imagePreviewHeight(150),

        PrivateVideoUpload::coursePreview('preview_video')
            ->label('Preview Video'),

        Textarea::make('short_description')
            ->label('Short Description')
            ->rows(3)
            ->columnSpanFull(),

        RichEditor::make('description')
            ->required()
            ->columnSpanFull(),
        
        TagsInput::make('requirements')
            ->placeholder('Add requirements')
            ->label('Requirements'),

        TagsInput::make('objectives')
            ->placeholder('Add objectives')
            ->label('Objectives'),

        TagsInput::make('tags')
            ->placeholder('Add tags')
            ->label('Tags'),

        TextInput::make('price')
            ->required()
            ->numeric()
            ->prefix('$'),

        TextInput::make('discount_price')
            ->numeric()
            ->prefix('$')
            ->rules(fn(callable $get) => $get('price') ? ['lt:' . $get('price')] : []),

        Select::make('status')
            ->options([
                // DB enum: ongoing/completed only. Draft vs. submitted lives
                // in approval_status, not here.
                'ongoing' => 'Ongoing',
                'completed' => 'Completed',
            ])
            ->default('ongoing')
            ->required(),

        Select::make('level')
            ->options([
                'beginner' => 'Beginner',
                'intermediate' => 'Intermediate',
                'advanced' => 'Advanced',
            ])
            ->default('intermediate')
            ->required(),

        TextInput::make('language'),

        Toggle::make('is_active')
            ->label('Active')
            ->default(true)
            ->required(),
            
    ]);
}

}
