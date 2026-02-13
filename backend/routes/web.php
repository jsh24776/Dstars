<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Api\Admin\InvoiceController as AdminInvoiceController;
use App\Http\Controllers\Api\Admin\MembershipPlanController as AdminMembershipPlanController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\FinanceController as AdminFinanceController;
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
        Route::get('/invoices/{invoice}', [AdminInvoiceController::class, 'show']);
        Route::patch('/invoices/{invoice}/cancel', [AdminInvoiceController::class, 'cancel']);
        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);
        Route::get('/finance-summary', [AdminFinanceController::class, 'summary']);
        Route::get('/membership-plans', [AdminMembershipPlanController::class, 'index']);
        Route::post('/membership-plans', [AdminMembershipPlanController::class, 'store']);
        Route::get('/membership-plans/{membershipPlan}', [AdminMembershipPlanController::class, 'show']);
        Route::match(['put', 'patch'], '/membership-plans/{membershipPlan}', [AdminMembershipPlanController::class, 'update']);
        Route::patch('/membership-plans/{membershipPlan}/status', [AdminMembershipPlanController::class, 'updateStatus']);
        Route::delete('/membership-plans/{membershipPlan}', [AdminMembershipPlanController::class, 'destroy']);
    });
