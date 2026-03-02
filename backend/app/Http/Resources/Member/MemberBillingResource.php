<?php

namespace App\Http\Resources\Member;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberBillingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->invoice_number,
            'date' => $this->issued_at->toIso8601String(),
            'amount' => (float) $this->total_amount,
            'method' => $this->payment_method ?? 'Not specified',
            'status' => $this->status->value,
            'receiptLabel' => 'Receipt-' . $this->issued_at->format('M'),
        ];
    }
}
