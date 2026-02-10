<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Api\Admin\InvoiceController as AdminInvoiceController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    Route::middleware(['throttle:admin-login'])->group(function () {
        Route::get('/login', [LoginController::class, 'show'])->name('admin.login');
        Route::post('/login', [LoginController::class, 'store'])->name('admin.login.store');
    });

    Route::middleware(['auth:admin'])->group(function () {
        Route::post('/logout', [LoginController::class, 'destroy'])->name('admin.logout');
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Admin authenticated.']);
        })->name('admin.dashboard');
    });
});

Route::prefix('admin/api')
    ->middleware(['auth:admin', 'throttle:admin-members'])
    ->group(function () {
        Route::get('/members', [\App\Http\Controllers\Api\Admin\MemberController::class, 'index']);
        Route::post('/members', [\App\Http\Controllers\Api\Admin\MemberController::class, 'store']);
        Route::get('/members/{member}', [\App\Http\Controllers\Api\Admin\MemberController::class, 'show']);
        Route::match(['put', 'patch'], '/members/{member}', [\App\Http\Controllers\Api\Admin\MemberController::class, 'update']);
        Route::patch('/members/{member}/status', [\App\Http\Controllers\Api\Admin\MemberController::class, 'updateStatus']);
        Route::delete('/members/{member}', [\App\Http\Controllers\Api\Admin\MemberController::class, 'destroy']);
        Route::get('/invoices', [AdminInvoiceController::class, 'index']);
        Route::get('/payments', [AdminPaymentController::class, 'index']);
    });
