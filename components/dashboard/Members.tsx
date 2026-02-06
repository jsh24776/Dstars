
import React, { useState } from 'react';
import { MOCK_MEMBERS } from '../../constants';

const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredMembers = MOCK_MEMBERS.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-6 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Members</h1>
          <p className="text-zinc-500 mt-1">Manage membership status and profile data.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-zinc-200 rounded-xl px-5 py-3 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900 w-full sm:w-64"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center whitespace-nowrap">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Member
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/30 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member Information</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Subscription</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Enrollment</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-sm border border-zinc-200">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900">{member.name}</div>
                        <div className="text-xs text-zinc-400 font-medium">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-semibold text-zinc-700">{member.plan}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      member.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
                      member.status === 'Inactive' ? 'bg-zinc-100 text-zinc-500 border-zinc-200' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-medium font-mono">
                    {member.joined}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 rounded-xl text-zinc-400 hover:text-primary transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 rounded-xl text-zinc-400 hover:text-red-500 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="text-zinc-400 text-sm font-medium">No members found matching "{searchTerm}"</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing {filteredMembers.length} of {MOCK_MEMBERS.length} results</span>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30" disabled>Previous</button>
            <button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
