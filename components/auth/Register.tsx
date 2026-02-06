
import React from 'react';
import AuthLayout from './AuthLayout';
import Button from '../Button';
import { PRICING_PLANS } from '../../constants';

interface RegisterProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin, onBackToLanding }) => {
  return (
    <AuthLayout 
      title="Join the Elite." 
      subtitle="Complete your application to begin your journey with Dstars."
      image="/imgs/back.jpg"
    >
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onRegister(); }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">First Name</label>
            <input 
              type="text" 
              placeholder="John" 
              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Last Name</label>
            <input 
              type="text" 
              placeholder="Doe" 
              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Select Plan</label>
          <select className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900 appearance-none">
            {PRICING_PLANS.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name} — ₱{plan.price}/mo</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
            required
          />
        </div>
        <div className="flex items-start space-x-2 pt-2">
          <input type="checkbox" id="terms" className="mt-1 w-4 h-4 border-zinc-200 rounded text-primary focus:ring-primary" required />
          <label htmlFor="terms" className="text-xs text-zinc-500 leading-relaxed">
            I agree to the Terms of Service and Privacy Policy. I understand that my membership application is subject to review.
          </label>
        </div>
        <Button size="lg" className="w-full py-5" style={{ backgroundColor: 'rgb(127, 127, 127)' }}>Create Account</Button>
        <div className="text-center pt-4">
          <p className="text-zinc-500 text-sm">
            Already a member? {' '}
            <button type="button" onClick={onNavigateToLogin} className="text-primary font-bold hover:underline">Sign in</button>
          </p>
          <button type="button" onClick={onBackToLanding} className="mt-6 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors">
            ← Back to Home
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
