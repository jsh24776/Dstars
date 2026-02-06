
import React from 'react';

const Overview: React.FC = () => {
  const stats = [
    { label: 'Total Members', value: '1,284', trend: '+12%', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: 'Monthly Revenue', value: '₱142,500', trend: '+8.4%', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Active Sessions', value: '42', trend: '+15', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { label: 'Growth rate', value: '24.2%', trend: '-2.1%', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">System Overview</h1>
          <p className="text-zinc-500 mt-2 font-medium">Real-time health of your premium facility.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">Reports</button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest">Live View</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">Financial Trajectory</h3>
              <p className="text-zinc-400 text-sm">Projected revenue vs historical data</p>
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
                  ${h}k
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-8 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] relative z-10">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-10 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative shadow-2xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 tracking-tight">Retention Matrix</h3>
            <p className="text-zinc-500 text-sm font-medium">Global benchmark alignment</p>
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center py-12 relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="84" fill="none" stroke="#1c1c1e" strokeWidth="16" />
                <circle cx="96" cy="96" r="84" fill="none" stroke="var(--primary)" strokeWidth="16" strokeDasharray="528" strokeDashoffset="53" strokeLinecap="round" className="animate-[dash_2s_ease-out]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tighter">90%</span>
                <span className="text-[10px] uppercase font-bold text-primary tracking-[0.2em] mt-1">Excellent</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 pt-8 border-t border-white/5 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Net Churn</span>
              <span className="text-sm font-black text-red-400">2.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Expansion</span>
              <span className="text-sm font-black text-green-400">14.8%</span>
            </div>
            <button className="w-full py-4 bg-white/5 hover:bg-white hover:text-black transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">
              Strategy Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
