<?php

namespace App\Http\Requests\Admin\Members;

use App\Enums\MemberStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemberRequest extends FormRequest
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
            'full_name' => ['required', 'string', 'max:120'],
            'username' => [
                'nullable',
                'string',
                'min:3',
                'max:60',
                'alpha_dash',
                Rule::unique('members', 'username')->whereNull('deleted_at'),
            ],
            'email' => [
                'required',
                'email:rfc,dns',
                'max:190',
                Rule::unique('members', 'email')->whereNull('deleted_at'),
            ],
            'phone' => ['required', 'string', 'max:30'],
            'status' => ['nullable', Rule::in(MemberStatus::values())],
            'membership_plan_id' => ['nullable', 'integer', 'exists:membership_plans,id'],
            'is_verified' => ['nullable', 'boolean'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
