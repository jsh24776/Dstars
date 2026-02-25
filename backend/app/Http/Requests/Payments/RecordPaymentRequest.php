<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => ['required', 'integer', 'exists:invoices,id'],
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
            'payment_method' => ['required', 'string', 'max:30', Rule::in(['gcash', 'maya', 'cash', 'bank_transfer'])],
        ];
    }
}
