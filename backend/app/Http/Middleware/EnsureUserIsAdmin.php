<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user('sanctum');

        // Check if user is an Admin and is active
        if (! $user || ! ($user instanceof \App\Models\Admin) || ! $user->is_active) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return $next($request);
    }
}
