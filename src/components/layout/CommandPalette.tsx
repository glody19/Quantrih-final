import React, { useState, useEffect, useRef } from "react";
import { Search, Activity, PieChart, BarChart3, Presentation, Briefcase, FileText, Settings, PlayCircle, Database } from "lucide-react";
import { cn } from "../../lib/utils";

interface CommandPaletteProps {
  onNavigate: (pageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ onNavigate, isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const modules = [
    { title: 'Home', id: 'home', icon: <Presentation size={18} /> },
    { title: 'Markets / Fin. Modeling', id: 'fmp', icon: <Search size={18} /> },
    { title: 'Asset Allocation', id: 'asset-allocation', icon: <PieChart size={18} /> },
    { title: 'Portfolio Management', id: 'portfolio', icon: <Briefcase size={18} /> },
    { title: 'Monte Carlo Simulation', id: 'montecarlo', icon: <Activity size={18} /> },
    { title: 'Factor Analysis', id: 'factor-analysis', icon: <Database size={18} /> },
    { title: 'Library / Education', id: 'education', icon: <PlayCircle size={18} /> },
  ];

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % filteredModules.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + filteredModules.length) % filteredModules.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredModules[activeIndex]) {
          onNavigate(filteredModules[activeIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredModules, activeIndex, onNavigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-[1.5rem] overflow-hidden shadow-pv-blue/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 border-b border-border">
          <Search className="text-text-4 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent py-4 outline-none text-text placeholder-text-4 font-medium"
            placeholder="Search modules or actions... (ex: Market, Asset)"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
          />
          <div className="flex items-center gap-1">
             <kbd className="hidden sm:inline-flex px-2 py-1 text-[10px] font-mono text-text-3 font-semibold uppercase bg-surface-2 rounded border border-border">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredModules.length === 0 ? (
            <div className="p-4 text-center text-sm text-text-4 py-8">
              No matching commands or modules found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredModules.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left text-sm",
                    index === activeIndex 
                      ? "bg-pv-blue text-white" 
                      : "text-text hover:bg-surface-2"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 opacity-80",
                    index === activeIndex ? "text-white" : "text-text-3"
                  )}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-2 text-xs text-text-4 flex items-center justify-between">
           <span>Use <kbd className="mx-1 px-1.5 py-0.5 rounded bg-surface border border-border text-text font-mono text-[10px]">↑</kbd><kbd className="mx-1 px-1.5 py-0.5 rounded bg-surface border border-border text-text font-mono text-[10px]">↓</kbd> to navigate, <kbd className="mx-1 px-1.5 py-0.5 rounded bg-surface border border-border text-text font-mono text-[10px]">↵</kbd> to select</span>
           <span className="font-bold flex items-center gap-1 opacity-50">Odoo UI Inspired <Activity size={12}/></span>
        </div>
      </div>
    </div>
  );
}
