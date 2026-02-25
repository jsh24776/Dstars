<?php

namespace App\Services\Admin;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Invoice::query()->with(['member', 'payment']);

        $this->applyFilters($query, $filters);

        $sortBy = $filters['sort_by'] ?? 'issued_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    public function cancel(Invoice $invoice): Invoice
    {
        if ($invoice->status === InvoiceStatus::Paid) {
            throw new \RuntimeException('Paid invoices cannot be cancelled.');
        }

        if ($invoice->status === InvoiceStatus::Cancelled) {
            return $invoice;
        }

        $invoice->forceFill(['status' => InvoiceStatus::Cancelled])->save();

        return $invoice->refresh();
    }

    /**
     * @param Builder<Invoice> $query
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['invoice_number'])) {
            $query->where('invoice_number', 'like', '%'.$filters['invoice_number'].'%');
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('member', function (Builder $memberQuery) use ($search) {
                        $memberQuery
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['issued_from'])) {
            $query->whereDate('issued_at', '>=', $filters['issued_from']);
        }

        if (! empty($filters['issued_to'])) {
            $query->whereDate('issued_at', '<=', $filters['issued_to']);
        }

        if (! empty($filters['has_payment'])) {
            $hasPayment = filter_var($filters['has_payment'], FILTER_VALIDATE_BOOLEAN);
            $hasPayment ? $query->whereHas('payment') : $query->whereDoesntHave('payment');
        }
    }
}
