
import React from 'react';
import { TRAINERS } from '../constants.tsx';

const Trainers: React.FC = () => {
  return (
    <section id="trainers" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-xl mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">The Faculty</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">World-class mentorship.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {TRAINERS.map((trainer) => (
            <div key={trainer.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6 bg-zinc-100 shadow-sm border border-zinc-100">
                <img 
                  src={trainer.image} 
                  alt={trainer.name} 
                  className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Connect</p>
                    <div className="flex space-x-4">
                      <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                      <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-zinc-900 mb-1">{trainer.name}</h4>
              <p className="text-primary font-medium text-sm uppercase tracking-wider mb-3">{trainer.specialty}</p>
              <p className="text-zinc-500 leading-relaxed text-sm">
                {trainer.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trainers;
