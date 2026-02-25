<?php

namespace App\Services\Members;

use App\Mail\MemberVerificationCode;
use App\Models\PendingMemberRegistration;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

class MemberVerificationService
{
    public const CODE_TTL_MINUTES = 10;
    public const RESEND_COOLDOWN_SECONDS = 60;

    public function issueCode(PendingMemberRegistration $pending, string $cooldownKey, bool $force = false): string
    {
        if (! $force && RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            throw new \RuntimeException('Please wait before requesting a new code.');
        }

        $code = $this->generateCode();

        $pending->forceFill([
            'verification_code' => Hash::make($code),
            'verification_expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
            'resend_available_at' => now()->addSeconds(self::RESEND_COOLDOWN_SECONDS),
        ])->save();

        RateLimiter::hit($cooldownKey, self::RESEND_COOLDOWN_SECONDS);

        try {
            Mail::to($pending->email)->send(new MemberVerificationCode($pending->full_name, $code));
        } catch (Throwable $exception) {
            if (app()->environment('local')) {
                Log::warning('Member verification email delivery failed in local environment.', [
                    'email' => $pending->email,
                    'message' => $exception->getMessage(),
                ]);
            } else {
                throw new \RuntimeException('Unable to send verification email. Check SMTP settings in backend/.env.');
            }
        }

        return $code;
    }

    public function verifyCode(PendingMemberRegistration $pending, string $code): bool
    {
        if (! $pending->verification_code || ! $pending->verification_expires_at) {
            return false;
        }

        if (now()->gt($pending->verification_expires_at)) {
            return false;
        }

        if (! Hash::check($code, $pending->verification_code)) {
            return false;
        }

        $pending->forceFill([
            'verification_code' => null,
            'verification_expires_at' => null,
        ])->save();

        return true;
    }

    protected function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
