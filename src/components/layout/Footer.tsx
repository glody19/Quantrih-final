import React from 'react';
import { useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { QuantrihLogo } from '../ui/Logo';
import { Disclaimer } from '../ui/Disclaimer';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const DONATE_URL = 'https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00';

export function Footer({ onNavigate }: FooterProps) {
  const { language } = useTranslation();
  const fr = language === 'fr';
  const { pathname } = useLocation();

  const go = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns: { title: string; links: { label: string; page?: string; href?: string }[] }[] = [
    {
      title: fr ? 'Outils' : 'Tools',
      links: [
        { label: 'Asset Allocation', page: 'asset-allocation' },
        { label: 'Portfolio Backtesting', page: 'portfolio-backtest' },
        { label: 'Tactical Allocation', page: 'tactical-allocation' },
        { label: 'Monte Carlo', page: 'montecarlo' },
        { label: fr ? 'Portefeuille virtuel' : 'Virtual portfolio', page: 'virtual-portfolio' },
      ],
    },
    {
      title: fr ? 'Marchés' : 'Markets',
      links: [
        { label: fr ? 'Marchés et analyse' : 'Markets and analysis', page: 'market' },
        { label: fr ? 'Comparateur d\'ETF' : 'ETF screener', page: 'etf-overview' },
        { label: 'Lazy portfolios', page: 'market#lazy-portfolios' },
        { label: fr ? 'Plateformes d\'investissement' : 'Investment platforms', page: 'platforms' },
      ],
    },
    {
      title: fr ? 'Apprendre' : 'Learn',
      links: [
        { label: fr ? 'Bibliothèque' : 'Library', page: 'education' },
        { label: fr ? 'À propos' : 'About us', page: 'about' },
        { label: fr ? 'Soutenir Quantrih' : 'Support Quantrih', href: DONATE_URL },
      ],
    },
    {
      title: fr ? 'Légal' : 'Legal',
      links: [
        { label: fr ? 'Confidentialité' : 'Privacy policy', page: 'privacy' },
        { label: fr ? 'Cookies' : 'Cookies policy', page: 'cookies' },
        { label: fr ? 'Plan du site' : 'Sitemap', page: 'sitemap' },
      ],
    },
  ];

  return (
    <footer
      className="w-full text-slate-300 font-sans"
      // same dark grid as the support section above it on the home page, so the two read as one block
      style={{ backgroundColor: "#040A10", backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "64px 64px" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 grid gap-12 lg:grid-cols-[1.3fr_2.7fr]">
        <div>
          <QuantrihLogo variant="bars" size="lg" className="text-[#A9C8EA] [&>span]:!text-white" />
          <p className="mt-5 text-[15px] leading-relaxed text-slate-400 max-w-sm">
            {fr
              ? 'Backtests de portefeuilles, allocations d\'actifs et données de marché pour les investisseurs européens et américains.'
              : 'Portfolio backtests, asset allocation and market data for European and US investors.'}
          </p>
          <a href="mailto:contact@quantrih.com" className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
            <Mail className="w-4 h-4 text-[#5B8CC8]" /> contact@quantrih.com
          </a>
        </div>

        <nav className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10" aria-label="Footer">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-white mb-4">{col.title}</h4>
              <ul className="grid gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => (l.href ? window.open(l.href, '_blank', 'noopener,noreferrer') : go(l.page!))}
                      className="text-left text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-8 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Quantrih. {fr ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
      </div>
      {/* not on the home page */}
      {pathname !== '/' && <Disclaimer />}
    </footer>
  );
}
