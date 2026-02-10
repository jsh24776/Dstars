import React, { useEffect, useMemo, useState } from 'react';

type PaymentStatus = 'recorded' | 'confirmed';

type PaymentMethod = 'gcash' | 'maya' | 'cash' | 'bank_transfer';

interface PaymentMember {
  id: number;
  full_name: string;
  email: string;
  membership_id: string | null;
}

interface PaymentInvoice {
  id: number;
  invoice_number: string;
  status: string;
  total_amount: string | number;
}

interface Payment {
  id: number;
  payment_reference: string;
  invoice_id: number;
  member_id: number;
  amount_paid: string | number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_at: string;
  member: PaymentMember | null;
  invoice: PaymentInvoice | null;
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

interface FinanceSummary {
  total_revenue: string | number;
  revenue_this_month: string | number;
  paid_amount: string | number;
  pending_amount: string | number;
  active_members: number;
  recent_payments: Payment[];
}

const formatCurrency = (value: string | number) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 'PHP 0.00';
  return `PHP ${numeric.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const paymentStatusLabel = (status: PaymentStatus) => {
  if (status === 'confirmed') return 'Captured';
  return 'Processing';
};

const paymentMethodLabel = (method: PaymentMethod) => {
  if (method === 'gcash') return 'GCash Wallet';
  if (method === 'maya') return 'Maya Wallet';
  if (method === 'cash') return 'Cash';
  return 'Bank Transfer';
};

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const baseUrl = useMemo(
    () => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
    []
  );

  const loadSummary = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/api/finance-summary`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) return;
      const payload = await response.json().catch(() => null);
      if (payload?.data) {
        setSummary(payload.data as FinanceSummary);
      }
    } catch {
      // Silent
    }
  };

  const loadPayments = async (targetPage = page) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (methodFilter !== 'all') params.set('payment_method', methodFilter);
    if (statusFilter !== 'all') params.set('payment_status', statusFilter);
    params.set('page', String(targetPage));
    params.set('per_page', String(perPage));

    try {
      const response = await fetch(`${baseUrl}/admin/api/payments?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments.');
      }

      const payload: PaginatedResponse<Payment> = await response.json();
      setPayments(payload.data);
      setPage(payload.meta.current_page);
      setLastPage(payload.meta.last_page);
      setTotal(payload.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load payments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadPayments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methodFilter, statusFilter]);

  const toggleMethodFilter = () => {
    setMethodFilter((current) => {
      if (current === 'all') return 'gcash';
      if (current === 'gcash') return 'maya';
      if (current === 'maya') return 'cash';
      if (current === 'cash') return 'bank_transfer';
      return 'all';
    });
  };

  const toggleStatusFilter = () => {
    setStatusFilter((current) => {
      if (current === 'all') return 'confirmed';
      if (current === 'confirmed') return 'recorded';
      return 'all';
    });
  };

  const openDetails = async (payment: Payment) => {
    setShowDetails(true);
    setActivePayment(payment);

    try {
      const response = await fetch(`${baseUrl}/admin/api/payments/${payment.id}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) return;
      const payload = await response.json().catch(() => null);
      const updated = payload?.data?.payment;
      if (updated?.id) {
        setActivePayment(updated);
      }
    } catch {
      // Silent
    }
  };

  const summaryCards = [
    {
      label: 'Total Captured',
      value: formatCurrency(summary?.total_revenue ?? 0),
      meta: 'Last 30 days',
      tone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Processing',
      value: formatCurrency(summary?.pending_amount ?? 0),
      meta: 'Pending invoices',
      tone: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Failed',
      value: 'PHP 0.00',
      meta: '0 transactions',
      tone: 'bg-red-50 text-red-600 border-red-100',
    },
  ];

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
        {summaryCards.map((card) => (
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
            <button
              onClick={toggleMethodFilter}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all"
            >
              Method: {methodFilter === 'all' ? 'All' : paymentMethodLabel(methodFilter)}
            </button>
            <button
              onClick={toggleStatusFilter}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all"
            >
              Status: {statusFilter === 'all' ? 'All' : paymentStatusLabel(statusFilter)}
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
              {payments.length > 0 ? payments.map((tx) => (
                <tr key={tx.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-zinc-900">{tx.payment_reference}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-zinc-700">{tx.member?.full_name ?? 'Member'}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500">{paymentMethodLabel(tx.payment_method)}</td>
                  <td className="px-8 py-6 text-sm font-black text-zinc-900">{formatCurrency(tx.amount_paid)}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500">{formatDate(tx.paid_at)}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        tx.payment_status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {paymentStatusLabel(tx.payment_status)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => openDetails(tx)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="text-zinc-400 text-sm font-medium">
                      {isLoading ? 'Loading payments...' : 'No payments found.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing {payments.length} of {total} transactions</span>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page <= 1}
              onClick={() => loadPayments(page - 1)}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white transition-all disabled:opacity-30"
              disabled={page >= lastPage}
              onClick={() => loadPayments(page + 1)}
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

      {showDetails && activePayment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Payment Details</h3>
                <p className="text-sm text-zinc-400">Trace payment to its invoice.</p>
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
                <span>Reference</span>
                <span className="font-semibold text-zinc-900">{activePayment.payment_reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Member</span>
                <span className="font-semibold text-zinc-900">{activePayment.member?.full_name ?? 'Member'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Invoice</span>
                <span className="font-semibold text-zinc-900">{activePayment.invoice?.invoice_number ?? 'Invoice'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Amount</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(activePayment.amount_paid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Method</span>
                <span>{paymentMethodLabel(activePayment.payment_method)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-semibold text-zinc-900">{paymentStatusLabel(activePayment.payment_status)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Paid At</span>
                <span>{formatDate(activePayment.paid_at)}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
