<?php

namespace App\Services\Billing;

use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Members\MembershipLifecycleService;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(protected MembershipLifecycleService $membershipLifecycleService)
    {
    }

    public function recordPayment(
        Invoice $invoice,
        string $method,
        ?string $actorType = null,
        ?int $actorId = null
    ): Payment {
        return DB::transaction(function () use ($invoice, $method, $actorType, $actorId) {
            try {
                $result = DB::select('CALL sp_record_payment(?, ?, ?, ?, ?)', [
                    $invoice->id,
                    $method,
                    now(),
                    $actorType,
                    $actorId,
                ]);
            } catch (QueryException $exception) {
                $message = $exception->errorInfo[2] ?? 'Payment could not be recorded.';
                throw new \RuntimeException($message, previous: $exception);
            }

            $paymentId = (int) (($result[0]->payment_id ?? 0));

            if (! $paymentId) {
                throw new \RuntimeException('Payment could not be recorded.');
            }

            $payment = Payment::query()
                ->with('invoice.member.membershipPlan')
                ->findOrFail($paymentId);

            if ($payment->invoice?->member) {
                $this->membershipLifecycleService->activate($payment->invoice->member, $payment->paid_at?->copy());
            }

            ActivityLog::create([
                'actor_type' => $actorType,
                'actor_id' => $actorId,
                'action' => 'membership_activated_after_payment',
                'entity_type' => 'member',
                'entity_id' => $payment->invoice?->member_id,
                'details' => [
                    'payment_id' => $payment->id,
                    'invoice_id' => $payment->invoice_id,
                ],
            ]);

            return $payment;
        });
    }
}
