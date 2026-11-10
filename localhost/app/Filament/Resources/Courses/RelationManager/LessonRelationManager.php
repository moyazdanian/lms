<?php

namespace App\Filament\Resources\Courses\RelationManager;

use App\Filament\Support\PrivateVideoUpload;
use App\Models\Lesson;
use App\Support\MediaDiskResolver;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms;
use Filament\Forms\Components\Repeater;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;

class LessonRelationManager extends RelationManager
{
    protected static string $relationship = 'lessons';

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Forms\Components\TextInput::make('title')
                ->required()
                ->maxLength(255),
            PrivateVideoUpload::lesson('video_url'),
            Forms\Components\TextInput::make('duration')
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
                ->columns(1)
                ->defaultItems(0)
                ->reorderable(false)
                ->maxItems((int) config('lessons.attachment_max_count')),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title'),
                Tables\Columns\TextColumn::make('duration')
                    ->suffix(' min'),
                Tables\Columns\TextColumn::make('video_url')
                    ->label('Video')
                    ->formatStateUsing(fn ($state) => $state ? basename($state) : 'No video')
                    ->url(fn ($record) => $record->video_url
                        ? route('filament.admin.media.lesson-video', ['lesson' => $record])
                        : null)
                    ->openUrlInNewTab()
                    ->copyable()
                    ->description(fn ($record) => $record->video_url
                        ? self::formatBytes($record)
                        : null),
                Tables\Columns\TextColumn::make('attachments_count')
                    ->label('Attachments')
                    ->counts('attachments')
                    ->formatStateUsing(fn ($state) => $state > 0 ? "{$state} file(s)" : '—'),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->defaultSort('sort_order');
    }

    protected static function formatBytes(Lesson $record): string
    {
        $path = $record->video_url;

        if (! $path) {
            return '';
        }

        if (! MediaDiskResolver::existsOnAnyDisk($record, 'video_url')) {
            return 'File not found on storage';
        }

        $disk = Storage::disk(MediaDiskResolver::resolve($record, 'video_url'));

        $bytes = (int) $disk->size($path);
        $units = ['B', 'KB', 'MB', 'GB'];
        $unit = 0;

        while ($bytes >= 1024 && $unit < count($units) - 1) {
            $bytes /= 1024;
            $unit++;
        }

        return number_format($bytes, $unit === 0 ? 0 : 2) . ' ' . $units[$unit];
    }
}
