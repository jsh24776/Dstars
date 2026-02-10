<?php

namespace App\Http\Requests\Members;

use Illuminate\Foundation\Http\FormRequest;

class RegisterMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email:rfc,dns', 'max:190', 'unique:members,email'],
            'phone' => ['required', 'string', 'max:30'],
            'plan_id' => ['required', 'string', 'max:120', 'exists:membership_plans,slug'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email already exists.',
            'plan_id.exists' => 'Selected membership plan is invalid.',
        ];
    }
}
