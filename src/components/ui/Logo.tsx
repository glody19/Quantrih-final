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
    lg: "w-6 h-6 lg:w-7 lg:h-7"
  };

  const textClasses = {
    sm: "text-[11px] font-semibold tracking-tight",
    md: "text-xs lg:text-sm font-semibold tracking-tight",
    lg: "text-base lg:text-lg font-bold tracking-tight"
  };

  const logos = {
    // Brand mark: a "Q" whose tail is a rising trend line ending on a data point
    bars: (
      <svg viewBox="0 0 32 32" className="w-full h-full text-current" fill="none">
        <circle cx="14.5" cy="15" r="10" stroke="currentColor" strokeWidth="3.2" />
        <path d="M9.5 17.2 L13 13.6 L15.8 16.2 L19.6 11.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <path d="M19.5 20 L27 27.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="27.6" cy="28.1" r="2.4" fill="#E2B84F" />
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
