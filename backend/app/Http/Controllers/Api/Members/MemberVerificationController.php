<?php

namespace App\Http\Controllers\Api\Members;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Members\ResendMemberCodeRequest;
use App\Http\Requests\Members\VerifyMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use App\Services\Members\MemberAccessService;
use App\Services\Members\MemberVerificationService;
use Illuminate\Http\JsonResponse;

class MemberVerificationController extends ApiController
{
    public function __construct(
        protected MemberVerificationService $verificationService,
        protected MemberAccessService $accessService
    ) {
    }

    public function verify(VerifyMemberRequest $request): JsonResponse
    {
        $email = strtolower($request->input('email'));
        $member = Member::where('email', $email)->first();

        if (! $member) {
            return $this->error('Invalid verification code.', 422);
        }

        if ($member->is_verified) {
            return $this->success([
                'member' => new MemberResource($member),
                'download_token' => $this->accessService->issueDownloadToken($member),
            ], 'Email already verified.');
        }

        $verified = $this->verificationService->verifyCode($member, $request->input('code'));

        if (! $verified) {
            return $this->error('Invalid or expired verification code.', 422);
        }

        $downloadToken = $this->accessService->issueDownloadToken($member);

        return $this->success([
            'member' => new MemberResource($member->refresh()),
            'download_token' => $downloadToken,
        ], 'Email verified successfully.');
    }

    public function resend(ResendMemberCodeRequest $request): JsonResponse
    {
        $email = strtolower($request->input('email'));
        $member = Member::where('email', $email)->first();

        if (! $member) {
            return $this->success([], 'If the account exists, a verification code has been sent.');
        }

        if ($member->is_verified) {
            return $this->success([
                'member' => new MemberResource($member),
            ], 'Email already verified.');
        }

        try {
            $cooldownKey = $this->cooldownKey($email, $request->ip());
            $this->verificationService->issueCode($member, $cooldownKey);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 429);
        }

        return $this->success([], 'Verification code sent.');
    }

    protected function cooldownKey(string $email, ?string $ip): string
    {
        return 'member-resend:' . ($ip ?? 'unknown') . ':' . strtolower($email);
    }
}
