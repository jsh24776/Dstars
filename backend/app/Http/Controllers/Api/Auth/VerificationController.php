<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Auth\ResendVerificationCodeRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Services\Auth\EmailVerificationService;
use Illuminate\Http\JsonResponse;
use App\Models\User;

class VerificationController extends ApiController
{
    public function __construct(
        protected EmailVerificationService $verificationService
    ) {
    }

    public function verify(VerifyEmailRequest $request): JsonResponse
    {
        $email = strtolower($request->input('email'));
        $user = User::where('email', $email)->first();

        if (! $user) {
            return $this->error('Invalid verification code.', 422);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success([], 'Email already verified.');
        }

        $verified = $this->verificationService->verifyCode($user, $request->input('code'));

        if (! $verified) {
            return $this->error('Invalid or expired verification code.', 422);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'is_active' => true,
        ])->save();

        return $this->success([], 'Email verified successfully.');
    }

    public function resend(ResendVerificationCodeRequest $request): JsonResponse
    {
        $email = strtolower($request->input('email'));
        $user = User::where('email', $email)->first();

        if (! $user || $user->hasVerifiedEmail()) {
            return $this->success([], 'If the account exists, a verification code has been sent.');
        }

        try {
            $this->verificationService->issueCode($user);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 429);
        }

        return $this->success([], 'Verification code sent.');
    }
}
