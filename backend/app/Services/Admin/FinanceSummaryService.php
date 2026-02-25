<?php

namespace App\Services\Admin;

use App\Enums\InvoiceStatus;
use App\Enums\MemberStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Support\Carbon;

class FinanceSummaryService
{
    public function summary(): array
    {
        $paidStatus = PaymentStatus::Confirmed->value;
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $totalRevenue = Payment::where('payment_status', $paidStatus)->sum('amount_paid');
        $revenueThisMonth = Payment::where('payment_status', $paidStatus)
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->sum('amount_paid');

        $paidAmount = Invoice::where('status', InvoiceStatus::Paid)->sum('total_amount');
        $pendingAmount = Invoice::where('status', InvoiceStatus::Pending)->sum('total_amount');

        $activeMembers = Member::where('status', MemberStatus::Active)->count();

        $recentPayments = Payment::with(['member', 'invoice'])
            ->where('payment_status', $paidStatus)
            ->orderByDesc('paid_at')
            ->limit(5)
            ->get();

        return [
            'total_revenue' => $totalRevenue,
            'revenue_this_month' => $revenueThisMonth,
            'paid_amount' => $paidAmount,
            'pending_amount' => $pendingAmount,
            'active_members' => $activeMembers,
            'recent_payments' => $recentPayments,
        ];
    }
}
