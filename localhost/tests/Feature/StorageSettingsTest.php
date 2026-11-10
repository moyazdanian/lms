<?php

use App\Models\General_setting;
use App\Services\StorageConfigService;

it('applies panel s3 credentials and video settings to the runtime config', function () {
    General_setting::query()->create([
        's3_enabled' => true,
        's3_access_key_id' => 'panel-key',
        's3_secret_access_key' => 'panel-secret',
        's3_region' => 'us-east-1',
        's3_bucket' => 'panel-bucket',
        's3_endpoint' => 'https://account.r2.cloudflarestorage.com',
        's3_use_path_style_endpoint' => true,
        'lesson_video_disk' => 's3',
        'video_serving_mode' => 'signed',
    ]);

    StorageConfigService::apply();

    expect(config('filesystems.disks.s3.key'))->toBe('panel-key')
        ->and(config('filesystems.disks.s3.secret'))->toBe('panel-secret')
        ->and(config('filesystems.disks.s3.region'))->toBe('us-east-1')
        ->and(config('filesystems.disks.s3.bucket'))->toBe('panel-bucket')
        ->and(config('filesystems.disks.s3.endpoint'))->toBe('https://account.r2.cloudflarestorage.com')
        ->and(config('filesystems.disks.s3.use_path_style_endpoint'))->toBeTrue()
        ->and(config('filesystems.lesson_video_disk'))->toBe('s3')
        ->and(config('media.serving_mode'))->toBe('signed');
});

it('does not override the config when the panel toggle is off', function () {
    $keyBefore = config('filesystems.disks.s3.key');
    $diskBefore = config('filesystems.lesson_video_disk');

    General_setting::query()->create([
        's3_enabled' => false,
        's3_access_key_id' => 'panel-key',
        's3_bucket' => 'panel-bucket',
        'lesson_video_disk' => 's3',
    ]);

    StorageConfigService::apply();

    expect(config('filesystems.disks.s3.key'))->toBe($keyBefore)
        ->and(config('filesystems.lesson_video_disk'))->toBe($diskBefore);
});

it('does not override empty panel fields with the env fallback intact', function () {
    General_setting::query()->create([
        's3_enabled' => true,
        's3_access_key_id' => 'panel-key',
        // everything else left empty -> env fallback stays
    ]);

    StorageConfigService::apply();

    expect(config('filesystems.disks.s3.key'))->toBe('panel-key')
        ->and(config('filesystems.disks.s3.region'))->toBe(env('AWS_DEFAULT_REGION'))
        ->and(config('filesystems.disks.s3.bucket'))->toBe(env('AWS_BUCKET'));
});

it('never exposes storage or gateway secrets in serialization', function () {
    $settings = General_setting::query()->create([
        's3_secret_access_key' => 'topsecret',
        'google_client_secret' => 'gsecret',
        'stripe_secret' => 'sk_live_x',
    ]);

    $payload = $settings->toArray();

    expect($payload)->not->toHaveKey('s3_secret_access_key')
        ->and($payload)->not->toHaveKey('google_client_secret')
        ->and($payload)->not->toHaveKey('stripe_secret');
});
