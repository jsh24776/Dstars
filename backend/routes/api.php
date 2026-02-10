<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\VerificationController;
use App\Http\Controllers\Api\Members\MemberRegisterController;
use App\Http\Controllers\Api\Members\MemberCardController;
use App\Http\Controllers\Api\Members\MemberValidationController;
use App\Http\Controllers\Api\Members\MemberVerificationController;
use App\Http\Controllers\Api\Admin\MemberController as AdminMemberController;
use App\Http\Controllers\Api\Admin\InvoiceController as AdminInvoiceController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\FinanceController as AdminFinanceController;
use App\Http\Controllers\Api\Invoices\InvoiceController as InvoiceController;
use App\Http\Controllers\Api\Payments\PaymentController as PaymentController;
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

    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'verified', 'admin', 'throttle:admin-members'])
        ->group(function () {
            Route::get('/members', [AdminMemberController::class, 'index']);
            Route::post('/members', [AdminMemberController::class, 'store']);
            Route::get('/members/{member}', [AdminMemberController::class, 'show']);
            Route::match(['put', 'patch'], '/members/{member}', [AdminMemberController::class, 'update']);
            Route::patch('/members/{member}/status', [AdminMemberController::class, 'updateStatus']);
            Route::delete('/members/{member}', [AdminMemberController::class, 'destroy']);
            Route::get('/invoices', [AdminInvoiceController::class, 'index']);
            Route::get('/payments', [AdminPaymentController::class, 'index']);
            Route::get('/invoices/{invoice}', [AdminInvoiceController::class, 'show']);
            Route::patch('/invoices/{invoice}/cancel', [AdminInvoiceController::class, 'cancel']);
            Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);
            Route::get('/finance-summary', [AdminFinanceController::class, 'summary']);
        });
});

Route::post('/invoices/create', [InvoiceController::class, 'store'])
    ->middleware('throttle:member-invoice');
Route::get('/members/{member}/invoice', [InvoiceController::class, 'showForMember'])
    ->middleware('throttle:member-invoice');
Route::post('/payments/record', [PaymentController::class, 'record'])
    ->middleware('throttle:member-payment');

Route::prefix('members')->group(function () {
    Route::post('/register', MemberRegisterController::class)
        ->middleware('throttle:member-register');
    Route::post('/verify', [MemberVerificationController::class, 'verify'])
        ->middleware('throttle:member-verify');
    Route::post('/resend-code', [MemberVerificationController::class, 'resend'])
        ->middleware('throttle:member-resend');
    Route::get('/{member}/virtual-card', [MemberCardController::class, 'download'])
        ->middleware(['member.token', 'throttle:member-card']);
    Route::get('/{member}/validate', MemberValidationController::class)
        ->middleware(['signed', 'throttle:member-validate'])
        ->name('members.validate');
});
