import React from 'react';

const invoiceRows = [
  { id: 'INV-2043', member: 'Isabella Garcia', plan: 'Elite', amount: '₱3,299', date: 'Feb 06, 2026', status: 'Paid' },
  { id: 'INV-2042', member: 'Alexander Wright', plan: 'Professional', amount: '₱2,149', date: 'Feb 05, 2026', status: 'Pending' },
  { id: 'INV-2039', member: 'Sophia Loren', plan: 'Elite', amount: '₱3,299', date: 'Feb 02, 2026', status: 'Paid' },
  { id: 'INV-2035', member: 'James Miller', plan: 'Essentials', amount: '₱789', date: 'Jan 30, 2026', status: 'Overdue' },
  { id: 'INV-2031', member: 'Liam Wilson', plan: 'Professional', amount: '₱2,149', date: 'Jan 27, 2026', status: 'Paid' },
];

const Invoices: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Invoices</h1>
          <p className="text-zinc-500 mt-1">Track billing, payment status, and invoice actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">
            Filter
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest">
            New Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/30 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Invoice</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Plan</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {invoiceRows.map((invoice) => (
                <tr key={invoice.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-zinc-900">{invoice.id}</td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-zinc-900">{invoice.member}</div>
                    <div className="text-xs text-zinc-400 font-medium">Premium Member</div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-zinc-700">{invoice.plan}</td>
                  <td className="px-8 py-6 text-sm font-black text-zinc-900">{invoice.amount}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-medium">{invoice.date}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        invoice.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : invoice.status === 'Pending'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all">
                        View
                      </button>
                      <button className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all">
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing 5 of 32 invoices</span>
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

export default Invoices;
