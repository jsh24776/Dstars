<?php

namespace App\Http\Resources\Admin;

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
            'subtotal_amount' => $this->subtotal_amount,
            'discount_amount' => $this->discount_amount,
            'tax_amount' => $this->tax_amount,
            'total_amount' => $this->total_amount,
            'status' => $this->status?->value ?? $this->status,
            'payment_method' => $this->payment_method,
            'notes' => $this->notes,
            'issued_at' => $this->issued_at,
            'member' => $this->whenLoaded('member', function () {
                if (! $this->member) {
                    return null;
                }

                return [
                    'id' => $this->member->id,
                    'full_name' => $this->member->full_name,
                    'email' => $this->member->email,
                    'phone' => $this->member->phone,
                    'membership_id' => $this->member->membership_id,
                    'membership_plan' => $this->member->membershipPlan ? [
                        'id' => $this->member->membershipPlan->id,
                        'name' => $this->member->membershipPlan->name,
                    ] : null,
                ];
            }),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn ($item) => [
                    'id' => $item->id,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                ])->values();
            }),
            'payment' => $this->whenLoaded('payment', function () {
                if (! $this->payment) {
                    return null;
                }

                return [
                    'id' => $this->payment->id,
                    'payment_reference' => $this->payment->payment_reference,
                    'amount_paid' => $this->payment->amount_paid,
                    'payment_method' => $this->payment->payment_method,
                    'payment_status' => $this->payment->payment_status?->value ?? $this->payment->payment_status,
                    'paid_at' => $this->payment->paid_at,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
