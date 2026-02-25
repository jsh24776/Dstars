<?php

namespace App\Http\Controllers\Api\Invoices;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Invoices\CreateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Member;
use App\Services\Billing\InvoiceService;
use Illuminate\Http\JsonResponse;

class InvoiceController extends ApiController
{
    public function __construct(protected InvoiceService $service)
    {
    }

    public function store(CreateInvoiceRequest $request): JsonResponse
    {
        $member = Member::findOrFail($request->validated()['member_id']);

        try {
            $invoice = $this->service->createForMember($member);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 422);
        }

        return $this->success([
            'invoice' => new InvoiceResource($invoice),
        ], 'Invoice created.', 201);
    }

    public function showForMember(Member $member): JsonResponse
    {
        $invoice = $this->service->latestForMember($member);

        if (! $invoice) {
            return $this->error('Invoice not found.', 404);
        }

        return $this->success([
            'invoice' => new InvoiceResource($invoice),
        ]);
    }
}
