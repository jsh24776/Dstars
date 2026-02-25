
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { getFitnessRecommendation } from '../services/geminiService';

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
};

const AIConcierge: React.FC = () => {
  const [input, setInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const result = await getFitnessRecommendation(userMessage.text);

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-ai`,
        role: 'ai',
        text: result || "I'm sorry, I couldn't process that.",
      },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, chatOpen]);

  useEffect(() => {
    if (!chatOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setChatOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [chatOpen]);

  const lastAiMessage = [...messages].reverse().find((message) => message.role === 'ai');

  return (
    <>
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
                Powered by Gemini / Ollama
              </div>
            </div>

            <div className="md:w-3/5 p-12 flex flex-col justify-center">
              <div className="mb-6 min-h-[120px]">
                {lastAiMessage ? (
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <p className="text-zinc-800 leading-relaxed italic">"{lastAiMessage.text}"</p>
                  </div>
                ) : (
                  <p className="text-zinc-400 italic">"I want to increase my endurance for an upcoming marathon..."</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-zinc-500">Start a real-time chat with the concierge from the bottom-right button.</p>
                <Button type="button" size="sm" onClick={() => setChatOpen(true)}>
                  Open Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        aria-label="Open AI Concierge chat"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(244,63,94,0.45)] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
      >
        <span className="flex items-center justify-center">
          <svg className="h-6 w-6 animate-[pulse_2.4s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-9 4l-1.7-1.7A8 8 0 1120 12v.2A3.8 3.8 0 0116.2 16H14l-4 4z" />
          </svg>
        </span>
      </button>

      {chatOpen && (
        <button
          type="button"
          aria-label="Close chat overlay"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setChatOpen(false)}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Concierge chat"
        className={`fixed z-50 w-[calc(100vw-1.5rem)] sm:w-[380px] md:w-[420px] rounded-3xl border border-zinc-200 bg-zinc-50 shadow-2xl transition-all duration-300 ${
          chatOpen
            ? 'bottom-4 right-3 sm:bottom-6 sm:right-6 opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'bottom-2 right-3 sm:bottom-4 sm:right-6 opacity-0 translate-y-6 scale-95 pointer-events-none'
        } max-h-[86vh]`}
      >
        <div className="flex items-center justify-between rounded-t-3xl bg-zinc-900 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/90 flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-9 4l-1.7-1.7A8 8 0 1120 12v.2A3.8 3.8 0 0116.2 16H14l-4 4z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold leading-none">AI Concierge</p>
              <p className="text-xs text-zinc-400 mt-1">Dstars Premium Assistant</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close AI Concierge chat"
            onClick={() => setChatOpen(false)}
            className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[68vh] max-h-[560px] flex-col p-4 sm:p-5">
          <div className="flex-1 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
                Share your goal and the concierge will build a focused path for your training.
              </div>
            )}

            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-md'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-200 text-zinc-600 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:100ms]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:200ms]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="relative mt-4 border-t border-zinc-200 pt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={600}
              placeholder="Describe your goal..."
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 pr-28 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-900"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-[1.125rem] h-[calc(100%-22px)]"
              disabled={loading}
            >
              Consult
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIConcierge;
