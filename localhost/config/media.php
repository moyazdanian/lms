<?php

return [

    /*
    |------------------------------------------------------------------
    | Video serving mode
    |------------------------------------------------------------------
    |
    | "proxy"  — media bytes flow through the Laravel server after
    |            authorization (zero extra configuration, works on every
    |            disk). Best default for small/medium deployments.
    |
    | "signed" — after authorization the browser is redirected to a
    |            time-limited signed cloud URL so the bytes bypass the
    |            app server (lower load, native fast seeking). Requires
    |            an S3-compatible disk that supports temporaryUrl. If the
    |            configured disk cannot sign URLs the app automatically
    |            falls back to "proxy" behavior.
    |
    */
    'serving_mode' => env('VIDEO_SERVING_MODE', 'proxy'),

    // Lifetime of signed cloud URLs in minutes ("signed" mode only).
    // Keep short: a leaked URL stops working quickly, but not so short
    // that a long lesson buffers out mid-playback (the player re-requests
    // with a fresh signed URL on every seek).
    'signed_url_ttl_private' => env('VIDEO_SIGNED_URL_TTL_PRIVATE', 30),
    'signed_url_ttl_public' => env('VIDEO_SIGNED_URL_TTL_PUBLIC', 120),

];
