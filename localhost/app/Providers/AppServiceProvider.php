<?php

namespace App\Providers;

use App\Models\BlogPost;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Payment;
use App\Policies\BlogPostPolicy;
use App\Policies\CoursePolicy;
use App\Policies\EnrollmentPolicy;
use App\Policies\OrderPolicy;
use App\Policies\PaymentPolicy;
use App\Services\StorageConfigService;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // url(), asset() and route() build absolute URLs from the *incoming
        // request's* host. Inside the Docker stack the storefront renders on
        // the server and fetches this API over the internal compose address
        // (http://api), so the HTML sent to the browser contained
        // "http://api/storage/..." for the logo, favicon and course
        // thumbnails — a host no browser can resolve. Pinning the root to
        // APP_URL keeps every generated URL on the public origin.
        $rootUrl = (string) config('app.url');

        if (preg_match('#^https?://#i', $rootUrl)) {
            URL::forceRootUrl($rootUrl);
        }

        // Panel-first storage (S3 credentials, lesson video disk, serving
        // mode) — must run before anything resolves a filesystem disk.
        StorageConfigService::apply();

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            // Frontend page: (auth)/reset-password -> /reset-password.
            // http_build_query keeps the token/email properly URL-encoded.
            return config('app.frontend_url').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });

        RateLimiter::for('auth', function ($request) {
            $email = (string) $request->email;

            return Limit::perMinute(5)
                ->by($email.$request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many authentication attempts. Please try again later.',
                    ], 429);
                });
        });

        RateLimiter::for('review', function ($request) {
            $email = (string) $request->email;

            return Limit::perMinute(1)
                ->by($email.$request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many review submissions. Please try again later.',
                    ], 429);
                });
        });

        RateLimiter::for('reset-password', function ($request) {
            $email = (string) $request->email;

            return Limit::perMinute(1)
                ->by($email.$request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many password reset requests. Please try again later.',
                    ], 429);
                });
        });

        RateLimiter::for('video-preview', function ($request) {
            return [
                Limit::perMinute(30)->by($request->ip()),
                Limit::perMinute(200)->by('global-video-preview'),
            ];
        });

        // Register model policies
        Gate::policy(BlogPost::class, BlogPostPolicy::class);
        Gate::policy(Course::class, CoursePolicy::class);
        Gate::policy(Enrollment::class, EnrollmentPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
    }
}
