<?php

namespace App\Http\Controllers\Api\Members;

use App\Http\Controllers\Api\ApiController;
use App\Models\Member;
use Illuminate\Http\JsonResponse;

class MemberValidationController extends ApiController
{
    public function __invoke(Member $member): JsonResponse
    {
        if (! $member->is_verified) {
            return $this->error('Member not found.', 404);
        }

        return $this->success([
            'membership_id' => $member->membership_id,
            'full_name' => $member->full_name,
            'is_verified' => $member->is_verified,
        ], 'Member verified.');
    }
}
