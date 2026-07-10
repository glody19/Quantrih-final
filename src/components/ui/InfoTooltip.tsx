import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface InfoTooltipProps {
  content: string | React.ReactNode;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative inline-flex items-center justify-center ml-1 focus:outline-none z-50 cursor-help group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
    >
      <Info size={13} className="text-slate-500 hover:text-blue-400 group-hover:text-blue-400 transition-colors" />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-[9999] mb-2.5 w-[210px] -translate-x-1/2 pointer-events-auto"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-500/10 blur-lg rounded-[1rem]"></div>
            
            {/* Tooltip Card */}
            <div className="relative rounded-xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/60 p-3 text-[11px] leading-relaxed text-slate-200 shadow-xl font-sans font-medium text-left">
              {content}
            </div>
            
            <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-slate-700/60 bg-slate-950/95 backdrop-blur-xl"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
