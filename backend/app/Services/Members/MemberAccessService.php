<?php

namespace App\Services\Members;

use App\Models\Member;
use Illuminate\Support\Facades\Hash;

class MemberAccessService
{
    public const TOKEN_TTL_HOURS = 24;

    public function issueDownloadToken(Member $member): string
    {
        $token = bin2hex(random_bytes(32));

        $member->forceFill([
            'download_token_hash' => Hash::make($token),
            'download_token_expires_at' => now()->addHours(self::TOKEN_TTL_HOURS),
        ])->save();

        return $token;
    }
}
