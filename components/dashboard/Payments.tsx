import React from 'react';

const transactions = [
  { id: 'TX-9931', member: 'Sophia Loren', method: 'Visa •••• 4921', amount: '₱3,299', date: 'Feb 06, 2026', status: 'Captured' },
  { id: 'TX-9927', member: 'Alexander Wright', method: 'GCash Wallet', amount: '₱2,149', date: 'Feb 05, 2026', status: 'Captured' },
  { id: 'TX-9919', member: 'Liam Wilson', method: 'Mastercard •••• 1134', amount: '₱2,149', date: 'Feb 03, 2026', status: 'Processing' },
  { id: 'TX-9911', member: 'James Miller', method: 'Bank Transfer', amount: '₱789', date: 'Jan 31, 2026', status: 'Failed' },
];

const Payments: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Payments</h1>
          <p className="text-zinc-500 mt-1">Monitor cash flow, capture rates, and payment methods.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">
            Reconcile
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest">
            Add Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          { label: 'Total Captured', value: '₱214,020', meta: 'Last 30 days', tone: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: 'Processing', value: '₱18,320', meta: '4 transactions', tone: 'bg-amber-50 text-amber-600 border-amber-100' },
          { label: 'Failed', value: '₱4,120', meta: '2 transactions', tone: 'bg-red-50 text-red-600 border-red-100' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${card.tone}`}>
                {card.label}
              </span>
              <button className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
                </svg>
              </button>
            </div>
            <div className="text-3xl font-black text-zinc-900">{card.value}</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-widest mt-2">{card.meta}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-zinc-900">Transaction History</h2>
            <p className="text-sm text-zinc-400">Latest captured and pending payments.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">
              Method: All
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
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Method</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-zinc-900">{tx.id}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-zinc-700">{tx.member}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500">{tx.method}</td>
                  <td className="px-8 py-6 text-sm font-black text-zinc-900">{tx.amount}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500">{tx.date}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        tx.status === 'Captured'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : tx.status === 'Processing'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                      {tx.status}
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
        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing 4 of 64 transactions</span>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30" disabled>
              Previous
            </button>
            <button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
