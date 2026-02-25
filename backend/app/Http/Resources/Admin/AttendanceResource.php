<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
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
            'member_id' => $this->member_id,
            'check_in_date' => $this->check_in_date?->toDateString(),
            'check_in_time' => $this->check_in_time?->toIso8601String(),
            'member' => $this->whenLoaded('member', function () {
                if (! $this->member) {
                    return null;
                }

                return [
                    'id' => $this->member->id,
                    'full_name' => $this->member->full_name,
                    'email' => $this->member->email,
                    'membership_id' => $this->member->membership_id,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
