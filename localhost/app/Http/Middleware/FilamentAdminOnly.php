<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class FilamentAdminOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    $user = Auth::guard('filament')->user();

    logger()->info('Filament Admin Access Check', [
        'url' => $request->fullUrl(),
        'method' => $request->method(),
        'user_id' => $user?->id,
        'email' => $user?->email,
        'role' => $user?->role,
        'authenticated' => Auth::guard('filament')->check(),
        'session_id' => $request->session()->getId(),
        'session_cookie' => $request->cookie('filament_admin_session') !== null,
    ]);

    if (!$user || $user->role !== 'admin') {
        logger()->warning('Filament Admin Access Denied');

        Auth::guard('filament')->logout();

        return redirect()->route('filament.admin.auth.login');
    }

    return $next($request);
}
}
