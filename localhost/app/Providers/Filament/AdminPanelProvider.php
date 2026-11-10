<?php

namespace App\Providers\Filament;

use App\Http\Middleware\AdminAuditLog;
use App\Http\Middleware\FilamentAdminOnly;
use App\Http\Middleware\FilamentStartSession;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use App\Filament\Pages\Dashboard;
use App\Models\General_setting;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use App\Filament\Widgets\AdminOverviewStats;
use App\Filament\Widgets\SalesTrendChart;
use App\Filament\Widgets\TopInstructorsChart;
use App\Filament\Widgets\LatestCourseSales;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        // Panel branding comes from the admin General Settings row. Wrapped in
        // try/catch because the panel resolves before `php artisan migrate`
        // on a fresh install, when the settings table does not exist yet.
        try {
            $settings = General_setting::query()->first();
        } catch (\Throwable) {
            $settings = null;
        }

        // NOTE: no early `return` here — every call mutates $panel and the
        // single return happens at the end of the method, AFTER the full
        // configuration (resources, pages, middleware) has been applied.
        // An early return previously skipped the middleware stack (session
        // + CSRF) and broke the whole panel with 419 errors.
        $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->unsavedChangesAlerts()
            ->authGuard('filament')
            ->authPasswordBroker('users')
            ->brandName((string) ($settings?->site_name ?: config('app.name', 'LMS')))
            ->colors([
                'primary' => Color::Amber,
            ]);

        // Logo and favicon are optional: only applied when the admin uploaded
        // them in General Settings. Applied after the fluent chain so the
        // Panel object is mutated regardless of condition evaluation order.
        if (filled($settings?->logo)) {
            $panel->brandLogo(url('storage/' . $settings->logo))
                // Keeps a tall/awkward logo from stretching the sidebar.
                ->brandLogoHeight('2rem');
        }

        if (filled($settings?->faveicon)) {
            $panel->favicon(url('storage/' . $settings->faveicon));
        }

        return $panel
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            // The dashboard is the first item of the sidebar — before every
            // resource group.
            ->navigationGroups([
                'Courses',
                'Payments',
                'Orders',
                'Content',
                'Certificates',
                'Users',
                'Coupons',
                'Communication',
                'Settings',
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->authenticatedRoutes(function (): void {
                Route::get('/media/lessons/{lesson}/video', [\App\Http\Controllers\FilamentMediaController::class, 'lessonVideo'])
                    ->name('media.lesson-video');
                Route::get('/media/courses/{course}/preview-video', [\App\Http\Controllers\FilamentMediaController::class, 'coursePreview'])
                    ->name('media.course-preview');
                Route::get('/media/edit-requests/{editRequest}/preview-video/{which}', [\App\Http\Controllers\FilamentMediaController::class, 'editRequestPreview'])
                    ->name('media.edit-request-preview');
            })
            ->widgets([
                AdminOverviewStats::class,
                SalesTrendChart::class,
                TopInstructorsChart::class,
                LatestCourseSales::class,
                AccountWidget::class,
            ])
            // ->viteTheme('resources/css/filament/admin/theme.css')
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                FilamentStartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
                AdminAuditLog::class,
            ])
            ->authMiddleware([
                Authenticate::class,
                FilamentAdminOnly::class,
            ]);
    }
}
