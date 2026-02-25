<?php

namespace App\Http\Requests\Admin\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceSummaryRequest extends FormRequest
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
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
            'top_limit' => ['nullable', 'integer', 'min:1', 'max:25'],
        ];
    }
}
