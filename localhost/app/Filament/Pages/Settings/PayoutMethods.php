<?php

namespace App\Filament\Pages\Settings;

use App\Models\General_setting;
use BackedEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section as FormSection;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * "Settings > Payout Methods" — the withdrawal methods instructors can
 * choose from, plus the payout-related financial rules.
 */
class PayoutMethods extends Page
{
    use \Filament\Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.settings';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Banknotes;
    protected static UnitEnum|string|null $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Payout Methods';
    protected static ?int $navigationSort = 3;

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
                Section::make('Payout Rules')
                    ->columns(2)
                    ->components([
                        TextInput::make('instructor_commission_percent')
                            ->label('Instructor Commission (%)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->step(0.01)
                            ->required(),
                        TextInput::make('minimum_payout_amount')
                            ->label('Minimum Payout Amount')
                            ->numeric()
                            ->minValue(0)
                            ->step(0.01)
                            ->required(),
                    ]),

                Section::make('Payout Methods')
                    ->description('Withdrawal methods instructors can choose from when requesting a payout. The "account hint" is shown to the instructor as a placeholder telling them what to enter (e.g. their PayPal email).')
                    ->columns(2)
                    ->components([
                        Repeater::make('payout_methods')
                            ->label('Methods')
                            ->schema([
                                TextInput::make('value')
                                    ->label('Key')
                                    ->required()
                                    ->alphaDash()
                                    ->maxLength(50),
                                TextInput::make('label')
                                    ->label('Display name')
                                    ->required()
                                    ->maxLength(100),
                                TextInput::make('account_label')
                                    ->label('Account hint')
                                    ->maxLength(255)
                                    ->columnSpanFull()
                                    ->helperText('Placeholder telling the instructor what to fill in (e.g. "Your PayPal email address").'),
                            ])
                            ->columns(2)
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state) => $state['label'] ?? 'Method')
                            ->columnSpanFull(),
                    ]),
            ])->statePath('data');
    }

    public function save()
    {
        General_setting::first()->update($this->form->getState());

        Notification::make()
            ->title('Payout methods saved successfully')
            ->success()
            ->send();
    }
}
