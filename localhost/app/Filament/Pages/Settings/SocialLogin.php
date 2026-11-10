<?php

namespace App\Filament\Pages\Settings;

use App\Models\General_setting;
use BackedEnum;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Section as FormSection;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\HtmlString;
use UnitEnum;

/**
 * "Settings > Social Login" — OAuth providers for sign-in. Google is
 * implemented; the schema (social_accounts + config injection) is ready
 * for more providers.
 */
class SocialLogin extends Page
{
    use \Filament\Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.settings';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::FingerPrint;
    protected static UnitEnum|string|null $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Social Login';
    protected static ?int $navigationSort = 4;

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
                Section::make('Google OAuth (Login with Google)')
                    ->description('Let users sign in with their Google account. Create an OAuth Client in the Google Cloud Console, paste its credentials here, and add the redirect URI below to the client\'s "Authorized redirect URIs".')
                    ->columns(2)
                    ->components([
                        Toggle::make('google_enabled')
                            ->label('Enable Login with Google')
                            ->live()
                            ->columnSpan(2),
                        TextInput::make('google_client_id')
                            ->label('Client ID')
                            ->placeholder('xxxxxxxx.apps.googleusercontent.com')
                            ->columnSpan(1),
                        TextInput::make('google_client_secret')
                            ->label('Client Secret')
                            ->password()
                            ->revealable()
                            ->columnSpan(1)
                            ->formatStateUsing(fn () => $this->record?->google_client_secret)
                            ->dehydrateStateUsing(fn ($state) => filled($state)
                                ? $state
                                : $this->record?->google_client_secret),
                        Placeholder::make('google_redirect_uri')
                            ->label('Authorized redirect URI — copy this into the Google Cloud Console')
                            ->content(fn (): HtmlString => new HtmlString(
                                '<code class="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800">'
                                .e(rtrim((string) config('app.url'), '/').'/auth/google/callback')
                                .'</code>'
                            ))
                            ->columnSpan(2),
                    ]),
            ])->statePath('data');
    }

    public function save()
    {
        General_setting::first()->update($this->form->getState());

        Notification::make()
            ->title('Social login settings saved successfully')
            ->success()
            ->send();
    }
}
