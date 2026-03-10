import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAttendanceSummary } from '../../services/attendanceService';

interface FinanceSummary {
  total_revenue: string | number;
  revenue_this_month: string | number;
  paid_amount: string | number;
  pending_amount: string | number;
  active_members: number;
  recent_payments: unknown[];
}

interface ActivityLogItem {
  id: number;
  actor_type: string | null;
  actor_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: any;
  created_at: string | null;
}

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

const formatCurrency = (value: string | number) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 'PHP 0.00';
  return `PHP ${numeric.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const timeAgo = (value: string | null) => {
  if (!value) return '';
  const diffMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diffMs)) return '';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const labelForActivity = (log: ActivityLogItem) => {
  const action = log.action;
  if (action === 'payment_recorded') return 'Payment recorded';
  if (action === 'invoice_created') return 'Invoice created';
  if (action === 'invoice_cancelled') return 'Invoice cancelled';
  if (action === 'member_profile_updated') return 'Member profile updated';
  if (action === 'member_password_updated') return 'Member password updated';
  if (action === 'membership_activated_after_payment') return 'Membership activated';
  return action.replace(/_/g, ' ');
};

const detailForActivity = (log: ActivityLogItem) => {
  const d = log.details ?? {};

  if (log.action === 'payment_recorded') {
    const amount = d?.amount_paid ?? d?.amount ?? null;
    const invoiceId = d?.invoice_id ?? null;
    const method = d?.payment_method ?? null;
    const parts = [
      invoiceId ? `Invoice #${invoiceId}` : null,
      amount != null ? formatCurrency(amount) : null,
      method ? String(method).toUpperCase() : null,
    ].filter(Boolean);
    return parts.join(' · ');
  }

  if (log.action === 'invoice_created') {
    const total = d?.total_amount ?? null;
    const memberId = d?.member_id ?? null;
    const parts = [memberId ? `Member #${memberId}` : null, total != null ? formatCurrency(total) : null].filter(Boolean);
    return parts.join(' · ');
  }

  if (log.action === 'invoice_cancelled') {
    const invoiceNumber = d?.invoice_number ?? null;
    const memberId = d?.member_id ?? null;
    const parts = [
      invoiceNumber ? String(invoiceNumber) : (log.entity_id ? `Invoice #${log.entity_id}` : null),
      memberId ? `Member #${memberId}` : null,
    ].filter(Boolean);
    return parts.join(' · ');
  }

  return `${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}`;
};

