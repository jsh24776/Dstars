<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_reference' => $this->payment_reference,
            'invoice_id' => $this->invoice_id,
            'member_id' => $this->member_id,
            'amount_paid' => $this->amount_paid,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status?->value ?? $this->payment_status,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
