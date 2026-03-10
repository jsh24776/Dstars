<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Member\UpdateMemberProfileRequest;
use App\Http\Requests\Member\UpdateMemberPasswordRequest;
use App\Http\Resources\Member\MemberProfileResource;
use App\Http\Resources\InvoiceResource;
use App\Models\ActivityLog;
use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\CheckIn;
use App\Services\Billing\InvoiceService;
use App\Services\Members\MemberAccessService;
use App\Services\Members\MembershipLifecycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MemberPortalController extends ApiController
{
    public function __construct(
        protected MembershipLifecycleService $membershipLifecycleService,
        protected MemberAccessService $accessService,
        protected InvoiceService $invoiceService
    ) {
    }

    /**
     * Get member dashboard data
     * Combines member plan info and recent attendance
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get the member associated with this user
        $member = Member::where('email', $user->email)->firstOrFail();
        
        $plan = $member->membershipPlan;
        $remainingDays = $this->getRemainingDaysCount($member);
        $planData = [
            'name' => $plan?->name ?? 'No Plan',
            'status' => $this->getMembershipStatus($member),
            'expirationDate' => $member->membership_end_date ? $member->membership_end_date->toIso8601String() : null,
            'nextPaymentDue' => $this->getNextPaymentDue($member),
            // Treat remaining sessions as remaining valid days for the plan
            'remainingSessions' => $remainingDays,
            'price' => $plan?->price !== null ? (float) $plan->price : null,
            'billingCycle' => $plan?->billing_cycle,
            'duration' => $plan?->duration,
            'durationCount' => $plan?->duration_count,
            'startDate' => $member->membership_start_date ? $member->membership_start_date->toIso8601String() : null,
        ];
        
        // Get recent check-ins
        $attendance = $member->checkIns()
            ->orderBy('check_in_date', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($att) => [
                'id' => 'CHK-' . str_pad($att->id, 5, '0', STR_PAD_LEFT),
                'date' => $att->check_in_date?->toIso8601String(),
                'timeIn' => $att->check_in_time?->format('h:i A') ?? 'N/A',
            ]);

        // Quick stats
        $visitsThisMonth = $member->checkIns()
            ->whereBetween('check_in_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->count();

        $visitsOverall = $member->checkIns()->count();

        $lastCheckIn = $member->checkIns()
            ->orderByDesc('check_in_date')
            ->orderByDesc('check_in_time')
            ->first();
        $lastCheckInDate = $lastCheckIn?->check_in_date?->toIso8601String();

        $lastInvoice = $member->invoices()->with('payment')->orderByDesc('issued_at')->first();
        $lastPaymentAmount = $lastInvoice?->payment?->amount_paid !== null
            ? (float) $lastInvoice->payment->amount_paid
            : null;
        
        return $this->success([
            'plan' => $planData,
            'attendance' => $attendance,
            'quickStats' => [
                'visitsThisMonth' => $visitsThisMonth,
                'visitsOverall' => $visitsOverall,
                'lastCheckInDate' => $lastCheckInDate,
                'lastPaymentAmount' => $lastPaymentAmount,
            ],
        ]);
    }

    /**
     * Get member profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();
        
        return $this->success([
            'profile' => new MemberProfileResource($member),
        ]);
    }

    /**
     * Update member profile
     */
    public function updateProfile(UpdateMemberProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();
        
        $validated = $request->validated();
        $changes = [];

        if (($validated['full_name'] ?? null) !== null && $validated['full_name'] !== $member->full_name) {
            $changes['full_name'] = [$member->full_name, $validated['full_name']];
        }

        if (array_key_exists('phone', $validated) && $validated['phone'] !== $member->phone) {
            $changes['phone'] = [$member->phone, $validated['phone']];
        }
        
        // Update user name
        $user->update([
            'name' => $validated['full_name'],
        ]);
        
        // Update member profile
        $member->update([
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'] ?? $member->phone,
        ]);

        ActivityLog::create([
            'actor_type' => 'member',
            'actor_id' => $member->id,
            'action' => 'member_profile_updated',
            'entity_type' => 'member',
            'entity_id' => $member->id,
            'details' => [
                'changes' => $changes,
            ],
        ]);
        
        return $this->success([
            'profile' => new MemberProfileResource($member),
        ], 'Profile updated successfully.');
    }

    /**
     * Get member current plan
     */
    public function plan(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();
        
        $plan = $member->membershipPlan;
        $remainingDays = $this->getRemainingDaysCount($member);
        $planData = [
            'name' => $plan?->name ?? 'No Plan',
            'status' => $this->getMembershipStatus($member),
            'expirationDate' => $member->membership_end_date ? $member->membership_end_date->toIso8601String() : null,
            'nextPaymentDue' => $this->getNextPaymentDue($member),
            'remainingSessions' => $remainingDays,
            'price' => $plan?->price !== null ? (float) $plan->price : null,
            'billingCycle' => $plan?->billing_cycle,
            'duration' => $plan?->duration,
            'durationCount' => $plan?->duration_count,
            'startDate' => $member->membership_start_date ? $member->membership_start_date->toIso8601String() : null,
        ];
        
        return $this->success([
            'plan' => $planData,
        ]);
    }

    /**
     * Request plan change
     */
    public function requestPlanChange(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();
        
        // Create a plan change request (you can store this in the database)
        // For now, we'll just return a success message
        // You can create a PlanChangeRequest model if needed
        
        return $this->success(
            ['message' => 'Plan change request submitted successfully.'],
            'Please wait for admin approval.',
            201
        );
    }

    /**
     * Apply for a new membership plan (for existing logged-in members)
     */
    public function applyMembership(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();

        $validated = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
        ]);

        $plan = MembershipPlan::query()
            ->whereKey($validated['plan_id'])
            ->where('status', 'active')
            ->first();

        if (! $plan) {
            return $this->error('Selected membership plan is not available.', 422);
        }

        // Disallow applying if there is already an active membership
        if (! $this->membershipLifecycleService->isExpired($member)) {
            return $this->error('You already have an active membership.', 422);
        }

        $member->forceFill([
            'membership_plan_id' => $plan->id,
        ])->save();

        // Activate membership dates based on plan duration
        $this->membershipLifecycleService->activate($member->refresh());

        try {
            $invoice = $this->invoiceService->createForMember($member->refresh());
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), 422);
        }

        $downloadToken = $this->accessService->issueDownloadToken($member->refresh());

        return $this->success([
            'member' => [
                'id' => $member->id,
                'membership_id' => $member->membership_id,
                'membership_plan_id' => $member->membership_plan_id,
                'membership_start_date' => $member->membership_start_date?->toDateString(),
                'membership_end_date' => $member->membership_end_date?->toDateString(),
            ],
            'invoice' => new InvoiceResource($invoice),
            'download_token' => $downloadToken,
        ], 'Membership applied successfully.');
    }

    /**
     * Get member attendance history
     */
    public function attendance(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();
        
        $attendance = $member->checkIns()
            ->orderBy('check_in_date', 'desc')
            ->paginate(20)
            ->through(fn($att) => [
                'id' => 'CHK-' . str_pad($att->id, 5, '0', STR_PAD_LEFT),
                'date' => $att->check_in_date?->toIso8601String(),
                'timeIn' => $att->check_in_time?->format('h:i A') ?? 'N/A',
            ]);
        
        return $this->success([
            'items' => $attendance->items(),
            'pagination' => [
                'current_page' => $attendance->currentPage(),
                'last_page' => $attendance->lastPage(),
                'per_page' => $attendance->perPage(),
                'total' => $attendance->total(),
            ],
        ]);
    }

    /**
     * Get member billing / invoices
     */
    public function billing(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();
        
        $invoices = $member->invoices()
            ->with('payment')
            ->orderBy('issued_at', 'desc')
            ->paginate(20)
            ->through(fn($invoice) => [
                'id' => $invoice->invoice_number,
                'date' => $invoice->issued_at->toIso8601String(),
                'amount' => (float) $invoice->total_amount,
                'method' => $invoice->payment?->payment_method
                    ? ucfirst($invoice->payment->payment_method)
                    : ($invoice->payment_method ?: 'Not specified'),
                'status' => $invoice->status->value,
                'receiptLabel' => 'Receipt-' . $invoice->issued_at->format('M'),
                'reference' => $invoice->payment?->payment_reference,
                'planName' => $invoice->plan_name,
            ]);
        
        return $this->success([
            'items' => $invoices->items(),
            'pagination' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    /**
     * Update member password
     */
    public function updatePassword(UpdateMemberPasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $member = Member::where('email', $user->email)->firstOrFail();
        $validated = $request->validated();
        
        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return $this->error('Current password is incorrect.', 422);
        }
        
        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        ActivityLog::create([
            'actor_type' => 'member',
            'actor_id' => $member->id,
            'action' => 'member_password_updated',
            'entity_type' => 'member',
            'entity_id' => $member->id,
            'details' => null,
        ]);
        
        return $this->success([], 'Password updated successfully.');
    }

    // Helper methods
    
    /**
     * Get membership status based on end date
     */
    private function getMembershipStatus(Member $member): string
    {
        if (!$member->membership_end_date) {
            return 'inactive';
        }
        
        $now = now();
        if ($member->membership_end_date->isFuture()) {
            return 'active';
        } else {
            return 'expired';
        }
    }

    /**
     * Get next payment due date for a member
     */
    private function getNextPaymentDue(Member $member): ?string
    {
        if (!$member->membership_end_date) {
            return null;
        }
        
        // Return the expiration date as the next payment due date
        return $member->membership_end_date->toIso8601String();
    }

    /**
     * Get remaining days until membership expires
     */
    private function getRemainingDaysCount(Member $member): ?int
    {
        if (!$member->membership_end_date) {
            return null;
        }
        
        $now = now();
        if ($member->membership_end_date->isBefore($now)) {
            return 0; // Membership has expired
        }
        
        // Calculate remaining days
        return $now->diffInDays($member->membership_end_date);
    }
}
