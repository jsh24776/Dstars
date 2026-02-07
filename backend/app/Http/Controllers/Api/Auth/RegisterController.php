<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use App\Services\Auth\EmailVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RegisterController extends ApiController
{
    public function __construct(
        protected AuthService $authService,
        protected EmailVerificationService $verificationService
    ) {
    }

    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = $this->authService->register($request->validated());
            $this->verificationService->issueCode($user, true);

            return $user;
        });

        return $this->success([
            'user' => new UserResource($user),
        ], 'Registration successful. Check your email for the verification code.', 201);
    }
}
