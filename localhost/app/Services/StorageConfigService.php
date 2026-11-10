<?php

namespace App\Services;

use App\Models\General_setting;

/**
 * Panel-first storage configuration — the same pattern as the payment
 * gateways and Google OAuth: values saved in the admin panel are pushed
 * into the runtime config, overriding the .env defaults for this request.
 * Applied once per request from AppServiceProvider::boot().
 */
class StorageConfigService
{
    public static function apply(): void
    {
        try {
            $settings = General_setting::query()->first();
        } catch (\Throwable) {
            // The settings table does not exist yet (e.g. providers boot
            // before `php artisan migrate` on a fresh install).
            return;
        }

        if (! $settings || ! $settings->s3_enabled) {
            return;
        }

        // Push panel credentials onto the s3 disk. The optional endpoint/url
        // fields support S3-compatible providers (R2, Wasabi, MinIO...).
        // .env values remain the fallback for anything left empty.
        if (filled($settings->s3_access_key_id)) {
            config(['filesystems.disks.s3.key' => $settings->s3_access_key_id]);
        }

        if (filled($settings->s3_secret_access_key)) {
            config(['filesystems.disks.s3.secret' => $settings->s3_secret_access_key]);
        }

        if (filled($settings->s3_region)) {
            config(['filesystems.disks.s3.region' => $settings->s3_region]);
        }

        if (filled($settings->s3_bucket)) {
            config(['filesystems.disks.s3.bucket' => $settings->s3_bucket]);
        }

        if (filled($settings->s3_url)) {
            config(['filesystems.disks.s3.url' => $settings->s3_url]);
        }

        if (filled($settings->s3_endpoint)) {
            config(['filesystems.disks.s3.endpoint' => $settings->s3_endpoint]);
        }

        if ($settings->s3_use_path_style_endpoint) {
            config(['filesystems.disks.s3.use_path_style_endpoint' => true]);
        }

        // Where lesson/course videos are stored (null = env default, usually
        // "private"). Existing uploads are NOT moved automatically — use
        // `php artisan media:migrate-to-cloud` for that.
        if (filled($settings->lesson_video_disk)) {
            config(['filesystems.lesson_video_disk' => $settings->lesson_video_disk]);
        }

        // How video bytes reach the browser (null = env default, "proxy").
        if (filled($settings->video_serving_mode)) {
            config(['media.serving_mode' => $settings->video_serving_mode]);
        }

        // Attachments live next to the videos by default (the env chain is
        // LESSON_ATTACHMENT_DISK -> LESSON_VIDEO_DISK -> private); keep them
        // on the same disk the panel picked for videos.
        config(['lessons.attachment_disk' => config('filesystems.lesson_video_disk')]);
    }
}
