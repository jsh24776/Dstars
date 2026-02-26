import React from 'react';
import type { MemberAttendanceItem } from '../../services/memberPortalService';

interface MemberAttendanceProps {
  items: MemberAttendanceItem[];
}

const MemberAttendance: React.FC<MemberAttendanceProps> = ({ items }) => {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Attendance History</h1>
        <p className="text-zinc-500 mt-2 font-medium">A record of your recent check-ins.</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="text-left text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
              <th className="py-3">Check-in ID</th>
              <th className="py-3">Date</th>
              <th className="py-3">Time In</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100 text-sm text-zinc-700">
                <td className="py-4 font-bold text-zinc-900">{item.id}</td>
                <td className="py-4">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-4">{item.timeIn}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
            No attendance history yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberAttendance;
