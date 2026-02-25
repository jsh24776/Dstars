import React, { useEffect, useMemo, useState } from 'react';
import type { MembershipPlan } from '../../types';
import {
  createAdminMembershipPlan,
  deleteAdminMembershipPlan,
  fetchAdminMembershipPlans,
  updateAdminMembershipPlan,
  updateAdminMembershipPlanStatus,
  type MembershipPlanInput,
} from '../../services/membershipPlanService';

const defaultForm: MembershipPlanInput = {
  name: '',
  duration: 'month',
  duration_count: 1,
  price: 0,
  status: 'active',
  description: '',
  features: [],
};

const formatCycle = (plan: MembershipPlan) => {
  if (plan.duration === 'day') return 'Daily';
  if (plan.duration_count === 1) return `1 ${plan.duration}`;
  return `${plan.duration_count} ${plan.duration}s`;
};

const MembershipPlans: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState<MembershipPlanInput>(defaultForm);
  const [featuresText, setFeaturesText] = useState('');

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.price - b.price),
    [plans]
  );

  const loadPlans = async (targetPage = page) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = await fetchAdminMembershipPlans({
        page: targetPage,
        per_page: 10,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      setPlans(payload.data);
      setPage(payload.meta.current_page);
      setLastPage(payload.meta.last_page);
      setTotal(payload.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load plans.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(defaultForm);
    setFeaturesText('');
    setShowForm(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      duration: (plan.duration as MembershipPlanInput['duration']) || 'month',
      duration_count: plan.duration_count,
      price: plan.price,
      status: plan.status === 'inactive' ? 'inactive' : 'active',
      description: plan.description ?? '',
      features: plan.features ?? [],
    });
    setFeaturesText((plan.features ?? []).join('\n'));
    setShowForm(true);
  };

  const submitForm = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError('');

    const payload: MembershipPlanInput = {
      ...form,
      name: form.name.trim(),
      duration_count: Number(form.duration_count),
      price: Number(form.price),
      description: form.description?.trim() || undefined,
      features: featuresText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingPlan) {
        await updateAdminMembershipPlan(editingPlan.id, payload);
      } else {
        await createAdminMembershipPlan(payload);
      }

      setShowForm(false);
      await loadPlans(editingPlan ? page : 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save membership plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (plan: MembershipPlan) => {
    try {
      await updateAdminMembershipPlanStatus(plan.id, plan.status === 'active' ? 'inactive' : 'active');
      await loadPlans(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update plan status.');
    }
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await deleteAdminMembershipPlan(planToDelete.id);
      setPlanToDelete(null);
      await loadPlans(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete plan.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Membership Plans</h1>
          <p className="text-zinc-500 mt-1">Manage pricing, durations, and plan availability.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">
            Plan Settings
          </button>
          <button
            onClick={openCreate}
            className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest"
          >
            Create Plan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search plan name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-3 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900 w-full"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'active' : statusFilter === 'active' ? 'inactive' : 'all')}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all"
          >
            Status: {statusFilter}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/30 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Plan</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Updated</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {sortedPlans.length > 0 ? sortedPlans.map((plan) => (
                <tr key={plan.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-zinc-900">{plan.name}</div>
                    <div className="text-xs text-zinc-400 font-medium">{(plan.features ?? []).slice(0, 1)[0] ?? 'Membership access'}</div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-zinc-700">{formatCycle(plan)}</td>
                  <td className="px-8 py-6 text-sm font-black text-zinc-900">PHP {plan.price.toLocaleString('en-PH')}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      plan.status === 'active'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-medium">
                    {plan.updated_at ? new Date(plan.updated_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(plan)}
                        className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(plan)}
                        className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all"
                      >
                        {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setPlanToDelete(plan)}
                        className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-200 text-zinc-500 hover:text-red-500 hover:bg-zinc-50 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="text-zinc-400 text-sm font-medium">
                      {isLoading ? 'Loading plans...' : 'No plans found.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing {plans.length} of {total} plans</span>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page <= 1 || isLoading}
              onClick={() => loadPlans(page - 1)}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page >= lastPage || isLoading}
              onClick={() => loadPlans(page + 1)}
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
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">{editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}</h3>
                <p className="text-sm text-zinc-400">Update plan details without leaving this view.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Plan name"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              />
              <input
                type="number"
                min={0}
                step="1"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value || 0) }))}
                placeholder="Price"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              />

              <div className="flex items-center justify-between border border-zinc-100 rounded-xl px-4 py-3 bg-zinc-50">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Duration</span>
                <select
                  value={form.duration}
                  onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value as MembershipPlanInput['duration'] }))}
                  className="bg-transparent text-sm font-semibold text-zinc-700 focus:outline-none"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>

              <input
                type="number"
                min={1}
                max={36}
                value={form.duration_count}
                onChange={(event) => setForm((prev) => ({ ...prev, duration_count: Number(event.target.value || 1) }))}
                placeholder="Duration count"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              />

              <div className="md:col-span-2 flex items-center justify-between border border-zinc-100 rounded-xl px-4 py-3 bg-zinc-50">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as 'active' | 'inactive' }))}
                  className="bg-transparent text-sm font-semibold text-zinc-700 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <textarea
                value={form.description ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description (optional)"
                className="md:col-span-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm min-h-24"
              />
              <textarea
                value={featuresText}
                onChange={(event) => setFeaturesText(event.target.value)}
                placeholder="Features (one per line)"
                className="md:col-span-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm min-h-28"
              />
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
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {planToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-lg p-8">
            <h3 className="text-2xl font-black text-zinc-900">Delete Membership Plan</h3>
            <p className="text-sm text-zinc-500 mt-2">
              Delete <span className="font-semibold text-zinc-900">{planToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setPlanToDelete(null)}
                className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;
