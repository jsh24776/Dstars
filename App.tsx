import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Programs from './components/Programs';
import AIConcierge from './components/AIConcierge';
import Pricing from './components/Pricing';
import Trainers from './components/Trainers';
import Footer from './components/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Dashboard from './components/dashboard/Dashboard';
import Members from './components/dashboard/Members';
import MembershipPlans from './components/dashboard/MembershipPlans';
import Invoices from './components/dashboard/Invoices';
import Payments from './components/dashboard/Payments';
import Attendance from './components/dashboard/Attendance';
import type { DashboardTabId } from './services/dashboardDeepLink';
import MemberLayout, { type MemberTabId } from './components/member/layout/MemberLayout';
import MemberDashboard from './components/member/MemberDashboard';
import MemberDashboardContainer from './components/member/MemberDashboardContainer';
import MemberMembership from './components/member/MemberMembership';
import MemberMembershipContainer from './components/member/MemberMembershipContainer';
import MemberBilling from './components/member/MemberBilling';
import MemberBillingContainer from './components/member/MemberBillingContainer';
import MemberAttendance from './components/member/MemberAttendance';
import MemberAttendanceContainer from './components/member/MemberAttendanceContainer';
import MemberProfile from './components/member/MemberProfile';
import MemberLogin from './components/member/auth/MemberLogin';
import MemberForgotPassword from './components/member/auth/MemberForgotPassword';
import MemberResetPassword from './components/member/auth/MemberResetPassword';
import {
  clearMemberSession,
  fetchMemberMe,
  loadMemberAttendance,
  loadMemberBilling,
  loadMemberPlanSummary,
  loadMemberProfile,
  loadMemberSession,
  logoutMember,
  saveMemberProfile,
  submitPlanChangeRequest,
  updateMemberProfile,
  updateMemberPassword,
  type MemberSession,
} from './services/memberPortalService';

const DASHBOARD_TABS: DashboardTabId[] = ['dashboard', 'members', 'plans', 'invoices', 'payments', 'attendance'];
const MEMBER_TABS: MemberTabId[] = ['dashboard', 'membership', 'billing', 'attendance', 'profile'];

const getDashboardTabFromPath = (pathname: string): DashboardTabId => {
  const parts = pathname.split('/').filter(Boolean);
  const tab = (parts[1] ?? 'dashboard') as DashboardTabId;
  return DASHBOARD_TABS.includes(tab) ? tab : 'dashboard';
};

const getMemberTabFromPath = (pathname: string): MemberTabId => {
  const parts = pathname.split('/').filter(Boolean);
  const tab = (parts[1] ?? 'dashboard') as MemberTabId;
  return MEMBER_TABS.includes(tab) ? tab : 'dashboard';
};

