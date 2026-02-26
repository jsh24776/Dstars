<?php

namespace App\Services\Auth;

use App\Mail\PasswordResetCode;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class PasswordResetService
{
    public const CODE_TTL_MINUTES = 10;

    public function issueCode(User $user): string
    {
        $code = $this->generateCode();

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => strtolower($user->email)],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        try {
            Mail::to($user->email)->send(new PasswordResetCode($user, $code));
        } catch (Throwable $exception) {
            if (app()->environment('local')) {
                Log::warning('Password reset email delivery failed in local environment.', [
                    'email' => $user->email,
                    'message' => $exception->getMessage(),
                ]);
            } else {
                throw new \RuntimeException('Unable to send reset code. Check SMTP settings in backend/.env.');
            }
        }

        return $code;
    }

    public function reset(User $user, string $code, string $password): bool
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', strtolower($user->email))
            ->first();

        if (! $record) {
            return false;
        }

        $createdAt = $record->created_at ? \Carbon\Carbon::parse($record->created_at) : null;
        if (! $createdAt || now()->gt($createdAt->addMinutes(self::CODE_TTL_MINUTES))) {
            return false;
        }

        if (! Hash::check($code, $record->token)) {
            return false;
        }

        $user->forceFill([
            'password' => $password,
        ])->save();

        DB::table('password_reset_tokens')
            ->where('email', strtolower($user->email))
            ->delete();

        return true;
    }

    protected function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
