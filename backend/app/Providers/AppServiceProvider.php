<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

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
        RateLimiter::for('auth-register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('auth-login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip().':'.$request->input('email'));
        });

        RateLimiter::for('auth-verify', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip().':'.$request->input('email'));
        });

        RateLimiter::for('auth-resend', function (Request $request) {
            return Limit::perMinute(2)->by($request->ip().':'.$request->input('email'));
        });

        RateLimiter::for('member-register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip().':'.$request->input('email'));
        });

        RateLimiter::for('member-verify', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip().':'.$request->input('email'));
        });

        RateLimiter::for('member-resend', function (Request $request) {
            return Limit::perMinute(2)->by($request->ip().':'.$request->input('email'));
        });

        RateLimiter::for('member-card', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('member-validate', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });
    }
}
