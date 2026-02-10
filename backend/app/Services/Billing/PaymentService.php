<?php

namespace App\Services\Billing;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function recordPayment(Invoice $invoice, string $method): Payment
    {
        return DB::transaction(function () use ($invoice, $method) {
            $invoice = Invoice::whereKey($invoice->id)->lockForUpdate()->firstOrFail();

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

            return $payment->refresh();
        });
    }

    protected function formatPaymentReference(int $id): string
    {
        return 'DSTARS-PAY-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