const Dashboard: React.FC = () => {
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [attendanceToday, setAttendanceToday] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = useMemo(
    () => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
    []
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      try {
        const [financeRes, attendanceRes, activityRes] = await Promise.all([
          fetch(`${baseUrl}/admin/api/finance-summary`, {
            credentials: 'include',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          }).then((r) => (r.ok ? r.json() : null)),
          fetchAdminAttendanceSummary(),
          fetch(`${baseUrl}/admin/api/activity-logs?per_page=8`, {
            credentials: 'include',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          }).then((r) => (r.ok ? r.json() : null)),
        ]);

        if (cancelled) return;

        const financePayload = financeRes as ApiEnvelope<FinanceSummary> | null;
        setFinanceSummary(financePayload?.data ?? null);

        setAttendanceToday(attendanceRes?.today_total_check_ins ?? 0);

        const activityPayload = activityRes as ApiEnvelope<{ items: ActivityLogItem[] }> | null;
        setActivity(Array.isArray(activityPayload?.data?.items) ? activityPayload!.data!.items : []);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  const activeMembersValue = financeSummary
    ? financeSummary.active_members.toLocaleString()
    : isLoading
      ? '—'
      : '0';

  const monthlyRevenueValue = financeSummary
    ? formatCurrency(financeSummary.revenue_this_month)
    : isLoading
      ? '—'
      : formatCurrency(0);

  const attendanceTodayValue = attendanceToday !== null
    ? attendanceToday.toLocaleString()
    : isLoading
      ? '—'
      : '0';

  const dynamicRecentActivity = useMemo(
    () =>
      activity.map((log) => ({
        label: labelForActivity(log),
        detail: detailForActivity(log),
        time: timeAgo(log.created_at),
        tone: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      })),
    [activity]
  );
  const stats = [
    { label: 'Active Members', value: '1,284', trend: '+4.6%', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { label: 'Monthly Revenue', value: '₱142,500', trend: '+8.4%', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Attendance Today', value: '312', trend: '+18', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { label: 'Retention Rate', value: '90.2%', trend: '+0.8%', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
  ];

  const recentActivity = [
    { label: 'New member activated', detail: 'Isabella Garcia · Elite Plan', time: '3m ago', tone: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Invoice paid', detail: 'INV-2043 · ₱3,299', time: '14m ago', tone: 'bg-sky-50 text-sky-600 border-sky-100' },
    { label: 'Membership upgraded', detail: 'James Miller · Professional', time: '1h ago', tone: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Class at capacity', detail: 'Elite Performance · 18/18', time: '2h ago', tone: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Dashboard Command</h1>
          <p className="text-zinc-500 mt-2 font-medium">A live operating view of Dstars Premium Fitness.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-zinc-50 text-primary rounded-[1.25rem] group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300 border border-zinc-100">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-4xl font-black text-zinc-900 mb-2">
              {stat.label === 'Active Members'
                ? activeMembersValue
                : stat.label === 'Monthly Revenue'
                  ? monthlyRevenueValue
                  : stat.label === 'Attendance Today'
                    ? attendanceTodayValue
                    : stat.value}
            </div>
            <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">Revenue Pulse</h3>
              <p className="text-zinc-400 text-sm">Monthly revenue against plan targets.</p>
            </div>
            <div className="flex bg-zinc-50 border border-zinc-100 rounded-2xl p-1">
              <button className="px-4 py-2 bg-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">Monthly</button>
              <button className="px-4 py-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Quarterly</button>
            </div>
          </div>

          <div className="h-[320px] flex items-end justify-between space-x-6 relative z-10 px-2">
            {[45, 65, 55, 85, 75, 95, 80, 110, 90, 110, 105, 120].map((h, i) => (
              <div key={i} className="flex-grow group/bar relative h-full flex flex-col justify-end">
                <div
                  className={`w-full transition-all duration-700 rounded-[0.75rem] ${i === 11 ? 'bg-primary' : 'bg-zinc-100 group-hover/bar:bg-zinc-200'}`}
                  style={{ height: `${h * 2.2}px` }}
                ></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-zinc-900 opacity-0 group-hover/bar:opacity-100 transition-all scale-90 group-hover/bar:scale-100">
                  ₱{h}k
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-10 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative shadow-2xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 tracking-tight">Attendance Momentum</h3>
            <p className="text-zinc-500 text-sm font-medium">Daily check-in velocity</p>
          </div>

          <div className="flex-grow flex flex-col justify-center items-center py-12 relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="84" fill="none" stroke="#1c1c1e" strokeWidth="16" />
                <circle cx="96" cy="96" r="84" fill="none" stroke="var(--primary)" strokeWidth="16" strokeDasharray="528" strokeDashoffset="68" strokeLinecap="round" className="animate-[dash_2s_ease-out]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tighter">82%</span>
                <span className="text-[10px] uppercase font-bold text-primary tracking-[0.2em] mt-1">On Track</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-white/5 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Peak Hour</span>
              <span className="text-sm font-black text-emerald-400">6:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No-Show Rate</span>
              <span className="text-sm font-black text-amber-400">3.1%</span>
            </div>
            <button className="w-full py-4 bg-white/5 hover:bg-white hover:text-black transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">
              Attendance Detail
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">Recent Activity</h3>
              <p className="text-zinc-400 text-sm">Last 24 hours across operations.</p>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-all">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {dynamicRecentActivity.length ? dynamicRecentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-50/60 border border-zinc-100 rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.tone}`}>
                    Live
                  </span>
                  <div>
                    <div className="text-sm font-bold text-zinc-900">{item.label}</div>
                    <div className="text-xs text-zinc-400 font-medium">{item.detail}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{item.time}</div>
              </div>
            )) : (
              <div className="text-sm text-zinc-400 font-medium">No activity logs yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-6">Quick Insights</h3>
          <div className="space-y-6">
            {[
              { label: 'Top Plan', value: 'Professional', meta: '42% of members' },
              { label: 'New Signups', value: '38', meta: 'Last 7 days' },
              { label: 'Avg. Spend', value: '₱2,741', meta: 'Per member / month' },
              { label: 'Churn Risk', value: '4.2%', meta: 'Low impact' },
            ].map((insight, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/70 border border-zinc-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{insight.label}</div>
                  <div className="text-lg font-black text-zinc-900">{insight.value}</div>
                </div>
                <div className="text-xs text-zinc-400 font-medium">{insight.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

