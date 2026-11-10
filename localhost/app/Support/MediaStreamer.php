<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Shared video-delivery helper used by every media-serving controller.
 *
 * Two serving modes, selected by VIDEO_SERVING_MODE:
 *
 *  - "proxy" (default): the controller authorizes, then this class streams the
 *    bytes through the app with Range support. Works on any disk (local, S3,
 *    R2, Spaces, MinIO) with zero extra configuration.
 *
 *  - "signed": after authorization the browser is redirected (302) to a
 *    time-limited signed cloud URL so media bytes bypass the app server
 *    entirely. Falls back to proxy streaming automatically when the configured
 *    disk cannot produce temporary URLs (e.g. the local driver), so the app
 *    never breaks on a misconfigured environment.
 */
class MediaStreamer
{
    /**
     * Serve a media file after the caller has already authorized the user.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public static function serve(Request $request, string $diskName, ?string $path, string $downloadName , bool $isPreview = false)
    {
        if (! $path) {
            abort(404);
        }

        $disk = Storage::disk($diskName);

        if (! $disk->exists($path)) {
            abort(404);
        }

        if (config('media.serving_mode') === 'signed') {
            $signed = static::temporaryUrl($disk, $path, $isPreview);

            $headers = $isPreview ? [
                'Cache-Control' => 'public, max-age=600',
            ] : [
                'Cache-Control' => 'private, no-store, max-age=0',
            ];

            if ($signed !== null) {
                return redirect()->away($signed, 302)->withHeaders($headers);
            }
            // Disk cannot sign URLs (e.g. local driver) — fall through to proxy.
        }

        return static::streamThroughApp($request, $disk, $path, $downloadName);
    }

    /**
     * Build a temporary cloud URL, or null when the driver cannot sign.
     */
    protected static function temporaryUrl($disk, string $path , bool $isPreview): ?string
    {
        $ttlMinutes = $isPreview ? (int) config('media.signed_url_ttl_public', 120) : (int) config('media.signed_url_ttl_private', 30);
        try {
            return $disk->temporaryUrl(
                $path,
                now()->addMinutes($ttlMinutes)
            );
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    /**
     * Proxy the file through the application with HTTP Range support so
     * seeking works identically on local disks and cloud object storage.
     */
    protected static function streamThroughApp(Request $request, $disk, string $path, string $downloadName)
    {
        $size = (int) $disk->size($path);
        $mimeType = $disk->mimeType($path) ?: 'application/octet-stream';
        $start = 0;
        $end = max(0, $size - 1);
        $status = 200;

        if ($range = $request->header('Range')) {
            if (preg_match('/bytes=(\d*)-(\d*)/', $range, $matches)) {
                $requestedStart = $matches[1] === '' ? null : (int) $matches[1];
                $requestedEnd = $matches[2] === '' ? null : (int) $matches[2];

                if ($requestedStart === null) {
                    $suffixLength = $requestedEnd ?? 0;
                    $start = max(0, $size - $suffixLength);
                } else {
                    $start = $requestedStart;
                }

                if ($requestedEnd !== null) {
                    $end = min($requestedEnd, $size - 1);
                }

                if ($start > $end || $start >= $size) {
                    return response('', 416, [
                        'Content-Range' => "bytes */{$size}",
                    ]);
                }

                $status = 206;
            }
        }

        $length = max(0, $end - $start + 1);
        $stream = $disk->readStream($path);

        abort_unless(is_resource($stream), 404);

        if ($start > 0) {
            // Cloud adapters often return non-seekable streams, so fall back
            // to reading-and-discarding when fseek is unavailable.
            if (@fseek($stream, $start) !== 0) {
                $remaining = $start;

                while ($remaining > 0 && ! feof($stream)) {
                    $chunk = fread($stream, min(1024 * 1024, $remaining));

                    if ($chunk === false || $chunk === '') {
                        break;
                    }

                    $remaining -= strlen($chunk);
                }
            }
        }

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => (string) $length,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'private, no-store, max-age=0',
            'Content-Disposition' => 'inline; filename="' . basename($downloadName) . '"',
            'X-Content-Type-Options' => 'nosniff',
        ];

        if ($status === 206) {
            $headers['Content-Range'] = "bytes {$start}-{$end}/{$size}";
        }

        return response()->stream(function () use ($stream, $length): void {
            $remaining = $length;

            while ($remaining > 0 && ! feof($stream)) {
                $chunk = fread($stream, min(1024 * 1024, $remaining));

                if ($chunk === false || $chunk === '') {
                    break;
                }

                echo $chunk;
                $remaining -= strlen($chunk);

                if (connection_aborted()) {
                    break;
                }

                flush();
            }

            fclose($stream);
        }, $status, $headers);
    }
}
