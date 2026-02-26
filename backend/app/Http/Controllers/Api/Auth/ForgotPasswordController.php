<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Models\User;
use App\Services\Auth\PasswordResetService;
use Illuminate\Http\JsonResponse;

class ForgotPasswordController extends ApiController
{
    public function __construct(
        protected PasswordResetService $passwordResetService
    ) {
    }

    public function __invoke(ForgotPasswordRequest $request): JsonResponse
    {
        $email = strtolower($request->input('email'));
        $user = User::query()
            ->where('email', $email)
            ->where('role', 'member')
            ->first();

        if (! $user) {
            return $this->success([], 'If the account exists, a reset code has been sent.');
        }

        try {
            $code = $this->passwordResetService->issueCode($user);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 422);
        }

        return $this->success([
            'debug_code' => app()->environment('local') ? $code : null,
        ], 'Reset code sent.');
    }
}
