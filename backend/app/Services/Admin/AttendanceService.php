<?php

namespace App\Services\Admin;

use App\Models\CheckIn;
use App\Models\Member;
use App\Services\Members\MembershipLifecycleService;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    public function __construct(protected MembershipLifecycleService $membershipLifecycleService)
    {
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = CheckIn::query()->with('member.latestCheckIn');

        $this->applyFilters($query, $filters);

        $sortBy = $filters['sort_by'] ?? 'check_in_time';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function memberHistory(Member $member, array $filters): LengthAwarePaginator
    {
        $query = CheckIn::query()
            ->with('member.latestCheckIn')
            ->where('member_id', $member->id);

        $this->applyFilters($query, $filters);

        $sortBy = $filters['sort_by'] ?? 'check_in_time';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function checkIn(array $data): CheckIn
    {
        $member = Member::query()->with('membershipPlan')->findOrFail((int) $data['member_id']);

        if ($this->membershipLifecycleService->isExpired($member)) {
            throw ValidationException::withMessages([
                'member_id' => ['This member has an expired membership and cannot check in.'],
            ]);
        }

        $checkInTime = ! empty($data['check_in_time'])
            ? Carbon::parse($data['check_in_time'])
            : now();

        return DB::transaction(function () use ($member, $checkInTime) {
            return CheckIn::create([
                'member_id' => $member->id,
                'check_in_date' => $checkInTime->toDateString(),
                'check_in_time' => $checkInTime,
            ]);
        });
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function summary(array $filters): array
    {
        $today = now()->toDateString();
        $fromDate = Carbon::parse($filters['from_date'] ?? now()->startOfMonth())->toDateString();
        $toDate = Carbon::parse($filters['to_date'] ?? now()->endOfMonth())->toDateString();
        $topLimit = (int) ($filters['top_limit'] ?? 10);

        $todayTotalCheckIns = CheckIn::query()
            ->whereDate('check_in_date', $today)
            ->count();

        $todayCheckIns = CheckIn::query()
            ->with('member')
            ->whereDate('check_in_date', $today)
            ->orderByDesc('check_in_time')
            ->limit(20)
            ->get()
            ->map(static function (CheckIn $checkIn) {
                return [
                    'id' => $checkIn->id,
                    'member_id' => $checkIn->member_id,
                    'check_in_date' => $checkIn->check_in_date?->toDateString(),
                    'check_in_time' => $checkIn->check_in_time?->toIso8601String(),
                    'member' => $checkIn->member ? [
                        'id' => $checkIn->member->id,
                        'full_name' => $checkIn->member->full_name,
                        'email' => $checkIn->member->email,
                        'membership_id' => $checkIn->member->membership_id,
                    ] : null,
                ];
            })
            ->values();

        $totalActiveMembers = Member::query()
            ->whereNotNull('membership_end_date')
            ->whereDate('membership_end_date', '>', now()->toDateString())
            ->count();

        $totalExpiredMembers = Member::query()
            ->where(function (Builder $query) {
                $query
                    ->whereNull('membership_end_date')
                    ->orWhereDate('membership_end_date', '<=', now()->toDateString());
            })
            ->count();

        $membersExpiringIn3Days = Member::query()
            ->whereNotNull('membership_end_date')
            ->whereDate('membership_end_date', '>', now()->toDateString())
            ->whereDate('membership_end_date', '<=', now()->addDays(3)->toDateString())
            ->count();

        $mostActiveMembers = CheckIn::query()
            ->select('member_id', DB::raw('COUNT(*) as total_check_ins'))
            ->with('member:id,full_name,membership_id')
            ->whereBetween('check_in_date', [$fromDate, $toDate])
            ->groupBy('member_id')
            ->orderByDesc('total_check_ins')
            ->limit($topLimit)
            ->get()
            ->map(static function (CheckIn $checkIn) {
                return [
                    'member_id' => $checkIn->member_id,
                    'full_name' => $checkIn->member?->full_name,
                    'membership_id' => $checkIn->member?->membership_id,
                    'total_check_ins' => (int) $checkIn->total_check_ins,
                ];
            })
            ->values();

        $attendanceTrends = CheckIn::query()
            ->selectRaw('check_in_date, COUNT(*) as total_check_ins')
            ->whereBetween('check_in_date', [$fromDate, $toDate])
            ->groupBy('check_in_date')
            ->orderBy('check_in_date')
            ->get()
            ->map(static function (CheckIn $checkIn) {
                return [
                    'date' => Carbon::parse($checkIn->check_in_date)->toDateString(),
                    'total_check_ins' => (int) $checkIn->total_check_ins,
                ];
            })
            ->values();

        return [
            'range' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'today_total_check_ins' => $todayTotalCheckIns,
            'total_active_members' => $totalActiveMembers,
            'total_expired_members' => $totalExpiredMembers,
            'members_expiring_in_3_days' => $membersExpiringIn3Days,
            'today_check_ins' => $todayCheckIns,
            'most_active_members' => $mostActiveMembers,
            'attendance_trends' => $attendanceTrends,
        ];
    }

    /**
     * @param Builder<CheckIn> $query
     * @param array<string, mixed> $filters
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->whereHas('member', function (Builder $memberQuery) use ($search) {
                $memberQuery
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('membership_id', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('check_in_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('check_in_date', '<=', $filters['date_to']);
        }
    }
}
