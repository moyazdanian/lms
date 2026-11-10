<?php

namespace App\Filament\Pages;

use App\Models\General_setting;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * "Settings > General Settings" — site identity, homepage layout and
 * LMS behavior flags. Payment gateways, payout methods, social login and
 * cloud storage each live on their own page in the Settings group.
 */
class Settings extends Page
{
    use \Filament\Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.settings';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Cog6Tooth;
    protected static UnitEnum|string|null $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'General Settings';
    protected static ?int $navigationSort = 1;

    public ?General_setting $record = null;

    public ?array $data = [];

    public function mount(): void
    {
        $this->record = General_setting::firstOrCreate();
        $this->form->fill($this->record->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Branding & Contact')
                    ->description('Identity of the site as shown on the storefront.')
                    ->columns(2)
                    ->components([
                        TextInput::make('site_name')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('language')
                            ->default('en')
                            ->required()
                            ->maxLength(20),
                        TextInput::make('contact_email')
                            ->email()
                            ->required()
                            ->maxLength(255),
                        FileUpload::make('logo')
                            ->image()
                            ->maxSize(2048)
                            ->disk('public')
                            ->directory('site-logos')
                            ->imagePreviewHeight(100)
                            ->helperText('Shown as the admin panel brand logo (sidebar). Recommended: horizontal PNG/SVG with transparent background.'),
                        FileUpload::make('faveicon')
                            ->image()
                            ->maxSize(1024)
                            ->disk('public')
                            ->directory('site-favicons')
                            ->imagePreviewHeight(50)
                            ->helperText('Browser tab icon. Recommended: square PNG, 64x64 or larger.'),
                    ]),

                Section::make('Learning')
                    ->columns(2)
                    ->components([
                        TextInput::make('quiz_default_pass_mark')
                            ->label('Default Quiz Pass Mark (%)')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(100)
                            ->step(0.01)
                            ->required()
                            ->helperText('Used by every quiz that has no specific pass mark set.'),
                        Toggle::make('certificates_enabled')
                            ->label('Enable Certificates')
                            ->default(true)
                            ->helperText('When disabled, no new certificates are issued and eligibility checks return false.'),
                    ]),
            ])->statePath('data');
    }

    public function save()
    {
        $data = $this->form->getState();

        // Delete replaced branding files from the public disk, otherwise the
        // old logo/favicon would stay served forever after an update.
        foreach (['logo', 'faveicon'] as $field) {
            $old = $this->record->getOriginal($field);
            $new = $data[$field] ?? null;

            if (filled($old) && filled($new) && $new !== $old) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
            }
        }

        General_setting::first()->update($data);

        Notification::make()
            ->title('Settings saved successfully')
            ->success()
            ->send();
    }
}
