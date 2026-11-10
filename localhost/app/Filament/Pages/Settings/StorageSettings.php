<?php

namespace App\Filament\Pages\Settings;

use App\Models\General_setting;
use App\Services\S3ConnectionTester;
use BackedEnum;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Section as FormSection;
use Filament\Forms\Components\Select;
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
 * "Settings > Storage" — cloud storage credentials (S3 / R2 / Wasabi /
 * MinIO) and lesson-video delivery. Panel values are pushed into the
 * runtime config per request (see StorageConfigService) with the .env
 * values acting as fallback.
 */
class StorageSettings extends Page
{
    use \Filament\Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.settings';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Cloud;
    protected static UnitEnum|string|null $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Storage';
    protected static ?int $navigationSort = 5;

    public ?General_setting $record = null;

    public ?array $data = [];

    /** Result of the last "Test Connection" run, rendered under the form. */
    public ?array $s3TestResult = null;
    public function mount(): void
    {
        $this->record = General_setting::firstOrCreate();
        $this->form->fill($this->record->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Video Delivery')
                    ->description('Where lesson and course videos are stored and how their bytes reach the browser.')
                    ->columns(2)
                    ->components([
                        Select::make('lesson_video_disk')
                            ->label('Lesson Video Disk')
                            ->options([
                                'private' => 'Local — private disk (default)',
                                'public' => 'Local — public disk',
                                'videos' => 'Local — videos folder',
                                's3' => 'S3-compatible cloud storage',
                            ])
                            ->native(false)
                            ->placeholder('Use the .env default (LESSON_VIDEO_DISK)')
                            ->helperText('Existing uploads are NOT moved automatically — run `php artisan media:migrate-to-cloud` after switching disks.')
                            ->columnSpan(1),
                        Select::make('video_serving_mode')
                            ->label('Video Serving Mode')
                            ->options([
                                'proxy' => 'Proxy — stream through the app server (default)',
                                'signed' => 'Signed URLs — browser is redirected to a time-limited cloud URL',
                            ])
                            ->native(false)
                            ->placeholder('Use the .env default (VIDEO_SERVING_MODE: proxy)')
                            ->helperText('"Signed" requires an S3-compatible disk that supports temporary URLs; it falls back to proxy automatically.')
                            ->columnSpan(1),
                        Placeholder::make('effective_config')
                            ->label('Currently active')
                            ->content(fn (): HtmlString => new HtmlString(
                                '<span class="text-xs">Disk: <code class="rounded bg-gray-100 px-2 py-1 font-mono dark:bg-gray-800">'
                                .e((string) config('filesystems.lesson_video_disk'))
                                .'</code> &nbsp;·&nbsp; Serving: <code class="rounded bg-gray-100 px-2 py-1 font-mono dark:bg-gray-800">'
                                .e((string) config('media.serving_mode'))
                                .'</code></span>'
                            ))
                            ->columnSpan(2),
                    ]),

                Section::make('S3 / Cloud Storage Credentials')
                    ->description('Credentials for the s3 disk — works with AWS S3 and S3-compatible providers (Cloudflare R2, Wasabi, MinIO...). When enabled, these values override the AWS_* variables from .env at runtime.')
                    ->columns(2)
                    ->components([
                        Toggle::make('s3_enabled')
                            ->label('Apply panel credentials (override .env)')
                            ->live()
                            ->columnSpan(2)
                            ->helperText('Leave disabled to keep using the AWS_* values from .env. Save your credentials, then use Test Connection below to verify the bucket before switching the Lesson Video Disk to S3.'),
                        TextInput::make('s3_access_key_id')
                            ->label('Access Key ID')
                            ->columnSpan(1),
                        TextInput::make('s3_secret_access_key')
                            ->label('Secret Access Key')
                            ->password()
                            ->revealable()
                            ->columnSpan(1)
                            ->formatStateUsing(fn () => $this->record?->s3_secret_access_key)
                            ->dehydrateStateUsing(fn ($state) => filled($state)
                                ? $state
                                : $this->record?->s3_secret_access_key),
                        TextInput::make('s3_region')
                            ->label('Region')
                            ->placeholder('us-east-1')
                            ->columnSpan(1),
                        TextInput::make('s3_bucket')
                            ->label('Bucket')
                            ->columnSpan(1),
                        TextInput::make('s3_url')
                            ->label('Custom URL / CDN base')
                            ->placeholder('https://cdn.example.com')
                            ->helperText('Optional — base URL used to build file links (e.g. a CDN in front of the bucket).')
                            ->columnSpan(1),
                        TextInput::make('s3_endpoint')
                            ->label('Custom endpoint')
                            ->placeholder('https://<account-id>.r2.cloudflarestorage.com')
                            ->helperText('Optional — required for S3-compatible providers (R2, Wasabi, MinIO).')
                            ->columnSpan(1),
                        Toggle::make('s3_use_path_style_endpoint')
                            ->label('Use path-style endpoint')
                            ->columnSpan(2)
                            ->helperText('Enable for MinIO or providers that need bucket-in-path URLs instead of virtual-hosted style.'),
                    ]),
            ])->statePath('data');
    }

    public function save()
    {
        General_setting::first()->update($this->form->getState());

        // Re-apply immediately so the "currently active" placeholder and
        // this very request reflect the new values.
        \App\Services\StorageConfigService::apply();

        Notification::make()
            ->title('Storage settings saved successfully')
            ->success()
            ->send();
    }

    /**
     * Test the S3 bucket with the values currently TYPED into the form
     * (unsaved edits included), falling back field-by-field to what is
     * already saved / in .env — exactly what a save would store. After
     * "Save Settings" the same button re-tests the saved credentials,
     * since the form fields then hold the saved values.
     */
    public function testConnection(): void
    {
        // Same dehydration as save(): an empty secret field falls back to
        // the stored one, so the test reflects exactly what a save stores.
        $state = $this->form->getState();

        $this->s3TestResult = app(S3ConnectionTester::class)->test($this->mergedTestCredentials(
            key: $state['s3_access_key_id'] ?? null,
            secret: $state['s3_secret_access_key'] ?? null,
            region: $state['s3_region'] ?? null,
            bucket: $state['s3_bucket'] ?? null,
            url: $state['s3_url'] ?? null,
            endpoint: $state['s3_endpoint'] ?? null,
            usePathStyle: (bool) ($state['s3_use_path_style_endpoint'] ?? false),
        ));

        $this->notifyAboutTestResult();
    }

    /**
     * Panel values with the .env/config values as fallback — the same
     * precedence StorageConfigService uses, so the test reflects what a
     * save would really end up with. Empty fields keep their saved value.
     */
    protected function mergedTestCredentials(
        ?string $key,
        ?string $secret,
        ?string $region,
        ?string $bucket,
        ?string $url,
        ?string $endpoint,
        bool $usePathStyle,
    ): array {
        $pick = fn (?string $typed, string $configKey): ?string => (
            filled(trim((string) $typed)) ? trim((string) $typed) : (string) config($configKey, '')
        ) ?: null;

        return [
            'key' => $pick($key, 'filesystems.disks.s3.key'),
            'secret' => $pick($secret, 'filesystems.disks.s3.secret'),
            'region' => $pick($region, 'filesystems.disks.s3.region'),
            'bucket' => $pick($bucket, 'filesystems.disks.s3.bucket'),
            'url' => $pick($url, 'filesystems.disks.s3.url'),
            'endpoint' => $pick($endpoint, 'filesystems.disks.s3.endpoint'),
            'use_path_style_endpoint' => $usePathStyle || (bool) config('filesystems.disks.s3.use_path_style_endpoint', false),
        ];
    }

    protected function notifyAboutTestResult(): void
    {
        $result = $this->s3TestResult;

        if ($result === null) {
            return;
        }

        $notification = Notification::make()
            ->title($result['ok'] ? 'S3 connection test passed' : 'S3 connection test failed')
            ->body($result['message'])
            ->seconds(8);

        $result['ok'] ? $notification->success()->send() : $notification->danger()->send();
    }
}
