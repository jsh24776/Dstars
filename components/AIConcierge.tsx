
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { getFitnessRecommendation } from '../services/geminiService';

const AIConcierge: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResponse(null);
    const result = await getFitnessRecommendation(input);
    setResponse(result || "I'm sorry, I couldn't process that.");
    setLoading(false);
    setInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, loading]);

  return (
    <section id="concierge" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-zinc-100 bg-zinc-50 shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-2/5 p-12 bg-zinc-900 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-8">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">AI Concierge</h3>
              <p className="text-zinc-400 leading-relaxed">
                Tell our concierge about your fitness goals, and let Dstars Intelligence recommend your perfect training path.
              </p>
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-widest mt-12">
              Powered by Gemini
            </div>
          </div>

          <div className="md:w-3/5 p-12 flex flex-col justify-center">
            <div className="mb-8 min-h-[120px]">
              {loading ? (
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                </div>
              ) : response ? (
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-zinc-800 leading-relaxed italic">"{response}"</p>
                </div>
              ) : (
                <p className="text-zinc-400 italic">"I want to increase my endurance for an upcoming marathon..."</p>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your goal..." 
                className="w-full bg-white border border-zinc-200 rounded-xl px-6 py-4 pr-32 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 top-2 h-[calc(100%-16px)]"
                disabled={loading}
              >
                Consult
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIConcierge;
