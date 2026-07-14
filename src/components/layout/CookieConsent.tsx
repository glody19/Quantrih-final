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
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 z-[150] bg-[#0c1222]/95 backdrop-blur-md border border-slate-800 shadow-2xl rounded-xl overflow-hidden max-w-[280px]"
        >
          <div className="p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Cookie size={14} className="text-blue-400 shrink-0" />
              <p className="text-slate-300 text-[10px] leading-tight">
                We use cookies to improve your experience.
              </p>
            </div>
            
            <div className="flex gap-1 shrink-0">
              <button 
                onClick={handleAccept}
                className="py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase transition-colors"
              >
                Accept
              </button>
              <button 
                onClick={handleDecline}
                className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold uppercase transition-colors border border-slate-700"
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
