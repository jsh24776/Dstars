<?php

namespace App\Services\Billing;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Member;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function createForMember(Member $member): Invoice
    {
        return DB::transaction(function () use ($member) {
            Member::whereKey($member->id)->lockForUpdate()->first();

            $existing = Invoice::where('member_id', $member->id)->latest('id')->first();
            if ($existing) {
                return $existing;
            }

            $member->loadMissing('membershipPlan');
            if (! $member->membershipPlan) {
                throw new \RuntimeException('Membership plan is required to generate an invoice.');
            }

            $planPrice = (float) $member->membershipPlan->price;
            $registrationFee = $this->calculateFee($planPrice);
            $total = round($planPrice + $registrationFee, 2);

            $invoice = Invoice::create([
                'invoice_number' => null,
                'member_id' => $member->id,
                'plan_name' => $member->membershipPlan->name,
                'plan_price' => $planPrice,
                'registration_fee' => $registrationFee,
                'total_amount' => $total,
                'status' => InvoiceStatus::Pending,
                'issued_at' => now(),
            ]);

            $invoice->forceFill([
                'invoice_number' => $this->formatInvoiceNumber($invoice->id),
            ])->save();

            return $invoice->refresh();
        });
    }

    public function latestForMember(Member $member): ?Invoice
    {
        return $member->invoices()->latest('issued_at')->first();
    }

    protected function calculateFee(float $planPrice): float
    {
        $rate = (float) config('billing.invoice_fee_rate', 0);
        $fixed = (float) config('billing.invoice_fixed_fee', 0);

        return round(($planPrice * $rate) + $fixed, 2);
    }

    protected function formatInvoiceNumber(int $id): string
    {
        return 'DSTARS-INV-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
