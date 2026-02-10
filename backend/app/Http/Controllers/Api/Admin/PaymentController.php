<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\Payments\IndexPaymentRequest;
use App\Http\Resources\Admin\PaymentResource;
use App\Models\Payment;
use App\Services\Admin\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends ApiController
{
    public function __construct(protected PaymentService $service)
    {
    }

    public function index(IndexPaymentRequest $request)
    {
        $payments = $this->service->paginate($request->validated());

        return PaymentResource::collection($payments);
    }

    public function show(Payment $payment): JsonResponse
    {
        return $this->success([
            'payment' => new PaymentResource($payment->load(['member', 'invoice'])),
        ]);
    }
}
