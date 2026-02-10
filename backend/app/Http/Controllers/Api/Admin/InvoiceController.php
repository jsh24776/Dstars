<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\Invoices\IndexInvoiceRequest;
use App\Http\Resources\Admin\InvoiceResource;
use App\Models\Invoice;

class InvoiceController extends ApiController
{
    public function index(IndexInvoiceRequest $request)
    {
        $validated = $request->validated();

        $query = Invoice::query()->with('member');

        if (! empty($validated['member_id'])) {
            $query->where('member_id', $validated['member_id']);
        }

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['issued_from'])) {
            $query->whereDate('issued_at', '>=', $validated['issued_from']);
        }

        if (! empty($validated['issued_to'])) {
            $query->whereDate('issued_at', '<=', $validated['issued_to']);
        }

        $sortBy = $validated['sort_by'] ?? 'issued_at';
        $sortDir = $validated['sort_dir'] ?? 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = $validated['per_page'] ?? 15;

        return InvoiceResource::collection(
            $query->paginate($perPage)
        );
    }
}
