import React, { useMemo, useState } from 'react';

export type MemberTabId = 'dashboard' | 'membership' | 'billing' | 'attendance' | 'profile';

interface MemberNavItem {
  id: MemberTabId;
  label: string;
  icon: React.ReactNode;
}

interface MemberLayoutProps {
  children: React.ReactNode;
  activeTab: MemberTabId;
  memberName: string;
  onTabChange: (id: MemberTabId) => void;
  onLogout: () => void;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({
  children,
  activeTab,
  memberName,
  onTabChange,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems: MemberNavItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM13 5a2 2 0 012-2h3a2 2 0 012 2v6a2 2 0 01-2 2h-3a2 2 0 01-2-2V5zM4 15a2 2 0 012-2h3a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM13 15a2 2 0 012-2h3a2 2 0 012 2v4a2 2 0 01-2 2h-3a2 2 0 01-2-2v-4z" /></svg>,
      },
      {
        id: 'membership',
        label: 'My Membership',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-8 4h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      },
      {
        id: 'billing',
        label: 'Billing & Receipts',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h4m-6 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      },
      {
        id: 'attendance',
        label: 'Attendance History',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7.5 7.5 0 1118.88 17.8M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      },
    ],
    []
  );

  const activeItem = navItems.find((item) => item.id === activeTab);

  return (
    <div className="flex h-screen bg-zinc-50 font-inter overflow-hidden">
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

      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <h2 className="text-lg font-bold text-zinc-900">{activeItem?.label ?? 'Member Portal'}</h2>
          </div>

          <div className="flex items-center space-x-3 border-l border-zinc-100 pl-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-zinc-900">{memberName || 'Member'}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Member Access</div>
            </div>
            <img src="/imgs/self.jpg" className="w-10 h-10 rounded-xl border border-zinc-100 object-cover" alt="Member" />
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
