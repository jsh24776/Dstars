<?php

namespace App\Http\Controllers\Api\Members;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Members\RegisterMemberRequest;
use App\Http\Resources\MemberResource;
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

        $member = $this->registrationService->register($request->validated(), $cooldownKey);

        return $this->success([
            'member' => new MemberResource($member),
        ], 'Registration successful. Check your email for the verification code.', 201);
    }

    protected function cooldownKey(string $email, ?string $ip): string
    {
        return 'member-resend:' . ($ip ?? 'unknown') . ':' . strtolower($email);
    }
}
