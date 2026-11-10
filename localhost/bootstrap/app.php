<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'verified'          => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'role'              => \App\Http\Middleware\EnsureUserRole::class,
            'instructor.active' => \App\Http\Middleware\EnsureInstructorActive::class,
        ]);

        // Behind the compose stack (and behind any reverse proxy on the host)
        // the real client IP and scheme arrive in X-Forwarded-* headers.
        // Trusting them keeps generated URLs on https:// and makes the login
        // throttle count visitors instead of the proxy. The Docker stack sets
        // TRUSTED_PROXIES="*" because its API port is bound to loopback; a
        // direct install trusts the local proxy only.
        $middleware->trustProxies(at: env('TRUSTED_PROXIES', '127.0.0.1'));

        $middleware->statefulApi();

        $middleware->validateCsrfTokens(except: [
            'api/webhooks/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
