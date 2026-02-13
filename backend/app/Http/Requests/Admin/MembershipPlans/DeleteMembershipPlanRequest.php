<?php

namespace App\Http\Requests\Admin\MembershipPlans;

use Illuminate\Foundation\Http\FormRequest;

class DeleteMembershipPlanRequest extends FormRequest
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
            'confirm' => ['required', 'accepted'],
        ];
    }
}
