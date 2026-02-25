<?php

namespace App\Http\Resources\Admin;

use Carbon\Carbon;
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
        $daysRemaining = null;
        $membershipStatus = 'expired';

        if ($this->membership_end_date) {
            $daysRemaining = now()->startOfDay()->diffInDays(
                Carbon::parse($this->membership_end_date)->startOfDay(),
                false
            );
            $membershipStatus = $daysRemaining > 0 ? 'active' : 'expired';
        }

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
                    $fallbackPlanName = $this->relationLoaded('latestInvoice') && $this->latestInvoice
                        ? $this->latestInvoice->plan_name
                        : null;

                    if (! $fallbackPlanName) {
                        return null;
                    }

                    return [
                        'id' => null,
                        'name' => $fallbackPlanName,
                        'price' => $this->latestInvoice->plan_price ?? null,
                        'duration' => null,
                        'duration_count' => null,
                    ];
                }

                return [
                    'id' => $this->membershipPlan->id,
                    'name' => $this->membershipPlan->name,
                    'price' => $this->membershipPlan->price,
                    'duration' => $this->membershipPlan->duration,
                    'duration_count' => $this->membershipPlan->duration_count,
                ];
            }),
            'membership_start_date' => $this->membership_start_date?->toDateString(),
            'membership_end_date' => $this->membership_end_date?->toDateString(),
            'membership_status' => $membershipStatus,
            'days_remaining' => $daysRemaining,
            'last_check_in' => $this->whenLoaded('latestCheckIn', function () {
                if (! $this->latestCheckIn) {
                    return null;
                }

                return [
                    'check_in_date' => $this->latestCheckIn->check_in_date?->toDateString(),
                    'check_in_time' => $this->latestCheckIn->check_in_time?->toIso8601String(),
                ];
            }),
            'is_inactive' => $membershipStatus === 'expired',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
