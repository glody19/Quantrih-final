import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { InvestorProfileForm } from '../profile/InvestorProfileForm';
import { Lock, LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';

interface InvestorProfilePageProps {
  onBack?: () => void;
}

export const InvestorProfilePage: React.FC<InvestorProfilePageProps> = ({ onBack }) => {
  const { language } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isEn = language === 'en';

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 text-white bg-[#060913]"
      >
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex flex-col w-full min-h-[100dvh] relative selection:bg-blue-500/30 pt-32 pb-32 px-4 sm:px-8 lg:px-12 font-sans text-white bg-[#060913] items-center justify-start overflow-x-hidden overflow-y-auto"
      >
        <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

        <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 sm:p-9 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col items-center space-y-6">
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isEn ? "Authentication Required" : "Connexion Requise"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              {isEn 
                ? "The Investor Profile & Strategy Qualification tool is accessible exclusively to registered members. Log in or create an account to save and synchronize your profile securely."
                : "Le Profil Investisseur & la Qualification Stratégique sont réservés aux membres connectés. Connectez-vous ou créez un compte pour enregistrer et synchroniser votre profil en toute sécurité."}
            </p>
          </div>

          <div className="w-full pt-1 flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>{isEn ? "Log In / Sign Up" : "Se connecter / S'inscrire"}</span>
            </button>

            <button
              onClick={() => {
                if (onBack) onBack();
                else navigate('/');
              }}
              className="w-full py-2.5 px-4 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition-all border border-slate-700/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? "Back to Dashboard" : "Retour au tableau de bord"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full min-h-[100dvh] relative selection:bg-blue-500/30 pt-32 pb-96 px-4 sm:px-8 lg:px-12 font-sans text-white bg-[#060913] overflow-x-hidden overflow-y-auto"
    >
      {/* Modern micro-grid overlay & subtle vignette */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col space-y-6 pt-6">
        
        {/* Top Header Navigation & Title */}
        <div className="flex flex-col items-center text-center justify-center gap-4 relative pt-4 pb-2">
          <button
            onClick={() => {
              if (onBack) onBack();
              else window.history.back();
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shrink-0 shadow-lg cursor-pointer hidden md:block"
          >
            <span>{isEn ? "Back" : "Retour"}</span>
          </button>
          
          <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {isEn ? "Investor Profile & Strategy Qualification" : "Profil Investisseur & Qualification Stratégique"}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-3xl font-medium leading-relaxed">
              {isEn 
                ? "Configure career, detailed asset breakdown, liquidity, market experience, and risk objective."
                : "Renseignez votre situation professionnelle, la ventilation de votre patrimoine, vos liquidités, votre expérience et vos objectifs."}
            </p>
          </div>

          <button
            onClick={() => {
              if (onBack) onBack();
              else window.history.back();
            }}
            className="md:hidden mt-2 px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shrink-0 shadow-lg cursor-pointer"
          >
            <span>{isEn ? "Back to Dashboard" : "Retour au tableau de bord"}</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full flex-1 flex flex-col">
          <InvestorProfileForm />
        </div>

      </div>
    </div>
  );
};



