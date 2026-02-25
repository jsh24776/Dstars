<?php

namespace App\Services\Admin;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\Payment;
use App\Services\Members\MembershipLifecycleService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(protected MembershipLifecycleService $membershipLifecycleService)
    {
    }

    public function create(array $payload): Invoice
    {
        return DB::transaction(function () use ($payload) {
            $member = Member::query()
                ->with('membershipPlan')
                ->lockForUpdate()
                ->findOrFail($payload['member_id']);

            if (! $member->membershipPlan) {
                throw new \RuntimeException('Selected member does not have a membership plan.');
            }

            $items = array_map(function (array $item) {
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $lineTotal = round($quantity * $unitPrice, 2);

                return [
                    'description' => $item['description'],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }, $payload['items']);

            $subtotal = round(array_reduce($items, function (float $carry, array $item) {
                return $carry + (float) $item['line_total'];
            }, 0.0), 2);
            $discount = round((float) ($payload['discount_amount'] ?? 0), 2);
            $tax = round((float) ($payload['tax_amount'] ?? 0), 2);
            $grandTotal = round(max(0, $subtotal - $discount + $tax), 2);

            $planPrice = (float) $member->membershipPlan->price;
            $status = $payload['payment_status'] === 'paid'
                ? InvoiceStatus::Paid
                : InvoiceStatus::Pending;

            $invoice = Invoice::create([
                'invoice_number' => null,
                'member_id' => $member->id,
                'plan_name' => $member->membershipPlan->name,
                'plan_price' => $planPrice,
                'registration_fee' => 0,
                'subtotal_amount' => $subtotal,
                'discount_amount' => $discount,
                'tax_amount' => $tax,
                'total_amount' => $grandTotal,
                'status' => $status,
                'payment_method' => $payload['payment_method'],
                'notes' => $payload['notes'] ?? null,
                'issued_at' => $payload['issued_at'] ?? now(),
            ]);

            $invoice->forceFill([
                'invoice_number' => $this->formatInvoiceNumber($invoice->id),
            ])->save();

            foreach ($items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $item['line_total'],
                ]);
            }

            if ($status === InvoiceStatus::Paid) {
                $payment = Payment::create([
                    'payment_reference' => null,
                    'invoice_id' => $invoice->id,
                    'member_id' => $member->id,
                    'amount_paid' => $grandTotal,
                    'payment_method' => $payload['payment_method'],
                    'payment_status' => PaymentStatus::Confirmed,
                    'paid_at' => $payload['issued_at'] ?? now(),
                ]);

                $payment->forceFill([
                    'payment_reference' => $this->formatPaymentReference($payment->id),
                ])->save();

                $this->membershipLifecycleService->activate($member, $payment->paid_at?->copy());
            }

            return $invoice->refresh();
        });
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Invoice::query()->with(['member.membershipPlan', 'payment', 'items']);

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

    protected function formatInvoiceNumber(int $id): string
    {
        return 'DSTARS-INV-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }

    protected function formatPaymentReference(int $id): string
    {
        return 'DSTARS-PAY-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
