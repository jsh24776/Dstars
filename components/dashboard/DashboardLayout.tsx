
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  setDashboardDeepLink,
  type DashboardDeepLinkKind,
  type DashboardTabId,
} from '../../services/dashboardDeepLink';

interface NavItem {
  id: DashboardTabId;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  tab: DashboardTabId;
  targetId?: number;
  targetKind?: DashboardDeepLinkKind;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM13 5a2 2 0 012-2h3a2 2 0 012 2v6a2 2 0 01-2 2h-3a2 2 0 01-2-2V5zM4 15a2 2 0 012-2h3a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM13 15a2 2 0 012-2h3a2 2 0 012 2v4a2 2 0 01-2 2h-3a2 2 0 01-2-2v-4z" /></svg> },
    { id: 'members', label: 'Members', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: 'plans', label: 'Membership Plans', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-8 4h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'invoices', label: 'Invoices', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h6m-6-4h6m-7 10l-2 2V5a2 2 0 012-2h10a2 2 0 012 2v17l-2-2H8z" /></svg> },
    { id: 'payments', label: 'Payments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h4m-6 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { id: 'attendance', label: 'Attendance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ], []);
  const activeItem = navItems.find((item) => item.id === activeTab);
  const baseUrl = useMemo(
    () => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
    []
  );

