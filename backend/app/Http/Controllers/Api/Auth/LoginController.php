<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class LoginController extends ApiController
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    public function __invoke(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->attemptLogin(
            $request->input('email'),
            $request->input('password')
        );

        if (! $user) {
            return $this->error('Invalid credentials.', 401);
        }

        if (! $user->hasVerifiedEmail()) {
            return $this->error('Email address is not verified.', 403);
        }

        if (! $user->is_active) {
            return $this->error('Account is inactive.', 403);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Login successful.');
    }
}
