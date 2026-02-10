<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\Payments\IndexPaymentRequest;
use App\Http\Resources\Admin\PaymentResource;
use App\Models\Payment;

class PaymentController extends ApiController
{
    public function index(IndexPaymentRequest $request)
    {
        $validated = $request->validated();

        $query = Payment::query()->with(['member', 'invoice']);

        if (! empty($validated['member_id'])) {
            $query->where('member_id', $validated['member_id']);
        }

        if (! empty($validated['invoice_id'])) {
            $query->where('invoice_id', $validated['invoice_id']);
        }

        if (! empty($validated['payment_status'])) {
            $query->where('payment_status', $validated['payment_status']);
        }

        if (! empty($validated['paid_from'])) {
            $query->whereDate('paid_at', '>=', $validated['paid_from']);
        }

        if (! empty($validated['paid_to'])) {
            $query->whereDate('paid_at', '<=', $validated['paid_to']);
        }

        $sortBy = $validated['sort_by'] ?? 'paid_at';
        $sortDir = $validated['sort_dir'] ?? 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = $validated['per_page'] ?? 15;

        return PaymentResource::collection(
            $query->paginate($perPage)
        );
    }
}
