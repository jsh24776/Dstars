<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
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
            'full_name' => $this->full_name,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'membership_id' => $this->membership_id,
            'status' => $this->status?->value ?? $this->status,
            'is_verified' => $this->is_verified,
            'profile_image_url' => $this->profile_image_url,
            'membership_plan' => $this->whenLoaded('membershipPlan', function () {
                if (! $this->membershipPlan) {
                    return null;
                }

                return [
                    'id' => $this->membershipPlan->id,
                    'name' => $this->membershipPlan->name,
                    'price' => $this->membershipPlan->price,
                    'billing_cycle' => $this->membershipPlan->billing_cycle,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
