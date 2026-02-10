import React from 'react';
import { PRICING_PLANS } from '../../constants';

const MembershipPlans: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Membership Plans</h1>
          <p className="text-zinc-500 mt-1">Position value with premium, benefit-led tiers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">
            Plan Settings
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest">
            Create Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-[2.5rem] border ${plan.recommended ? 'border-primary shadow-xl shadow-primary/10' : 'border-zinc-100 shadow-sm'} p-8 flex flex-col`}
          >
            {plan.recommended && (
              <span className="absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">
                Popular
              </span>
            )}

            <div className="mb-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Plan Tier</div>
              <div className="text-2xl font-black text-zinc-900 mt-2">{plan.name}</div>
              <div className="flex items-end space-x-2 mt-4">
                <span className="text-4xl font-black text-zinc-900">₱{plan.price}</span>
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">per month</span>
              </div>
            </div>

            <div className="space-y-4 flex-grow">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center space-x-3 text-sm text-zinc-600">
                  <span className="w-7 h-7 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button className={`w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${plan.recommended ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-95' : 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100'}`}>
                {plan.recommended ? 'Set As Default' : 'Promote Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-12 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Upsell Intelligence</h2>
            <p className="text-zinc-400 mt-2 max-w-xl">Offer personalized upgrades based on attendance, spending, and class affinity. Keep your premium tiers in demand.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-white/10 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/20 transition-all">
              View Model
            </button>
            <button className="px-6 py-3 bg-white text-zinc-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">
              Launch Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans;
