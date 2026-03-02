<?php

namespace App\Http\Requests\Member;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Full name is required.',
            'full_name.string' => 'Full name must be a string.',
            'full_name.max' => 'Full name must not exceed 255 characters.',
            'phone.string' => 'Phone must be a string.',
            'phone.max' => 'Phone must not exceed 20 characters.',
        ];
    }
}
