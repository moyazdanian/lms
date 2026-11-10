<?php

namespace App\Filament\Resources\Courses\RelationManager;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use App\Filament\Support\PrivateVideoUpload;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Forms;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SectionRelationManager extends RelationManager
{
    protected static string $relationship = 'sections';

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('title')->required()
            ->maxLength(255),
            TextInput::make('sort_order')->label('Sort Order')->numeric()->nullable(),
            Repeater::make('lessons')
                    ->label('Lessons')
                
                    ->relationship('lessons')
                    ->schema([
                        TextInput::make('title')->required(),
                        PrivateVideoUpload::lesson('video_url'),
                        TextInput::make('duration')
                            ->numeric()
                            ->suffix('minutes'),
                        Forms\Components\Toggle::make('is_free')
                            ->label('Is Free?')
                            ->default(false)
                            ->live()
                            ->hintIcon('heroicon-m-information-circle', tooltip: 'Free lessons are previewable by anyone and never carry downloadable attachments.'),
                             Repeater::make('attachments')
                                ->relationship('attachments')
                                ->label('Lesson attachments')
                                ->hidden(fn ($get) => (bool) $get('is_free'))
                                ->dehydrated(fn ($get) => ! (bool) $get('is_free'))
                                ->schema([
                                    Grid::make(2)->schema([
                                        Forms\Components\FileUpload::make('file_path')
                                            ->label('File')
                                            ->disk(config('lessons.attachment_disk'))
                                            ->visibility('private')
                                            ->directory('lesson-attachments')
                                            ->preserveFilenames(false)
                                            ->maxSize(((int) config('lessons.attachment_max_size')) / 1024)
                                            ->acceptedFileTypes(config('lessons.attachment_mimetypes'))
                                            ->downloadable()
                                            ->openable(false)
                                            ->required(),
                                        Forms\Components\TextInput::make('title')
                                            ->label('Display title')
                                            ->maxLength(255)
                                            ->placeholder('Chapter 1 exercises'),
                                    ]),
                            ])
                    ])
                    ->orderColumn('sort_order')
                    ->columnSpanFull()
                    ->defaultItems(0)
                    ->collapsible()
                    ->itemLabel(fn (array $state) => $state['title'] ?? null)
                    ->addActionLabel('Add Lesson')
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title'),
                TextColumn::make('sort_order'),
                
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
                ViewAction::make(),
            ])
            ->defaultSort('sort_order');
    }
}