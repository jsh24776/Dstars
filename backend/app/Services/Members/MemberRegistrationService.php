<?php

namespace App\Services\Members;

use App\Models\PendingMemberRegistration;
use App\Models\MembershipPlan;
use App\Models\Member;
use Illuminate\Support\Facades\DB;

class MemberRegistrationService
{
    public function __construct(
        protected MemberVerificationService $verificationService
    ) {
    }

    public function register(array $data, string $cooldownKey): array
    {
        return DB::transaction(function () use ($data, $cooldownKey) {
            if (Member::where('email', strtolower($data['email']))->exists()) {
                throw new \RuntimeException('This email already exists.');
            }

            $plan = MembershipPlan::query()
                ->whereKey($data['plan_id'])
                ->where('status', 'active')
                ->first();

            if (! $plan) {
                throw new \RuntimeException('Selected membership plan is invalid.');
            }

            $pending = PendingMemberRegistration::updateOrCreate(
                ['email' => strtolower($data['email'])],
                [
                    'full_name' => $data['full_name'],
                    'phone' => $data['phone'],
                    'plan_id' => $plan->id,
                    'verification_code' => null,
                    'verification_expires_at' => null,
                    'resend_available_at' => null,
                ]
            );

            $code = $this->verificationService->issueCode($pending, $cooldownKey, true);

            return [
                'pending' => $pending,
                'code' => $code,
            ];
        });
    }

    public function finalize(PendingMemberRegistration $pending): Member
    {
        return DB::transaction(function () use ($pending) {
            if (Member::where('email', strtolower($pending->email))->exists()) {
                throw new \RuntimeException('This email already exists.');
            }

            $member = Member::create([
                'full_name' => $pending->full_name,
                'email' => strtolower($pending->email),
                'phone' => $pending->phone,
                'is_verified' => true,
                'membership_plan_id' => $pending->plan_id,
            ]);

            $member->forceFill([
                'membership_id' => $this->formatMembershipId($member->id),
            ])->save();

            $pending->delete();

            return $member;
        });
    }

    protected function formatMembershipId(int $id): string
    {
        return 'DSTARS-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