const getInitialSelectedPlanId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem('selectedMembershipPlanId');
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(getInitialSelectedPlanId);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession | null>(loadMemberSession);

  const baseUrl = (import.meta as ImportMeta).env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : '';
  };

  const logoutAdmin = async () => {
    try {
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, { credentials: 'include' });
      const xsrfToken = getCookie('XSRF-TOKEN');

      await fetch(`${baseUrl}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });
    } catch {
      // Ignore logout failures; local auth state will still be cleared.
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${baseUrl}/admin/dashboard`, {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        setIsAdminAuthenticated(response.ok);
      } catch {
        setIsAdminAuthenticated(false);
      }

      const currentMemberSession = loadMemberSession();
      if (!currentMemberSession) {
        setMemberSession(null);
        setIsBootstrapping(false);
        return;
      }

      try {
        const freshUser = await fetchMemberMe(currentMemberSession.token);
        if (freshUser.role !== 'member') {
          clearMemberSession();
          setMemberSession(null);
          setIsBootstrapping(false);
          return;
        }
        setMemberSession({
          ...currentMemberSession,
          user: freshUser,
        });
      } catch {
        clearMemberSession();
        setMemberSession(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    checkSession();
  }, [baseUrl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const clearPlanSelection = () => {
    setSelectedPlanId(null);
    window.sessionStorage.removeItem('selectedMembershipPlanId');
  };

  const setPlanSelection = (planId: number) => {
    setSelectedPlanId(planId);
    window.sessionStorage.setItem('selectedMembershipPlanId', String(planId));
  };

  const activeTab = getDashboardTabFromPath(location.pathname);
  const memberActiveTab = getMemberTabFromPath(location.pathname);

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Members />;
      case 'plans':
        return <MembershipPlans />;
      case 'invoices':
        return <Invoices />;
      case 'payments':
        return <Payments />;
      case 'attendance':
        return <Attendance />;
      default:
        return <Dashboard />;
    }
  };

  const renderMemberContent = () => {
    if (!memberSession) return null;

    const plan = loadMemberPlanSummary(memberSession.user.email);
    const billing = loadMemberBilling();
    const attendance = loadMemberAttendance();
    const profile = loadMemberProfile(memberSession.user);

    switch (memberActiveTab) {
      case 'dashboard':
        return (
          <MemberDashboardContainer
            token={memberSession.token}
            fallbackPlan={plan}
            fallbackAttendance={attendance}
          />
        );
      case 'membership':
        return (
          <MemberMembershipContainer
            token={memberSession.token}
            email={memberSession.user.email}
            memberId={memberSession.user.id}
            fallbackPlan={plan}
          />
        );
      case 'billing':
        return (
          <MemberBillingContainer
            token={memberSession.token}
            fallbackItems={billing}
          />
        );
      case 'attendance':
        return (
          <MemberAttendanceContainer
            token={memberSession.token}
            fallbackItems={attendance}
          />
        );
      case 'profile':
        return (
          <MemberProfile
            profile={profile}
            onSaveProfile={async (nextProfile) => {
              const updated = await updateMemberProfile(memberSession.token, {
                full_name: nextProfile.fullName,
                phone: nextProfile.phone || undefined,
              });
              saveMemberProfile(memberSession.user.email, updated);
            }}
            onChangePassword={async ({ currentPassword, newPassword, confirmPassword }) => {
              await updateMemberPassword(memberSession.token, {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
              });
            }}
          />
        );
      default:
        return <MemberDashboard plan={plan} attendance={attendance} />;
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-white font-inter flex items-center justify-center text-zinc-500 text-sm font-semibold">
        Loading session...
      </div>
    );
  }

  const landingElement = (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white font-inter">
      <Navbar
        onNavigate={(view) => {
          if (view === 'landing') navigate('/');
          if (view === 'member-login') navigate('/member/login');
          if (view === 'login') navigate('/login');
          if (view === 'register') {
            clearPlanSelection();
            navigate('/register');
          }
        }}
      />
      <main>
        <Hero
          onJoin={() => {
            clearPlanSelection();
            navigate('/register');
          }}
        />
        <Programs />
        <AIConcierge />
        <Trainers />
        <Pricing
          onJoin={(planId) => {
            setPlanSelection(planId);
            navigate('/register');
          }}
        />

        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="relative rounded-[2.5rem] bg-zinc-900 p-12 md:p-24 overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <svg viewBox="0 0 400 400" className="w-full h-full text-white/10" fill="currentColor">
                  <circle cx="200" cy="200" r="150" />
                </svg>
              </div>

              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
                  Ready to transcend?
                </h2>
                <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
                  Join a community of focused high-performers. Your transformation begins with a single step.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => {
                      clearPlanSelection();
                      navigate('/register');
                    }}
                    className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                  >
                    Apply for Membership
                  </button>
                  <button className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-black transition-all">
                    Book a Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={landingElement} />

      <Route
        path="/login"
        element={
          isAdminAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLogin={() => {
                setIsAdminAuthenticated(true);
                navigate('/dashboard');
              }}
              onNavigateToRegister={() => navigate('/register')}
              onBackToLanding={() => navigate('/')}
            />
          )
        }
      />

      <Route
        path="/register"
        element={
          isAdminAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register
              onRegister={() => {
                setIsAdminAuthenticated(true);
                navigate('/dashboard');
              }}
              onNavigateToLogin={() => navigate('/member/login')}
              onBackToLanding={() => navigate('/')}
              preselectedPlanId={selectedPlanId}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAdminAuthenticated ? (
            <DashboardLayout
              activeTab={activeTab}
              onTabChange={(id) => navigate(id === 'dashboard' ? '/dashboard' : `/dashboard/${id}`)}
              onLogout={async () => {
                await logoutAdmin();
                setIsAdminAuthenticated(false);
                navigate('/');
              }}
            >
              {renderDashboardContent()}
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/dashboard/:tab"
        element={
          isAdminAuthenticated ? (
            <DashboardLayout
              activeTab={activeTab}
              onTabChange={(id) => navigate(id === 'dashboard' ? '/dashboard' : `/dashboard/${id}`)}
              onLogout={async () => {
                await logoutAdmin();
                setIsAdminAuthenticated(false);
                navigate('/');
              }}
            >
              {renderDashboardContent()}
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/member/login"
        element={
          memberSession ? (
            <Navigate to="/member/dashboard" replace />
          ) : (
            <MemberLogin
              onLogin={(session) => {
                setMemberSession(session);
                navigate('/member/dashboard');
              }}
              onForgotPassword={() => navigate('/member/forgot-password')}
              onApply={() => {
                clearPlanSelection();
                navigate('/register');
              }}
              onBackToLanding={() => navigate('/')}
            />
          )
        }
      />

      <Route
        path="/member/forgot-password"
        element={
          memberSession ? (
            <Navigate to="/member/dashboard" replace />
          ) : (
            <MemberForgotPassword
              onBackToLogin={() => navigate('/member/login')}
              onGoToReset={() => navigate('/member/reset-password')}
            />
          )
        }
      />

      <Route
        path="/member/reset-password"
        element={
          memberSession ? (
            <Navigate to="/member/dashboard" replace />
          ) : (
            <MemberResetPassword onBackToLogin={() => navigate('/member/login')} />
          )
        }
      />

      <Route
        path="/member/dashboard"
        element={
          memberSession ? (
            <MemberLayout
              activeTab={memberActiveTab}
              memberName={memberSession.user.name}
              onTabChange={(id) => navigate(id === 'dashboard' ? '/member/dashboard' : `/member/${id}`)}
              onLogout={async () => {
                await logoutMember(memberSession.token);
                setMemberSession(null);
                navigate('/member/login');
              }}
            >
              {renderMemberContent()}
            </MemberLayout>
          ) : (
            <Navigate to="/member/login" replace />
          )
        }
      />

      <Route
        path="/member/:tab"
        element={
          memberSession ? (
            <MemberLayout
              activeTab={memberActiveTab}
              memberName={memberSession.user.name}
              onTabChange={(id) => navigate(id === 'dashboard' ? '/member/dashboard' : `/member/${id}`)}
              onLogout={async () => {
                await logoutMember(memberSession.token);
                setMemberSession(null);
                navigate('/member/login');
              }}
            >
              {renderMemberContent()}
            </MemberLayout>
          ) : (
            <Navigate to="/member/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => <AppRoutes />;

export default App;
