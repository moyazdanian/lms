<?php

namespace App\Support;

/**
 * Builds URLs that the browser requests itself — video streams, attachment
 * downloads and certificate PDFs.
 *
 * Laravel pins every generated URL to APP_URL, which is the API host. The
 * session cookie, however, belongs to the storefront host. In the Docker
 * stack Caddy serves the API on that same storefront host under /api, so a
 * media URL must stay there: on the API host the browser sends no session
 * cookie, the auth middleware redirects to /login (a POST-only route), and
 * the player receives a 405 instead of the video.
 *
 * Local development keeps both origins on the same host (localhost), where
 * cookies are shared across ports and the APP_URL value already works.
 */
class StorefrontUrl
{
    /**
     * Generate a named route on the storefront origin when the two origins
     * differ, and on APP_URL otherwise.
     */
    public static function route(string $name, array $parameters = []): string
    {
        $url = route($name, $parameters);

        $appUrl = rtrim((string) config('app.url'), '/');
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        if ($appUrl === '' || $frontendUrl === '') {
            return $url;
        }

        $appHost = parse_url($appUrl, PHP_URL_HOST);
        $frontendHost = parse_url($frontendUrl, PHP_URL_HOST);

        // Same host (local development): the APP_URL URL is reachable and
        // shares cookies, so leave it untouched.
        if (! $frontendHost || $frontendHost === $appHost) {
            return $url;
        }

        return str_starts_with($url, $appUrl)
            ? $frontendUrl . substr($url, strlen($appUrl))
            : $url;
    }
}
