<?php

use App\Filament\Pages\Settings\StorageSettings;
use App\Models\General_setting;
use App\Models\User;
use App\Services\S3ConnectionTester;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

/**
 * The "Test Connection" button on Settings > Storage: verifies the S3
 * bucket (write / read / delete round trip) with the panel credentials
 * before the admin switches the lesson-video disk to it.
 *
 * The tester builds a one-off disk from the credentials; in tests that
 * protected factory is stubbed to a local fake disk, so the full round
 * trip runs without network access.
 */
beforeEach(function () {
    Storage::fake('local');

    // role/status are guarded attributes — the factory cannot set them.
    $this->admin = User::factory()->create();
    $this->admin->forceFill(['role' => 'admin', 'status' => true])->save();
    $this->admin = $this->admin->refresh();
});

/**
 * A tester whose probe disk is the (faked) local disk.
 */
function testerOnFakeDisk(): S3ConnectionTester
{
    $tester = Mockery::mock(S3ConnectionTester::class)->makePartial()->shouldAllowMockingProtectedMethods();
    $tester->shouldReceive('buildDisk')->andReturnUsing(fn () => Storage::disk('local'));

    return $tester;
}

it('passes the round trip and cleans up the probe file', function () {
    $result = testerOnFakeDisk()->test([
        'key' => 'k',
        'secret' => 's',
        'region' => 'us-east-1',
        'bucket' => 'media-bucket',
        'url' => null,
        'endpoint' => null,
        'use_path_style_endpoint' => false,
    ]);

    expect($result['ok'])->toBeTrue()
        ->and($result['message'])->toContain('media-bucket')
        ->and($result['duration_ms'])->toBeInt()
        ->and(collect($result['steps'])->every(fn (array $step) => $step['ok']))->toBeTrue()
        ->and(count($result['steps']))->toBe(3);

    // The probe file inside the test directory was deleted again.
    expect(collect(Storage::disk('local')->allFiles('storage-connection-test')))->toBeEmpty();
});

it('fails early when required credentials are missing', function () {
    $result = testerOnFakeDisk()->test([
        'key' => 'k',
        'secret' => '',
        'region' => null,
        'bucket' => 'media-bucket',
        'url' => null,
        'endpoint' => null,
        'use_path_style_endpoint' => false,
    ]);

    expect($result['ok'])->toBeFalse()
        ->and($result['message'])->toContain('Secret Access Key')
        ->and($result['message'])->toContain('Region')
        ->and($result['steps'])->toBe([]);
});

it('reports a corrupted round trip when read-back differs', function () {
    $disk = Mockery::mock(FilesystemAdapter::class);
    $disk->shouldReceive('put')->andReturnTrue();
    $disk->shouldReceive('get')->andReturn('tampered-bytes');

    $tester = Mockery::mock(S3ConnectionTester::class)->makePartial()->shouldAllowMockingProtectedMethods();
    $tester->shouldReceive('buildDisk')->andReturn($disk);

    $result = $tester->test([
        'key' => 'k',
        'secret' => 's',
        'region' => 'r',
        'bucket' => 'b',
        'url' => null,
        'endpoint' => null,
        'use_path_style_endpoint' => false,
    ]);

    expect($result['ok'])->toBeFalse()
        ->and($result['message'])->toContain('different content');
});

it('renders the storage settings page with the test button for admins', function () {
    General_setting::firstOrCreate();

    $this->actingAs($this->admin, 'filament')
        ->get(StorageSettings::getUrl())
        ->assertSuccessful()
        ->assertSee('Test Connection');
});

it('merges typed panel values over config fallbacks', function () {
    config([
        'filesystems.disks.s3.key' => 'env-key',
        'filesystems.disks.s3.secret' => 'env-secret',
        'filesystems.disks.s3.region' => 'env-region',
        'filesystems.disks.s3.bucket' => 'env-bucket',
        'filesystems.disks.s3.use_path_style_endpoint' => true,
    ]);

    $page = app(StorageSettings::class);

    $method = new ReflectionMethod($page, 'mergedTestCredentials');

    $credentials = $method->invoke(
        $page,
        key: 'typed-key',
        secret: 'typed-secret',
        region: null, // falls back to the env value
        bucket: null, // falls back to the env value
        url: null,
        endpoint: null,
        usePathStyle: false,
    );

    expect($credentials['key'])->toBe('typed-key')
        ->and($credentials['secret'])->toBe('typed-secret')
        ->and($credentials['region'])->toBe('env-region')
        ->and($credentials['bucket'])->toBe('env-bucket')
        ->and($credentials['use_path_style_endpoint'])->toBeTrue();
});
