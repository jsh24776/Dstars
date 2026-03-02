<?php

namespace App\Http\Requests\Members;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:190',
                'unique:members,email',
            ],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'plan_id' => [
                'required',
                'integer',
                Rule::exists('membership_plans', 'id')->where('status', 'active'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email already exists.',
            'password.confirmed' => 'Password confirmation does not match.',
            'password.min' => 'Password must be at least 8 characters.',
            'plan_id.exists' => 'Selected membership plan is invalid.',
        ];
    }
}
