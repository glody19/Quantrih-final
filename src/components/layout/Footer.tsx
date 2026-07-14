import React from 'react';
import { cn } from '../../lib/utils';

import { Mail, Clock, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}


export function Footer({ onNavigate }: FooterProps) {


  return (
    <footer className="w-full py-5 border-t border-border/60 bg-bg text-text">
      <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Discover */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-text font-bold mb-0.5 text-sm">Backtesting & Allocation</h4>
          <button onClick={() => { onNavigate('asset-allocation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Asset Allocations</button>
          <button onClick={() => { onNavigate('portfolio-backtest'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Portfolio Backtesting</button>
          <button onClick={() => { onNavigate('tactical-allocation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Tactical Allocation</button>
          <button onClick={() => { onNavigate('montecarlo'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Monte Carlo</button>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-text font-bold mb-0.5 text-sm">Resources</h4>
          <button onClick={() => { onNavigate('market'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Financial Market</button>
          <button onClick={() => { onNavigate('etf-overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">ETF Overview</button>
          <button onClick={() => { onNavigate('platforms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Brokers & Platforms</button>
          <button onClick={() => { onNavigate('education'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Education</button>
        </div>

        {/* Contact Us */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-text font-bold mb-0.5 text-sm">Contact Us</h4>
          <div className="flex items-center gap-3 text-text-3 text-xs">
            <Mail className="w-3.5 h-3.5 text-text-4" />
            <a href="mailto:contact@quantrih.com" className="hover:text-blue-500 transition-colors">contact@quantrih.com</a>
          </div>
          <div className="flex items-center gap-3 text-text-3 text-xs">
            <Clock className="w-3.5 h-3.5 text-text-4" />
            <span>Mon - Fri, 9:00 AM - 6:00 PM (CET)</span>
          </div>
        </div>

        {/* Legal & About */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-text font-bold mb-0.5 text-sm">Company & Legal</h4>
          <button onClick={() => { onNavigate('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">About Us</button>
          <button onClick={() => window.open('https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00', '_blank', 'noopener,noreferrer')} className="text-left text-blue-500 hover:text-blue-600 font-bold transition-colors text-xs">Donate</button>
          <button onClick={() => { onNavigate('cookies'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Cookies Policy</button>
          <button onClick={() => { onNavigate('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors text-xs">Privacy Policy</button>
        </div>

      </div>
      
      <div className="max-w-[1400px] mx-auto px-8 mt-5 pt-3 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-text-4">
        <p className="text-xs">© {new Date().getFullYear()} Quantrih. All rights reserved.</p>
      </div>
    </footer>
  );
}
