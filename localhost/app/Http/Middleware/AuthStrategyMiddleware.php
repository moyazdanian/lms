<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthStrategyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $mode = config('auth_strategy.mode');

        if ($mode === 'cookie') {
            // Use session-based authentication
            config(['auth.defaults.guard' => 'web']);
        } else {
            // Use token-based authentication
            config(['auth.defaults.guard' => 'sanctum']);
        }
        return $next($request);
    }
}
