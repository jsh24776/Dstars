import React, { useMemo, useState } from 'react';
import type { ApplyMembershipResult, MemberPlanSummary, RecordMemberPaymentResult } from '../../services/memberPortalService';
import type { MembershipPlan } from '../../types';

interface MemberMembershipProps {
  plan: MemberPlanSummary;
  onRequestPlanChange: () => void;
  availablePlans: MembershipPlan[];
  isSubmitting: boolean;
  onApplyMembership: (planId: number) => Promise<void> | void;
  onPayInvoice: (method: 'gcash' | 'maya') => Promise<void> | void;
  applyResult: ApplyMembershipResult | null;
  paymentResult: RecordMemberPaymentResult | null;
  memberId: number;
}

const MemberMembership: React.FC<MemberMembershipProps> = ({
  plan,
  onRequestPlanChange,
  availablePlans,
  isSubmitting,
  onApplyMembership,
  onPayInvoice,
  applyResult,
  paymentResult,
  memberId,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const hasActiveMembership = Boolean(plan.startDate || plan.expirationDate);
  const [applyStep, setApplyStep] = useState<'select' | 'invoice' | 'receipt'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya'>('gcash');

  const selectedPlan = useMemo(
    () => availablePlans.find((p) => p.id === selectedPlanId) ?? null,
    [availablePlans, selectedPlanId],
  );

  const apiBaseUrl = (import.meta as ImportMeta).env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

  const handleDownloadVirtualId = async () => {
    if (!applyResult?.downloadToken || !memberId) return;
    try {
      const response = await fetch(`${apiBaseUrl}/api/members/${memberId}/virtual-card`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${applyResult.downloadToken}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = applyResult.membershipId
        ? `DStars-Virtual-ID-${applyResult.membershipId}.pdf`
        : 'DStars-Virtual-ID.pdf';
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // swallow download errors for now
    }
  };

  const handleApplyMembershipClick = async () => {
    if (!selectedPlanId || isSubmitting || hasActiveMembership) return;
    try {
      await onApplyMembership(selectedPlanId);
      setApplyStep('invoice');
    } catch {
      // ignore
    }
  };
  const handlePayClick = async () => {
    if (!applyResult || isSubmitting || hasActiveMembership) return;
    await onPayInvoice(paymentMethod);
    setApplyStep('receipt');
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">My Membership</h1>
        <p className="text-zinc-500 mt-2 font-medium">
          {hasActiveMembership
            ? 'See full details of your current plan and request changes.'
            : 'You do not have an active membership yet. Apply for a plan below.'}
        </p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-zinc-100 bg-zinc-50/70 p-8">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Plan</div>
            <div className="text-3xl font-black text-zinc-900 mt-2">
              {hasActiveMembership ? plan.name : 'No active membership yet'}
            </div>
            <div className="mt-6 text-sm text-zinc-600 space-y-2">
              <div>
                Status:{' '}
                <span className="font-bold text-zinc-900 uppercase">
                  {hasActiveMembership ? plan.status : 'inactive'}
                </span>
              </div>
              <div>
                Price:{' '}
                <span className="font-bold text-zinc-900">
                  {hasActiveMembership
                    ? plan.price != null
                      ? `PHP ${plan.price.toLocaleString()}`
                      : 'Not available'
                    : 'N/A'}
                </span>
                {hasActiveMembership && plan.billingCycle && (
                  <span className="text-xs text-zinc-500"> / {plan.billingCycle}</span>
                )}
              </div>
              <div>
                Duration:{' '}
                <span className="font-bold text-zinc-900">
                  {hasActiveMembership
                    ? plan.durationCount && plan.duration
                      ? `${plan.durationCount} ${plan.duration}${plan.durationCount > 1 ? 's' : ''}`
                      : 'Not available'
                    : 'N/A'}
                </span>
              </div>
              <div>
                Membership period:{' '}
                <span className="font-bold text-zinc-900">
                  {hasActiveMembership && plan.startDate && plan.expirationDate
                    ? `${new Date(plan.startDate).toLocaleDateString()} → ${new Date(
                        plan.expirationDate,
                      ).toLocaleDateString()}`
                    : 'N/A'}
                </span>
              </div>
              <div>
                Remaining days:{' '}
                <span className="font-bold text-zinc-900">
                  {hasActiveMembership
                    ? plan.remainingSessions != null
                      ? plan.remainingSessions
                      : 'N/A'
                    : 'N/A'}
                </span>
              </div>
              <div>
                Next payment:{' '}
                <span className="font-bold text-zinc-900">
                  {hasActiveMembership
                    ? plan.nextPaymentDue
                      ? new Date(plan.nextPaymentDue).toLocaleDateString()
                      : 'N/A'
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-100 p-8 space-y-6">
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">
              {hasActiveMembership ? 'Request Plan Change' : 'Apply for Membership'}
            </h3>
            <p className="text-zinc-500 text-sm mt-2">
              {hasActiveMembership
                ? 'Use this for upgrade or downgrade requests.'
                : applyStep === 'select'
                ? 'Select a membership plan below to start your first membership. Your membership will be activated once payment is recorded.'
                : applyStep === 'invoice'
                ? 'Review your invoice and choose a payment method to activate your membership.'
                : 'Payment successful. A receipt has been issued and your virtual ID is ready.'}
            </p>

            {!hasActiveMembership && applyStep === 'select' && (
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Available Plans
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availablePlans.length === 0 ? (
                    <div className="text-xs text-zinc-400">
                      No membership plans are available right now.
                    </div>
                  ) : (
                    availablePlans.map((p) => {
                      const isSelected = p.id === selectedPlanId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlanId(p.id)}
                          className={`text-left rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                          }`}
                          disabled={isSubmitting}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                              <p className="text-xs text-zinc-500">
                                PHP {Number(p.price ?? 0).toLocaleString('en-PH')}{' '}
                                {p.duration === 'day'
                                  ? '/day'
                                  : p.duration_count === 1
                                  ? '/month'
                                  : `/${p.duration_count} months`}
                              </p>
                            </div>
                            <div
                              className={`h-4 w-4 rounded-full border ${
                                isSelected ? 'border-primary bg-primary' : 'border-zinc-300'
                              }`}
                            ></div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {!hasActiveMembership && applyStep === 'invoice' && selectedPlan && applyResult && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Selected Plan
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900">{selectedPlan.name}</h4>
                      <p className="text-xs text-zinc-500">
                        PHP {Number(selectedPlan.price ?? 0).toLocaleString('en-PH')}{' '}
                        {selectedPlan.duration === 'day'
                          ? '/day'
                          : selectedPlan.duration_count === 1
                          ? '/month'
                          : `/${selectedPlan.duration_count} months`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('gcash')}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        paymentMethod === 'gcash'
                          ? 'border-[#00AEEF] bg-[#00AEEF]/10 shadow-md'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#00AEEF] text-white flex items-center justify-center text-sm font-bold">
                          G
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">GCash</p>
                          <p className="text-xs text-zinc-500">Instant wallet payment</p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('maya')}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        paymentMethod === 'maya'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                          M
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Maya</p>
                          <p className="text-xs text-zinc-500">Secure checkout</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {applyStep !== 'receipt' && (
              <button
                onClick={() => {
                  if (hasActiveMembership) {
                    onRequestPlanChange();
                    setSubmitted(true);
                  } else if (applyStep === 'select') {
                    handleApplyMembershipClick();
                    setSubmitted(true);
                  } else if (applyStep === 'invoice') {
                    handlePayClick();
                    setSubmitted(true);
                  }
                }}
                disabled={
                  isSubmitting ||
                  (!hasActiveMembership && applyStep === 'select' && !selectedPlanId) ||
                  (!hasActiveMembership && applyStep === 'invoice' && !applyResult)
                }
                className="mt-4 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-95 transition-all disabled:opacity-60"
              >
                {hasActiveMembership
                  ? 'Request Plan Change'
                  : applyStep === 'select'
                  ? 'Apply for Membership'
                  : `Pay with ${paymentMethod === 'gcash' ? 'GCash' : 'Maya'}`}
              </button>
            )}

            {applyStep === 'receipt' && paymentResult && (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
                  Payment recorded. Reference: {paymentResult.paymentReference}. Your membership is now active.
                </div>
                <div className="text-xs text-zinc-500 space-y-2">
                  <p>
                    View the full receipt in Billing &amp; Receipts. You can also download your virtual ID now and use
                    it as your access pass at the gym entrance.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadVirtualId}
                    className="mt-2 inline-flex items-center px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-700 hover:bg-zinc-50"
                    disabled={!applyResult?.downloadToken}
                  >
                    Download Virtual ID
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberMembership;
