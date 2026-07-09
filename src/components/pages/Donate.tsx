import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { auth } from '../../firebase';

export function Donate({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t: translate, language } = useTranslation();
  const [amount, setAmount] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const t = {
    title: 'Support our project',
    subtitle: 'Make a donation to help us improve the app. Minimum amount is 100 €.',
    amountLabel: 'Custom Amount (€)',
    minError: 'Minimum amount is 100 €',
    donateBtn: 'Donate',
    thankYouTitle: 'Thank you so much!',
    thankYouText: 'We greatly appreciate your support.',
    back: 'Back to Home'
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val < 100) {
      alert(t.minError);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would call your backend here to create a Stripe Checkout session:
      // const response = await fetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify({ amount: val }) });
      // const { url } = await response.json();
      // window.location.href = url;
      
      // For now, we simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowThankYou(true);
    } catch (err) {
      console.error(err);
      alert('Error creating checkout session.');
    } finally {
      setLoading(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-[100dvh] bg-bg flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface p-8 rounded-[2rem] border border-border shadow-lg text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">{t.thankYouTitle}</h2>
          <p className="text-text-2 mb-8">{t.thankYouText}</p>
          <button 
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-pv-blue text-white rounded-full font-medium hover:bg-pv-blue-l transition-colors"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-bg/90 via-bg/80 to-bg"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-surface p-8 rounded-[2rem] border border-border shadow-lg">
        <button 
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-3 hover:text-text hover:bg-surface-3 transition-colors mb-6"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">{t.title}</h1>
        <p className="text-text-2 text-sm mb-8 leading-relaxed">
          {t.subtitle}
        </p>

        <form onSubmit={handleDonate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-3 uppercase tracking-wider">
              {t.amountLabel}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 font-medium">€</span>
              <input
                type="number"
                min="100"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-2 border border-border text-text rounded-2xl py-3 pl-10 pr-4 outline-none focus:border-pv-blue focus:ring-1 focus:ring-pv-blue transition-all"
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">Stripe Webhook</h4>
            <p className="text-xs text-blue-600/80 dark:text-blue-300/80">
              To validate this payment on the server side, you must listen for the Stripe event: <code className="font-mono bg-blue-500/20 px-1 py-0.5 rounded">checkout.session.completed</code>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pv-blue hover:bg-pv-blue-l text-white font-medium py-3 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {t.donateBtn}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
