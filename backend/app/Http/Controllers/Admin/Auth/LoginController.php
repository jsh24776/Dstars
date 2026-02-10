<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Requests\Admin\AdminLoginRequest;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginController
{
    public function show(Request $request)
    {
        if (Auth::guard('admin')->check()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Already authenticated.',
                    'redirect_to' => '/admin/dashboard',
                ]);
            }

            return redirect('/admin/dashboard');
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Admin login required.'], 401);
        }

        return response('Admin login required.', 401);
    }

    public function store(AdminLoginRequest $request)
    {
        if (Auth::guard('admin')->check()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Already authenticated.',
                    'redirect_to' => '/admin/dashboard',
                ]);
            }

            return redirect('/admin/dashboard');
        }

        $this->ensureIsNotRateLimited($request);

        $credentials = $request->validated();
        $remember = (bool) ($credentials['remember'] ?? false);

        $attempt = Auth::guard('admin')->attempt(
            [
                'email' => $credentials['email'],
                'password' => $credentials['password'],
                'is_active' => true,
            ],
            $remember
        );

        if (! $attempt) {
            RateLimiter::hit($this->throttleKey($request), 60);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        RateLimiter::clear($this->throttleKey($request));

        $request->session()->regenerate();

        /** @var Admin $admin */
        $admin = Auth::guard('admin')->user();
        $admin->forceFill(['last_login_at' => now()])->save();

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Authenticated.',
                'redirect_to' => '/admin/dashboard',
            ]);
        }

        return redirect()->intended('/admin/dashboard');
    }

    public function destroy(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Logged out.']);
        }

        return redirect('/admin/login');
    }

    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => ["Too many login attempts. Please try again in {$seconds} seconds."],
        ])->status(429);
    }

    protected function throttleKey(Request $request): string
    {
        return strtolower($request->input('email')).'|'.$request->ip();
    }
}
