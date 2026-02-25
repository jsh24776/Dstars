<?php

namespace App\Services\Members;

use App\Models\MembershipPlan;
use App\Models\Member;
use Illuminate\Support\Facades\DB;

class MemberRegistrationService
{
    public function __construct(
        protected MemberVerificationService $verificationService
    ) {
    }

    public function register(array $data, string $cooldownKey): Member
    {
        return DB::transaction(function () use ($data, $cooldownKey) {
            $plan = MembershipPlan::query()
                ->whereKey($data['plan_id'])
                ->where('status', 'active')
                ->first();

            if (! $plan) {
                throw new \RuntimeException('Selected membership plan is invalid.');
            }

            $member = Member::create([
                'full_name' => $data['full_name'],
                'email' => strtolower($data['email']),
                'phone' => $data['phone'],
                'is_verified' => false,
                'membership_plan_id' => $plan->id,
            ]);

            $member->forceFill([
                'membership_id' => $this->formatMembershipId($member->id),
            ])->save();

            $this->verificationService->issueCode($member, $cooldownKey, true);

            return $member;
        });
    }

    protected function formatMembershipId(int $id): string
    {
        return 'DSTARS-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
