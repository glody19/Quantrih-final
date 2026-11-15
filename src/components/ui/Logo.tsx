import React from 'react';
import { cn } from '../../lib/utils';

export type LogoVariant = "bars" | "orbit" | "prism";

interface LogoProps {
 className?: string;
 variant?: LogoVariant;
 showText?: boolean;
 size?: "sm" | "md" | "lg";
}

export const QuantrihLogo = ({ className, variant = "bars", showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5 lg:w-5 lg:h-5",
    lg: "w-8 h-8 lg:w-7 lg:h-7"
  };

  const textClasses = {
    sm: "text-[11px] font-semibold tracking-tight",
    md: "text-xs lg:text-sm font-semibold tracking-tight",
    lg: "text-xl lg:text-lg font-bold tracking-tight"
  };

  const logos = {
    // Brand mark: three rising bars in relief with pointed tops, the tallest touched by a gold spark (no circle, no letter)
    bars: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <polygon points="3.4,29.5 3.4,21.5 6.9,16.5 6.9,29.5" fill="#CFF1FD" />
        <polygon points="6.9,29.5 6.9,16.5 10.4,21.5 10.4,29.5" fill="#7DD3F5" />
        <polygon points="11.5,29.5 11.5,14.5 15.5,8.5 15.5,29.5" fill="#38BDF8" />
        <polygon points="15.5,29.5 15.5,8.5 19.5,14.5 19.5,29.5" fill="#0E86C7" />
        <polygon points="20.5,29.5 20.5,8.5 25,1.8 25,29.5" fill="#1D6FA8" />
        <polygon points="25,29.5 25,1.8 29.5,8.5 29.5,29.5" fill="#0B3558" />
        <path d="M19.6 1 L20.25 2.85 L22.1 3.5 L20.25 4.15 L19.6 6 L18.95 4.15 L17.1 3.5 L18.95 2.85 Z" fill="#E2B84F" />
      </svg>
    ),
    orbit: (
      <svg viewBox="0 0 32 32" className="w-full h-full text-current" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="16" cy="16" r="13" opacity="0.25" />
        <path d="M16 3C23.1797 3 29 8.8203 29 16C29 23.1797 23.1797 29 16 29" strokeLinecap="round" />
        <circle cx="16" cy="16" r="6" fill="currentColor" fillOpacity="0.1" />
        <circle cx="16" cy="16" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    prism: (
      <svg viewBox="0 0 32 32" className="w-full h-full text-current" fill="currentColor">
        <path d="M16 3L29 26H3L16 3Z" opacity="0.25" />
        <path d="M16 8L24 23H8L16 8Z" opacity="0.6" />
        <path d="M16 13L20 20H12L16 13Z" />
      </svg>
    )
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("text-current flex-shrink-0", sizeClasses[size] || sizeClasses.md)}>
        {logos[variant]}
      </div>
      {showText && (
        <span className={cn(textClasses[size] || textClasses.md, "text-blue-900 dark:text-blue-600 font-semibold tracking-tight")}>
          Quantrih<span className="text-blue-600 dark:text-blue-500 font-bold">.</span>
        </span>
      )}
    </div>
  );
};
