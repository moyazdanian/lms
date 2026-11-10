<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminAuditLog
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::guard('filament')->user();

        // Log admin panel access
        if ($user && $user->role === 'admin') {
            Log::channel('admin_audit')->info('Admin panel access', [
                'admin_id' => $user->id,
                'admin_email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'timestamp' => now()->toISOString(),
            ]);
        }

        $response = $next($request);

        // Log sensitive actions (POST/PUT/DELETE on admin routes)
        if ($user && $user->role === 'admin' && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            Log::channel('admin_audit')->info('Admin action performed', [
                'admin_id' => $user->id,
                'admin_email' => $user->email,
                'action' => $request->method(),
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'timestamp' => now()->toISOString(),
                // Don't log sensitive data like passwords
                'input' => $this->sanitizeInput($request->all()),
            ]);
        }

        return $response;
    }

    protected function sanitizeInput(array $input): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'secret', 'key'];

        return collect($input)->map(function ($value, $key) use ($sensitiveKeys) {
            if (in_array(strtolower($key), $sensitiveKeys)) {
                return '[REDACTED]';
            }
            return $value;
        })->toArray();
    }
}