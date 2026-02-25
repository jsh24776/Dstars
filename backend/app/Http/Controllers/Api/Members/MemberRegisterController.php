<?php

namespace App\Http\Controllers\Api\Members;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Members\RegisterMemberRequest;
use App\Services\Members\MemberRegistrationService;
use Illuminate\Http\JsonResponse;

class MemberRegisterController extends ApiController
{
    public function __construct(
        protected MemberRegistrationService $registrationService
    ) {
    }

    public function __invoke(RegisterMemberRequest $request): JsonResponse
    {
        $cooldownKey = $this->cooldownKey($request->input('email'), $request->ip());

        try {
            $result = $this->registrationService->register($request->validated(), $cooldownKey);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 422);
        }

        $pending = $result['pending'];
        $code = $result['code'];

        return $this->success([
            'pending_registration' => [
                'email' => $pending->email,
            ],
            'debug_code' => app()->environment('local') ? $code : null,
        ], 'Registration successful. Check your email for the verification code.', 201);
    }

    protected function cooldownKey(string $email, ?string $ip): string
    {
        return 'member-resend:' . ($ip ?? 'unknown') . ':' . strtolower($email);
    }
}
