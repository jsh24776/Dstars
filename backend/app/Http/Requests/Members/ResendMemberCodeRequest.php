<?php

namespace App\Http\Requests\Members;

use Illuminate\Foundation\Http\FormRequest;

class ResendMemberCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc,dns', 'max:190'],
        ];
    }
}
