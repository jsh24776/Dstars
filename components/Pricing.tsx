
import React from 'react';
import { PRICING_PLANS } from '../constants.tsx';
import Button from './Button';

const Pricing: React.FC = () => {
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
          {PRICING_PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative flex flex-col p-10 rounded-3xl transition-all duration-300 ${
                plan.recommended 
                  ? 'bg-zinc-900 text-white shadow-2xl scale-105 z-10' 
                  : 'bg-white text-zinc-900 border border-zinc-100 hover:shadow-lg'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              
              <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
              <div className="mb-8">
                <span className="text-4xl md:text-5xl font-black">₱{plan.price}</span>
                <span className={plan.recommended ? 'text-zinc-500' : 'text-zinc-400'}>/mo</span>
              </div>
              
              <ul className="text-left space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm font-medium">
                    <svg className={`w-4 h-4 mr-3 ${plan.recommended ? 'text-primary' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.recommended ? 'primary' : 'outline'} 
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
