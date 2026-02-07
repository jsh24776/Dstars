
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AuthLayout from './AuthLayout';
import Button from '../Button';
import { PRICING_PLANS } from '../../constants';

interface RegisterProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
  preselectedPlanId?: string | null;
}

const Register: React.FC<RegisterProps> = ({
  onRegister: _onRegister,
  onNavigateToLogin,
  onBackToLanding,
  preselectedPlanId
}) => {
  const [step, setStep] = useState<'details' | 'verify' | 'invoice' | 'success' | 'member-id'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState(preselectedPlanId ?? PRICING_PLANS[0]?.id ?? 'basic');
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerified, setShowVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya'>('gcash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isTransitioningToId, setIsTransitioningToId] = useState(false);
  const [memberId] = useState(() => `DST-${Math.floor(100000 + Math.random() * 900000)}`);
  const verifyTimeoutRef = useRef<number | null>(null);
  const paymentTimeoutRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const qrMatrix = useMemo(() => {
    const size = 21;
    const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    const placeFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y += 1) {
        for (let x = 0; x < 7; x += 1) {
          const isBorder = x === 0 || y === 0 || x === 6 || y === 6;
          const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          if (isBorder || isCenter) {
            matrix[oy + y][ox + x] = true;
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(size - 7, 0);
    placeFinder(0, size - 7);

    for (let i = 8; i < size - 8; i += 1) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    const hash = (input: string) => {
      let value = 5381;
      for (let i = 0; i < input.length; i += 1) {
        value = ((value << 5) + value) ^ input.charCodeAt(i);
      }
      return value >>> 0;
    };

    let seed = hash(memberId);
    const nextBit = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) & 1;
    };

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const inFinder =
          (x < 7 && y < 7) ||
          (x >= size - 7 && y < 7) ||
          (x < 7 && y >= size - 7);
        const inTiming = x === 6 || y === 6;
        if (!inFinder && !inTiming) {
          matrix[y][x] = nextBit() === 1;
        }
      }
    }

    return matrix;
  }, [memberId]);

  useEffect(() => {
    if (preselectedPlanId) {
      setPlanId(preselectedPlanId);
    }
  }, [preselectedPlanId]);

  useEffect(() => {
    return () => {
      if (verifyTimeoutRef.current) window.clearTimeout(verifyTimeoutRef.current);
      if (paymentTimeoutRef.current) window.clearTimeout(paymentTimeoutRef.current);
      if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const selectedPlan = useMemo(
    () => PRICING_PLANS.find((plan) => plan.id === planId) ?? PRICING_PLANS[0],
    [planId]
  );

  const priceValue = useMemo(() => {
    const sanitized = (selectedPlan?.price ?? '0').replace(/,/g, '');
    const numeric = Number(sanitized);
    return Number.isNaN(numeric) ? 0 : numeric;
  }, [selectedPlan]);

  const taxValue = Math.round(priceValue * 0.06);
  const totalValue = priceValue + taxValue;
  const formattedPrice = (value: number) => value.toLocaleString('en-PH');

  const handleDetailsSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStep('verify');
  };

  const handleVerify = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setShowVerified(false);
    verifyTimeoutRef.current = window.setTimeout(() => {
      setShowVerified(true);
      verifyTimeoutRef.current = window.setTimeout(() => {
        setIsVerifying(false);
        setStep('invoice');
      }, 600);
    }, 800);
  };

  const handlePayment = () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    paymentTimeoutRef.current = window.setTimeout(() => {
      setIsProcessingPayment(false);
      setStep('success');
      setIsTransitioningToId(true);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioningToId(false);
        setStep('member-id');
      }, 1400);
    }, 900);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'details', label: 'Details' },
      { id: 'verify', label: 'Verify' },
      { id: 'invoice', label: 'Invoice' },
      { id: 'success', label: 'Receipt' },
      { id: 'member-id', label: 'Member ID' }
    ];

    return (
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-zinc-400 mb-10">
        {steps.map((item, index) => {
          const isActive = step === item.id;
          const isCompleted = steps.findIndex((s) => s.id === step) > index;
          return (
            <div key={item.id} className="flex-1 flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                  isActive
                    ? 'border-primary text-primary bg-primary/10'
                    : isCompleted
                      ? 'border-primary text-white bg-primary'
                      : 'border-zinc-200 text-zinc-400 bg-white'
                }`}
              >
                {index + 1}
              </div>
              <span className={`font-semibold ${isActive ? 'text-zinc-900' : isCompleted ? 'text-zinc-700' : ''}`}>
                {item.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 ${isCompleted ? 'bg-primary' : 'bg-zinc-200'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailsStep = () => (
    <form className="space-y-6" onSubmit={handleDetailsSubmit}>
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
        <p className="text-sm text-zinc-500">
          Minimal details. No password. Average time to complete: under 60 seconds.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
        <input
          type="text"
          placeholder="Alexandra Cruz"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Phone Number</label>
        <input
          type="tel"
          placeholder="+63 9XX XXX XXXX"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
          required
        />
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Selected Membership Plan</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRICING_PLANS.map((plan) => {
            const isSelected = plan.id === planId;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setPlanId(plan.id)}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
                    <p className="text-xs text-zinc-500">PHP {plan.price}/mo</p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      isSelected ? 'border-primary bg-primary' : 'border-zinc-300'
                    }`}
                  ></div>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  {plan.features[0]}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      <Button size="lg" className="w-full py-5" style={{ backgroundColor: 'rgb(127, 127, 127)' }}>
        Continue
      </Button>
      <div className="text-center pt-2">
        <p className="text-zinc-500 text-sm">
          Already a member?{' '}
          <button type="button" onClick={onNavigateToLogin} className="text-primary font-bold hover:underline">
            Sign in
          </button>
        </p>
        <button
          type="button"
          onClick={onBackToLanding}
          className="mt-4 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </form>
  );

  const renderVerifyStep = () => (
    <div className="space-y-8">
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
        <p className="text-sm text-zinc-500">We've sent a confirmation code to your email.</p>
        <p className="text-xs text-zinc-400 mt-2">Check your inbox at {email || 'your email'}.</p>
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">6-Digit Code</label>
        <div className="flex items-center justify-between gap-2">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => {
                const value = event.target.value.replace(/[^0-9]/g, '');
                const updated = [...verificationCode];
                updated[index] = value;
                setVerificationCode(updated);
              }}
              className="w-full h-12 text-center text-lg font-semibold rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Didn't receive the code?</span>
          <button type="button" className="text-primary font-semibold hover:underline">
            Resend code
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full py-5"
          style={{ backgroundColor: 'rgb(127, 127, 127)' }}
          onClick={handleVerify}
          disabled={verificationCode.join('').length < 6 || isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Confirm'}
        </Button>
        {showVerified && (
          <div className="flex items-center justify-center gap-3 text-sm text-emerald-600 font-semibold">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Verified. Moving to invoice...
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setStep('details')}
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          Back to Details
        </button>
        <button
          type="button"
          onClick={onBackToLanding}
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderInvoiceStep = () => (
    <div className="space-y-8">
      <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Selected Plan</p>
            <h3 className="text-2xl font-bold text-zinc-900">{selectedPlan?.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Monthly</p>
            <p className="text-2xl font-black text-zinc-900">PHP {selectedPlan?.price}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-zinc-200 pt-6 space-y-3 text-sm text-zinc-500">
          <div className="flex items-center justify-between">
            <span>Membership</span>
            <span>PHP {formattedPrice(priceValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax & Fees</span>
            <span>PHP {formattedPrice(taxValue)}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-900 font-semibold">
            <span>Total Amount</span>
            <span>PHP {formattedPrice(totalValue)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Client Summary</p>
        <div className="space-y-2 text-sm text-zinc-600">
          <div className="flex items-center justify-between">
            <span>Name</span>
            <span className="font-semibold text-zinc-900">{fullName || 'Member Name'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Email</span>
            <span>{email || 'name@example.com'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Phone</span>
            <span>{phone || '+63 9XX XXX XXXX'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Payment Method</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('gcash')}
            className={`rounded-2xl border p-5 text-left transition-all ${
              paymentMethod === 'gcash'
                ? 'border-[#00AEEF] bg-[#00AEEF]/10 shadow-lg'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#00AEEF] text-white flex items-center justify-center font-bold">
                G
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">GCash</p>
                <p className="text-xs text-zinc-500">Instant wallet payment</p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('maya')}
            className={`rounded-2xl border p-5 text-left transition-all ${
              paymentMethod === 'maya'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Maya</p>
                <p className="text-xs text-zinc-500">Secure checkout</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full py-5"
          style={{ backgroundColor: 'rgb(127, 127, 127)' }}
          onClick={handlePayment}
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? 'Processing...' : 'Proceed to Payment'}
        </Button>
        <button
          type="button"
          onClick={() => setStep('verify')}
          className="w-full text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          Back to Verification
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => {
    const transactionId = `DST-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div className="space-y-8">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold">
            OK
          </div>
          <h3 className="mt-4 text-2xl font-bold text-zinc-900">Payment Successful</h3>
          <p className="text-sm text-zinc-500 mt-2">
            Welcome to Dstars. Your membership is now active.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Receipt</p>
              <h4 className="text-xl font-bold text-zinc-900">Membership Confirmation</h4>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Paid
            </span>
          </div>
          <div className="space-y-3 text-sm text-zinc-600">
            <div className="flex items-center justify-between">
              <span>Transaction ID</span>
              <span className="font-semibold text-zinc-900">{transactionId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Client Name</span>
              <span className="font-semibold text-zinc-900">{fullName || 'Member Name'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Plan</span>
              <span>{selectedPlan?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Amount Paid</span>
              <span className="font-semibold text-zinc-900">PHP {formattedPrice(totalValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment Method</span>
              <span>{paymentMethod === 'gcash' ? 'GCash' : 'Maya'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Date</span>
              <span>{transactionDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            size="lg"
            className="w-full py-5"
            style={{ backgroundColor: 'rgb(127, 127, 127)' }}
          >
            Download Receipt
          </Button>
          <Button variant="outline" size="lg" className="w-full py-5" onClick={onBackToLanding}>
            Return to Home
          </Button>
        </div>
        {isTransitioningToId && (
          <div className="flex items-center justify-center gap-3 text-sm text-zinc-500 font-semibold">
            Preparing your Virtual ID...
          </div>
        )}
      </div>
    );
  };

  const renderMemberIdStep = () => {
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(startDate.getFullYear() + 1);

    const formatDate = (value: Date) =>
      value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div className="space-y-8">
        <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold tracking-widest">
            ACTIVE
          </div>
          <h3 className="mt-4 text-2xl font-bold text-zinc-900">
            Welcome to DStars Gym - Your Membership is Now Active.
          </h3>
          <p className="text-sm text-zinc-500 mt-2">
            Present your virtual ID at the front desk to access the gym.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Virtual Member ID</p>
              <h4 className="text-xl font-bold text-zinc-900">{fullName || 'Member Name'}</h4>
              <p className="text-xs text-zinc-500 mt-1">{selectedPlan?.name} Plan</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold tracking-tight text-zinc-900">
                DSTARS<span className="text-primary">.</span>
              </div>
              <p className="text-xs text-zinc-400">Premium Fitness</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1.4fr_0.6fr] gap-6">
            <div className="space-y-3 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Member ID</span>
                <span className="font-semibold text-zinc-900">{memberId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Start Date</span>
                <span>{formatDate(startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Expiry Date</span>
                <span>{formatDate(expiryDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Level</span>
                <span>{selectedPlan?.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4">
              <div className="rounded-xl bg-white p-3 shadow-sm border border-zinc-100">
                <svg viewBox="0 0 21 21" className="h-24 w-24 text-zinc-900" shapeRendering="crispEdges">
                  <rect x="0" y="0" width="21" height="21" fill="white" />
                  {qrMatrix.map((row, y) =>
                    row.map((isOn, x) =>
                      isOn ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="black" /> : null
                    )
                  )}
                </svg>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Present this Virtual ID at the front desk to access the gym.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            size="lg"
            className="w-full py-5"
            style={{ backgroundColor: 'rgb(127, 127, 127)' }}
          >
            Download Virtual ID
          </Button>
          <Button variant="outline" size="lg" className="w-full py-5">
            Save to Phone
          </Button>
          <Button variant="outline" size="lg" className="w-full py-5">
            Add to Apple Wallet
          </Button>
          <Button variant="outline" size="lg" className="w-full py-5">
            Add to Google Wallet
          </Button>
          <Button variant="outline" size="lg" className="w-full py-5" onClick={onBackToLanding}>
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  };

  const headerTitle = {
    details: 'Join the Elite.',
    verify: 'Confirm your email.',
    invoice: 'Review your invoice.',
    success: 'Membership activated.',
    'member-id': 'Your virtual member ID.'
  }[step];

  const headerSubtitle = {
    details: 'Complete your membership request in under a minute.',
    verify: 'Enter the code we sent to secure your membership.',
    invoice: 'Finalize your membership with a secure payment.',
    success: 'A receipt has been issued for your records.',
    'member-id': 'Your digital access pass is ready.'
  }[step];

  return (
    <AuthLayout 
      title={headerTitle}
      subtitle={headerSubtitle}
      image="/imgs/back.jpg"
      maxWidthClass="max-w-2xl"
    >
      <div key={step} style={{ animation: 'fadeIn 0.4s ease' }}>
        {renderStepIndicator()}
        {step === 'details' && renderDetailsStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'invoice' && renderInvoiceStep()}
        {step === 'success' && renderSuccessStep()}
        {step === 'member-id' && renderMemberIdStep()}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AuthLayout>
  );
};

export default Register;
