import React, { useEffect, useState } from 'react';
import MemberMembership from './MemberMembership';
import type { MemberPlanSummary, ApplyMembershipResult, RecordMemberPaymentResult } from '../../services/memberPortalService';
import { applyMemberMembership, fetchMemberPlanSummaryFromApi, recordMemberPayment, submitMemberPlanChangeRequest } from '../../services/memberPortalService';
import { fetchPublicMembershipPlans } from '../../services/membershipPlanService';
import type { MembershipPlan } from '../../types';

interface MemberMembershipContainerProps {
  token: string;
  email: string;
  memberId: number;
  fallbackPlan: MemberPlanSummary;
}

const MemberMembershipContainer: React.FC<MemberMembershipContainerProps> = ({ token, email, memberId, fallbackPlan }) => {
  const [plan, setPlan] = useState<MemberPlanSummary>(fallbackPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [applyResult, setApplyResult] = useState<ApplyMembershipResult | null>(null);
  const [paymentResult, setPaymentResult] = useState<RecordMemberPaymentResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const freshPlan = await fetchMemberPlanSummaryFromApi(token);
        if (!isMounted) return;
        setPlan(freshPlan);
      } catch {
        // keep fallback on error
      }

      try {
        const list = await fetchPublicMembershipPlans();
        if (!isMounted) return;
        setPlans(list);
      } catch {
        // ignore plan loading errors here; UI will just show none
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleRequestPlanChange = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitMemberPlanChangeRequest(token, email);
      // reflect pending state in UI
      setPlan((prev) => ({ ...prev, status: 'pending' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyMembership = async (selectedPlanId: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await applyMemberMembership(token, selectedPlanId);
      setApplyResult(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayInvoice = async (paymentMethod: 'gcash' | 'maya') => {
    if (!applyResult || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await recordMemberPayment(token, {
        invoice_id: applyResult.invoiceId,
        member_id: memberId,
        payment_method: paymentMethod,
      });
      setPaymentResult(result);
      const freshPlan = await fetchMemberPlanSummaryFromApi(token);
      setPlan(freshPlan);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MemberMembership
      plan={plan}
      onRequestPlanChange={handleRequestPlanChange}
      availablePlans={plans}
      isSubmitting={isSubmitting}
      onApplyMembership={handleApplyMembership}
      onPayInvoice={handlePayInvoice}
      applyResult={applyResult}
      paymentResult={paymentResult}
      memberId={memberId}
    />
  );
};

export default MemberMembershipContainer;

