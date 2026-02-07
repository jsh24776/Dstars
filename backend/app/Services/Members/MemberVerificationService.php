<?php

namespace App\Services\Members;

use App\Mail\MemberVerificationCode;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class MemberVerificationService
{
    public const CODE_TTL_MINUTES = 10;
    public const RESEND_COOLDOWN_SECONDS = 60;

    public function issueCode(Member $member, string $cooldownKey, bool $force = false): string
    {
        if (! $force && RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            throw new \RuntimeException('Please wait before requesting a new code.');
        }

        $code = $this->generateCode();

        $member->forceFill([
            'verification_code' => Hash::make($code),
            'verification_expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
            'is_verified' => false,
        ])->save();

        RateLimiter::hit($cooldownKey, self::RESEND_COOLDOWN_SECONDS);

        Mail::to($member->email)->send(new MemberVerificationCode($member, $code));

        return $code;
    }

    public function verifyCode(Member $member, string $code): bool
    {
        if (! $member->verification_code || ! $member->verification_expires_at) {
            return false;
        }

        if (now()->gt($member->verification_expires_at)) {
            return false;
        }

        if (! Hash::check($code, $member->verification_code)) {
            return false;
        }

        $member->forceFill([
            'verification_code' => null,
            'verification_expires_at' => null,
            'is_verified' => true,
        ])->save();

        return true;
    }

    protected function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
