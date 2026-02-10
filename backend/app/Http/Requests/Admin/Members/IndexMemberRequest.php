<?php

namespace App\Http\Requests\Admin\Members;

use App\Enums\MemberStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(MemberStatus::values())],
            'membership_plan_id' => ['nullable', 'integer', 'exists:membership_plans,id'],
            'joined_from' => ['nullable', 'date'],
            'joined_to' => ['nullable', 'date', 'after_or_equal:joined_from'],
            'sort_by' => ['nullable', Rule::in(['full_name', 'email', 'username', 'status', 'created_at'])],
            'sort_dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
