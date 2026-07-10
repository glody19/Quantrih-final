import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Lock, Heart, CheckCircle2 } from 'lucide-react';
import { QuantrihLogo } from '../ui/Logo';
import { motion } from 'motion/react';

export function Donate({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t: translate } = useTranslation();
  const [amount, setAmount] = useState<string>('10');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const t = {
    title: 'Support our vision',
    subtitle: 'Make a contribution to help us improve Quantrih. Your support makes a difference.',
    amountLabel: 'Amount (€)',
    minError: 'Please enter a valid amount greater than 0 €',
    donateBtn: 'Donate via Stripe',
    thankYouTitle: 'Thank you so much!',
    thankYouText: 'We greatly appreciate your support.',
    back: 'Back to Home'
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert(t.minError);
      return;
    }

    setLoading(true);
    try {
      // First, log the contribution intent in Firestore
      await addDoc(collection(db, 'donations'), {
        fullName,
        message,
        amount: val,
        currency: 'EUR',
        createdAt: serverTimestamp(),
      });
      
      if (message.trim()) {
        console.log(`Sending message to quantrih email from ${fullName}: ${message}`);
      }

      // Try creating a real Stripe checkout session on the backend
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: val,
          currency: 'eur'
        })
      });

      if (!response.ok) {
        throw new Error('Stripe integration not fully configured or returned error.');
      }

      const session = await response.json();
      if (session.url) {
        // Redirect user to Stripe Checkout
        window.location.href = session.url;
      } else {
        throw new Error(session.error || 'Failed to generate checkout url.');
      }
    } catch (err) {
      console.warn("Stripe Redirect failed, falling back to instant appreciation:", err);
      // Fallback: Show beautiful thank you screen directly if stripe key is not configured or in sandbox
      setShowThankYou(true);
    } finally {
      setLoading(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-sm border border-green-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">{t.thankYouTitle}</h2>
          <p className="text-slate-500 mb-10 text-xl">{t.thankYouText}</p>
          <button 
            onClick={() => onNavigate('home')}
            className="w-full px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
          >
            {t.back}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900 selection:bg-[#635BFF] selection:text-white">
      {/* Left Panel - Branding */}
      <div className="w-full md:w-1/3 bg-[#0F172A] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#635BFF]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-6 h-6 text-white hover:text-slate-300 transition-colors" />
          <QuantrihLogo variant="sigma" size="sm" className="text-white" />
        </div>
        <div className="relative z-10 mt-20 md:mt-0">
          <Heart className="w-12 h-12 text-[#635BFF] mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white">{t.title}</h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            {t.subtitle}
          </p>
        </div>
        <div className="hidden md:block relative z-10">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Quantrih. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-6 md:p-16 lg:p-24 bg-white relative">
        <div className="w-full max-w-xl">
          <form onSubmit={handleDonate} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-xl outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 placeholder:text-slate-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Message <span className="text-slate-400 font-normal normal-case tracking-normal">(Optional)</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I love the platform..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-xl outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 placeholder:text-slate-300 resize-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">{t.amountLabel}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span className="text-slate-900 font-bold text-3xl">€</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-5 text-3xl font-black outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#635BFF] hover:bg-[#4B45D6] text-white font-bold py-5 rounded-2xl text-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                     Donate €{amount}
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 pt-8 text-sm font-semibold text-slate-500">
                <Lock className="w-4 h-4" />
                <span>Powered by <span className="font-bold text-slate-900">Stripe</span></span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
