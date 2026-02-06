
import React from 'react';
import Button from './Button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background with subtle overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/imgs/deep.jpg" 
          alt="Dstars Gym"  
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            REDEFINE<br />
            <span className="text-white/40">YOUR</span> LIMITS
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed max-w-xl">
            A sanctuary for high-performance training. Experience the fusion of elite biomechanics and premium architectural design.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="px-10">Start Your Journey</Button>
            <Button variant="outline" size="lg" className="bg-white text-black border-white hover:bg-white hover:text-black">
              Virtual Tour
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-12 left-0 right-0 z-10 hidden lg:block">
        <div className="container mx-auto px-12">
          <div className="flex space-x-16">
            <div>
              <div className="text-3xl font-bold text-white">15+</div>
              <div className="text-sm text-zinc-400 uppercase tracking-widest">Elite Coaches</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-zinc-400 uppercase tracking-widest">Global Access</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9</div>
              <div className="text-sm text-zinc-400 uppercase tracking-widest">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
