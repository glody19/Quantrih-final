import React from "react";
import { motion } from "motion/react";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";

export function Platforms({ onNavigate }: { onNavigate?: (page: string) => void }) {
 const { t } = useTranslation();

 return (
  <MobileZoomWrapper scaleMobile={0.6}>
   <div className="w-full mx-auto relative min-h-[calc(100vh-120px)] font-sans flex flex-col items-center justify-start pt-16 md:pt-24 px-4 md:px-8">
    <motion.div 
     initial={{ opacity: 0, y: 15 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5 }}
     className="max-w-2xl text-center space-y-6"
    >
     <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-pv-blue/10 border border-pv-blue/20 rounded-full text-xs font-semibold text-pv-blue">
      <span className="w-2 h-2 rounded-full bg-pv-blue animate-pulse" />
      <span>{t('platforms.coming_soon.badge')}</span>
     </div>

     <h1 className="text-3xl md:text-5xl font-extrabold text-text tracking-tight leading-tight">
      {t('platforms.coming_soon.title')}
     </h1>
     
     <p className="text-base md:text-lg text-text-2 leading-relaxed font-normal max-w-xl mx-auto">
      {t('platforms.coming_soon.desc')}
     </p>
    </motion.div>
   </div>
  </MobileZoomWrapper>
 );
}
