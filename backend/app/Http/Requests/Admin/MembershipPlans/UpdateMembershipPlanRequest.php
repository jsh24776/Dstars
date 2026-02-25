<?php

namespace App\Http\Requests\Admin\MembershipPlans;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMembershipPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('admin')->check();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'duration' => ['sometimes', 'required', Rule::in(['day', 'week', 'month', 'year'])],
            'duration_count' => ['sometimes', 'required', 'integer', 'min:1', 'max:36'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive'])],
            'description' => ['nullable', 'string', 'max:1000'],
            'features' => ['nullable', 'array', 'max:10'],
            'features.*' => ['string', 'max:120'],
        ];
    }
}
