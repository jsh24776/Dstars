<?php

namespace App\Http\Requests\Admin\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class DeleteAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('admin')->check() || ($this->user()?->isAdmin() ?? false);
    }

    public function rules(): array
    {
        return [];
    }
}
