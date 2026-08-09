import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[200] w-full bg-[#0a0f1c]/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 md:max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Cookie size={20} className="text-blue-400" />
                </div>
                <h3 className="text-white text-base md:text-lg font-bold">
                  We value your privacy
                </h3>
              </div>
              <p className="text-slate-400 text-sm md:text-[15px] leading-relaxed md:pl-[3.25rem]">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies.
                <Link to="/cookies" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 ml-2 font-medium transition-colors">
                  View Cookies Policy <ArrowRight size={14} />
                </Link>
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto md:pl-[3.25rem] lg:pl-0">
              <button 
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-2.5 bg-transparent hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-bold transition-colors border border-slate-700"
              >
                Decline
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
