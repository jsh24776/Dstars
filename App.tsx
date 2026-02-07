
import React, { useState } from 'react';
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
import Overview from './components/dashboard/Overview';
import Members from './components/dashboard/Members';
import TrainersAdmin from './components/dashboard/TrainersAdmin';
import Schedule from './components/dashboard/Schedule';

type View = 'landing' | 'login' | 'register' | 'dashboard';
type DashboardTab = 'overview' | 'members' | 'trainers' | 'schedule';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const navigateTo = (view: View) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  const renderDashboardContent = () => {
    switch (dashboardTab) {
      case 'overview': return <Overview />;
      case 'members': return <Members />;
      case 'trainers': return <TrainersAdmin />;
      case 'schedule': return <Schedule />;
      default: return <Overview />;
    }
  };

  if (currentView === 'dashboard') {
    return (
      <DashboardLayout 
        activeTab={dashboardTab} 
        onTabChange={(id) => setDashboardTab(id as DashboardTab)}
        onLogout={() => navigateTo('landing')}
      >
        {renderDashboardContent()}
      </DashboardLayout>
    );
  }

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={() => navigateTo('dashboard')} 
        onNavigateToRegister={() => navigateTo('register')}
        onBackToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register 
        onRegister={() => navigateTo('dashboard')} 
        onNavigateToLogin={() => navigateTo('login')}
        onBackToLanding={() => navigateTo('landing')}
        preselectedPlanId={selectedPlanId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white font-inter">
      <Navbar onNavigate={(v) => { 
        if (v === 'register') setSelectedPlanId(null);
        navigateTo(v as View); 
      }} />
      <main>
        <Hero onJoin={() => { setSelectedPlanId(null); navigateTo('register'); }} />
        <Programs />
        <AIConcierge />
        <Trainers />
        <Pricing onJoin={(planId) => { setSelectedPlanId(planId); navigateTo('register'); }} />
        
        {/* Call to Action Section */}
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
                    onClick={() => { setSelectedPlanId(null); navigateTo('register'); }}
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
};

export default App;
