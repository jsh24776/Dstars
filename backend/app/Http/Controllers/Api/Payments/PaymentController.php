<?php

namespace App\Http\Controllers\Api\Payments;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Payments\RecordPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Invoice;
use App\Services\Billing\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends ApiController
{
    public function __construct(protected PaymentService $service)
    {
    }

    public function record(RecordPaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $invoice = Invoice::findOrFail($validated['invoice_id']);

        if (! empty($validated['member_id']) && $invoice->member_id !== (int) $validated['member_id']) {
            return $this->error('Invoice does not belong to the provided member.', 422);
        }

        try {
            $payment = $this->service->recordPayment($invoice, $validated['payment_method']);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 422);
        }

        return $this->success([
            'payment' => new PaymentResource($payment),
        ], 'Payment recorded.', 201);
    }
}
