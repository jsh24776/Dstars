
import React from 'react';
import { PROGRAMS } from '../constants.tsx';

const Programs: React.FC = () => {
  return (
    <section id="programs" className="py-24 md:py-32 bg-zinc-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-6 md:space-y-0">
          <div className="max-w-xl">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Our Programs</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">Precision in every movement.</h3>
          </div>
          <p className="text-zinc-500 text-lg max-w-sm">
            Curated training paths designed for specific physical outcomes and long-term health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROGRAMS.map((program) => (
            <div 
              key={program.id} 
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 border border-zinc-100"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={program.image} 
                  alt={program.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-zinc-900 mb-3">{program.title}</h4>
                <p className="text-zinc-600 leading-relaxed mb-6">{program.description}</p>
                <a href="#" className="inline-flex items-center text-primary font-semibold hover:translate-x-1 transition-transform">
                  Explore Details
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
