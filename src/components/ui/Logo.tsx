import React from 'react';
import { cn } from '../../lib/utils';

export type LogoVariant = "bars" | "sigma" | "orbit" | "prism";

interface LogoProps {
 className?: string;
 variant?: LogoVariant;
 showText?: boolean;
 size?: "sm" | "md" | "lg";
}

export const QuantrihLogo = ({ className, variant = "bars", showText = true, size = "md" }: LogoProps) => {
 const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8"
  };

 const textClasses = {
  sm: "text-xs",
  md: "text-xl",
  lg: "text-2xl"
  };

 const logos = {
 bars: (
 <svg viewBox="0 0 40 40" className="w-full h-full text-current">
 <rect x="4" y="24" width="6" height="12" rx="1" fill="currentColor" opacity="0.3" />
 <rect x="14" y="16" width="6" height="20" rx="1" fill="currentColor" opacity="0.6" />
 <rect x="24" y="8" width="6" height="28" rx="1" fill="currentColor" />
 <path d="M4 22L14 14L24 6L36 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 ),
 sigma: (
 <svg viewBox="0 0 40 40" className="w-full h-full text-current" fill="none" stroke="currentColor" strokeWidth="3">
 <path d="M12 8H28L16 20L28 32H12" strokeLinecap="round" strokeLinejoin="round" />
 <circle cx="28" cy="8" r="2" fill="currentColor" stroke="none" />
 <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
 <circle cx="28" cy="32" r="2" fill="currentColor" stroke="none" />
 </svg>
 ),
 orbit: (
 <svg viewBox="0 0 40 40" className="w-full h-full text-current" fill="none" stroke="currentColor" strokeWidth="2.5">
 <circle cx="20" cy="20" r="16" opacity="0.2" />
 <path d="M20 4C28.8366 4 36 11.1634 36 20C36 28.8366 28.8366 36 20 36" strokeLinecap="round" />
 <circle cx="20" cy="20" r="8" fill="currentColor" fillOpacity="0.1" />
 <path d="M26 26L34 34" strokeLinecap="round" />
 <circle cx="20" cy="20" r="3" fill="currentColor" stroke="none" />
 </svg>
 ),
 prism: (
 <svg viewBox="0 0 40 40" className="w-full h-full text-current" fill="currentColor">
 <path d="M20 4L36 32H4L20 4Z" opacity="0.2" />
 <path d="M20 10L30 28H10L20 10Z" opacity="0.5" />
 <path d="M20 16L24 24H16L20 16Z" />
 <rect x="19" y="34" width="2" height="4" rx="1" />
 </svg>
 )
 };

 return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("text-current flex-shrink-0", sizeClasses[size] || sizeClasses.md)}>
        {logos[variant]}
      </div>
      {showText && (
        <span className={cn("font-medium tracking-tight", textClasses[size] || textClasses.md, "text-sky-500/90")}>QUANTRIH<span className="text-sky-400">.</span></span>
      )}
    </div>
  );
};
