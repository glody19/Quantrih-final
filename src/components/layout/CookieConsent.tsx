import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cookie } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or declined
    const consent = localStorage.getItem('quantrih_cookie_consent');
    if (!consent) {
      // Small delay to make it feel more natural
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('quantrih_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('quantrih_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[450px] bg-[#0f172a] border border-slate-700/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl z-[100] overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Cookie size={20} />
                </div>
                <h3 className="text-white font-semibold text-lg">Cookies & Privacy</h3>
              </div>
              <button 
                onClick={handleDecline}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We use cookies to improve your backtesting experience, analyze platform usage, and save your preferences. No financial data is tracked.
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAccept}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
              >
                Accept All
              </button>
              <button 
                onClick={handleDecline}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
