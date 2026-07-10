import React from 'react';
import { cn } from '../../lib/utils';

import { Mail, Clock, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}


export function Footer({ onNavigate }: FooterProps) {


  return (
    <footer className="w-full py-16 border-t border-border/60 bg-bg text-text">
      <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
        
        {/* Discover */}
        <div className="flex flex-col gap-4">
          <h4 className="text-text font-bold mb-2">Backtesting & Allocation</h4>
          <button onClick={() => { onNavigate('asset-allocation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Asset Allocation</button>
          <button onClick={() => { onNavigate('portfolio-backtest'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Portfolio Backtesting</button>
          <button onClick={() => { onNavigate('tactical-allocation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Tactical Allocation</button>
          <button onClick={() => { onNavigate('montecarlo'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Monte Carlo Dynamics</button>
          

        </div>

        {/* Resources */}
        <div className="flex flex-col gap-4">
          <h4 className="text-text font-bold mb-2">Resources</h4>
          <button onClick={() => { onNavigate('market'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Financial Market</button>
          <button onClick={() => { onNavigate('etf-overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">ETF Overview</button>
          <button onClick={() => { onNavigate('platforms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Brokers & Platforms</button>
          <button onClick={() => { onNavigate('education'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Education</button>
        </div>

        {/* Contact Us */}
        <div className="flex flex-col gap-4">
          <h4 className="text-text font-bold mb-2">Contact Us</h4>
          <div className="flex items-center gap-3 text-text-3">
            <Mail className="w-4 h-4 text-text-4" />
            <a href="mailto:contact@quantrih.com" className="hover:text-blue-500 transition-colors">contact@quantrih.com</a>
          </div>
          <div className="flex items-center gap-3 text-text-3">
            <Clock className="w-4 h-4 text-text-4" />
            <span>Mon - Fri, 9:00 AM - 6:00 PM (CET)</span>
          </div>
        </div>

        {/* Legal & About */}
        <div className="flex flex-col gap-4">
          <h4 className="text-text font-bold mb-2">Company & Legal</h4>
          <button onClick={() => { onNavigate('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">About Us</button>
          <button onClick={() => { onNavigate('donate'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Donate</button>
          <button onClick={() => { onNavigate('cookies'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Cookies Policy</button>
          <button onClick={() => { onNavigate('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-text-3 hover:text-blue-500 transition-colors">Privacy Policy</button>
        </div>

      </div>
      
      <div className="max-w-[1400px] mx-auto px-8 mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-text-4">
        <p className="text-sm">© {new Date().getFullYear()} Quantrih Engineering. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-text transition-colors text-sm">Twitter</a>
          <a href="#" className="hover:text-text transition-colors text-sm">LinkedIn</a>
          <a href="#" className="hover:text-text transition-colors text-sm">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
