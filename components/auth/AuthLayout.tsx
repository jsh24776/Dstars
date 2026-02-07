
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image: string;
  maxWidthClass?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  image, 
  maxWidthClass = 'max-w-md' 
}) => {
  return (
    <div className="min-h-screen flex bg-white font-inter">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={image} 
          alt="Dstars Training" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="text-3xl font-bold tracking-tight mb-4">DSTARS<span className="text-primary">.</span></div>
          <p className="text-zinc-200 text-lg font-light leading-relaxed max-w-md">
            The sanctuary for those who pursue the extraordinary. 
            Welcome back to the elite standard of performance.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className={`w-full ${maxWidthClass}`}>
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">{title}</h1>
            <p className="text-zinc-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
