<?php

namespace App\Filament\Resources\BlogPosts\Schemas;

use App\Models\BlogPost;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class BlogPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Post')
                    ->columns(2)
                    ->components([
                        TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->live()
                            ->afterStateUpdated(fn (callable $set, $state) => $set('slug', \Str::slug((string) $state))),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('The post URL: /blog/your-slug'),

                        Textarea::make('excerpt')
                            ->rows(3)
                            ->maxLength(500)
                            ->columnSpanFull()
                            ->helperText('The summary shown on the blog cards and in search results.'),

                        FileUpload::make('cover_image')
                            ->label('Cover image')
                            ->image()
                            ->maxSize(4096)
                            ->disk('public')
                            ->directory('blog-covers')
                            ->imagePreviewHeight(180)
                            ->helperText('Optional. Used on the cards, on the post page and in link previews.'),

                        RichEditor::make('content')
                            ->required()
                            ->columnSpanFull(),
                    ]),

                Section::make('Publishing')
                    ->columns(2)
                    ->components([
                        Select::make('status')
                            ->options([
                                BlogPost::STATUS_DRAFT => 'Draft',
                                BlogPost::STATUS_PUBLISHED => 'Published',
                            ])
                            ->default(BlogPost::STATUS_DRAFT)
                            ->required(),

                        DateTimePicker::make('published_at')
                            ->label('Publish date')
                            ->seconds(false)
                            ->helperText('Leave empty to publish the moment you save. A future date schedules the post.'),
                    ]),
            ]);
    }
}
