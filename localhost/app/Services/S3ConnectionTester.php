<?php

namespace App\Services;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Verifies the S3-compatible bucket actually works BEFORE the admin
 * switches the lesson-video disk to it.
 *
 * Performs the full round trip the app needs for videos and attachments —
 * write, read back, delete a small probe file — using a one-off disk built
 * from the given credentials, so the global s3 disk config and its cached
 * adapter are never touched.
 */
class S3ConnectionTester
{
    protected const PROBE_DIR = 'storage-connection-test';

    /**
     * Run the connection test.
     *
     * @param  array{key: string, secret: string, region: string, bucket: string, url: ?string, endpoint: ?string, use_path_style_endpoint: bool}  $credentials
     * @return array{ok: bool, message: string, steps: array<int, array{label: string, ok: bool, detail: ?string}>, duration_ms: int}
     */
    public function test(array $credentials): array
    {
        $startedAt = microtime(true);
        $steps = [];

        $finish = function (bool $ok, string $message) use (&$steps, $startedAt): array {
            return [
                'ok' => $ok,
                'message' => $message,
                'steps' => $steps,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            ];
        };

        // 1. Required credentials present (panel values with .env fallback
        // are merged by the caller).
        $labels = [
            'key' => 'Access Key ID',
            'secret' => 'Secret Access Key',
            'region' => 'Region',
            'bucket' => 'Bucket',
        ];

        $missing = collect($labels)
            ->filter(fn (string $label, string $field) => blank($credentials[$field] ?? null))
            ->values()
            ->implode(', ');

        if ($missing !== '') {
            return $finish(false, 'Missing required credentials: '.$missing.'.');
        }

        // 2. The flysystem S3 adapter must be installed.
        if (! class_exists(\Aws\S3\S3Client::class)) {
            return $finish(false, 'The S3 adapter is not installed in this project. Run: composer require league/flysystem-aws-s3-v3');
        }

        // 3. Build a one-off disk from these exact credentials.
        try {
            $disk = $this->buildDisk($credentials);
        } catch (\Throwable $e) {
            return $finish(false, 'Could not build the S3 disk — '.self::describe($e));
        }

        // 4. Write / read / delete a probe file — exactly what the app does
        // with lesson videos, previews and attachments.
        $payload = 'connection-test-'.now()->toIso8601String();
        $path = self::PROBE_DIR.'/'.Str::uuid().'.txt';

        try {
            $disk->put($path, $payload);
            $steps[] = ['label' => 'Write probe file', 'ok' => true, 'detail' => null];
        } catch (\Throwable $e) {
            $steps[] = ['label' => 'Write probe file', 'ok' => false, 'detail' => self::describe($e)];

            return $finish(false, 'Could not WRITE to the bucket — check the credentials, the bucket name and that this user has write permission.');
        }

        try {
            $readBack = $disk->get($path);
            $steps[] = ['label' => 'Read the file back', 'ok' => true, 'detail' => null];

            if ($readBack !== $payload) {
                return $finish(false, 'The bucket returned different content than was written — the endpoint may be proxying or corrupting files.');
            }
        } catch (\Throwable $e) {
            $steps[] = ['label' => 'Read the file back', 'ok' => false, 'detail' => self::describe($e)];

            return $finish(false, 'Wrote the probe file but could not READ it back — check the bucket policy and endpoint.');
        }

        try {
            $disk->delete($path);
            $steps[] = ['label' => 'Delete the probe file', 'ok' => true, 'detail' => null];
        } catch (\Throwable $e) {
            $steps[] = ['label' => 'Delete the probe file', 'ok' => false, 'detail' => self::describe($e)];

            return $finish(false, 'Write and read worked, but DELETE failed — the app needs delete permission to clean up replaced videos and attachments.');
        }

        return $finish(
            true,
            'Bucket "'.$credentials['bucket'].'" accepted write, read and delete — ready to receive media.',
        );
    }

    /**
     * One-off disk instance from these credentials — does not mutate the
     * global "s3" disk config or its cached adapter.
     *
     * @param  array{key: string, secret: string, region: string, bucket: string, url: ?string, endpoint: ?string, use_path_style_endpoint: bool}  $credentials
     */
    protected function buildDisk(array $credentials): FilesystemAdapter
    {
        return Storage::build([
            'driver' => 's3',
            'key' => (string) $credentials['key'],
            'secret' => (string) $credentials['secret'],
            'region' => (string) $credentials['region'],
            'bucket' => (string) $credentials['bucket'],
            'url' => ($credentials['url'] ?? null) ?: null,
            'endpoint' => ($credentials['endpoint'] ?? null) ?: null,
            'use_path_style_endpoint' => (bool) ($credentials['use_path_style_endpoint'] ?? false),
            'throw' => true,
        ]);
    }

    /**
     * Short, human-usable error text (AWS error messages first when present).
     */
    protected static function describe(\Throwable $e): string
    {
        $message = trim($e->getMessage());

        if (class_exists(\Aws\Exception\AwsException::class) && $e instanceof \Aws\Exception\AwsException) {
            $message = trim((string) $e->getAwsErrorMessage()) ?: $message;
        }

        return Str::limit(preg_replace('/\s+/', ' ', $message) ?? '', 240);
    }
}
