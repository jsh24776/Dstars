import React from 'react';
import type { MemberAttendanceItem, MemberBillingItem, MemberPlanSummary } from '../../services/memberPortalService';

interface MemberDashboardProps {
  plan: MemberPlanSummary;
  attendance: MemberAttendanceItem[];
  billing: MemberBillingItem[];
  visitsThisMonth: number;
  visitsOverall: number;
  lastCheckInDate: string | null;
  lastPaymentAmount: number | null;
}

const formatDate = (value: string | null) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString();
};

const MemberDashboard: React.FC<MemberDashboardProps> = ({
  plan,
  attendance,
  billing,
  visitsThisMonth,
  visitsOverall,
  lastCheckInDate,
  lastPaymentAmount,
}) => {
  const stats = [
    {
      label: 'Total Visits This Month',
      value: String(visitsThisMonth),
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      label: 'Total Visits Overall',
      value: String(visitsOverall),
      tone: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    },
    {
      label: 'Last Check-in Date',
      value: formatDate(lastCheckInDate),
      tone: 'bg-sky-50 text-sky-700 border-sky-100',
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Member Dashboard</h1>
        <p className="text-zinc-500 mt-2 font-medium">Your current membership summary and activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm">
            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${stat.tone}`}>
              {stat.label}
            </div>
            <div className="text-2xl font-black text-zinc-900 mt-4 break-words">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-3">Membership Status</h3>
          <p className="text-zinc-500 mb-8">
            {plan.startDate || plan.expirationDate
              ? 'Quick view of your current plan.'
              : 'No active membership yet. Apply for a plan from the My Membership section.'}
          </p>
          <div className="rounded-3xl border border-zinc-100 bg-zinc-50/70 p-8">
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Plan Name</div>
            <div className="text-3xl font-black text-zinc-900 mt-2">
              {plan.startDate || plan.expirationDate ? plan.name : 'No active membership yet'}
            </div>
            <div className="mt-6 text-sm text-zinc-600 space-y-1">
              <div>
                Status:{' '}
                <span className="font-bold text-zinc-900 uppercase">
                  {plan.startDate || plan.expirationDate ? plan.status : 'inactive'}
                </span>
              </div>
              <div>
                Days remaining:{' '}
                <span className="font-bold text-zinc-900">
                  {plan.startDate || plan.expirationDate
                    ? plan.remainingSessions != null
                      ? plan.remainingSessions
                      : 'N/A'
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 p-10 rounded-[3rem] text-white shadow-2xl">
          <h3 className="text-2xl font-black tracking-tight mb-2">Payment Snapshot</h3>
          <p className="text-zinc-500 text-sm">Your latest payment and upcoming due date.</p>
          <div className="mt-8 space-y-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Last Payment
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="text-xs text-zinc-400 mb-1">Last payment amount</div>
                  <div className="text-2xl font-black text-white">
                    {lastPaymentAmount != null ? `PHP ${lastPaymentAmount.toLocaleString()}` : 'No payments yet'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Next Payment Due
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="text-xs text-zinc-400 mb-1">Scheduled date</div>
                  <div className="text-lg font-bold text-white">
                    {plan.nextPaymentDue ? formatDate(plan.nextPaymentDue) : 'Not scheduled'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
