import React from 'react';

const Dashboard: React.FC = () => {
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
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">
            Export Insights
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest">
            Open Live View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-zinc-50 text-primary rounded-[1.25rem] group-hover:bg-primary group-hover:text-white transition-colors duration-300 border border-zinc-100">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-4xl font-black text-zinc-900 mb-2">{stat.value}</div>
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
            {recentActivity.map((item, i) => (
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
            ))}
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
