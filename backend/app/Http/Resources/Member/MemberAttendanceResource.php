<?php

namespace App\Http\Resources\Member;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberAttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'CHK-' . str_pad($this->id, 5, '0', STR_PAD_LEFT),
            'date' => $this->attendance_date->toIso8601String(),
            'timeIn' => $this->check_in_time?->format('h:i A') ?? 'N/A',
        ];
    }
}
