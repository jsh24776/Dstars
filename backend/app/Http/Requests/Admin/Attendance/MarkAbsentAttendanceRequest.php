<?php

namespace App\Http\Requests\Admin\Attendance;

use App\Enums\AttendanceSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MarkAbsentAttendanceRequest extends FormRequest
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
            'attendance_date' => ['required', 'date'],
            'source' => ['nullable', Rule::in(AttendanceSource::values())],
            'notes' => ['nullable', 'string', 'max:1000'],
            'allow_override' => ['nullable', 'boolean'],
        ];
    }
}
