<?php

namespace App\Http\Requests\Admin\Attendance;

use App\Enums\AttendanceSource;
use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckInAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('admin')->check() || ($this->user()?->isAdmin() ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'attendance_date' => ['nullable', 'date'],
            'check_in_time' => ['nullable', 'date_format:H:i:s'],
            'status' => ['nullable', Rule::in([AttendanceStatus::Present->value, AttendanceStatus::Late->value])],
            'source' => ['nullable', Rule::in(AttendanceSource::values())],
            'notes' => ['nullable', 'string', 'max:1000'],
            'allow_duplicate' => ['nullable', 'boolean'],
        ];
    }
}
