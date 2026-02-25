<?php

namespace App\Http\Requests\Admin\Members;

use App\Enums\MemberStatus;
use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
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
        /** @var Member $member */
        $member = $this->route('member');

        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:120'],
            'username' => [
                'sometimes',
                'nullable',
                'string',
                'min:3',
                'max:60',
                'alpha_dash',
                Rule::unique('members', 'username')
                    ->ignore($member->id)
                    ->whereNull('deleted_at'),
            ],
            'email' => [
                'sometimes',
                'required',
                'email:rfc,dns',
                'max:190',
                Rule::unique('members', 'email')
                    ->ignore($member->id)
                    ->whereNull('deleted_at'),
            ],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
            'status' => ['sometimes', Rule::in(MemberStatus::values())],
            'membership_plan_id' => ['sometimes', 'nullable', 'integer', 'exists:membership_plans,id'],
            'is_verified' => ['sometimes', 'boolean'],
            'avatar' => ['sometimes', 'nullable', 'image', 'max:2048'],
        ];
    }
}
