import React, { useState } from 'react';
import AuthLayout from '../../auth/AuthLayout';
import Button from '../../Button';
import { clearMemberSession, loginMember, type MemberSession } from '../../../services/memberPortalService';

interface MemberLoginProps {
  onLogin: (session: MemberSession) => void;
  onForgotPassword: () => void;
  onBackToLanding: () => void;
  onApply: () => void;
}

const MemberLogin: React.FC<MemberLoginProps> = ({ onLogin, onForgotPassword, onBackToLanding, onApply }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const session = await loginMember(email, password);
      if (session.user.role !== 'member') {
        clearMemberSession();
        setError('This account is not a member account.');
        return;
      }
      onLogin(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Member portal login."
      subtitle="Sign in to view your membership, billing, attendance, and profile."
      image="/imgs/gym.jpg"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
            <button type="button" onClick={onForgotPassword} className="text-xs font-bold text-primary hover:opacity-80 transition-opacity">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        <Button size="lg" className="w-full py-5" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center pt-4 space-y-3">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onApply}
              className="text-primary font-bold hover:underline"
            >
              Apply now
            </button>
          </p>
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors"
          >
            &larr; Back to Home
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default MemberLogin;
