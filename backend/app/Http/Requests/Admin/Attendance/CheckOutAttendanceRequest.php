<?php

namespace App\Http\Requests\Admin\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class CheckOutAttendanceRequest extends FormRequest
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
            'check_out_time' => ['nullable', 'date_format:H:i:s'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
