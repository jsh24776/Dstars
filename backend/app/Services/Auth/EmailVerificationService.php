<?php

namespace App\Services\Auth;

use App\Mail\EmailVerificationCode;
use App\Models\EmailVerification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmailVerificationService
{
    public const CODE_TTL_MINUTES = 10;
    public const RESEND_COOLDOWN_SECONDS = 60;
    public const MAX_ATTEMPTS = 5;

    public function issueCode(User $user, bool $force = false): string
    {
        $verification = $user->emailVerification;

        if (! $force && $verification?->resend_available_at && now()->lt($verification->resend_available_at)) {
            throw new \RuntimeException('Please wait before requesting a new code.');
        }

        $code = $this->generateCode();

        EmailVerification::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
                'resend_available_at' => now()->addSeconds(self::RESEND_COOLDOWN_SECONDS),
                'last_sent_at' => now(),
                'attempts' => 0,
            ]
        );

        Mail::to($user->email)->send(new EmailVerificationCode($user, $code));

        return $code;
    }

    public function verifyCode(User $user, string $code): bool
    {
        $verification = $user->emailVerification;

        if (! $verification) {
            return false;
        }

        if ($verification->attempts >= self::MAX_ATTEMPTS) {
            return false;
        }

        if (now()->gt($verification->expires_at)) {
            return false;
        }

        if (! Hash::check($code, $verification->code_hash)) {
            $verification->increment('attempts');

            return false;
        }

        $verification->delete();

        return true;
    }

    protected function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
