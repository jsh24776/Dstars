<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Services\Auth\PasswordResetService;
use Illuminate\Http\JsonResponse;

class ResetPasswordController extends ApiController
{
    public function __construct(
        protected PasswordResetService $passwordResetService
    ) {
    }

    public function __invoke(ResetPasswordRequest $request): JsonResponse
    {
        $email = strtolower($request->input('email'));
        $user = User::query()
            ->where('email', $email)
            ->where('role', 'member')
            ->first();

        if (! $user) {
            return $this->error('Invalid reset code.', 422);
        }

        $success = $this->passwordResetService->reset(
            $user,
            $request->input('code'),
            $request->input('password')
        );

        if (! $success) {
            return $this->error('Invalid or expired reset code.', 422);
        }

        return $this->success([], 'Password reset successfully.');
    }
}
