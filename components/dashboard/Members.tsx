
import React, { useEffect, useMemo, useState } from 'react';

type MemberStatus = 'active' | 'inactive' | 'suspended';

interface MemberPlan {
  id: number;
  name: string;
}

interface Member {
  id: number;
  full_name: string;
  username: string | null;
  email: string;
  phone: string;
  membership_id: string | null;
  status: MemberStatus;
  is_verified: boolean;
  profile_image_url: string | null;
  membership_plan: MemberPlan | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : '';
};

const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    status: 'inactive' as MemberStatus,
  });

  const baseUrl = useMemo(
    () => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
    []
  );

  const loadMembers = async (targetPage = page) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('page', String(targetPage));
    params.set('per_page', String(perPage));

    try {
      const response = await fetch(`${baseUrl}/admin/api/members?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members.');
      }

      const payload: PaginatedResponse<Member> = await response.json();
      setMembers(payload.data);
      setPage(payload.meta.current_page);
      setLastPage(payload.meta.last_page);
      setTotal(payload.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load members.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const openCreate = () => {
    setIsEditing(false);
    setActiveMember(null);
    setForm({
      full_name: '',
      email: '',
      phone: '',
      username: '',
      status: 'inactive',
    });
    setShowForm(true);
  };

  const openEdit = (member: Member) => {
    setIsEditing(true);
    setActiveMember(member);
    setForm({
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      username: member.username ?? '',
      status: member.status,
    });
    setShowForm(true);
  };

  const submitForm = async () => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    const isUpdate = isEditing && activeMember;
    const endpoint = isUpdate
      ? `${baseUrl}/admin/api/members/${activeMember.id}`
      : `${baseUrl}/admin/api/members`;
    const method = isUpdate ? 'PATCH' : 'POST';

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          username: form.username || null,
          status: form.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.message ?? 'Unable to save member.';
        setError(message);
        return;
      }

      setShowForm(false);
      await loadMembers(page);
    } catch {
      setError('Unable to save member.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (member: Member) => {
    const confirmed = window.confirm(`Delete ${member.full_name}? This can be restored later.`);
    if (!confirmed) return;

    const xsrfToken = getCookie('XSRF-TOKEN');

    try {
      const response = await fetch(`${baseUrl}/admin/api/members/${member.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
        body: JSON.stringify({ confirm: true }),
      });

      if (!response.ok) {
        throw new Error('Unable to delete member.');
      }

      await loadMembers(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete member.');
    }
  };

  const updateStatus = async (member: Member, status: MemberStatus) => {
    const xsrfToken = getCookie('XSRF-TOKEN');

    try {
      const response = await fetch(`${baseUrl}/admin/api/members/${member.id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Unable to update status.');
      }

      await loadMembers(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Members</h1>
          <p className="text-zinc-500 mt-1">Search, segment, and manage high-value memberships.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-zinc-50 transition-all">
            Export
          </button>
          <button
            onClick={openCreate}
            className="px-5 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center whitespace-nowrap uppercase tracking-widest"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Member
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search name, email, or member ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-3 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900 w-full"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'active' : 'all')}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all"
          >
            Status: {statusFilter === 'all' ? 'All' : statusFilter}
          </button>
          <button className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">
            Plan: Any
          </button>
          <button className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">
            Joined: 30d
          </button>
          <button className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">
            More Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/30 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Plan</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Last Check-In</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Joined</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {members.length > 0 ? members.map((member) => (
                <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      {member.profile_image_url ? (
                        <img
                          src={member.profile_image_url}
                          className="w-11 h-11 rounded-2xl object-cover border border-zinc-200"
                          alt={member.full_name}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-sm border border-zinc-200">
                          {member.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-zinc-900">{member.full_name}</div>
                        <div className="text-xs text-zinc-400 font-medium">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-semibold text-zinc-700">
                      {member.membership_plan?.name ?? 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      member.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                      member.status === 'inactive' ? 'bg-zinc-100 text-zinc-500 border-zinc-200' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-medium">
                    {member.is_verified ? 'Verified' : 'Pending'}
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-medium font-mono">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-900 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEdit(member)}
                        className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 rounded-xl text-zinc-400 hover:text-primary transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateStatus(member, member.status === 'active' ? 'suspended' : 'active')}
                        className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-900 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteMember(member)}
                        className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 rounded-xl text-zinc-400 hover:text-red-500 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="text-zinc-400 text-sm font-medium">
                      {isLoading ? 'Loading members…' : `No members found matching "${searchTerm}"`}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing {members.length} of {total} results</span>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page <= 1}
              onClick={() => loadMembers(page - 1)}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page >= lastPage}
              onClick={() => loadMembers(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">{isEditing ? 'Edit Member' : 'Add Member'}</h3>
                <p className="text-sm text-zinc-400">All fields are required unless optional.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={form.full_name}
                onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                placeholder="Full name"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              />
              <input
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              />
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Phone"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              />
              <input
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="Username (optional)"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              />
              <div className="flex items-center justify-between border border-zinc-100 rounded-xl px-4 py-3 bg-zinc-50">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as MemberStatus }))}
                  className="bg-transparent text-sm font-semibold text-zinc-700 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95"
              >
                {isEditing ? 'Save Changes' : 'Create Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
