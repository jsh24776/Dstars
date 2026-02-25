<?php

namespace App\Http\Requests\Admin\Invoices;

use App\Enums\InvoiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
            'status' => ['nullable', Rule::in(InvoiceStatus::values())],
            'invoice_number' => ['nullable', 'string', 'max:40'],
            'search' => ['nullable', 'string', 'max:190'],
            'issued_from' => ['nullable', 'date'],
            'issued_to' => ['nullable', 'date', 'after_or_equal:issued_from'],
            'sort_by' => ['nullable', Rule::in(['issued_at', 'total_amount', 'status', 'created_at'])],
            'sort_dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'has_payment' => ['nullable', 'boolean'],
        ];
    }
}
