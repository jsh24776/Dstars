import React from 'react';
import type { MemberBillingItem } from '../../services/memberPortalService';

interface MemberBillingProps {
  items: MemberBillingItem[];
}

const MemberBilling: React.FC<MemberBillingProps> = ({ items }) => {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Billing & Receipts</h1>
        <p className="text-zinc-500 mt-2 font-medium">Your payment history and available receipts.</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-left text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
              <th className="py-3">Invoice</th>
              <th className="py-3">Date</th>
              <th className="py-3">Amount</th>
              <th className="py-3">Method</th>
              <th className="py-3">Status</th>
              <th className="py-3">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100 text-sm text-zinc-700">
                <td className="py-4 font-bold text-zinc-900">{item.id}</td>
                <td className="py-4">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-4 font-semibold">PHP {item.amount.toLocaleString()}</td>
                <td className="py-4">{item.method}</td>
                <td className="py-4">
                  <span className="px-3 py-1 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                    {item.status}
                  </span>
                </td>
                <td className="py-4">
                  <button className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:bg-zinc-100 transition-all">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
            No payment records yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberBilling;
