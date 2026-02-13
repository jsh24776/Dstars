import React, { useEffect, useMemo, useState } from 'react';
import type { MembershipPlan } from '../types';
import { fetchPublicMembershipPlans } from '../services/membershipPlanService';
import Button from './Button';

interface PricingProps {
  onJoin?: (planId: number) => void;
}

const formatPlanCycle = (plan: MembershipPlan) => {
  if (plan.duration === 'day') return '/day';
  if (plan.duration_count === 1) return `/${plan.duration}`;
  return `/${plan.duration_count} ${plan.duration}s`;
};

const Pricing: React.FC<PricingProps> = ({ onJoin }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      setIsLoading(true);
      setError('');

      try {
        const list = await fetchPublicMembershipPlans();
        if (!isMounted) return;
        setPlans(list);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load plans.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredPlanId = useMemo(() => {
    if (plans.length === 0) return null;
    return [...plans].sort((a, b) => b.duration_count - a.duration_count)[0]?.id ?? null;
  }, [plans]);

  const loadingCards = Array.from({ length: 3 }, (_, index) => (
    <div
      key={`skeleton-${index}`}
      className="relative flex flex-col p-10 rounded-3xl bg-white text-zinc-900 border border-zinc-100"
    >
      <div className="h-6 w-32 rounded bg-zinc-100 mb-4" />
      <div className="h-12 w-40 rounded bg-zinc-100 mb-8" />
      <div className="space-y-4 mb-10 flex-grow">
        <div className="h-4 w-full rounded bg-zinc-100" />
        <div className="h-4 w-11/12 rounded bg-zinc-100" />
        <div className="h-4 w-10/12 rounded bg-zinc-100" />
      </div>
      <div className="h-12 w-full rounded-2xl bg-zinc-100" />
    </div>
  ));

  return (
    <section id="pricing" className="py-24 md:py-32 bg-zinc-50">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Membership</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight mb-6">Invest in your performance.</h3>
          <p className="text-zinc-500 text-lg">
            Flexible plans designed to accommodate your journey from beginner to elite athlete.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {isLoading && loadingCards}

          {!isLoading && plans.map((plan) => {
            const recommended = featuredPlanId === plan.id;
            const planFeatures = plan.features.length > 0 ? plan.features : ['Premium gym access'];

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-10 rounded-3xl transition-all duration-300 ${
                  recommended
                    ? 'text-white shadow-2xl scale-105 z-10'
                    : 'bg-white text-zinc-900 border border-zinc-100 hover:shadow-lg'
                }`}
                style={recommended ? { backgroundColor: 'rgb(127, 127, 127)' } : {}}
              >
                {recommended && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                <div className="mb-8">
                  <span className="text-4xl md:text-5xl font-black">PHP {plan.price.toLocaleString('en-PH')}</span>
                  <span className={recommended ? 'text-zinc-500' : 'text-zinc-400'}>{formatPlanCycle(plan)}</span>
                </div>

                <ul className="text-left space-y-4 mb-10 flex-grow">
                  {planFeatures.map((feature, idx) => (
                    <li key={`${plan.id}-feature-${idx}`} className="flex items-center text-sm font-medium">
                      <svg className="w-4 h-4 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={recommended ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => onJoin?.(plan.id)}
                >
                  Choose Plan
                </Button>
              </div>
            );
          })}

          {!isLoading && plans.length === 0 && (
            <div className="md:col-span-3 bg-white text-zinc-900 border border-zinc-100 rounded-3xl p-10">
              <p className="text-lg font-semibold">No membership plans available right now.</p>
              <p className="text-zinc-500 mt-2">Please check back shortly.</p>
            </div>
          )}
        </div>

        {!isLoading && error && (
          <div className="max-w-2xl mx-auto mt-6 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
