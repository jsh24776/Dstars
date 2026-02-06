
import React, { useState } from 'react';
import { TRAINERS } from '../../constants';
import Button from '../Button';

const TrainersAdmin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Trainer Roster</h1>
          <p className="text-zinc-500 mt-1">Manage coaching staff and availability schedules.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-zinc-900 text-white rounded-2xl text-sm font-bold shadow-2xl shadow-zinc-900/20 hover:opacity-95 transition-all active:scale-95"
        >
          Register New Trainer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TRAINERS.map((trainer) => (
          <div key={trainer.id} className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="relative mb-8">
              <img src={trainer.image} className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-zinc-50 shadow-md group-hover:scale-105 transition-transform duration-500" alt={trainer.name} />
              <span className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-2xl border-4 border-white shadow-sm"></span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-1">{trainer.name}</h3>
            <span className="text-xs font-bold text-primary uppercase tracking-[0.25em] mb-6">{trainer.specialty}</span>
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Students</div>
                <div className="text-xl font-black text-zinc-900">42</div>
              </div>
              <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Rating</div>
                <div className="text-xl font-black text-zinc-900">4.9</div>
              </div>
            </div>
            <div className="flex space-x-3 w-full">
              <button className="flex-grow py-4 border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">Schedule</button>
              <button className="px-5 py-4 bg-zinc-50 rounded-2xl text-zinc-400 hover:text-primary border border-zinc-100 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">Register Trainer</h2>
                  <p className="text-zinc-500">Onboard a new elite coach to the Dstars faculty.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-zinc-100 rounded-2xl text-zinc-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
                    <input type="text" placeholder="e.g. Erik Sorenson" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Specialty</label>
                    <input type="text" placeholder="e.g. Bio-Mechanics" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Biography</label>
                  <textarea rows={3} placeholder="Describe the trainer's professional background..." className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900 resize-none" required></textarea>
                </div>
                <div className="pt-4 flex space-x-4">
                  <Button variant="outline" size="lg" className="flex-grow py-5" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button size="lg" className="flex-grow py-5">Onboard Trainer</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainersAdmin;
