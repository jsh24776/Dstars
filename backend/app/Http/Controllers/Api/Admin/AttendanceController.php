<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\Attendance\AttendanceSummaryRequest;
use App\Http\Requests\Admin\Attendance\CheckInAttendanceRequest;
use App\Http\Requests\Admin\Attendance\IndexAttendanceRequest;
use App\Http\Requests\Admin\Attendance\IndexMemberAttendanceHistoryRequest;
use App\Http\Resources\Admin\AttendanceResource;
use App\Models\Member;
use App\Services\Admin\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AttendanceController extends ApiController
{
    public function __construct(protected AttendanceService $service)
    {
    }

    public function index(IndexAttendanceRequest $request)
    {
        $records = $this->service->paginate($request->validated());

        return AttendanceResource::collection($records);
    }

    public function checkIn(CheckInAttendanceRequest $request)
    {
        $attendance = $this->service->checkIn($request->validated());

        return (new AttendanceResource($attendance->load('member')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function showMemberHistory(IndexMemberAttendanceHistoryRequest $request, Member $member)
    {
        $records = $this->service->memberHistory($member, $request->validated());

        return AttendanceResource::collection($records);
    }

    public function summary(AttendanceSummaryRequest $request): JsonResponse
    {
        return $this->success($this->service->summary($request->validated()));
    }
}
