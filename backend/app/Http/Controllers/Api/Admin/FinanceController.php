<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Admin\PaymentResource;
use App\Services\Admin\FinanceSummaryService;
use Illuminate\Http\JsonResponse;

class FinanceController extends ApiController
{
    public function __construct(protected FinanceSummaryService $service)
    {
    }

    public function summary(): JsonResponse
    {
        $summary = $this->service->summary();

        return $this->success([
            'total_revenue' => $summary['total_revenue'],
            'revenue_this_month' => $summary['revenue_this_month'],
            'paid_amount' => $summary['paid_amount'],
            'pending_amount' => $summary['pending_amount'],
            'active_members' => $summary['active_members'],
            'recent_payments' => PaymentResource::collection($summary['recent_payments']),
        ]);
    }
}
