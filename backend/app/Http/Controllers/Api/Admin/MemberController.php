<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\Members\DeleteMemberRequest;
use App\Http\Requests\Admin\Members\IndexMemberRequest;
use App\Http\Requests\Admin\Members\StoreMemberRequest;
use App\Http\Requests\Admin\Members\UpdateMemberRequest;
use App\Http\Requests\Admin\Members\UpdateMemberStatusRequest;
use App\Http\Resources\Admin\MemberResource;
use App\Models\Member;
use App\Services\Admin\MemberService;
use Illuminate\Http\Response;

class MemberController extends ApiController
{
    public function __construct(protected MemberService $service)
    {
    }

    public function index(IndexMemberRequest $request)
    {
        $this->authorize('viewAny', Member::class);

        $validated = $request->validated();

        $query = Member::query()->with('membershipPlan');

        if (! empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['membership_plan_id'])) {
            $query->where('membership_plan_id', $validated['membership_plan_id']);
        }

        if (! empty($validated['joined_from'])) {
            $query->whereDate('created_at', '>=', $validated['joined_from']);
        }

        if (! empty($validated['joined_to'])) {
            $query->whereDate('created_at', '<=', $validated['joined_to']);
        }

        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortDir = $validated['sort_dir'] ?? 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = $validated['per_page'] ?? 15;

        return MemberResource::collection(
            $query->paginate($perPage)
        );
    }

    public function store(StoreMemberRequest $request)
    {
        $this->authorize('create', Member::class);

        $member = $this->service->create($request->validated());

        return (new MemberResource($member->load('membershipPlan')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Member $member)
    {
        $this->authorize('view', $member);

        return new MemberResource($member->load('membershipPlan'));
    }

    public function update(UpdateMemberRequest $request, Member $member)
    {
        $this->authorize('update', $member);

        $member = $this->service->update($member, $request->validated());

        return new MemberResource($member->load('membershipPlan'));
    }

    public function updateStatus(UpdateMemberStatusRequest $request, Member $member)
    {
        $this->authorize('update', $member);

        $member = $this->service->updateStatus($member, $request->validated()['status']);

        return new MemberResource($member->load('membershipPlan'));
    }

    public function destroy(DeleteMemberRequest $request, Member $member)
    {
        $this->authorize('delete', $member);

        $request->validated();

        $this->service->delete($member);

        return response()->json(['message' => 'Member deleted.']);
    }
}
