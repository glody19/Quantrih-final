import React from 'react';
import { Mail, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { language } = useTranslation();
  const isFr = language === 'fr';

  const handleNav = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0b1329] text-slate-300 border-t border-slate-800/80 py-6 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Allocations & Backtesting */}
        <div className="flex flex-col gap-1">
          <h4 className="text-[11px] font-bold text-slate-100 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {isFr ? "Allocations & Backtest" : "Allocations & Backtesting"}
          </h4>
          <button 
            onClick={() => handleNav('asset-allocation')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Asset Allocation" : "Asset Allocation"}
          </button>
          <button 
            onClick={() => handleNav('portfolio-backtest')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Portfolio Backtesting" : "Portfolio Backtesting"}
          </button>
          <button 
            onClick={() => handleNav('tactical-allocation')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Tactical Allocation" : "Tactical Allocation"}
          </button>
          <button 
            onClick={() => handleNav('montecarlo')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Monte Carlo" : "Monte Carlo"}
          </button>
        </div>

        {/* Markets & Research */}
        <div className="flex flex-col gap-1">
          <h4 className="text-[11px] font-bold text-slate-100 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {isFr ? "Marchés & Recherche" : "Markets & Research"}
          </h4>
          <button 
            onClick={() => handleNav('market')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Market Equity" : "Market Equity"}
          </button>
          <button 
            onClick={() => handleNav('etf-overview')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "ETF Overview" : "ETF Overview"}
          </button>
          <button 
            onClick={() => handleNav('education')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Education" : "Education"}
          </button>
        </div>

        {/* Information & Legal */}
        <div className="flex flex-col gap-1">
          <h4 className="text-[11px] font-bold text-slate-100 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {isFr ? "Informations & Légal" : "Information & Legal"}
          </h4>
          <button 
            onClick={() => handleNav('about')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "About Us" : "About Us"}
          </button>
          <button 
            onClick={() => window.open('https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00', '_blank', 'noopener,noreferrer')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Support / Donate" : "Support / Donate"}
          </button>
          <button 
            onClick={() => handleNav('cookies')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Cookies Policy" : "Cookies Policy"}
          </button>
          <button 
            onClick={() => handleNav('privacy')} 
            className="text-left text-[11px] text-slate-400 hover:text-sky-400 transition-colors py-0.5 flex items-center gap-1"
          >
            <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
            {isFr ? "Privacy Policy" : "Privacy Policy"}
          </button>
        </div>

      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mt-5 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[10px]">
        <p>© {new Date().getFullYear()} Quantrih. {isFr ? "Tous droits réservés." : "All rights reserved."}</p>
        <div className="flex items-center gap-4">
          <a href="mailto:contact@quantrih.com" className="hover:text-slate-300 transition-colors flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-500" />
            contact@quantrih.com
          </a>
        </div>
      </div>
    </footer>
  );
}

