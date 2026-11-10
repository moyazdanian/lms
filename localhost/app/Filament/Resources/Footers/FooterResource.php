<?php

namespace App\Filament\Resources\Footers;

use App\Models\Footer;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class FooterResource extends Resource
{
    protected static ?string $model = Footer::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Link;

    protected static ?string $label = 'Footer';

    protected static ?string $pluralLabel = 'Footer';

    protected static UnitEnum|string|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        // It is a single-row config table — no badge needed, keep it clean.
        return null;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Textarea::make('about')
                ->label('About text')
                ->rows(3)
                ->columnSpanFull()
                ->helperText('Shown next to the logo. The site name is prepended automatically.'),

            TextInput::make('copyright')
                ->label('Copyright line')
                ->maxLength(255)
                ->columnSpanFull()
                ->helperText('Shown after © and the current year. The site name is prepended automatically.'),

            Repeater::make('links')
                ->label('Quick links')
                ->schema([
                    TextInput::make('label')->required()->maxLength(255),
                    TextInput::make('url')
                        ->required()
                        ->maxLength(2048)
                        ->helperText('Internal path (e.g. /courses) or full URL.'),
                ])
                ->columns(2)
                ->reorderable()
                ->collapsible()
                ->itemLabel(fn (array $state) => $state['label'] ?? 'Link')
                ->columnSpanFull(),

            Repeater::make('social_links')
                ->label('Social media links')
                ->schema([
                    Select::make('platform')
                        ->options(Footer::platforms())
                        ->required()
                        ->searchable()
                        ->helperText('Chooses the brand icon shown in the footer.'),
                    TextInput::make('label')
                        ->label('Accessibility label')
                        ->maxLength(255)
                        ->helperText('Screen-reader text, e.g. "Follow us on X". Falls back to the platform name.'),
                    TextInput::make('url')
                        ->required()
                        ->url()
                        ->maxLength(2048),
                ])
                ->columns(3)
                ->reorderable()
                ->collapsible()
                ->itemLabel(fn (array $state) => Footer::platforms()[$state['platform'] ?? ''] ?? ($state['label'] ?? 'Social link'))
                ->columnSpanFull(),

            Toggle::make('is_active')
                ->label('Show footer on the site')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('about')
                    ->label('About')
                    ->limit(60),
                TextColumn::make('links')
                    ->label('Quick links')
                    ->formatStateUsing(fn ($state) => is_array($state)
                        ? implode('، ', array_map(fn ($link) => $link['label'] ?? '', $state))
                        : '')
                    ->limit(60),
                TextColumn::make('social_links')
                    ->label('Social media')
                    ->formatStateUsing(fn ($state) => is_array($state)
                        ? implode('، ', array_map(fn ($link) => Footer::platforms()[$link['platform'] ?? ''] ?? ($link['platform'] ?? ''), $state))
                        : ''),
                IconColumn::make('is_active')
                    ->label('Visible')
                    ->boolean(),
                TextColumn::make('updated_at')
                    ->label('Updated')
                    ->since()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                \Filament\Actions\EditAction::make(),
            ])
            ->toolbarActions([
                //
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFooters::route('/'),
            'edit' => Pages\EditFooter::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        // Single-row config: the row already exists (self-healing model).
        return false;
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }
}
