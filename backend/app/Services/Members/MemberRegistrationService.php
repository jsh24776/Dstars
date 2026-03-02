<?php

namespace App\Services\Members;

use App\Models\PendingMemberRegistration;
use App\Models\MembershipPlan;
use App\Models\Member;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
            if (Schema::hasTable('users')) {
                if (\App\Models\User::where('email', strtolower($data['email']))->exists()) {
                    throw new \RuntimeException('This email already exists.');
                }
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
                    'password' => Hash::make($data['password']),
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
            if (! $pending->password) {
                throw new \RuntimeException('Registration password was not set. Please register again.');
            }

            $member = Member::create([
                'full_name' => $pending->full_name,
                'email' => strtolower($pending->email),
                'phone' => $pending->phone,
                'password' => $pending->password,
                'role' => 'member',
                'is_active' => true,
                'email_verified_at' => now(),
                'is_verified' => true,
                'membership_plan_id' => $pending->plan_id,
            ]);

            $member->forceFill([
                'membership_id' => $this->formatMembershipId($member->id),
            ])->save();

            if (Schema::hasTable('users')) {
                $user = \App\Models\User::create([
                    'name' => $member->full_name,
                    'email' => strtolower($member->email),
                    'password' => $pending->password,
                    'role' => 'member',
                    'is_active' => true,
                ]);

                $user->forceFill([
                    'email_verified_at' => now(),
                ])->save();
            }

            $pending->delete();

            return $member;
        });
    }

    protected function formatMembershipId(int $id): string
    {
        return 'DSTARS-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
