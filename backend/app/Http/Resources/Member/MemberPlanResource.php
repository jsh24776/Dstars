<?php

namespace App\Http\Resources\Member;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberPlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this['name'] ?? 'No Plan',
            'status' => $this['status'] ?? 'inactive',
            'expirationDate' => $this['expirationDate'] ?? null,
            'nextPaymentDue' => $this['nextPaymentDue'] ?? null,
            'remainingSessions' => $this['remainingSessions'] ?? null,
        ];
    }
}
