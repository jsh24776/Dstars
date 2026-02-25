<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\Invoices\CancelInvoiceRequest;
use App\Http\Requests\Admin\Invoices\IndexInvoiceRequest;
use App\Http\Resources\Admin\InvoiceResource;
use App\Models\Invoice;
use App\Services\Admin\InvoiceService;
use Illuminate\Http\JsonResponse;

class InvoiceController extends ApiController
{
    public function __construct(protected InvoiceService $service)
    {
    }

    public function index(IndexInvoiceRequest $request)
    {
        $invoices = $this->service->paginate($request->validated());

        return InvoiceResource::collection($invoices);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return $this->success([
            'invoice' => new InvoiceResource($invoice->load(['member', 'payment'])),
        ]);
    }

    public function cancel(CancelInvoiceRequest $request, Invoice $invoice): JsonResponse
    {
        $request->validated();

        try {
            $invoice = $this->service->cancel($invoice);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 422);
        }

        return $this->success([
            'invoice' => new InvoiceResource($invoice->load(['member', 'payment'])),
        ], 'Invoice cancelled.');
    }
}
