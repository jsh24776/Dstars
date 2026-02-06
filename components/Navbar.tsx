
import React, { useState, useEffect } from 'react';
import Button from './Button';

interface NavbarProps {
  onNavigate?: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <button onClick={() => onNavigate?.('landing')} className="text-2xl font-extrabold tracking-tighter text-zinc-900 focus:outline-none">
          DSTARS<span className="text-primary">.</span>
        </button>
        
        <div className="hidden md:flex items-center space-x-10">
          {['Programs', 'Trainers', 'Pricing', 'Concierge'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => onNavigate?.('login')}>
            Login
          </Button>
          <Button size="sm" onClick={() => onNavigate?.('register')}>
            Join Now
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
