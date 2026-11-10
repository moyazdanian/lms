<?php

namespace App\Filament\Pages\Settings;

use App\Models\General_setting;
use BackedEnum;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * "Settings > Payment Gateways" — enable a gateway and store its
 * credentials in the database (panel-first, .env as fallback).
 */
class PaymentGateways extends Page
{
    use \Filament\Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.settings';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::CreditCard;
    protected static UnitEnum|string|null $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Payment Gateways';
    protected static ?int $navigationSort = 2;

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
                Section::make('Payment Gateways')
                    ->description('Enable a gateway and fill its credentials. Enabled gateways appear automatically on the storefront checkout. Keys are stored in the database — never commit them to version control.')
                    ->columns(2)
                    ->components([
                        Toggle::make('stripe_enabled')
                            ->label('Enable Stripe')
                            ->live()
                            ->columnSpan(2),
                        TextInput::make('stripe_secret')
                            ->label('Stripe Secret Key')
                            ->password()
                            ->revealable()
                            ->placeholder('sk_live_... or sk_test_...')
                            ->helperText('Leave empty to keep using the STRIPE_SECRET_KEY from .env (existing installations).')
                            ->columnSpan(2)
                            ->formatStateUsing(fn () => $this->record?->stripe_secret)
                            ->dehydrateStateUsing(fn ($state) => filled($state)
                                ? $state
                                : $this->record?->stripe_secret),

                        Toggle::make('paypal_enabled')
                            ->label('Enable PayPal')
                            ->live()
                            ->columnSpan(2),
                        TextInput::make('paypal_mode')
                            ->label('PayPal Mode')
                            ->placeholder('sandbox or live')
                            ->maxLength(10)
                            ->default('sandbox'),
                        TextInput::make('paypal_client_id')
                            ->label('PayPal Client ID')
                            ->columnSpan(1),
                        TextInput::make('paypal_client_secret')
                            ->label('PayPal Client Secret')
                            ->password()
                            ->revealable()
                            ->columnSpan(2)
                            ->formatStateUsing(fn () => $this->record?->paypal_client_secret)
                            ->dehydrateStateUsing(fn ($state) => filled($state)
                                ? $state
                                : $this->record?->paypal_client_secret),

                        Toggle::make('mollie_enabled')
                            ->label('Enable Mollie')
                            ->live()
                            ->columnSpan(2),
                        TextInput::make('mollie_api_key')
                            ->label('Mollie API Key')
                            ->password()
                            ->revealable()
                            ->placeholder('live_... or test_...')
                            ->columnSpan(2)
                            ->formatStateUsing(fn () => $this->record?->mollie_api_key)
                            ->dehydrateStateUsing(fn ($state) => filled($state)
                                ? $state
                                : $this->record?->mollie_api_key),

                        Toggle::make('razorpay_enabled')
                            ->label('Enable Razorpay')
                            ->live()
                            ->columnSpan(2),
                        TextInput::make('razorpay_key_id')
                            ->label('Razorpay Key ID')
                            ->placeholder('rzp_live_... or rzp_test_...'),
                        TextInput::make('razorpay_key_secret')
                            ->label('Razorpay Key Secret')
                            ->password()
                            ->revealable()
                            ->formatStateUsing(fn () => $this->record?->razorpay_key_secret)
                            ->dehydrateStateUsing(fn ($state) => filled($state)
                                ? $state
                                : $this->record?->razorpay_key_secret),
                    ]),
            ])->statePath('data');
    }

    public function save()
    {
        General_setting::first()->update($this->form->getState());

        Notification::make()
            ->title('Payment gateways saved successfully')
            ->success()
            ->send();
    }
}
