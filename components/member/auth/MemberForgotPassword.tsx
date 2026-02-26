import React, { useState } from 'react';
import AuthLayout from '../../auth/AuthLayout';
import Button from '../../Button';
import { requestMemberPasswordReset } from '../../../services/memberPortalService';

interface MemberForgotPasswordProps {
  onBackToLogin: () => void;
  onGoToReset: () => void;
}

const MemberForgotPassword: React.FC<MemberForgotPasswordProps> = ({ onBackToLogin, onGoToReset }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [error, setError] = useState('');

  return (
    <AuthLayout
      title="Recover your account."
      subtitle="Enter your email and we will send reset instructions."
      image="/imgs/dark.jpg"
    >
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitted(false);
          setError('');
          setDebugCode('');
          setIsSubmitting(true);
          try {
            const response = await requestMemberPasswordReset(email);
            setMessage(response.message);
            setDebugCode(response.debugCode ?? '');
            setSubmitted(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to send reset code.');
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
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

        {submitted && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
            {message || 'If your email exists, reset instructions have been sent.'}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}
        {debugCode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 font-semibold">
            Dev Reset Code: <span className="font-bold tracking-widest">{debugCode}</span>
          </div>
        )}

        <Button size="lg" className="w-full py-5" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Code'}
        </Button>

        {submitted && (
          <button
            type="button"
            onClick={onGoToReset}
            className="w-full text-center text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
          >
            Enter Reset Code
          </button>
        )}

        <div className="text-center pt-4">
          <button type="button" onClick={onBackToLogin} className="text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors">
            &larr; Back to Member Login
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default MemberForgotPassword;
