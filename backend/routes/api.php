<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\VerificationController;
use App\Http\Controllers\Api\Members\MemberRegisterController;
use App\Http\Controllers\Api\Members\MemberVerificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', RegisterController::class)
            ->middleware('throttle:auth-register');
        Route::post('/login', LoginController::class)
            ->middleware('throttle:auth-login');
        Route::post('/verify-email', [VerificationController::class, 'verify'])
            ->middleware('throttle:auth-verify');
        Route::post('/resend-code', [VerificationController::class, 'resend'])
            ->middleware('throttle:auth-resend');

        Route::post('/logout', LogoutController::class)
            ->middleware(['auth:sanctum', 'verified']);
    });

    Route::get('/me', MeController::class)
        ->middleware(['auth:sanctum', 'verified']);
});

Route::prefix('members')->group(function () {
    Route::post('/register', MemberRegisterController::class)
        ->middleware('throttle:member-register');
    Route::post('/verify', [MemberVerificationController::class, 'verify'])
        ->middleware('throttle:member-verify');
    Route::post('/resend-code', [MemberVerificationController::class, 'resend'])
        ->middleware('throttle:member-resend');
});
