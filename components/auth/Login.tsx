import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import Button from '../Button';

interface LoginProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onBackToLanding: () => void;
}

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : '';
};

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, onBackToLanding }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

    try {
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
      });

      const xsrfToken = getCookie('XSRF-TOKEN');

      const response = await fetch(`${baseUrl}/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
        body: JSON.stringify({
          email,
          password,
          remember,
        }),
      });

      if (!response.ok) {
        let message = 'The provided credentials are incorrect.';
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
          if (data?.errors?.email?.length) {
            message = data.errors.email[0];
          }
        } catch {
          // ignore parse errors
        }
        setError(message);
        return;
      }

      onLogin();
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back."  
      subtitle="Enter your credentials to access your performance dashboard."
      image="/imgs/barb.jpg"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
              placeholder="********" 
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 border-zinc-200 rounded text-primary focus:ring-primary"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <label htmlFor="remember" className="text-sm text-zinc-500">Remember me for 30 days</label>
        </div>
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}
        <Button size="lg" className="w-full py-5" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
        <div className="text-center pt-4">
          <p className="text-zinc-500 text-sm">
            Don't have an account? {' '}
            <button type="button" onClick={onNavigateToRegister} className="text-primary font-bold hover:underline">Apply now</button>
          </p>
          <button type="button" onClick={onBackToLanding} className="mt-8 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors">
            &larr; Back to Home
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
