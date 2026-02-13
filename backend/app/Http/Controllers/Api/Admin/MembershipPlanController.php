<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\MembershipPlans\DeleteMembershipPlanRequest;
use App\Http\Requests\Admin\MembershipPlans\IndexMembershipPlanRequest;
use App\Http\Requests\Admin\MembershipPlans\StoreMembershipPlanRequest;
use App\Http\Requests\Admin\MembershipPlans\UpdateMembershipPlanRequest;
use App\Http\Requests\Admin\MembershipPlans\UpdateMembershipPlanStatusRequest;
use App\Http\Resources\Admin\MembershipPlanResource;
use App\Models\MembershipPlan;
use App\Services\Admin\MembershipPlanService;
use Illuminate\Http\Response;

class MembershipPlanController extends ApiController
{
    public function __construct(protected MembershipPlanService $service)
    {
    }

    public function index(IndexMembershipPlanRequest $request)
    {
        $plans = $this->service->paginate($request->validated());

        return MembershipPlanResource::collection($plans);
    }

    public function show(MembershipPlan $membershipPlan): MembershipPlanResource
    {
        return new MembershipPlanResource($membershipPlan);
    }

    public function store(StoreMembershipPlanRequest $request)
    {
        $plan = $this->service->create($request->validated());

        return (new MembershipPlanResource($plan))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateMembershipPlanRequest $request, MembershipPlan $membershipPlan): MembershipPlanResource
    {
        $plan = $this->service->update($membershipPlan, $request->validated());

        return new MembershipPlanResource($plan);
    }

    public function updateStatus(UpdateMembershipPlanStatusRequest $request, MembershipPlan $membershipPlan): MembershipPlanResource
    {
        $plan = $this->service->updateStatus($membershipPlan, $request->validated()['status']);

        return new MembershipPlanResource($plan);
    }

    public function destroy(DeleteMembershipPlanRequest $request, MembershipPlan $membershipPlan)
    {
        $request->validated();
        $this->service->delete($membershipPlan);

        return response()->json(['message' => 'Membership plan deleted.']);
    }
}
