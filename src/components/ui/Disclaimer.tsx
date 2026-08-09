import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

const componentTranslations = {
  en: {
    title: "Disclaimer",
    text: "Past performance is not indicative of future results. Quantrih's tools, simulations, calculations, and analyses are based exclusively on historical data and are provided solely for informational and educational purposes. They do not constitute financial, investment, legal, tax, or professional advice. Investing in financial markets involves high risks, including the complete loss of capital. Users are solely responsible for their investment decisions.",
  },
  fr: {
    title: "Avertissement",
    text: "Les performances passées ne préjugent pas des résultats futurs. Les outils, simulations, calculs et analyses de Quantrih sont basés exclusivement sur des données historiques et sont fournis uniquement à des fins d'information et d'éducation. Ils ne constituent en aucun cas un conseil financier, d'investissement, juridique, fiscal ou professionnel. L'investissement sur les marchés financiers comporte des risques élevés, y compris la perte totale du capital. Les utilisateurs sont seuls responsables de leurs decisions d'investissement.",
  },
  de: {
    title: "Haftungsausschluss",
    text: "Die vergangene Performance ist kein Indikator für zukünftige Ergebnisse. Die Werkzeuge, Simulationen, Berechnungen und Analysen von Quantrih basieren ausschließlich auf historischen Daten und dienen nur zu Informations- und Bildungszwecken. Sie stellen keine finanzielle, Anlage-, rechtliche, steuerliche oder professionelle Beratung dar. Investitionen an den Finanzmärkten bergen hohe Risiken, einschließlich des vollständigen Kapitalverlusts. Die Nutzer sind allein für ihre Anlageentscheidungen verantwortlich.",
  },
  nl: {
    title: "Vrijwaring",
    text: "In het verleden behaalde resultaten bieden geen garantie voor de toekomst. De tools, simulaties, berekeningen en analyses van Quantrih zijn uitsluitend gebaseerd op historische gegevens en worden alleen voor informatieve en educatieve doeleinden verstrekt. Ze vormen geen financieel, investerings-, juridisch, fiscaal of professioneel advies. Beleggen op de financiële markten brengt hoge risico's met zich mee, inclusief het volledige verlies van kapitaal. Gebruikers zijn uitsluitend verantwoordelijk voor hun investeringsbeslissingen.",
  },
  es: {
    title: "Descargo de responsabilidad",
    text: "El rendimiento pasado no es indicativo de resultados futuros. Las herramientas, simulaciones, cálculos y análisis de Quantrih se basan exclusivamente en datos históricos y se proporcionan únicamente con fines informativos y educativos. No constituyen asesoramiento financiero, de inversión, legal, fiscal o profesional. Invertir en los mercados financieros implica altos riesgos, incluida la pérdida completa del capital. Los usuarios son los únicos responsables de sus decisiones de inversión.",
  },
};

export const Disclaimer = () => {
  const { language } = useTranslation();
  const t = componentTranslations[language as keyof typeof componentTranslations] || componentTranslations.en;

  return (
    <div className="mt-12 text-center text-blue-600 dark:text-blue-400 max-w-5xl mx-auto space-y-2 px-4 pb-8 max-sm:[zoom:0.4]">
      <p className="font-bold uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-1 text-blue-600/80 dark:text-blue-400/80">
        <AlertTriangle size={9} className="shrink-0" /> {t.title}
      </p>
      <p className="text-xs sm:text-sm leading-relaxed font-medium max-w-4xl mx-auto opacity-80">
        {t.text}
      </p>
    </div>
  );
};
