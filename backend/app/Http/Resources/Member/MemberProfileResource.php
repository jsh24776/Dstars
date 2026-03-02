<?php

namespace App\Http\Resources\Member;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'fullName' => $this->full_name ?? '',
            'email' => $this->email ?? '',
            'phone' => $this->phone ?? '',
            'address' => '', // Address field not available in database yet
            'emergencyContact' => '', // Emergency contact field not available in database yet
        ];
    }
}
