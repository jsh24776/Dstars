
import React from 'react';
import { MOCK_SCHEDULE } from '../../constants';

const Schedule: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Class Schedule</h1>
          <p className="text-zinc-500 mt-1">Organize facility programs and bookings.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white border border-zinc-200 rounded-xl flex overflow-hidden">
            <button className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest transition-all">Today</button>
            <button className="px-4 py-2 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all">Week</button>
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            New Session
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-zinc-50">
          {MOCK_SCHEDULE.map((session) => (
            <div key={session.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between group hover:bg-zinc-50/50 transition-all duration-300">
              <div className="flex items-start space-x-8 mb-4 md:mb-0">
                <div className="text-center min-w-[80px]">
                  <div className="text-lg font-black text-zinc-900">{session.time.split(' ')[0]}</div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{session.time.split(' ')[1]}</div>
                </div>
                <div className="h-12 w-px bg-zinc-100 hidden md:block"></div>
                <div>
                  <h4 className="text-xl font-bold text-zinc-900 group-hover:text-primary transition-colors">{session.activity}</h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-zinc-500 font-medium">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {session.trainer}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {session.capacity} Slots
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="px-5 py-2.5 bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all">Manage</button>
                <button className="p-2.5 text-zinc-400 hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
