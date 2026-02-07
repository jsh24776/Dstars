<?php

namespace App\Http\Middleware;

use App\Models\Member;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class EnsureMemberToken
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $member = $request->route('member');

        if (! $member instanceof Member) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.',
            ], 401);
        }

        $token = $request->bearerToken() ?: $request->header('X-Member-Token');

        if (! $token || ! $member->download_token_hash || ! $member->download_token_expires_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.',
            ], 401);
        }

        if (now()->gt($member->download_token_expires_at)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token expired.',
            ], 401);
        }

        if (! Hash::check($token, $member->download_token_hash)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.',
            ], 401);
        }

        return $next($request);
    }
}
