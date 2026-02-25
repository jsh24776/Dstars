<?php

namespace App\Http\Requests\Admin\MembershipPlans;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMembershipPlanRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'duration' => ['required', Rule::in(['day', 'week', 'month', 'year'])],
            'duration_count' => ['required', 'integer', 'min:1', 'max:36'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'description' => ['nullable', 'string', 'max:1000'],
            'features' => ['nullable', 'array', 'max:10'],
            'features.*' => ['string', 'max:120'],
        ];
    }
}
