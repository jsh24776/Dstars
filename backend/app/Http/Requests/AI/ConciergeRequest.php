<?php

namespace App\Http\Requests\AI;

use Illuminate\Foundation\Http\FormRequest;

class ConciergeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxChars = (int) config('ai.concierge.max_input_chars', 600);

        return [
            'goal' => ['required', 'string', 'min:8', 'max:'.$maxChars],
        ];
    }

    public function messages(): array
    {
        return [
            'goal.required' => 'Please share your fitness goal.',
            'goal.min' => 'Please provide a bit more detail so the concierge can help.',
            'goal.max' => 'Your goal is too long. Please keep it concise.',
        ];
    }
}
