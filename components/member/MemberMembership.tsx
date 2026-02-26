import React, { useState } from 'react';
import type { MemberPlanSummary } from '../../services/memberPortalService';

interface MemberMembershipProps {
  plan: MemberPlanSummary;
  onRequestPlanChange: () => void;
}

const MemberMembership: React.FC<MemberMembershipProps> = ({ plan, onRequestPlanChange }) => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">My Membership</h1>
        <p className="text-zinc-500 mt-2 font-medium">View your current package and request plan changes.</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-zinc-100 bg-zinc-50/70 p-8">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Plan</div>
            <div className="text-3xl font-black text-zinc-900 mt-2">{plan.name}</div>
            <div className="mt-6 text-sm text-zinc-600 space-y-2">
              <div>Status: <span className="font-bold text-zinc-900 uppercase">{plan.status}</span></div>
              <div>Expiration: <span className="font-bold text-zinc-900">{plan.expirationDate ? new Date(plan.expirationDate).toLocaleDateString() : 'N/A'}</span></div>
              <div>Next Payment: <span className="font-bold text-zinc-900">{plan.nextPaymentDue ? new Date(plan.nextPaymentDue).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-100 p-8">
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Request Plan Change</h3>
            <p className="text-zinc-500 text-sm mt-2">Use this for upgrade or downgrade requests. Admin will review your request.</p>

            <button
              onClick={() => {
                onRequestPlanChange();
                setSubmitted(true);
              }}
              className="mt-8 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-95 transition-all"
            >
              Request Plan Change
            </button>

            {submitted && (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
                Request submitted. Please wait for admin approval.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberMembership;
