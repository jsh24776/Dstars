
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-24 pb-12">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <a href="#" className="text-3xl font-black tracking-tighter text-zinc-900 mb-8 block">
              DSTARS<span className="text-primary">.</span>
            </a>
            <p className="text-zinc-500 leading-relaxed max-w-xs">
              Luxury performance for the dedicated few. Modern aesthetics meets peak biological science.
            </p>
          </div>
          
          <div>
            <h5 className="font-bold text-zinc-900 mb-6 uppercase text-xs tracking-widest">Navigation</h5>
            <ul className="space-y-4">
              {['Home', 'Programs', 'Trainers', 'Pricing', 'Concierge'].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-zinc-500 hover:text-primary transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-zinc-900 mb-6 uppercase text-xs tracking-widest">Legal</h5>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map(item => (
                <li key={item}>
                  <a href="#" className="text-zinc-500 hover:text-primary transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-zinc-900 mb-6 uppercase text-xs tracking-widest">Connect</h5>
            <ul className="space-y-4">
              {['Instagram', 'YouTube', 'Twitter', 'Facebook'].map(item => (
                <li key={item}>
                  <a href="#" className="text-zinc-500 hover:text-primary transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-zinc-100 text-zinc-400 text-xs uppercase tracking-widest font-medium">
          <p>© {new Date().getFullYear()} Dstars Premium Fitness. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-8">
            <p>Designed for Excellence</p>
            <p>Built for Power</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
