import React, { useEffect, useMemo, useState } from 'react';

type InvoiceStatus = 'pending' | 'paid' | 'cancelled';

interface InvoiceMember {
  id: number;
  full_name: string;
  email: string;
  membership_id: string | null;
}

interface Invoice {
  id: number;
  invoice_number: string;
  member_id: number;
  plan_name: string;
  total_amount: string | number;
  status: InvoiceStatus;
  issued_at: string;
  member: InvoiceMember | null;
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

const formatCurrency = (value: string | number) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 'PHP 0.00';
  return `PHP ${numeric.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const baseUrl = useMemo(
    () => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
    []
  );

  const statusLabel = (status: InvoiceStatus) => {
    if (status === 'paid') return 'Paid';
    if (status === 'pending') return 'Pending';
    return 'Cancelled';
  };

  const loadInvoices = async (targetPage = page) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('page', String(targetPage));
    params.set('per_page', String(perPage));

    try {
      const response = await fetch(`${baseUrl}/admin/api/invoices?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices.');
      }

      const payload: PaginatedResponse<Invoice> = await response.json();
      setInvoices(payload.data);
      setPage(payload.meta.current_page);
      setLastPage(payload.meta.last_page);
      setTotal(payload.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load invoices.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const toggleStatusFilter = () => {
    setStatusFilter((current) => {
      if (current === 'all') return 'pending';
      if (current === 'pending') return 'paid';
      if (current === 'paid') return 'cancelled';
      return 'all';
    });
  };

  const openDetails = async (invoice: Invoice) => {
    setShowDetails(true);
    setActiveInvoice(invoice);

    try {
      const response = await fetch(`${baseUrl}/admin/api/invoices/${invoice.id}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) return;
      const payload = await response.json().catch(() => null);
      const updated = payload?.data?.invoice;
      if (updated?.id) {
        setActiveInvoice(updated);
      }
    } catch {
      // Keep existing data
    }
  };

  const cancelInvoice = async () => {
    if (!activeInvoice) return;
    if (activeInvoice.status === 'paid') return;

    const confirmed = window.confirm(`Cancel invoice ${activeInvoice.invoice_number}?`);
    if (!confirmed) return;

    const xsrfToken = getCookie('XSRF-TOKEN');

    try {
      const response = await fetch(`${baseUrl}/admin/api/invoices/${activeInvoice.id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.message ?? 'Unable to cancel invoice.');
        return;
      }

      const payload = await response.json().catch(() => null);
      const updated = payload?.data?.invoice;
      if (updated?.id) {
        setActiveInvoice(updated);
      }
      await loadInvoices(page);
    } catch {
      setError('Unable to cancel invoice.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Invoices</h1>
          <p className="text-zinc-500 mt-1">Track billing, payment status, and invoice actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleStatusFilter}
            className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest"
          >
            Status: {statusFilter === 'all' ? 'All' : statusLabel(statusFilter)}
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
              {invoices.length > 0 ? invoices.map((invoice) => (
                <tr key={invoice.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-zinc-900">{invoice.invoice_number}</td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-zinc-900">{invoice.member?.full_name ?? 'Member'}</div>
                    <div className="text-xs text-zinc-400 font-medium">Premium Member</div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-zinc-700">{invoice.plan_name}</td>
                  <td className="px-8 py-6 text-sm font-black text-zinc-900">{formatCurrency(invoice.total_amount)}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-medium">{formatDate(invoice.issued_at)}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : invoice.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                      {statusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetails(invoice)}
                        className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all"
                      >
                        View
                      </button>
                      <button className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all">
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="text-zinc-400 text-sm font-medium">
                      {isLoading ? 'Loading invoices...' : 'No invoices found.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing {invoices.length} of {total} invoices</span>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page <= 1}
              onClick={() => loadInvoices(page - 1)}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page >= lastPage}
              onClick={() => loadInvoices(page + 1)}
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

      {showDetails && activeInvoice && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Invoice Details</h3>
                <p className="text-sm text-zinc-400">Review invoice record and status.</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900"
              >
                X
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Invoice Number</span>
                <span className="font-semibold text-zinc-900">{activeInvoice.invoice_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Member</span>
                <span className="font-semibold text-zinc-900">{activeInvoice.member?.full_name ?? 'Member'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span>{activeInvoice.plan_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(activeInvoice.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-semibold text-zinc-900">{statusLabel(activeInvoice.status)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Issued</span>
                <span>{formatDate(activeInvoice.issued_at)}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
              >
                Close
              </button>
              <button
                onClick={cancelInvoice}
                disabled={activeInvoice.status === 'paid' || activeInvoice.status === 'cancelled'}
                className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 disabled:opacity-40"
              >
                Cancel Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
