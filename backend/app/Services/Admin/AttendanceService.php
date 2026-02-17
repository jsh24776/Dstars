<?php

namespace App\Services\Admin;

use App\Enums\AttendanceSource;
use App\Enums\AttendanceStatus;
use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Attendance::query()->with('member');

        $this->applyFilters($query, $filters);

        $sortBy = $filters['sort_by'] ?? 'attendance_date';
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
        $query = Attendance::query()
            ->with('member')
            ->where('member_id', $member->id);

        $this->applyFilters($query, $filters);

        $sortBy = $filters['sort_by'] ?? 'attendance_date';
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
    public function checkIn(array $data): Attendance
    {
        $attendanceDate = Carbon::parse($data['attendance_date'] ?? now())->toDateString();
        $checkInTime = $this->resolveTimestamp($attendanceDate, $data['check_in_time'] ?? null, now());
        $status = $data['status'] ?? AttendanceStatus::Present->value;
        $source = $data['source'] ?? AttendanceSource::AdminManual->value;
        $allowDuplicate = (bool) ($data['allow_duplicate'] ?? false);

        return DB::transaction(function () use ($data, $attendanceDate, $checkInTime, $status, $source, $allowDuplicate) {
            $existing = Attendance::query()
                ->where('member_id', $data['member_id'])
                ->whereDate('attendance_date', $attendanceDate)
                ->lockForUpdate()
                ->first();

            if ($existing && ! $allowDuplicate) {
                throw ValidationException::withMessages([
                    'member_id' => ['Attendance already exists for this member on '.$attendanceDate.'.'],
                ]);
            }

            if ($existing) {
                $existing->forceFill([
                    'check_in_time' => $checkInTime,
                    'status' => $status,
                    'source' => $source,
                    'notes' => array_key_exists('notes', $data) ? $data['notes'] : $existing->notes,
                ])->save();

                return $existing->refresh();
            }

            return Attendance::create([
                'member_id' => $data['member_id'],
                'attendance_date' => $attendanceDate,
                'check_in_time' => $checkInTime,
                'status' => $status,
                'source' => $source,
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }

    /**
     * @param array<string, mixed> $data
     */
    public function checkOut(array $data): Attendance
    {
        $attendanceDate = Carbon::parse($data['attendance_date'] ?? now())->toDateString();

        return DB::transaction(function () use ($data, $attendanceDate) {
            $attendance = Attendance::query()
                ->where('member_id', $data['member_id'])
                ->whereDate('attendance_date', $attendanceDate)
                ->lockForUpdate()
                ->first();

            if (! $attendance) {
                throw ValidationException::withMessages([
                    'member_id' => ['No attendance record found for checkout on '.$attendanceDate.'.'],
                ]);
            }

            if (! $attendance->check_in_time) {
                throw ValidationException::withMessages([
                    'check_out_time' => ['Cannot check out without a check-in time.'],
                ]);
            }

            if ($attendance->check_out_time) {
                throw ValidationException::withMessages([
                    'check_out_time' => ['Member has already been checked out for '.$attendanceDate.'.'],
                ]);
            }

            if (in_array(($attendance->status?->value ?? $attendance->status), [AttendanceStatus::Absent->value, AttendanceStatus::Cancelled->value], true)) {
                throw ValidationException::withMessages([
                    'status' => ['Cannot check out an attendance marked as absent or cancelled.'],
                ]);
            }

            $checkOutTime = $this->resolveTimestamp(
                $attendanceDate,
                $data['check_out_time'] ?? null,
                now()
            );

            if ($checkOutTime->lessThan($attendance->check_in_time)) {
                throw ValidationException::withMessages([
                    'check_out_time' => ['Check-out time must be greater than or equal to check-in time.'],
                ]);
            }

            $attendance->forceFill([
                'check_out_time' => $checkOutTime,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $attendance->notes,
            ])->save();

            return $attendance->refresh();
        });
    }

    /**
     * @param array<string, mixed> $data
     */
    public function markAbsent(array $data): Attendance
    {
        $attendanceDate = Carbon::parse($data['attendance_date'])->toDateString();
        $allowOverride = (bool) ($data['allow_override'] ?? false);

        return DB::transaction(function () use ($data, $attendanceDate, $allowOverride) {
            $existing = Attendance::query()
                ->where('member_id', $data['member_id'])
                ->whereDate('attendance_date', $attendanceDate)
                ->lockForUpdate()
                ->first();

            if ($existing && ! $allowOverride) {
                throw ValidationException::withMessages([
                    'member_id' => ['Attendance already exists for this member on '.$attendanceDate.'.'],
                ]);
            }

            $payload = [
                'member_id' => $data['member_id'],
                'attendance_date' => $attendanceDate,
                'check_in_time' => null,
                'check_out_time' => null,
                'status' => AttendanceStatus::Absent->value,
                'source' => $data['source'] ?? AttendanceSource::AdminManual->value,
                'notes' => $data['notes'] ?? null,
            ];

            if ($existing) {
                $existing->forceFill($payload)->save();

                return $existing->refresh();
            }

            return Attendance::create($payload);
        });
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Attendance $attendance, array $data): Attendance
    {
        return DB::transaction(function () use ($attendance, $data) {
            $memberId = (int) ($data['member_id'] ?? $attendance->member_id);
            $attendanceDate = Carbon::parse($data['attendance_date'] ?? $attendance->attendance_date)->toDateString();

            $duplicateExists = Attendance::query()
                ->where('id', '!=', $attendance->id)
                ->where('member_id', $memberId)
                ->whereDate('attendance_date', $attendanceDate)
                ->exists();

            if ($duplicateExists) {
                throw ValidationException::withMessages([
                    'member_id' => ['Another attendance record already exists for this member on '.$attendanceDate.'.'],
                ]);
            }

            $nextStatus = $data['status'] ?? ($attendance->status?->value ?? $attendance->status);

            $checkInTime = array_key_exists('check_in_time', $data)
                ? $this->resolveNullableTimestamp($attendanceDate, $data['check_in_time'])
                : $attendance->check_in_time;

            $checkOutTime = array_key_exists('check_out_time', $data)
                ? $this->resolveNullableTimestamp($attendanceDate, $data['check_out_time'])
                : $attendance->check_out_time;

            if (in_array($nextStatus, [AttendanceStatus::Absent->value, AttendanceStatus::Cancelled->value], true)) {
                $checkInTime = null;
                $checkOutTime = null;
            }

            if ($checkOutTime && ! $checkInTime) {
                throw ValidationException::withMessages([
                    'check_out_time' => ['Check-out time cannot be set without a check-in time.'],
                ]);
            }

            if ($checkOutTime && $checkInTime && $checkOutTime->lessThan($checkInTime)) {
                throw ValidationException::withMessages([
                    'check_out_time' => ['Check-out time must be greater than or equal to check-in time.'],
                ]);
            }

            $attendance->forceFill([
                'member_id' => $memberId,
                'attendance_date' => $attendanceDate,
                'check_in_time' => $checkInTime,
                'check_out_time' => $checkOutTime,
                'status' => $nextStatus,
                'source' => $data['source'] ?? ($attendance->source?->value ?? $attendance->source),
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $attendance->notes,
            ])->save();

            return $attendance->refresh();
        });
    }

    public function delete(Attendance $attendance): void
    {
        $attendance->delete();
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function summary(array $filters): array
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();
        $fromDate = Carbon::parse($filters['from_date'] ?? $monthStart)->toDateString();
        $toDate = Carbon::parse($filters['to_date'] ?? $monthEnd)->toDateString();
        $topLimit = (int) ($filters['top_limit'] ?? 10);
        $presentStatuses = [AttendanceStatus::Present->value, AttendanceStatus::Late->value];

        $totalCheckInsToday = Attendance::query()
            ->whereDate('attendance_date', $today)
            ->whereIn('status', $presentStatuses)
            ->count();

        $totalAbsencesToday = Attendance::query()
            ->whereDate('attendance_date', $today)
            ->where('status', AttendanceStatus::Absent->value)
            ->count();

        $monthlyAttendanceCount = Attendance::query()
            ->whereBetween('attendance_date', [$monthStart, $monthEnd])
            ->whereIn('status', $presentStatuses)
            ->count();

        $mostActiveMembers = Attendance::query()
            ->select('member_id', DB::raw('COUNT(*) as total_check_ins'))
            ->with('member:id,full_name,membership_id')
            ->whereBetween('attendance_date', [$fromDate, $toDate])
            ->whereIn('status', $presentStatuses)
            ->groupBy('member_id')
            ->orderByDesc('total_check_ins')
            ->limit($topLimit)
            ->get()
            ->map(static function (Attendance $attendance) {
                return [
                    'member_id' => $attendance->member_id,
                    'full_name' => $attendance->member?->full_name,
                    'membership_id' => $attendance->member?->membership_id,
                    'total_check_ins' => (int) $attendance->total_check_ins,
                ];
            })
            ->values();

        $attendanceTrends = Attendance::query()
            ->selectRaw('attendance_date, COUNT(*) as total_check_ins')
            ->whereBetween('attendance_date', [$fromDate, $toDate])
            ->whereIn('status', $presentStatuses)
            ->groupBy('attendance_date')
            ->orderBy('attendance_date')
            ->get()
            ->map(static function (Attendance $attendance) {
                return [
                    'date' => Carbon::parse($attendance->attendance_date)->toDateString(),
                    'total_check_ins' => (int) $attendance->total_check_ins,
                ];
            })
            ->values();

        $peakAttendanceTimes = Attendance::query()
            ->selectRaw('HOUR(check_in_time) as hour_of_day, COUNT(*) as total_check_ins')
            ->whereBetween('attendance_date', [$fromDate, $toDate])
            ->whereIn('status', $presentStatuses)
            ->whereNotNull('check_in_time')
            ->groupBy(DB::raw('HOUR(check_in_time)'))
            ->orderByDesc('total_check_ins')
            ->limit(5)
            ->get()
            ->map(static function (Attendance $attendance) {
                return [
                    'hour' => (int) $attendance->hour_of_day,
                    'total_check_ins' => (int) $attendance->total_check_ins,
                ];
            })
            ->values();

        return [
            'range' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'total_check_ins_today' => $totalCheckInsToday,
            'total_absences_today' => $totalAbsencesToday,
            'monthly_attendance_count' => $monthlyAttendanceCount,
            'most_active_members' => $mostActiveMembers,
            'attendance_trends' => $attendanceTrends,
            'peak_attendance_times' => $peakAttendanceTimes,
        ];
    }

    /**
     * @param Builder<Attendance> $query
     * @param array<string, mixed> $filters
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->whereHas('member', function (Builder $memberQuery) use ($search) {
                        $memberQuery
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('membership_id', 'like', "%{$search}%");
                    })
                    ->orWhere('member_id', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('attendance_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('attendance_date', '<=', $filters['date_to']);
        }
    }

    protected function resolveTimestamp(string $attendanceDate, mixed $timeString, Carbon $fallback): Carbon
    {
        if (! empty($timeString)) {
            return Carbon::parse($attendanceDate.' '.$timeString);
        }

        return $fallback->copy();
    }

    protected function resolveNullableTimestamp(string $attendanceDate, mixed $timeString): ?Carbon
    {
        if ($timeString === null || $timeString === '') {
            return null;
        }

        return Carbon::parse($attendanceDate.' '.$timeString);
    }
}

