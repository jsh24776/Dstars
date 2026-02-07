
import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import Button from '../Button';

interface LoginProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onBackToLanding: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, onBackToLanding }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout 
      title="Welcome back."  
      subtitle="Enter your credentials to access your performance dashboard."
      image="/imgs/barb.jpg"
    >
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
            <button type="button" className="text-xs font-bold text-primary hover:opacity-80 transition-opacity">Forgot password?</button>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="remember" className="w-4 h-4 border-zinc-200 rounded text-primary focus:ring-primary" />
          <label htmlFor="remember" className="text-sm text-zinc-500">Remember me for 30 days</label>
        </div>
        <Button size="lg" className="w-full py-5">Sign In</Button>
        <div className="text-center pt-4">
          <p className="text-zinc-500 text-sm">
            Don't have an account? {' '}
            <button type="button" onClick={onNavigateToRegister} className="text-primary font-bold hover:underline">Apply now</button>
          </p>
          <button type="button" onClick={onBackToLanding} className="mt-8 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors">
            ← Back to Home
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
