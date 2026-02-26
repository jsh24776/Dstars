import React from 'react';
import type { MemberAttendanceItem, MemberPlanSummary } from '../../services/memberPortalService';

interface MemberDashboardProps {
  plan: MemberPlanSummary;
  attendance: MemberAttendanceItem[];
}

const formatDate = (value: string | null) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString();
};

const MemberDashboard: React.FC<MemberDashboardProps> = ({ plan, attendance }) => {
  const visitsThisMonth = attendance.filter((entry) => {
    const date = new Date(entry.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Plan Status', value: plan.status.toUpperCase(), tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Expiration Date', value: formatDate(plan.expirationDate), tone: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
    { label: 'Next Payment Due', value: formatDate(plan.nextPaymentDue), tone: 'bg-sky-50 text-sky-700 border-sky-100' },
    { label: 'Visits This Month', value: String(visitsThisMonth), tone: 'bg-amber-50 text-amber-700 border-amber-100' },
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
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-3">Active Plan</h3>
          <p className="text-zinc-500 mb-8">Your currently assigned membership package.</p>
          <div className="rounded-3xl border border-zinc-100 bg-zinc-50/70 p-8">
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Plan Name</div>
            <div className="text-3xl font-black text-zinc-900 mt-2">{plan.name}</div>
            <div className="mt-6 text-sm text-zinc-600">
              Remaining sessions: <span className="font-bold text-zinc-900">{plan.remainingSessions ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 p-10 rounded-[3rem] text-white shadow-2xl">
          <h3 className="text-2xl font-black tracking-tight mb-2">Recent Check-ins</h3>
          <p className="text-zinc-500 text-sm">Latest attendance records.</p>
          <div className="mt-8 space-y-4">
            {attendance.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <div className="text-sm font-bold text-white">{new Date(entry.date).toLocaleDateString()}</div>
                <div className="text-xs text-zinc-400">{entry.timeIn}</div>
              </div>
            ))}
            {attendance.length === 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-zinc-400">
                No attendance records yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
