<?php

namespace App\Services\Members;

use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Support\Carbon as IlluminateCarbon;

class MembershipLifecycleService
{
    public function activate(Member $member, ?IlluminateCarbon $startDate = null): Member
    {
        $member->loadMissing('membershipPlan');

        if (! $member->membershipPlan) {
            return $member;
        }

        $start = ($startDate ?? now())->copy()->startOfDay();
        $end = $this->resolveEndDate($member, $start);

        $member->forceFill([
            'membership_start_date' => $start->toDateString(),
            'membership_end_date' => $end->toDateString(),
        ])->save();

        return $member->refresh();
    }

    public function isExpired(Member $member): bool
    {
        if (! $member->membership_end_date) {
            return true;
        }

        $today = now()->startOfDay();
        $end = Carbon::parse($member->membership_end_date)->startOfDay();
        $daysRemaining = $today->diffInDays($end, false);

        return $daysRemaining <= 0;
    }

    protected function resolveEndDate(Member $member, IlluminateCarbon $start): IlluminateCarbon
    {
        $duration = (string) ($member->membershipPlan?->duration ?? 'month');
        $count = (int) ($member->membershipPlan?->duration_count ?? 1);
        $count = max(1, $count);

        return match ($duration) {
            'day' => $start->copy()->addDays($count),
            'week' => $start->copy()->addWeeks($count),
            'year' => $start->copy()->addYears($count),
            default => $start->copy()->addMonthsNoOverflow($count),
        };
    }
}

