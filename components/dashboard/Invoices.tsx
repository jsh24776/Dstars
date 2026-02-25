import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { consumeDashboardDeepLink, onDashboardDeepLink } from '../../services/dashboardDeepLink';

type InvoiceStatus = 'pending' | 'paid' | 'cancelled';
type PaymentMethod = 'cash' | 'gcash' | 'bank_transfer';
type PaymentSelection = 'paid' | 'unpaid';

interface ItemForm { id: string; description: string; quantity: string; unitPrice: string; }
interface Member { id: number; full_name: string; email: string; phone?: string; membership_plan?: { name: string; price?: string | number } | null; }
interface InvoiceItem { id?: number; description: string; quantity: number; unit_price: string | number; line_total: string | number; }
interface Invoice {
  id: number; invoice_number: string; member_id: number; plan_name: string; total_amount: string | number; status: InvoiceStatus;
  issued_at: string; notes?: string | null; payment_method?: string | null;
  subtotal_amount?: string | number; discount_amount?: string | number; tax_amount?: string | number;
  member: Member | null; items?: InvoiceItem[];
}
interface Paginated<T> { data: T[]; meta: { current_page: number; last_page: number; total: number; }; }
interface ApiEnvelope<T> { data?: T; message?: string; }

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : '';
};
const formatCurrency = (value: string | number) => `PHP ${(Number(value) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const toDateTimeLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const statusLabel = (s: InvoiceStatus) => (s === 'paid' ? 'Paid' : s === 'pending' ? 'Pending' : 'Cancelled');
const paymentMethodLabel = (m?: string | null) => (m === 'gcash' ? 'GCash' : m === 'bank_transfer' ? 'Bank Transfer' : m === 'cash' ? 'Cash' : '-');

const Invoices: React.FC = () => {
  const baseUrl = useMemo(() => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000', []);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [issuedAt, setIssuedAt] = useState(toDateTimeLocal(new Date()));
  const [discountAmount, setDiscountAmount] = useState('0');
  const [taxAmount, setTaxAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentSelection>('unpaid');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemForm[]>([{ id: 'item-1', description: '', quantity: '1', unitPrice: '' }]);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);

  const selectedMember = useMemo(() => members.find((m) => m.id === selectedMemberId) ?? null, [members, selectedMemberId]);
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
    const discount = Number(discountAmount) || 0;
    const tax = Number(taxAmount) || 0;
    return { subtotal, discount, tax, grandTotal: Math.max(0, subtotal - discount + tax) };
  }, [items, discountAmount, taxAmount]);

  const loadInvoices = async (targetPage = page) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(targetPage), per_page: '10' });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    try {
      const r = await fetch(`${baseUrl}/admin/api/invoices?${params.toString()}`, { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!r.ok) throw new Error('Failed to fetch invoices.');
      const data: Paginated<Invoice> = await r.json();
      setInvoices(data.data); setPage(data.meta.current_page); setLastPage(data.meta.last_page); setTotal(data.meta.total);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load invoices.'); } finally { setLoading(false); }
  };

  const loadMembers = async () => {
    try {
      const r = await fetch(`${baseUrl}/admin/api/members?per_page=100`, { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!r.ok) throw new Error('Unable to load members.');
      const payload = await r.json().catch(() => null);
      setMembers(Array.isArray(payload?.data) ? payload.data : []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load members.'); }
  };

  useEffect(() => { loadInvoices(1); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const link = consumeDashboardDeepLink('invoices', 'invoice');
    if (link) {
      openDetailById(link.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const off = onDashboardDeepLink((link) => {
      if (link.tab === 'invoices' && link.kind === 'invoice') {
        openDetailById(link.id);
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (notice) { const t = setTimeout(() => setNotice(null), 2500); return () => clearTimeout(t); } }, [notice]);
  useEffect(() => {
    if (!selectedMember?.membership_plan?.name) return;

    setItems((current) => {
      if (current.length !== 1) return current;
      const row = current[0];
      const isBlank = !row.description.trim() && !row.unitPrice.trim();
      if (!isBlank) return current;

      return [{
        ...row,
        description: `${selectedMember.membership_plan.name} Membership`,
        unitPrice: String(selectedMember.membership_plan.price ?? ''),
      }];
    });
  }, [selectedMember]);
  useEffect(() => {
    if (!showCreate || typeof document === 'undefined') return;
    const body = document.body; const original = body.style.overflow; body.style.overflow = 'hidden';
    return () => { body.style.overflow = original; };
  }, [showCreate]);

  const openDetail = async (invoice: Invoice) => {
    setDetailInvoice(invoice);
    try {
      const r = await fetch(`${baseUrl}/admin/api/invoices/${invoice.id}`, { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!r.ok) return;
      const p: ApiEnvelope<{ invoice?: Invoice }> = await r.json().catch(() => ({}));
      if (p?.data?.invoice) setDetailInvoice(p.data.invoice);
    } catch {}
  };

  const openDetailById = async (invoiceId: number) => {
    setDetailInvoice(null);
    try {
      const r = await fetch(`${baseUrl}/admin/api/invoices/${invoiceId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!r.ok) throw new Error('Unable to load invoice details.');
      const p: ApiEnvelope<{ invoice?: Invoice }> = await r.json().catch(() => ({}));
      if (!p?.data?.invoice) throw new Error('Unable to load invoice details.');
      setDetailInvoice(p.data.invoice);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load invoice details.');
    }
  };

  const cancelInvoice = async () => {
    if (!detailInvoice || detailInvoice.status !== 'pending') return;
    if (!window.confirm(`Cancel invoice ${detailInvoice.invoice_number}?`)) return;
    try {
      const xsrf = getCookie('XSRF-TOKEN');
      const r = await fetch(`${baseUrl}/admin/api/invoices/${detailInvoice.id}/cancel`, { method: 'PATCH', credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}) } });
      if (!r.ok) throw new Error('Unable to cancel invoice.');
      const p: ApiEnvelope<{ invoice?: Invoice }> = await r.json().catch(() => ({}));
      if (p?.data?.invoice) setDetailInvoice(p.data.invoice);
      setNotice('Invoice cancelled successfully.');
      await loadInvoices(page);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to cancel invoice.'); }
  };

  const openCreate = async () => {
    setShowCreate(true); setError(null); setSelectedMemberId(''); setIssuedAt(toDateTimeLocal(new Date())); setDiscountAmount('0');
    setTaxAmount('0'); setPaymentMethod('cash'); setPaymentStatus('unpaid'); setNotes(''); setItems([{ id: `item-${Date.now()}`, description: '', quantity: '1', unitPrice: '' }]);
    await loadMembers();
  };

  const addRow = () => setItems((v) => [...v, { id: `item-${Date.now()}-${v.length}`, description: '', quantity: '1', unitPrice: '' }]);
  const removeRow = (id: string) => setItems((v) => (v.length > 1 ? v.filter((i) => i.id !== id) : v));
  const updateRow = (id: string, k: keyof ItemForm, value: string) => setItems((v) => v.map((i) => (i.id === id ? { ...i, [k]: value } : i)));

  const submitCreate = async () => {
    setError(null);
    if (!selectedMemberId) return setError('Member is required.');
    const normalized = items.map((i) => ({ description: i.description.trim(), quantity: Number(i.quantity), unit_price: Number(i.unitPrice) })).filter((i) => i.description && i.quantity > 0 && i.unit_price >= 0);
    if (!normalized.length) return setError('At least one valid invoice item is required.');
    setCreating(true);
    try {
      const xsrf = getCookie('XSRF-TOKEN');
      const r = await fetch(`${baseUrl}/admin/api/invoices`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}) },
        body: JSON.stringify({ member_id: selectedMemberId, issued_at: issuedAt ? new Date(issuedAt).toISOString() : undefined, items: normalized, discount_amount: Number(discountAmount) || 0, tax_amount: Number(taxAmount) || 0, payment_method: paymentMethod, payment_status: paymentStatus, notes: notes.trim() || null }),
      });
      const p: ApiEnvelope<{ invoice?: Invoice }> = await r.json().catch(() => ({}));
      if (!r.ok || !p?.data?.invoice) throw new Error(p?.message ?? 'Unable to create invoice.');
      setShowCreate(false); setNotice('Invoice generated successfully.');
      await loadInvoices(1);
      await openDetail(p.data.invoice);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create invoice.'); } finally { setCreating(false); }
  };

  if (detailInvoice) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <button onClick={() => setDetailInvoice(null)} className="mb-4 px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50">Back to Invoices</button>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Invoice Details</h1>
            <p className="text-zinc-500 mt-1">{detailInvoice.invoice_number}</p>
          </div>
          <button onClick={cancelInvoice} disabled={detailInvoice.status !== 'pending'} className="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest disabled:opacity-40">Cancel Invoice</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date Issued</div><div className="mt-1 text-sm font-semibold text-zinc-900">{formatDate(detailInvoice.issued_at)}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status</div><div className="mt-1 text-sm font-semibold text-zinc-900">{statusLabel(detailInvoice.status)}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Member</div><div className="mt-1 text-sm font-semibold text-zinc-900">{detailInvoice.member?.full_name ?? '-'}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Payment Method</div><div className="mt-1 text-sm font-semibold text-zinc-900">{paymentMethodLabel(detailInvoice.payment_method)}</div></div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-zinc-100">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-zinc-50/80 border-b border-zinc-100"><th className="px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</th><th className="px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Qty</th><th className="px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Unit Price</th><th className="px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Line Total</th></tr></thead>
                <tbody>{(detailInvoice.items ?? []).map((i, idx) => <tr key={`${i.id ?? idx}`} className="border-b border-zinc-50 last:border-0"><td className="px-5 py-3 text-sm font-semibold text-zinc-800">{i.description}</td><td className="px-5 py-3 text-sm text-zinc-600">{i.quantity}</td><td className="px-5 py-3 text-sm text-zinc-600">{formatCurrency(i.unit_price)}</td><td className="px-5 py-3 text-sm font-semibold text-zinc-900">{formatCurrency(i.line_total)}</td></tr>)}</tbody>
              </table>
            </div>
            {detailInvoice.notes ? <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4"><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes</div><div className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">{detailInvoice.notes}</div></div> : null}
          </div>
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 space-y-3">
            <h3 className="text-lg font-black text-zinc-900">Payment Summary</h3>
            <div className="flex justify-between text-sm text-zinc-600"><span>Subtotal</span><span>{formatCurrency(detailInvoice.subtotal_amount ?? 0)}</span></div>
            <div className="flex justify-between text-sm text-zinc-600"><span>Discount</span><span>-{formatCurrency(detailInvoice.discount_amount ?? 0)}</span></div>
            <div className="flex justify-between text-sm text-zinc-600"><span>Tax</span><span>{formatCurrency(detailInvoice.tax_amount ?? 0)}</span></div>
            <div className="border-t border-zinc-100 pt-3 flex justify-between"><span className="text-sm font-bold text-zinc-900">Grand Total</span><span className="text-lg font-black text-zinc-900">{formatCurrency(detailInvoice.total_amount)}</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Invoices</h1><p className="text-zinc-500 mt-1">Track billing, payment status, and invoice actions.</p></div>
        <div className="flex gap-3">
          <button onClick={() => setStatusFilter((c) => (c === 'all' ? 'pending' : c === 'pending' ? 'paid' : c === 'paid' ? 'cancelled' : 'all'))} className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 uppercase tracking-widest">Status: {statusFilter === 'all' ? 'All' : statusLabel(statusFilter)}</button>
          <button onClick={openCreate} className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 uppercase tracking-widest">New Invoice</button>
        </div>
      </div>

      {notice ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600">{error}</div> : null}

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-zinc-50/30 border-b border-zinc-100"><th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Invoice</th><th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member</th><th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Plan</th><th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Amount</th><th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Date</th><th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th><th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th></tr></thead>
            <tbody className="divide-y divide-zinc-50">
              {invoices.length ? invoices.map((i) => <tr key={i.id} className="hover:bg-zinc-50/50"><td className="px-8 py-6 text-sm font-bold text-zinc-900">{i.invoice_number}</td><td className="px-8 py-6"><div className="text-sm font-bold text-zinc-900">{i.member?.full_name ?? 'Member'}</div><div className="text-xs text-zinc-400 font-medium">{i.member?.email ?? '-'}</div></td><td className="px-8 py-6 text-sm font-semibold text-zinc-700">{i.plan_name}</td><td className="px-8 py-6 text-sm font-black text-zinc-900">{formatCurrency(i.total_amount)}</td><td className="px-8 py-6 text-sm text-zinc-500 font-medium">{formatDate(i.issued_at)}</td><td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${i.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : i.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{statusLabel(i.status)}</span></td><td className="px-8 py-6"><button onClick={() => openDetail(i)} className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white">View Details</button></td></tr>) : <tr><td colSpan={7} className="px-8 py-20 text-center text-zinc-400 text-sm font-medium">{loading ? 'Loading invoices...' : 'No invoices found.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing {invoices.length} of {total} invoices</span>
          <div className="flex gap-2"><button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white disabled:opacity-30" disabled={page <= 1} onClick={() => loadInvoices(page - 1)}>Previous</button><button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white disabled:opacity-30" disabled={page >= lastPage} onClick={() => loadInvoices(page + 1)}>Next</button></div>
        </div>
      </div>

      {showCreate && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative z-[121] bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-5xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8"><div><h3 className="text-2xl font-black text-zinc-900">Create Invoice</h3><p className="text-sm text-zinc-400">Generate a new invoice and post payment when applicable.</p></div><button onClick={() => setShowCreate(false)} className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900">X</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-zinc-100 p-5 bg-zinc-50/40 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Invoice Number</label><input readOnly value="Auto-generated upon save" className="mt-2 w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-sm text-zinc-500" /></div>
                    <div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Invoice Date</label><input type="datetime-local" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} className="mt-2 w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm" /></div>
                  </div>
                  <div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Member</label><select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : '')} className="mt-2 w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm"><option value="">Select a registered member...</option>{members.map((m) => <option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>)}</select></div>
                  {selectedMember ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-white border border-zinc-100 p-4"><div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Name</div><div className="mt-1 text-sm font-semibold text-zinc-900">{selectedMember.full_name}</div></div><div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Membership Type</div><div className="mt-1 text-sm font-semibold text-zinc-900">{selectedMember.membership_plan?.name ?? 'Unassigned'}</div></div><div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Contact</div><div className="mt-1 text-sm font-semibold text-zinc-900">{selectedMember.phone ?? '-'}</div></div><div><div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</div><div className="mt-1 text-sm font-semibold text-zinc-900">{selectedMember.email}</div></div></div> : null}
                </div>
                <div className="rounded-2xl border border-zinc-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50"><h4 className="text-sm font-black text-zinc-900">Invoice Items</h4><button onClick={addRow} className="px-3 py-2 rounded-xl bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50">Add Row</button></div>
                  <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-zinc-50/30 border-b border-zinc-100"><th className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</th><th className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Quantity</th><th className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Unit Price</th><th className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Line Total</th><th className="px-4 py-3"></th></tr></thead><tbody>{items.map((i) => <tr key={i.id} className="border-b border-zinc-50 last:border-0"><td className="px-4 py-3"><input value={i.description} onChange={(e) => updateRow(i.id, 'description', e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-sm" /></td><td className="px-4 py-3 w-28"><input type="number" min="1" value={i.quantity} onChange={(e) => updateRow(i.id, 'quantity', e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-sm" /></td><td className="px-4 py-3 w-40"><input type="number" min="0" step="0.01" value={i.unitPrice} onChange={(e) => updateRow(i.id, 'unitPrice', e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-sm" /></td><td className="px-4 py-3 text-sm font-semibold text-zinc-900 w-40">{formatCurrency((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0))}</td><td className="px-4 py-3 text-right w-24"><button onClick={() => removeRow(i.id)} className="px-3 py-2 rounded-lg border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50">Remove</button></td></tr>)}</tbody></table></div>
                </div>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-zinc-100 p-5 space-y-4"><h4 className="text-sm font-black text-zinc-900">Payment Summary</h4><div className="flex justify-between text-sm text-zinc-600"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div><div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Discount</label><input type="number" min="0" step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="mt-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm" /></div><div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tax</label><input type="number" min="0" step="0.01" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} className="mt-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm" /></div><div className="pt-3 border-t border-zinc-100 flex justify-between"><span className="text-sm font-bold text-zinc-900">Grand Total</span><span className="text-lg font-black text-zinc-900">{formatCurrency(totals.grandTotal)}</span></div></div>
                <div className="rounded-2xl border border-zinc-100 p-5 space-y-4"><h4 className="text-sm font-black text-zinc-900">Payment</h4><div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payment Method</label><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"><option value="cash">Cash</option><option value="gcash">GCash</option><option value="bank_transfer">Bank Transfer</option></select></div><div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payment Status</label><select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentSelection)} className="mt-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></div><div><label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm resize-none" /></div></div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3"><button onClick={() => setShowCreate(false)} className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50">Cancel</button><button onClick={submitCreate} disabled={creating} className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 disabled:opacity-50">{creating ? 'Generating...' : 'Generate Invoice'}</button></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Invoices;