  const jsonHeaders: HeadersInit = useMemo(
    () => ({
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }),
    []
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (searchWrapRef.current.contains(event.target as Node)) return;
      setShowResults(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const lowered = query.toLowerCase();
        const navMatches: SearchResult[] = navItems
          .filter((item) => item.label.toLowerCase().includes(lowered))
          .map((item) => ({
            id: `nav-${item.id}`,
            title: item.label,
            subtitle: 'Open module',
            tab: item.id,
          }));

        const [membersRaw, plansRaw, invoicesRaw, paymentsRaw] = await Promise.all([
          fetch(`${baseUrl}/admin/api/members?search=${encodeURIComponent(query)}&per_page=4`, {
            credentials: 'include',
            headers: jsonHeaders,
          }).then((r) => r.json().catch(() => null)),
          fetch(`${baseUrl}/admin/api/membership-plans?search=${encodeURIComponent(query)}&per_page=4`, {
            credentials: 'include',
            headers: jsonHeaders,
          }).then((r) => r.json().catch(() => null)),
          fetch(`${baseUrl}/admin/api/invoices?per_page=20`, {
            credentials: 'include',
            headers: jsonHeaders,
          }).then((r) => r.json().catch(() => null)),
          fetch(`${baseUrl}/admin/api/payments?per_page=20`, {
            credentials: 'include',
            headers: jsonHeaders,
          }).then((r) => r.json().catch(() => null)),
        ]);

        const members: SearchResult[] = (Array.isArray(membersRaw?.data) ? membersRaw.data : []).map((member: any) => ({
          id: `member-${member.id}`,
          title: member.full_name ?? `Member #${member.id}`,
          subtitle: `Member • ${member.email ?? 'No email'}`,
          tab: 'members',
          targetId: Number(member.id),
          targetKind: 'member',
        }));

        const plans: SearchResult[] = (Array.isArray(plansRaw?.data) ? plansRaw.data : []).map((plan: any) => ({
          id: `plan-${plan.id}`,
          title: plan.name ?? `Plan #${plan.id}`,
          subtitle: `Plan • ${plan.duration_count ?? 1} ${plan.duration ?? 'month'}`,
          tab: 'plans',
          targetId: Number(plan.id),
          targetKind: 'plan',
        }));

        const invoices: SearchResult[] = (Array.isArray(invoicesRaw?.data) ? invoicesRaw.data : [])
          .filter((invoice: any) => {
            const invoiceNo = String(invoice.invoice_number ?? '').toLowerCase();
            const memberName = String(invoice.member?.full_name ?? '').toLowerCase();
            const planName = String(invoice.plan_name ?? '').toLowerCase();
            return invoiceNo.includes(lowered) || memberName.includes(lowered) || planName.includes(lowered);
          })
          .slice(0, 4)
          .map((invoice: any) => ({
            id: `invoice-${invoice.id}`,
            title: invoice.invoice_number ?? `Invoice #${invoice.id}`,
            subtitle: `Invoice • ${invoice.member?.full_name ?? 'Unknown member'}`,
            tab: 'invoices',
            targetId: Number(invoice.id),
            targetKind: 'invoice',
          }));

        const payments: SearchResult[] = (Array.isArray(paymentsRaw?.data) ? paymentsRaw.data : [])
          .filter((payment: any) => {
            const ref = String(payment.payment_reference ?? '').toLowerCase();
            const memberName = String(payment.member?.full_name ?? '').toLowerCase();
            return ref.includes(lowered) || memberName.includes(lowered);
          })
          .slice(0, 4)
          .map((payment: any) => ({
            id: `payment-${payment.id}`,
            title: payment.payment_reference ?? `Payment #${payment.id}`,
            subtitle: `Payment • ${payment.member?.full_name ?? 'Unknown member'}`,
            tab: 'payments',
            targetId: Number(payment.id),
            targetKind: 'payment',
          }));

        if (cancelled) return;
        const combined = [...navMatches, ...members, ...plans, ...invoices, ...payments].slice(0, 16);
        setSearchResults(combined);
        setHighlightedIndex(0);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [searchTerm, navItems, baseUrl, jsonHeaders]);

  const activateResult = (result: SearchResult) => {
    if (result.targetId && result.targetKind) {
      setDashboardDeepLink({ tab: result.tab, kind: result.targetKind, id: result.targetId });
    }
    onTabChange(result.tab);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-inter overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-zinc-100 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center px-6 border-b border-zinc-50">
          <span className="text-xl font-black tracking-tighter text-zinc-900">
            D{isSidebarOpen && 'STARS'}<span className="text-primary">.</span>
          </span>
        </div>
        
        <nav className="flex-grow py-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-red-600 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {isSidebarOpen && <span className="font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <h2 className="text-lg font-bold text-zinc-900">{activeItem?.label ?? 'Dashboard'}</h2>
          </div>
          
          <div className="flex items-center space-x-6">
            <div ref={searchWrapRef} className="hidden sm:block relative">
              <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2">
                <svg className="w-4 h-4 text-zinc-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={() => setShowResults(true)}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setShowResults(true);
                  }}
                  onKeyDown={(event) => {
                    if (!showResults || !searchResults.length) return;

                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setHighlightedIndex((index) => (index + 1) % searchResults.length);
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setHighlightedIndex((index) => (index - 1 + searchResults.length) % searchResults.length);
                    } else if (event.key === 'Enter') {
                      event.preventDefault();
                      activateResult(searchResults[highlightedIndex]);
                    } else if (event.key === 'Escape') {
                      setShowResults(false);
                    }
                  }}
                  placeholder="Search anything..."
                  className="bg-transparent border-none text-sm focus:outline-none text-zinc-600 w-56"
                />
              </div>

              {showResults && (searchTerm.trim().length > 0) && (
                <div className="absolute z-[130] mt-2 w-[420px] max-w-[70vw] rounded-2xl border border-zinc-100 bg-white shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                    {isSearching ? 'Searching...' : searchResults.length ? 'Search Results' : 'No Results'}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => activateResult(result)}
                        className={`w-full text-left px-4 py-3 border-b border-zinc-50 last:border-b-0 transition-colors ${
                          index === highlightedIndex ? 'bg-zinc-50' : 'hover:bg-zinc-50/70'
                        }`}
                      >
                        <div className="text-sm font-semibold text-zinc-900">{result.title}</div>
                        <div className="text-xs text-zinc-500">{result.subtitle}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button className="relative p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
            </button>

            <div className="hidden lg:flex items-center space-x-2 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Operational</span>
            </div>

            <button className="hidden md:flex items-center px-4 py-2 rounded-xl bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-all">
              Quick Actions
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            <div className="flex items-center space-x-3 border-l border-zinc-100 pl-6">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-zinc-900">Admin User</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Master Access</div>
              </div>
              <img src="/imgs/toji.jpg" className="w-10 h-10 rounded-xl border border-zinc-100" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-grow overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
