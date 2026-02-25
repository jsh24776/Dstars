<?php

namespace App\Http\Controllers\Api\MembershipPlans;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\MembershipPlanResource;
use App\Models\MembershipPlan;
use Illuminate\Http\JsonResponse;

class MembershipPlanController extends ApiController
{
    public function index(): JsonResponse
    {
        $plans = MembershipPlan::query()
            ->active()
            ->orderBy('price')
            ->get();

        return $this->success([
            'plans' => MembershipPlanResource::collection($plans)->resolve(),
        ]);
    }
}
