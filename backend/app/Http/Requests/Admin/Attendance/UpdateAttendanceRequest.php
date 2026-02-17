<?php

namespace App\Http\Requests\Admin\Attendance;

use App\Enums\AttendanceSource;
use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttendanceRequest extends FormRequest
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
            'member_id' => ['sometimes', 'integer', 'exists:members,id'],
            'attendance_date' => ['sometimes', 'date'],
            'check_in_time' => ['sometimes', 'nullable', 'date_format:H:i:s'],
            'check_out_time' => ['sometimes', 'nullable', 'date_format:H:i:s'],
            'status' => ['sometimes', Rule::in(AttendanceStatus::values())],
            'source' => ['sometimes', Rule::in(AttendanceSource::values())],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
