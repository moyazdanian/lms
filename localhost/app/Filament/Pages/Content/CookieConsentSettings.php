<?php

namespace App\Filament\Pages\Content;

use App\Models\LegalPage;
use BackedEnum;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section as ComponentsSection;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * "Content > Cookie Consent" — the copy shown on the cookie banner the
 * first-time visitors see (title, body text, the two button labels and
 * the trailing policy link label). Saved onto the single legal_pages row.
 */
class CookieConsentSettings extends Page
{
    use \Filament\Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.legal-pages';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Cog; // or adjustments-horizontal

    protected static UnitEnum|string|null $navigationGroup = 'Content';

    protected static ?string $navigationLabel = 'Cookie Consent';

    protected static ?int $navigationSort = 4;

    public ?LegalPage $record = null;

    public ?array $data = [];

    public function mount(): void
    {
        $this->record = LegalPage::current();
        $this->form->fill($this->record->only([
            'banner_title',
            'banner_body',
            'banner_accept_label',
            'banner_necessary_label',
            'banner_link_label',
        ]));
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                ComponentsSection::make('Banner copy')
                    ->description('Texts shown on the cookie-consent banner first-time visitors get.')
                    ->columns(2)
                    ->components([
                        TextInput::make('banner_title')
                            ->label('Banner title')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        RichEditor::make('banner_body')
                            ->label('Banner body')
                            ->required()
                            ->columnSpanFull()
                            ->helperText('Short paragraph shown above the buttons — keep it under 2–3 sentences.'),
                        TextInput::make('banner_accept_label')
                            ->label('Accept button label')
                            ->maxLength(64)
                            ->placeholder('Accept All'),
                        TextInput::make('banner_necessary_label')
                            ->label('Necessary-only button label')
                            ->maxLength(64)
                            ->placeholder('Necessary Only'),
                        TextInput::make('banner_link_label')
                            ->label('Policy link label')
                            ->maxLength(64)
                            ->placeholder('Cookie Policy')
                            ->helperText('Shown after the terms/privacy links at the bottom of the banner.'),
                    ]),
            ])->statePath('data');
    }

    public function save(): void
    {
        LegalPage::current()->update($this->form->getState());

        Notification::make()
            ->title('Cookie consent texts saved successfully')
            ->success()
            ->send();
    }
}
