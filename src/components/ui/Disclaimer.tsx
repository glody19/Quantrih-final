import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const Disclaimer = () => {
  return (
    <div className="mt-12 text-center text-blue-600 dark:text-blue-400 max-w-5xl mx-auto space-y-2 px-4 pb-8">
      <p className="font-bold uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-1 text-blue-600/80 dark:text-blue-400/80">
        <AlertTriangle size={9} className="shrink-0" /> Disclaimer
      </p>
      <p className="text-xs sm:text-sm leading-relaxed font-medium max-w-4xl mx-auto opacity-80">
        Past performance is not indicative of future results. Quantrih's tools, simulations, calculations, and analyses are based exclusively on historical data and are provided solely for informational and educational purposes. They do not constitute financial, investment, legal, tax, or professional advice. Investing in financial markets involves high risks, including the complete loss of capital. Users are solely responsible for their investment decisions.
      </p>
    </div>
  );
};
