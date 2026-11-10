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
 * "Content > Terms & Privacy" — the admin writes the Terms of Service and
 * Privacy Policy, each with its own RichEditor, on the single legal_pages
 * row. Both are rendered on the frontend at /terms and /privacy-policy.
 */
class TermsAndPrivacy extends Page
{
    use \Filament\Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.legal-pages';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::DocumentText;

    protected static UnitEnum|string|null $navigationGroup = 'Content';

    protected static ?string $navigationLabel = 'Terms & Privacy';

    protected static ?int $navigationSort = 3;

    public ?LegalPage $record = null;

    public ?array $data = [];

    public function mount(): void
    {
        $this->record = LegalPage::current();
        $this->form->fill($this->record->only([
            'terms_title', 'terms', 'privacy_title', 'privacy',
        ]));
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                ComponentsSection::make('Terms of Service')
                    ->description('The rules users agree to when using the site. Frontend page: /terms')
                    ->components([
                        TextInput::make('terms_title')
                            ->label('Page title')
                            ->required()
                            ->maxLength(255),
                        RichEditor::make('terms')
                            ->label('Terms content')
                            ->columnSpanFull(),
                    ]),

                ComponentsSection::make('Privacy Policy')
                    ->description('How user data is collected, stored and processed. Frontend page: /privacy-policy')
                    ->components([
                        TextInput::make('privacy_title')
                            ->label('Page title')
                            ->required()
                            ->maxLength(255),
                        RichEditor::make('privacy')
                            ->label('Privacy content')
                            ->columnSpanFull(),
                    ]),
            ])->statePath('data');
    }

    public function save(): void
    {
        LegalPage::current()->update($this->form->getState());

        Notification::make()
            ->title('Terms & Privacy saved successfully')
            ->success()
            ->send();
    }
}
