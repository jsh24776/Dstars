import React from 'react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const attendanceGrid = [
  { day: 'Mon', date: '03', status: 'High', count: 312 },
  { day: 'Tue', date: '04', status: 'Medium', count: 284 },
  { day: 'Wed', date: '05', status: 'High', count: 328 },
  { day: 'Thu', date: '06', status: 'High', count: 342 },
  { day: 'Fri', date: '07', status: 'Medium', count: 278 },
  { day: 'Sat', date: '08', status: 'Low', count: 196 },
  { day: 'Sun', date: '09', status: 'Low', count: 164 },
];

const attendanceLog = [
  { name: 'Isabella Garcia', time: '6:12 PM', status: 'Checked In', location: 'Strength Floor' },
  { name: 'Alexander Wright', time: '5:48 PM', status: 'Checked In', location: 'Performance Lab' },
  { name: 'Sophia Loren', time: '5:20 PM', status: 'Checked Out', location: 'Recovery Lounge' },
  { name: 'James Miller', time: '4:45 PM', status: 'No Show', location: 'Mobility Studio' },
];

const Attendance: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Attendance</h1>
          <p className="text-zinc-500 mt-1">Operational visibility into daily check-ins and presence.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">
            Calendar View
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest">
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-zinc-900">Weekly Activity</h2>
              <p className="text-sm text-zinc-400">Check-in density by day.</p>
            </div>
            <div className="flex bg-zinc-50 border border-zinc-100 rounded-2xl p-1">
              <button className="px-4 py-2 bg-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">This Week</button>
              <button className="px-4 py-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Last Week</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {attendanceGrid.map((item) => (
              <div key={item.day} className="rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{item.day}</div>
                <div className="text-lg font-black text-zinc-900 mt-2">{item.date}</div>
                <div
                  className={`mt-4 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest border ${
                    item.status === 'High'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : item.status === 'Medium'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}
                >
                  {item.status}
                </div>
                <div className="text-xs text-zinc-400 font-medium mt-3">{item.count} check-ins</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Attendance Summary</h3>
            <p className="text-zinc-500 text-sm">Operational performance snapshot.</p>
          </div>
          <div className="mt-10 space-y-6 relative z-10">
            {[
              { label: 'Avg. Daily Check-ins', value: '286' },
              { label: 'Peak Window', value: '5:30 - 7:30 PM' },
              { label: 'No Show Rate', value: '3.1%' },
              { label: 'Top Zone', value: 'Strength Floor' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</span>
                <span className="text-sm font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <button className="relative z-10 mt-10 w-full py-4 bg-white/5 hover:bg-white hover:text-black transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">
            Open Heatmap
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-zinc-900">Live Check-In Log</h2>
            <p className="text-sm text-zinc-400">Real-time activity from the last hour.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">
              Location: All
            </button>
            <button className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">
              Status: All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/30 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Time</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Location</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {attendanceLog.map((entry) => (
                <tr key={`${entry.name}-${entry.time}`} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-zinc-900">{entry.name}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500">{entry.time}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500">{entry.location}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        entry.status === 'Checked In'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : entry.status === 'Checked Out'
                          ? 'bg-sky-50 text-sky-600 border-sky-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
