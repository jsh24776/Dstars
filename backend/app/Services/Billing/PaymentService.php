<?php

namespace App\Services\Billing;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Members\MembershipLifecycleService;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(protected MembershipLifecycleService $membershipLifecycleService)
    {
    }

    public function recordPayment(Invoice $invoice, string $method): Payment
    {
        return DB::transaction(function () use ($invoice, $method) {
            $invoice = Invoice::query()
                ->with('member.membershipPlan')
                ->whereKey($invoice->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($invoice->status === InvoiceStatus::Paid) {
                throw new \RuntimeException('Invoice is already marked as paid.');
            }

            if ($invoice->payment()->exists()) {
                throw new \RuntimeException('Payment already recorded for this invoice.');
            }

            $payment = Payment::create([
                'payment_reference' => null,
                'invoice_id' => $invoice->id,
                'member_id' => $invoice->member_id,
                'amount_paid' => $invoice->total_amount,
                'payment_method' => strtolower($method),
                'payment_status' => PaymentStatus::Confirmed,
                'paid_at' => now(),
            ]);

            $payment->forceFill([
                'payment_reference' => $this->formatPaymentReference($payment->id),
            ])->save();

            $invoice->forceFill([
                'status' => InvoiceStatus::Paid,
            ])->save();

            if ($invoice->member) {
                $this->membershipLifecycleService->activate($invoice->member, $payment->paid_at?->copy());
            }

            return $payment->refresh();
        });
    }

    protected function formatPaymentReference(int $id): string
    {
        return 'DSTARS-PAY-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
