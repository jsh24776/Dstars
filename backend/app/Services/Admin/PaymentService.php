<?php

namespace App\Services\Admin;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PaymentService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Payment::query()->with(['member', 'invoice']);

        $this->applyFilters($query, $filters);

        $sortBy = $filters['sort_by'] ?? 'paid_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    /**
     * @param Builder<Payment> $query
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (! empty($filters['invoice_id'])) {
            $query->where('invoice_id', $filters['invoice_id']);
        }

        if (! empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (! empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (! empty($filters['payment_reference'])) {
            $query->where('payment_reference', 'like', '%'.$filters['payment_reference'].'%');
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('payment_reference', 'like', "%{$search}%")
                    ->orWhereHas('invoice', function (Builder $invoiceQuery) use ($search) {
                        $invoiceQuery->where('invoice_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('member', function (Builder $memberQuery) use ($search) {
                        $memberQuery
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['paid_from'])) {
            $query->whereDate('paid_at', '>=', $filters['paid_from']);
        }

        if (! empty($filters['paid_to'])) {
            $query->whereDate('paid_at', '<=', $filters['paid_to']);
        }
    }
}
