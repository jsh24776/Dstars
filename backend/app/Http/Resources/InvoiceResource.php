<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
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
            'invoice_number' => $this->invoice_number,
            'member_id' => $this->member_id,
            'plan_name' => $this->plan_name,
            'plan_price' => $this->plan_price,
            'registration_fee' => $this->registration_fee,
            'total_amount' => $this->total_amount,
            'status' => $this->status?->value ?? $this->status,
            'issued_at' => $this->issued_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
