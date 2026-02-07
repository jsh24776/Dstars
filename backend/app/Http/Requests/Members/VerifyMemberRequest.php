<?php

namespace App\Http\Requests\Members;

use Illuminate\Foundation\Http\FormRequest;

class VerifyMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc,dns', 'max:190'],
            'code' => ['required', 'regex:/^\d{6}$/'],
        ];
    }
}
