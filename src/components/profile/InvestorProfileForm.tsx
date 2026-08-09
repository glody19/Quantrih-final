import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomSelect } from '../ui/CustomSelect';
import { Search, Globe, MapPin, Building2, ChevronDown, Check, X, Compass, Flag, Info, RotateCcw, Cloud, CloudLightning, CloudOff, CloudCheck } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { INTERNATIONAL_COUNTRIES, CountryDetail } from '../../data/internationalCountries';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface InvestorProfileData {
  // Section 1: Identity & Info
  firstName?: string;
  lastName?: string;
  dob?: string;
  nationality?: string;
  taxCountry?: string;
  taxState?: string;
  taxCity?: string;
  tin?: string;
  isUsPerson?: boolean;

  // Section 2: Career & Financial Situation (Advanced)
  employmentStatus?: string;
  professionType?: string;
  otherProfession?: string;
  careerSeniority?: string;
  mainIncomeType?: string;
  sideHustleIncome?: string;
  expectedIncomeEvolution?: string;
  incomeStability?: string;
  incomeSourcesCount?: string;
  incomeFrequency?: string;
  monthlySavingsCapacity?: string;
  approxFixedChargesPct?: string;
  annualIncomeRange?: string;
  emergencyFundMonths?: string;
  housingStatus?: string;
  dependentsCount?: string;
  marginalTaxBracket?: string;
  financialSituationStableForInvesting?: boolean;
  dependentOnSingleIncome?: boolean;
  hasIncomeDropLast12m?: boolean;
  incomeDropImpactDetails?: string;

  // Section 3: Detailed Wealth, Liquidity, Debt & Origin of Funds
  approxNetWorth?: string;
  financialWealthEstimate?: string;
  realEstateWealthEstimate?: string;
  businessWealthEstimate?: string;
  immediatelyAvailableLiquidity?: string;
  totalOutstandingDebt?: string;
  debtServiceRatio?: string;
  amountToInvestNow?: string;
  investableSharePct?: string;
  primarySourceOfFunds?: string;
  secondarySourcesOfFunds?: string[];
  fundsOwnership?: string;
  depositFrequency?: string;
  capitalTaxStatus?: string;
  assetSaleType?: string;
  inheritanceFundsAvailable?: string;
  businessIncomeNature?: string;

  // Section 4: Experience & Knowledge (Niveau Très Avancé)
  overallExperienceYears?: string;
  investmentFrequency?: string;
  tradesPerYearRange?: string;
  annualTradingVolume?: string;
  professionalBackground?: string;
  productsTraded?: string[];
  priorPlatformsUsed?: string[];
  ordersExecutedTypes?: string[];
  understandsPerfVsVolatility?: string;
  experiencedMajorDrawdown?: string;
  selfAssessedLevel?: string;
  understandsDerivativesLeverage?: string;
  understandsOptionsGreeks?: string;
  understandsBondPriceYieldInverse?: string;
  understandsShortSellingLiabilities?: string;
  experiencedMajorMarketCrash?: string;

  // Section 5: Risk & Objectives
  primaryObjective?: string;
  timeHorizon?: string;
  maxDrawdownAcceptable?: string;
  reactionToMarketCrash?: string;
  riskToleranceProfile?: string;
  expectedAnnualReturn?: string;
}

const STEPS = [
  { id: 'identity', stepNum: "01", titleEn: "Identity and contact", titleFr: "Identité et informations" },
  { id: 'financial', stepNum: "02", titleEn: "Career and finances", titleFr: "Situation financière" },
  { id: 'wealth', stepNum: "03", titleEn: "Wealth and funds", titleFr: "Patrimoine et origine des fonds" },
  { id: 'experience', stepNum: "04", titleEn: "Knowledge and markets", titleFr: "Expérience et marchés" },
  { id: 'objectives', stepNum: "05", titleEn: "Risk and objectives", titleFr: "Risque et objectifs" },
];

const LOCAL_STORAGE_KEY = 'quantrih_investor_profile_draft_v1';

const defaultFormData: InvestorProfileData = {
  firstName: '',
  lastName: '',
  dob: '',
  taxCountry: 'FR',
  taxState: 'Île-de-France (Paris)',
  taxCity: 'Paris',
  tin: '',
  isUsPerson: false,
  employmentStatus: 'salaried',
  professionType: 'tech',
  careerSeniority: '3_10_years',
  mainIncomeType: 'base_salary',
  sideHustleIncome: 'none',
  expectedIncomeEvolution: 'moderate_growth',
  incomeStability: 'fixed',
  incomeSourcesCount: '1',
  incomeFrequency: 'monthly',
  monthlySavingsCapacity: '1200-2500',
  approxFixedChargesPct: '30-50',
  annualIncomeRange: '60k-100k',
  emergencyFundMonths: '3_6_months',
  housingStatus: 'renting',
  dependentsCount: '0',
  marginalTaxBracket: '30',
  financialSituationStableForInvesting: true,
  dependentOnSingleIncome: true,
  hasIncomeDropLast12m: false,
  approxNetWorth: '300k-600k',
  financialWealthEstimate: '150k-300k',
  realEstateWealthEstimate: '250k-500k',
  businessWealthEstimate: 'none',
  immediatelyAvailableLiquidity: '40k-100k',
  totalOutstandingDebt: '50k-150k',
  debtServiceRatio: '15-33',
  amountToInvestNow: '50000',
  investableSharePct: '10-25',
  primarySourceOfFunds: 'salary',
  secondarySourcesOfFunds: [],
  fundsOwnership: 'personal',
  depositFrequency: 'recurring',
  capitalTaxStatus: 'declared_residence',
  overallExperienceYears: '3_7_years',
  investmentFrequency: 'monthly',
  tradesPerYearRange: '20_50',
  annualTradingVolume: '100k-500k',
  professionalBackground: 'self_taught',
  productsTraded: ['stocks_etfs', 'bonds'],
  priorPlatformsUsed: ['online_broker', 'traditional_bank'],
  ordersExecutedTypes: ['market_order', 'limit_order', 'conditional_orders'],
  understandsPerfVsVolatility: 'yes',
  experiencedMajorDrawdown: 'held_reinforced',
  selfAssessedLevel: 'intermediate',
  understandsDerivativesLeverage: 'yes_experienced',
  understandsOptionsGreeks: 'basic',
  understandsBondPriceYieldInverse: 'yes_fully',
  understandsShortSellingLiabilities: 'yes_fully',
  experiencedMajorMarketCrash: 'yes_managed_active',
  primaryObjective: 'growth',
  timeHorizon: '5_10_years',
  maxDrawdownAcceptable: '20_pct',
  reactionToMarketCrash: 'wait',
  riskToleranceProfile: 'balanced',
  expectedAnnualReturn: '5_8_pct'
};

/* Reusable Info Button & Popover Component */
interface FieldHelpProps {
  titleEn: string;
  titleFr: string;
  descEn: string;
  descFr: string;
  isEn: boolean;
  activeHelpId: string | null;
  helpId: string;
  onToggle: (id: string) => void;
}

const FieldHelp: React.FC<FieldHelpProps> = ({ titleEn, titleFr, descEn, descFr, isEn, activeHelpId, helpId, onToggle }) => {
  const isOpen = activeHelpId === helpId;

  return (
    <div className="inline-block relative ml-1.5 align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(helpId);
        }}
        aria-label="Aide"
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all cursor-pointer ${
          isOpen
            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/50 scale-110 ring-2 ring-blue-400/50'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 border border-zinc-700'
        }`}
      >
        i
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 sm:left-auto sm:right-0 top-6 w-72 sm:w-88 p-4 bg-zinc-900 border border-blue-500/40 rounded-2xl shadow-2xl backdrop-blur-2xl text-left"
          >
            <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{isEn ? titleEn : titleFr}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(helpId);
                }}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-md hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line space-y-1">
              {isEn ? descEn : descFr}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const InvestorProfileForm: React.FC = () => {
  const { language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [showInspector, setShowInspector] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeHelpId, setActiveHelpId] = useState<string | null>(null);

  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'synced' | 'error' | 'offline'>('idle');

  const [formData, setFormData] = useState<InvestorProfileData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...defaultFormData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error restoring profile draft:', e);
    }
    return defaultFormData;
  });

  // Load profile from Firestore when user logs in or on mount
  useEffect(() => {
    if (!user) {
      setCloudSyncStatus('offline');
      return;
    }
    
    let active = true;
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'profiles', 'suitability');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && active) {
          const cloudData = docSnap.data() as InvestorProfileData;
          // Merge local and cloud data gracefully
          setFormData(prev => ({
            ...prev,
            ...cloudData
          }));
          setCloudSyncStatus('synced');
        }
      } catch (err) {
        console.error("Error loading profile from Firestore:", err);
      }
    };
    
    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  // Auto-save effect to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
      const now = new Date();
      setLastSavedTime(now.toLocaleString(isEn ? 'en-US' : 'fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Error saving profile draft:', e);
    }
  }, [formData, isEn]);

  // Auto-save to Firestore with debounce
  useEffect(() => {
    if (!user) {
      setCloudSyncStatus('offline');
      return;
    }
    
    setCloudSyncStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'profiles', 'suitability');
        const cleanData = JSON.parse(JSON.stringify(formData));
        await setDoc(docRef, {
          ...cleanData,
          userId: user.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        setCloudSyncStatus('synced');
        setLastSavedTime(new Date().toLocaleString(isEn ? 'en-US' : 'fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error("Error saving profile to Firestore:", err);
        setCloudSyncStatus('error');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [formData, user, isEn]);

  const handleToggleHelp = (id: string) => {
    setActiveHelpId(prev => (prev === id ? null : id));
  };

  const handleResetDraft = async () => {
    if (window.confirm(isEn ? "Reset all profile fields to defaults?" : "Réinitialiser tous les champs du profil par défaut ?")) {
      setFormData(defaultFormData);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        if (user) {
          setCloudSyncStatus('saving');
          const docRef = doc(db, 'users', user.uid, 'profiles', 'suitability');
          await setDoc(docRef, {
            ...defaultFormData,
            userId: user.uid,
            updatedAt: new Date().toISOString()
          });
          setCloudSyncStatus('synced');
        }
      } catch (e) {
        console.error('Error resetting draft:', e);
        setCloudSyncStatus('error');
      }
    }
  };

  const handleChange = (key: keyof InvestorProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const currentCountryObj = useMemo(() => {
    return INTERNATIONAL_COUNTRIES.find(c => c.code === (formData.taxCountry || 'FR')) || INTERNATIONAL_COUNTRIES[0];
  }, [formData.taxCountry]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return INTERNATIONAL_COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return INTERNATIONAL_COUNTRIES.filter(c =>
      c.nameEn.toLowerCase().includes(q) ||
      c.nameFr.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const handleSelectCountry = (c: CountryDetail) => {
    const defaultState = c.states && c.states.length > 0 ? (isEn ? c.states[0].nameEn : c.states[0].nameFr) : '';
    setFormData(prev => ({
      ...prev,
      taxCountry: c.code,
      taxState: defaultState,
      taxCity: prev.taxCity || ''
    }));
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleArrayValue = (key: 'productsTraded' | 'priorPlatformsUsed' | 'ordersExecutedTypes' | 'secondarySourcesOfFunds', val: string) => {
    setFormData(prev => {
      const arr = (prev[key] as string[]) || [];
      const updated = arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val];
      return { ...prev, [key]: updated };
    });
  };

  const isStepCompleted = (stepIdx: number): boolean => {
    switch (stepIdx) {
      case 0:
        return Boolean(formData.firstName?.trim() && formData.lastName?.trim());
      case 1:
        return Boolean(formData.employmentStatus && formData.incomeStability && formData.annualIncomeRange);
      case 2:
        return Boolean(formData.approxNetWorth && formData.immediatelyAvailableLiquidity && formData.primarySourceOfFunds);
      case 3:
        return Boolean(formData.overallExperienceYears && formData.selfAssessedLevel);
      case 4:
        return Boolean(formData.primaryObjective && formData.maxDrawdownAcceptable && formData.timeHorizon && formData.riskToleranceProfile && formData.reactionToMarketCrash && formData.expectedAnnualReturn);
      case 5:
        return isStepCompleted(0) && isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3) && isStepCompleted(4);
      default:
        return false;
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // Dynamic suitability engine calculations
  const suitabilityAnalysis = useMemo(() => {
    let score = 50;
    const flags: { level: 'info' | 'warning' | 'danger'; code: string; message: string }[] = [];

    if (formData.annualIncomeRange === '>500k' || formData.approxNetWorth === '>5M' || formData.approxNetWorth === '2.5M-5M') score += 25;
    else if (formData.annualIncomeRange === '180k-300k' || formData.annualIncomeRange === '300k-500k' || formData.approxNetWorth === '1M-2.5M') score += 18;
    else if (formData.annualIncomeRange === '60k-100k' || formData.approxNetWorth === '300k-600k') score += 10;
    else if (formData.annualIncomeRange === '<30k' || formData.approxNetWorth === '<50k') score -= 15;

    if (formData.debtServiceRatio === '>45') {
      score -= 15;
      flags.push({
        level: 'danger',
        code: 'HIGH_DEBT_RATIO',
        message: isEn ? "High monthly debt service ratio relative to income (> 45%)." : "Taux d'endettement mensuel élevé par rapport aux revenus (> 45%)."
      });
    }

    if (formData.approxFixedChargesPct === '>70' || formData.emergencyFundMonths === '<1_month') {
      score -= 15;
      flags.push({
        level: 'warning',
        code: 'HIGH_FIXED_BURDEN',
        message: isEn ? "High fixed charges ratio (> 70%) or limited emergency buffer (< 1 month)." : "Part des charges fixes très élevée (> 70%) ou faible matelas de sécurité (< 1 mois)."
      });
    }

    if (formData.incomeStability === 'seasonal') {
      score -= 10;
      flags.push({
        level: 'info',
        code: 'VARIABLE_INCOME',
        message: isEn ? "Variable or seasonal income structure requiring higher cash buffers." : "Flux de revenus saisonniers ou hautement variables nécessitant des réserves accrues."
      });
    }

    const amountNum = parseFloat(formData.amountToInvestNow || '0');
    if (amountNum >= 100000 || formData.investableSharePct === '>60') {
      flags.push({
        level: 'info',
        code: 'HIGH_ALLOCATION_SHARE',
        message: isEn ? "Significant capital allocation relative to total net worth." : "Allocation en capital significative par rapport au patrimoine global."
      });
    }

    if (formData.overallExperienceYears === '>7_years' || formData.selfAssessedLevel === 'expert') score += 20;
    else if (formData.overallExperienceYears === '<1_year' || formData.selfAssessedLevel === 'beginner') score -= 15;

    if (formData.experiencedMajorDrawdown === 'held_reinforced') score += 10;
    else if (formData.experiencedMajorDrawdown === 'sold_early') score -= 10;

    const finalScore = Math.max(10, Math.min(99, score));
    let tier = isEn ? "Balanced Allocation" : "Profil Équilibré";
    if (finalScore >= 75) tier = isEn ? "Dynamic and Advanced Strategy" : "Stratégie Dynamique et Avancée";
    else if (finalScore <= 40) tier = isEn ? "Prudent and Defensive Strategy" : "Stratégie Prudente et Défensive";

    return { score: finalScore, tier, flags };
  }, [formData, isEn]);

  const profilePayload = useMemo(() => {
    return {
      schemaVersion: "2026.1-QUANTRIH-SUITABILITY",
      timestamp: new Date().toISOString(),
      applicant: {
        identity: {
          firstName: formData.firstName || "Not Specified",
          lastName: formData.lastName || "Not Specified",
          dob: formData.dob || "N/A",
          taxCountry: formData.taxCountry || "FR",
          taxCountryName: currentCountryObj.nameEn,
          taxState: formData.taxState || "N/A",
          taxCity: formData.taxCity || "N/A"
        },
        financialSituation: {
          employmentStatus: formData.employmentStatus,
          incomeStability: formData.incomeStability,
          incomeSourcesCount: formData.incomeSourcesCount,
          monthlySavingsCapacity: formData.monthlySavingsCapacity,
          fixedChargesPct: formData.approxFixedChargesPct,
          annualIncomeRange: formData.annualIncomeRange,
          hasIncomeDropLast12m: formData.hasIncomeDropLast12m
        },
        detailedWealthAndLiquidity: {
          totalNetWorthRange: formData.approxNetWorth,
          financialWealthEstimate: formData.financialWealthEstimate,
          realEstateWealthEstimate: formData.realEstateWealthEstimate,
          businessWealthEstimate: formData.businessWealthEstimate,
          availableLiquidity: formData.immediatelyAvailableLiquidity,
          totalOutstandingDebt: formData.totalOutstandingDebt,
          debtServiceRatio: formData.debtServiceRatio,
          amountToInvestNow: formData.amountToInvestNow,
          investableSharePct: formData.investableSharePct,
          primarySourceOfFunds: formData.primarySourceOfFunds,
          secondarySourcesOfFunds: formData.secondarySourcesOfFunds
        },
        experienceAndKnowledge: {
          yearsExperience: formData.overallExperienceYears,
          tradesPerYear: formData.tradesPerYearRange,
          productsTraded: formData.productsTraded,
          platformsUsed: formData.priorPlatformsUsed,
          ordersExecutedTypes: formData.ordersExecutedTypes,
          drawdownBehavior: formData.experiencedMajorDrawdown,
          selfAssessedLevel: formData.selfAssessedLevel
        },
        suitabilityEngineOutput: {
          qualificationScore: suitabilityAnalysis.score,
          recommendedTier: suitabilityAnalysis.tier,
          flagsCount: suitabilityAnalysis.flags.length,
          flags: suitabilityAnalysis.flags
        }
      }
    };
  }, [formData, suitabilityAnalysis]);

  const copyPayloadToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(profilePayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const downloadPayloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profilePayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dossier_investisseur_${formData.lastName || 'profil'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      /* ================= SECTION 1: IDENTITY & INFO ================= */
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 block mb-1">
                {isEn ? "Step 1 of 5 : Identity & contact" : "Étape 1 sur 5 : Identité et informations"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isEn ? "Personal identity and tax residence" : "Identité personnelle et résidence fiscale"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {isEn 
                  ? "Enter your contact information and civil status to customize your file."
                  : "Renseignez vos informations de contact et d'état civil de base pour personnaliser votre dossier."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "First name" : "Prénom"}
                </label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800/90 text-white placeholder-zinc-500 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 border border-zinc-700/60 transition-all font-medium" 
                  value={formData.firstName || ''} 
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Jean"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "Last name" : "Nom de famille"}
                </label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800/90 text-white placeholder-zinc-500 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 border border-zinc-700/60 transition-all font-medium" 
                  value={formData.lastName || ''} 
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Dupont"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "Date of birth" : "Date de naissance"}
                </label>
                <input 
                  type="date" 
                  className="w-full bg-zinc-800/90 text-white placeholder-zinc-500 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 border border-zinc-700/60 transition-all font-medium" 
                  value={formData.dob || ''} 
                  onChange={(e) => handleChange('dob', e.target.value)}
                />
              </div>

              {/* Searchable Country Selector with Flags & Help */}
              <div className="relative" ref={countryDropdownRef}>
                <div className="flex items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    {isEn ? "Country of tax residence" : "Pays de résidence fiscale"}
                  </label>
                  <FieldHelp
                    titleEn="Country of tax residence"
                    titleFr="Résidence fiscale & TIN"
                    descEn="Your tax country determines the legal and tax framework applicable to your investments. TIN (Tax ID Number) is required under international banking rules (CRS/FATCA)."
                    descFr="Le pays de résidence fiscale détermine les conventions fiscales applicables. Le NIF (Numéro d'Identification Fiscale) est votre numéro fiscal à 13 chiffres requis par les normes bancaires (CRS/FATCA)."
                    isEn={isEn}
                    activeHelpId={activeHelpId}
                    helpId="taxCountryHelp"
                    onToggle={handleToggleHelp}
                  />
                </div>

                {/* Selected Country Trigger Box */}
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="w-full bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/60 text-white rounded-xl p-3.5 text-sm flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-sm group text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{currentCountryObj.flag}</span>
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <span>{isEn ? currentCountryObj.nameEn : currentCountryObj.nameFr}</span>
                      <span className="text-[10px] bg-zinc-700/80 text-zinc-300 px-1.5 py-0.5 rounded font-mono uppercase">
                        {currentCountryObj.code}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>

                {/* Country Search Dropdown */}
                <AnimatePresence>
                  {isCountryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.99 }}
                      transition={{ duration: 0.12 }}
                      className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                      {/* Search Bar */}
                      <div className="p-3 border-b border-zinc-800 bg-zinc-900/90 flex items-center gap-2">
                        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder={isEn ? "Type country name or code (e.g. USA, France, DE)..." : "Tapez le nom du pays ou code (ex : US, France, DE)..."}
                          className="w-full bg-transparent text-white placeholder-zinc-500 text-xs outline-none"
                          autoFocus
                        />
                        {countrySearch && (
                          <button 
                            type="button" 
                            onClick={() => setCountrySearch('')}
                            className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Country List */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-zinc-800/40 p-1 custom-scrollbar">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c) => {
                            const isSelected = c.code === formData.taxCountry;
                            return (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => handleSelectCountry(c)}
                                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected 
                                    ? 'bg-blue-600/20 text-white font-semibold' 
                                    : 'hover:bg-zinc-800/80 text-zinc-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl leading-none">{c.flag}</span>
                                  <span className="text-xs font-medium">{isEn ? c.nameEn : c.nameFr}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono">({c.code})</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-zinc-400">
                            {isEn ? "No country found" : "Aucun pays trouvé"}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* State / Province Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                {isEn 
                  ? (currentCountryObj.statesHeaderEn || "State / region / province") 
                  : (currentCountryObj.statesHeaderFr || "État / région / province")}
              </label>
              {currentCountryObj.states && currentCountryObj.states.length > 0 ? (
                <CustomSelect
                  value={formData.taxState || ''}
                  onChange={(e) => handleChange('taxState', e.target.value)}
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                >
                  <option value="">{isEn ? "-- Select state/region --" : "-- Sélectionner l'état/région --"}</option>
                  {currentCountryObj.states.map(st => {
                    const val = isEn ? st.nameEn : st.nameFr;
                    return (
                      <option key={st.nameEn} value={val} className="bg-zinc-900 text-white">
                        {st.code ? `[${st.code}] ` : ''}{val}
                      </option>
                    );
                  })}
                </CustomSelect>
              ) : (
                <input
                  type="text"
                  value={formData.taxState || ''}
                  onChange={(e) => handleChange('taxState', e.target.value)}
                  placeholder={isEn ? "State or region name" : "Nom de l'état ou de la région"}
                  className="w-full bg-zinc-800/90 text-white placeholder-zinc-500 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                />
              )}
            </div>
          </div>
        );

      /* ================= SECTION 2: CAREER & FINANCES (ADVANCED LONG PAGE) ================= */
      case 1:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <span className="text-xs font-semibold text-blue-400 block mb-1 tracking-wider uppercase">
                {isEn ? "Step 2 of 5 : Career, Income & Financial Resilience" : "Étape 2 sur 5 : Situation professionnelle, revenus & résilience financière"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isEn ? "Advanced Career Profile & Income Architecture" : "Bilan professionnel approfondi et structure des flux financiers"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                {isEn 
                  ? "Detailed assessment of your professional status, industry sector, income stability, monthly cash flows, tax bracket, and financial cushion."
                  : "Évaluation complète de votre statut professionnel, secteur d'activité, prévisibilité des revenus, capacité d'épargne et niveau de résilience globale."}
              </p>
            </div>

            {/* Subsection 1: Activity & Sector */}
            <div className="p-5 bg-zinc-900/90 shadow-2xl rounded-2xl space-y-4 border border-zinc-700/40">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider pb-1 border-b border-zinc-800">
                {isEn ? "1. Professional Activity, Sector & Seniority" : "1. Statut professionnel, secteur & ancienneté"}
              </h4>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  {isEn ? "Exact employment status" : "Statut professionnel exact"}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { id: 'salaried', labelEn: 'Salaried Employee', labelFr: 'Salarié (CDI / CDD)' },
                    { id: 'self_employed', labelEn: 'Independent / Freelance', labelFr: 'Indépendant / Freelance' },
                    { id: 'business_owner', labelEn: 'Business Owner / Founder', labelFr: 'Dirigeant / Entrepreneur' },
                    { id: 'liberal', labelEn: 'Liberal Profession', labelFr: 'Profession libérale' },
                    { id: 'civil_servant', labelEn: 'Public Sector / Civil', labelFr: 'Fonction publique / État' },
                    { id: 'executive', labelEn: 'Executive / C-Suite', labelFr: 'Cadre Dirigeant' },
                    { id: 'trader_investor', labelEn: 'Professional Investor', labelFr: 'Investisseur Pro / Trader' },
                    { id: 'retired', labelEn: 'Retired / Other', labelFr: 'Retraité / Autre' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleChange('employmentStatus', item.id)}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all duration-150 cursor-pointer ${
                        formData.employmentStatus === item.id 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30' 
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50'
                      }`}
                    >
                      {isEn ? item.labelEn : item.labelFr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {isEn ? "Industry / Activity Sector" : "Secteur d'activité principal"}
                  </label>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.professionType || 'tech'}
                    onChange={(e) => handleChange('professionType', e.target.value)}
                  >
                    <option value="tech">{isEn ? "Technology, AI & Software" : "Technologie, IA & Logiciel"}</option>
                    <option value="finance">{isEn ? "Banking, Finance & Insurance" : "Banque, Finance & Assurance"}</option>
                    <option value="healthcare">{isEn ? "Healthcare, Pharma & Biotech" : "Santé, Pharmacie & Biotech"}</option>
                    <option value="real_estate">{isEn ? "Real Estate & Construction" : "Immobilier & BTP"}</option>
                    <option value="legal_consulting">{isEn ? "Law, Audit & Consulting" : "Droit, Conseil & Audit"}</option>
                    <option value="industry">{isEn ? "Industry, Energy & Commodities" : "Industrie, Énergie & Matériaux"}</option>
                    <option value="public_education">{isEn ? "Public Service & Education" : "Secteur Public & Éducation"}</option>
                    <option value="trade_retail">{isEn ? "Retail, E-commerce & Trade" : "Commerce, E-commerce & Distribution"}</option>
                    <option value="media_art">{isEn ? "Media, Entertainment & Art" : "Médias, Culture & Événementiel"}</option>
                    <option value="other">{isEn ? "Other / Multi-disciplinary" : "Autre / Pluridisciplinaire"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {isEn ? "Career Seniority / Experience" : "Niveau d'expérience & Ancienneté"}
                  </label>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.careerSeniority || '3_10_years'}
                    onChange={(e) => handleChange('careerSeniority', e.target.value)}
                  >
                    <option value="<3_years">{isEn ? "Junior (< 3 years experience)" : "Début de carrière (< 3 ans)"}</option>
                    <option value="3_10_years">{isEn ? "Intermediate / Confirmed (3 - 10 years)" : "Confirmé (3 à 10 ans d'expérience)"}</option>
                    <option value="10_20_years">{isEn ? "Senior / Management (10 - 20 years)" : "Sénior / Management (10 à 20 ans)"}</option>
                    <option value=">20_years">{isEn ? "Executive / Partner (> 20 years)" : "Dirigeant / Associé (> 20 ans)"}</option>
                  </CustomSelect>
                </div>
              </div>
            </div>

            {/* Subsection 2: Income Structure & Trajectory */}
            <div className="p-5 bg-zinc-900/90 shadow-2xl rounded-2xl space-y-4 border border-zinc-700/40">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider pb-1 border-b border-zinc-800">
                {isEn ? "2. Annual Income, Structure & Growth Expectations" : "2. Structure des revenus bruts & prévisions de croissance"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      {isEn ? "Annual Gross Income Range" : "Revenu brut annuel global"}
                    </label>
                    <FieldHelp
                      titleEn="Annual gross income"
                      titleFr="Revenu brut annuel"
                      descEn="Total personal income before taxes (salary, dividends, bonuses, rental income)."
                      descFr="Somme totale de vos rémunérations avant déduction fiscale (salaires, dividendes, bénéfices, revenus fonciers)."
                      isEn={isEn}
                      activeHelpId={activeHelpId}
                      helpId="annualIncomeHelp"
                      onToggle={handleToggleHelp}
                    />
                  </div>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.annualIncomeRange || '60k-100k'}
                    onChange={(e) => handleChange('annualIncomeRange', e.target.value)}
                  >
                    <option value="<30k">&lt; €30,000 / {isEn ? "year" : "an"}</option>
                    <option value="30k-60k">€30,000 - €60,000 / {isEn ? "year" : "an"}</option>
                    <option value="60k-100k">€60,000 - €100,000 / {isEn ? "year" : "an"}</option>
                    <option value="100k-180k">€100,000 - €180,000 / {isEn ? "year" : "an"}</option>
                    <option value="180k-300k">€180,000 - €300,000 / {isEn ? "year" : "an"}</option>
                    <option value="300k-500k">€300,000 - €500,000 / {isEn ? "year" : "an"}</option>
                    <option value=">500k">&gt; €500,000 / {isEn ? "year" : "an"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <div className="flex items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      {isEn ? "Income Stability & Regularity" : "Stabilité et régularité des flux"}
                    </label>
                    <FieldHelp
                      titleEn="Income stability"
                      titleFr="Stabilité des revenus"
                      descEn="Measures cash flow predictability. Guaranteed salary allows regular DCA investing."
                      descFr="Évalue la régularité et la prévisibilité de vos flux financiers."
                      isEn={isEn}
                      activeHelpId={activeHelpId}
                      helpId="incomeStabilityHelp"
                      onToggle={handleToggleHelp}
                    />
                  </div>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.incomeStability || 'fixed'}
                    onChange={(e) => handleChange('incomeStability', e.target.value)}
                  >
                    <option value="fixed">{isEn ? "100% Guaranteed & Regular (Fixed salary)" : "100% Fixe & Garanti (Salarié / Fonctionnaire)"}</option>
                    <option value="mixed">{isEn ? "Mixed (Fixed base + variable bonus/commissions)" : "Mixte (Base fixe + part variable / bonus)"}</option>
                    <option value="variable">{isEn ? "Variable (Freelance, sales, business profits)" : "Variable (Indépendant, honoraires, dividendes)"}</option>
                    <option value="seasonal">{isEn ? "Seasonal / Contractual project payments" : "Saisonnière / Paiements par projets"}</option>
                  </CustomSelect>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {isEn ? "Primary Source of Personal Income" : "Source principale de revenus"}
                  </label>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.mainIncomeType || 'base_salary'}
                    onChange={(e) => handleChange('mainIncomeType', e.target.value)}
                  >
                    <option value="base_salary">{isEn ? "Fixed Salary / Compensation" : "Salaire / Rémunération fixe"}</option>
                    <option value="business_dividends">{isEn ? "Company Dividends & Owner Distributions" : "Dividendes & Bénéfices d'entreprise"}</option>
                    <option value="rental_income">{isEn ? "Real Estate Rental Income" : "Revenus fonciers / Immobiliers"}</option>
                    <option value="commissions">{isEn ? "Sales Commissions & Performance Fees" : "Commissions de vente & Primes"}</option>
                    <option value="pension">{isEn ? "Pension & Annuities" : "Pension de retraite / Rentes"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {isEn ? "Secondary Income Stream / Side Activity" : "Revenu secondaire / Activité complémentaire"}
                  </label>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.sideHustleIncome || 'none'}
                    onChange={(e) => handleChange('sideHustleIncome', e.target.value)}
                  >
                    <option value="none">{isEn ? "None (100% Single main income)" : "Aucun (Revenu unique)"}</option>
                    <option value="consulting">{isEn ? "Secondary Consulting / Freelance" : "Conseil / Prestations indépendantes"}</option>
                    <option value="real_estate">{isEn ? "Rental Investments" : "Investissement locatif"}</option>
                    <option value="digital_business">{isEn ? "E-Commerce / Digital Business" : "E-Commerce / Business Numérique"}</option>
                    <option value="investments">{isEn ? "Financial Portfolio Yield & Interest" : "Revenus de portefeuille financier"}</option>
                  </CustomSelect>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {isEn ? "3 to 5-Year Income Growth Trajectory" : "Perspectives d'évolution des revenus (horizon 3-5 ans)"}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'strong_growth', labelEn: 'Strong Growth (> +20%/yr)', labelFr: 'Forte hausse (> +20%/an)' },
                    { id: 'moderate_growth', labelEn: 'Moderate Growth (+5-20%)', labelFr: 'Hausse modérée (+5-20%)' },
                    { id: 'stable', labelEn: 'Stable & Constant', labelFr: 'Stable & Constant' },
                    { id: 'uncertain', labelEn: 'Uncertain / Variable', labelFr: 'Incertain / En baisse' },
                  ].map(evo => (
                    <button
                      key={evo.id}
                      type="button"
                      onClick={() => handleChange('expectedIncomeEvolution', evo.id)}
                      className={`p-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                        formData.expectedIncomeEvolution === evo.id 
                          ? 'bg-blue-600 text-white font-bold shadow-md' 
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50 text-xs font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold">{isEn ? evo.labelEn : evo.labelFr}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subsection 3: Savings Capacity, Fixed Charges & Reserves */}
            <div className="p-5 bg-zinc-900/90 shadow-2xl rounded-2xl space-y-4 border border-zinc-700/40">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider pb-1 border-b border-zinc-800">
                {isEn ? "3. Cash Flow, Fixed Charges & Emergency Reserves" : "3. Capacité d'épargne, charges fixes & matelas de sécurité"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      {isEn ? "Monthly Net Savings Capacity" : "Capacité d'épargne mensuelle nette"}
                    </label>
                    <FieldHelp
                      titleEn="Monthly savings capacity"
                      titleFr="Capacité d'épargne mensuelle nette"
                      descEn="Net money remaining every month after paying all fixed charges and living expenses."
                      descFr="Montant net disponible chaque mois après versement des charges fixes et dépenses courantes."
                      isEn={isEn}
                      activeHelpId={activeHelpId}
                      helpId="savingsCapacityHelp"
                      onToggle={handleToggleHelp}
                    />
                  </div>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.monthlySavingsCapacity || '1200-2500'}
                    onChange={(e) => handleChange('monthlySavingsCapacity', e.target.value)}
                  >
                    <option value="<200">&lt; €200 / {isEn ? "month" : "mois"}</option>
                    <option value="200-500">€200 - €500 / {isEn ? "month" : "mois"}</option>
                    <option value="500-1200">€500 - €1,200 / {isEn ? "month" : "mois"}</option>
                    <option value="1200-2500">€1,200 - €2,500 / {isEn ? "month" : "mois"}</option>
                    <option value="2500-5000">€2,500 - €5,000 / {isEn ? "month" : "mois"}</option>
                    <option value="5000-10000">€5,000 - €10,000 / {isEn ? "month" : "mois"}</option>
                    <option value=">10000">&gt; €10,000 / {isEn ? "month" : "mois"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <div className="flex items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      {isEn ? "Emergency Safety Reserve (In Months)" : "Matelas d'épargne de précaution (en mois)"}
                    </label>
                  </div>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.emergencyFundMonths || '3_6_months'}
                    onChange={(e) => handleChange('emergencyFundMonths', e.target.value)}
                  >
                    <option value="<1_month">{isEn ? "< 1 Month (Low cushion)" : "< 1 Mois de dépenses (Faible)"}</option>
                    <option value="1_3_months">{isEn ? "1 - 3 Months (Standard buffer)" : "1 à 3 Mois de dépenses"}</option>
                    <option value="3_6_months">{isEn ? "3 - 6 Months (Solid protection)" : "3 à 6 Mois de dépenses (Solide)"}</option>
                    <option value="6_12_months">{isEn ? "6 - 12 Months (High security)" : "6 à 12 Mois de dépenses (Prudent)"}</option>
                    <option value=">12_months">{isEn ? "> 12 Months (Ultra-conservative)" : "> 12 Mois de dépenses (Très haute sécurité)"}</option>
                  </CustomSelect>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    {isEn ? "Fixed Charges Ratio (% of Net Monthly Income)" : "Part des charges fixes (% du revenu net)"}
                  </label>
                  <FieldHelp
                    titleEn="Fixed charges ratio"
                    titleFr="Ratio des charges fixes"
                    descEn="Percentage of income committed to non-negotiable expenses (rent/mortgage, taxes, insurance, active loans)."
                    descFr="Pourcentage de vos revenus absorbé par vos dépenses incompressibles (loyer/prêt, impôts, factures, crédits)."
                    isEn={isEn}
                    activeHelpId={activeHelpId}
                    helpId="fixedChargesPctHelp"
                    onToggle={handleToggleHelp}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: '<30', label: '< 30%', desc: isEn ? "High margin" : "Marge forte" },
                    { id: '30-50', label: '30% - 50%', desc: isEn ? "Standard" : "Standard" },
                    { id: '50-70', label: '50% - 70%', desc: isEn ? "Moderate" : "Modérée" },
                    { id: '>70', label: '> 70%', desc: isEn ? "High load" : "Charge élevée" },
                  ].map(charge => (
                    <button
                      key={charge.id}
                      type="button"
                      onClick={() => handleChange('approxFixedChargesPct', charge.id)}
                      className={`p-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                        formData.approxFixedChargesPct === charge.id 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50'
                      }`}
                    >
                      <div className="text-xs font-bold">{charge.label}</div>
                      <div className="text-[10px] opacity-80">{charge.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subsection 4: Household, Housing & Fiscal Bracket */}
            <div className="p-5 bg-zinc-900/90 shadow-2xl rounded-2xl space-y-4 border border-zinc-700/40">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider pb-1 border-b border-zinc-800">
                {isEn ? "4. Housing Status, Family & Tax Bracket" : "4. Logement, charges familiales & tranche d'imposition"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {isEn ? "Housing Status" : "Statut du logement principal"}
                  </label>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.housingStatus || 'renting'}
                    onChange={(e) => handleChange('housingStatus', e.target.value)}
                  >
                    <option value="owner_mortgage">{isEn ? "Owner (Active mortgage)" : "Propriétaire (Crédit en cours)"}</option>
                    <option value="owner_outright">{isEn ? "Owner (Fully paid, no loan)" : "Propriétaire (Sans crédit)"}</option>
                    <option value="renting">{isEn ? "Tenant / Renting" : "Locataire"}</option>
                    <option value="employer_provided">{isEn ? "Provided by Employer / Family" : "Logé à titre gratuit / Employeur"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {isEn ? "Household Dependents" : "Nombre de personnes à charge"}
                  </label>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.dependentsCount || '0'}
                    onChange={(e) => handleChange('dependentsCount', e.target.value)}
                  >
                    <option value="0">{isEn ? "0 (No dependents)" : "0 (Aucune personne à charge)"}</option>
                    <option value="1">{isEn ? "1 dependent" : "1 personne à charge"}</option>
                    <option value="2">{isEn ? "2 dependents" : "2 personnes à charge"}</option>
                    <option value="3">{isEn ? "3 dependents" : "3 personnes à charge"}</option>
                    <option value="4+">{isEn ? "4+ dependents" : "4 personnes ou plus"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {isEn ? "Marginal Tax Bracket (TMI)" : "Tranche Marginale d'Imposition"}
                  </label>
                  <CustomSelect
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3 px-4 text-xs font-semibold outline-none border border-zinc-700/60"
                    value={formData.marginalTaxBracket || '30'}
                    onChange={(e) => handleChange('marginalTaxBracket', e.target.value)}
                  >
                    <option value="0">0% ({isEn ? "Non-taxable" : "Non imposable"})</option>
                    <option value="11_15">11% - 15% ({isEn ? "Low bracket" : "Tranche basse"})</option>
                    <option value="30">30% ({isEn ? "Intermediate bracket" : "Tranche intermédiaire"})</option>
                    <option value="41_45">41% - 45% ({isEn ? "High earner" : "Tranche élevée"})</option>
                    <option value="high_earner">&gt; 45% ({isEn ? "Top tax tier" : "Tranche maximale / Forts revenus"})</option>
                  </CustomSelect>
                </div>
              </div>
            </div>
          </div>
        );

      /* ================= SECTION 3: WEALTH, LIQUIDITY, DEBT & ORIGIN ================= */
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 block mb-1">
                {isEn ? "Step 3 of 5 : Wealth & funds" : "Étape 3 sur 5 : Patrimoine, liquidités et origine des fonds"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isEn ? "Detailed asset structure & target capital" : "Structure du patrimoine et capital d'investissement"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {isEn 
                  ? "Distinguish financial, real estate, business assets, debt and target capital."
                  : "Distinguez précisément patrimoine financier, immobilier, professionnel, passif/dettes et montant à allouer."}
              </p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="text-xs font-semibold text-zinc-300">
                  {isEn ? "1. Total estimated net worth" : "1. Patrimoine net global estimé"}
                </label>
                <FieldHelp
                  titleEn="Estimated Net Worth"
                  titleFr="Patrimoine net global"
                  descEn="Total value of assets (real estate, liquid cash, stock portfolio, business assets) minus total liabilities (mortgages, loans)."
                  descFr="Valeur totale de l'ensemble de vos actifs (résidence principale, investissements, comptes bancaires, parts d'entreprises) déduction faite de l'ensemble de vos dettes."
                  isEn={isEn}
                  activeHelpId={activeHelpId}
                  helpId="netWorthHelp"
                  onToggle={handleToggleHelp}
                />
              </div>
              <CustomSelect 
                className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-zinc-700/60"
                value={formData.approxNetWorth || '300k-600k'}
                onChange={(e) => handleChange('approxNetWorth', e.target.value)}
              >
                <option value="<50k">&lt; €50,000</option>
                <option value="50k-150k">€50,000 - €150,000</option>
                <option value="150k-300k">€150,000 - €300,000</option>
                <option value="300k-600k">€300,000 - €600,000</option>
                <option value="600k-1M">€600,000 - €1,000,000</option>
                <option value="1M-2.5M">€1,000,000 - €2,500,000</option>
                <option value="2.5M-5M">€2,500,000 - €5,000,000</option>
                <option value=">5M">&gt; €5,000,000</option>
              </CustomSelect>
            </div>

            <div className="p-5 bg-zinc-900/90 shadow-2xl rounded-2xl space-y-4 border border-zinc-700/40">
              <h4 className="text-xs font-semibold text-white">
                {isEn ? "2. Advanced asset breakdown" : "2. Ventilation granulaire des actifs"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    {isEn ? "Financial assets" : "Patrimoine financier (actions, ETFs)"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800 text-white rounded-xl p-3 text-xs font-semibold outline-none border border-zinc-700/50"
                    value={formData.financialWealthEstimate || '150k-300k'}
                    onChange={(e) => handleChange('financialWealthEstimate', e.target.value)}
                  >
                    <option value="<10k">&lt; €10,000</option>
                    <option value="10k-50k">€10,000 - €50,000</option>
                    <option value="50k-150k">€50,000 - €150,000</option>
                    <option value="150k-300k">€150,000 - €300,000</option>
                    <option value="300k-750k">€300,000 - €750,000</option>
                    <option value="750k-1.5M">€750,000 - €1,500,000</option>
                    <option value="1.5M-3M">€1,500,000 - €3,000,000</option>
                    <option value=">3M">&gt; €3,000,000</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    {isEn ? "Real estate assets" : "Patrimoine immobilier"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800 text-white rounded-xl p-3 text-xs font-semibold outline-none border border-zinc-700/50"
                    value={formData.realEstateWealthEstimate || '250k-500k'}
                    onChange={(e) => handleChange('realEstateWealthEstimate', e.target.value)}
                  >
                    <option value="none">{isEn ? "None" : "Aucun"}</option>
                    <option value="<100k">&lt; €100,000</option>
                    <option value="100k-250k">€100,000 - €250,000</option>
                    <option value="250k-500k">€250,000 - €500,000</option>
                    <option value="500k-1M">€500,000 - €1,000,000</option>
                    <option value="1M-2.5M">€1,000,000 - €2,500,000</option>
                    <option value="2.5M-5M">€2,500,000 - €5,000,000</option>
                    <option value=">5M">&gt; €5,000,000</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    {isEn ? "Business assets" : "Patrimoine professionnel"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800 text-white rounded-xl p-3 text-xs font-semibold outline-none border border-zinc-700/50"
                    value={formData.businessWealthEstimate || 'none'}
                    onChange={(e) => handleChange('businessWealthEstimate', e.target.value)}
                  >
                    <option value="none">{isEn ? "None" : "Aucun"}</option>
                    <option value="<50k">&lt; €50,000</option>
                    <option value="50k-200k">€50,000 - €200,000</option>
                    <option value="200k-500k">€200,000 - €500,000</option>
                    <option value="500k-1.5M">€500,000 - €1,500,000</option>
                    <option value=">1.5M">&gt; €1,500,000</option>
                  </CustomSelect>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    {isEn ? "3. Available liquidity" : "3. Liquidités immédiatement disponibles"}
                  </label>
                  <FieldHelp
                    titleEn="Available liquidity"
                    titleFr="Liquidités disponibles"
                    descEn="Funds stored in checking accounts, savings accounts, or cash funds immediately available within 48h without loss."
                    descFr="Sommes d'argent disponibles sous 48h (Livrets, comptes courants, fonds en euros sans pénalités)."
                    isEn={isEn}
                    activeHelpId={activeHelpId}
                    helpId="liquidityHelp"
                    onToggle={handleToggleHelp}
                  />
                </div>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.immediatelyAvailableLiquidity || '40k-100k'}
                  onChange={(e) => handleChange('immediatelyAvailableLiquidity', e.target.value)}
                >
                  <option value="<5k">&lt; €5,000</option>
                  <option value="5k-15k">€5,000 - €15,000</option>
                  <option value="15k-40k">€15,000 - €40,000</option>
                  <option value="40k-100k">€40,000 - €100,000</option>
                  <option value="100k-250k">€100,000 - €250,000</option>
                  <option value="250k-500k">€250,000 - €500,000</option>
                  <option value=">500k">&gt; €500,000</option>
                </CustomSelect>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    {isEn ? "4. Target amount to invest (€)" : "4. Montant du capital à investir (€)"}
                  </label>
                  <FieldHelp
                    titleEn="Capital to invest"
                    titleFr="Montant à investir"
                    descEn="Initial lump sum capital allocation target for this portfolio management strategy."
                    descFr="Capital initial que vous prévoyez d'allouer immédiatement à cette stratégie d'investissement."
                    isEn={isEn}
                    activeHelpId={activeHelpId}
                    helpId="amountToInvestHelp"
                    onToggle={handleToggleHelp}
                  />
                </div>
                <input 
                  type="number" 
                  step="1000"
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-zinc-700/60"
                  value={formData.amountToInvestNow || ''}
                  onChange={(e) => handleChange('amountToInvestNow', e.target.value)}
                  placeholder="50000"
                />
              </div>
            </div>
          </div>
        );

      /* ================= SECTION 4: KNOWLEDGE & MARKETS (ADVANCED) ================= */
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <span className="text-xs font-semibold text-blue-400 block mb-1">
                {isEn ? "Step 4 of 5 : Knowledge & Markets (Advanced Qualification)" : "Étape 4 sur 5 : Connaissance des marchés & Qualification avancée"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isEn ? "Market Knowledge & Advanced Trading Practice" : "Connaissance des marchés et instruments complexes"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                {isEn 
                  ? "Evaluate your mastery of financial instruments, derivatives, risk mechanisms, and professional qualifications."
                  : "Évaluation avancée de votre pratique des marchés, instruments dérivés, mécanismes de risque et niveau d'expertise."}
              </p>
            </div>

            {/* 1. Background & Global Expertise */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400/90 pb-1 border-b border-zinc-800">
                {isEn ? "1. General Experience & Professional Background" : "1. Expérience globale & Formation financière"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <label className="text-xs font-semibold text-zinc-300">
                      {isEn ? "Years of active trading" : "Années d'expérience active"}
                    </label>
                    <FieldHelp
                      titleEn="Market experience"
                      titleFr="Expérience des marchés"
                      descEn="Cumulative active years managing personal or professional investments through financial cycles."
                      descFr="Nombre d'années cumulées pendant lesquelles vous avez géré des placements financiers."
                      isEn={isEn}
                      activeHelpId={activeHelpId}
                      helpId="experienceYearsHelp"
                      onToggle={handleToggleHelp}
                    />
                  </div>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.overallExperienceYears || '3_7_years'}
                    onChange={(e) => handleChange('overallExperienceYears', e.target.value)}
                  >
                    <option value="<1_year">&lt; 1 {isEn ? "year" : "an"}</option>
                    <option value="1_3_years">1 - 3 {isEn ? "years" : "ans"}</option>
                    <option value="3_7_years">3 - 7 {isEn ? "years" : "ans"}</option>
                    <option value="7_15_years">7 - 15 {isEn ? "years" : "ans"}</option>
                    <option value=">15_years">&gt; 15 {isEn ? "years (Senior / Pro)" : "ans (Sénior / Pro)"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "Self-assessed level" : "Niveau d'expertise auto-évalué"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.selfAssessedLevel || 'intermediate'}
                    onChange={(e) => handleChange('selfAssessedLevel', e.target.value)}
                  >
                    <option value="beginner">{isEn ? "Beginner" : "Débutant"}</option>
                    <option value="intermediate">{isEn ? "Intermediate" : "Intermédiaire"}</option>
                    <option value="advanced">{isEn ? "Advanced" : "Avancé"}</option>
                    <option value="expert">{isEn ? "Expert / Professional" : "Expert / Professionnel de marché"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "Financial qualifications & background" : "Formation & Qualification Pro"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.professionalBackground || 'self_taught'}
                    onChange={(e) => handleChange('professionalBackground', e.target.value)}
                  >
                    <option value="self_taught">{isEn ? "Self-taught private investor" : "Autodidacte (Investisseur privé)"}</option>
                    <option value="academic_finance">{isEn ? "Master / University in Finance & Econ" : "Formation Supérieure (Finance / Économie)"}</option>
                    <option value="certified_pro">{isEn ? "Certified CFA / CAIA / FRM / Licensed" : "Certifié CFA / CAIA / FRM / Professionnel agréé"}</option>
                    <option value="market_pro">{isEn ? "Institutional Trader / Portfolio Manager" : "Trader / Gérant de Portefeuille / Analyste Pro"}</option>
                  </CustomSelect>
                </div>
              </div>
            </div>

            {/* 2. Financial Instruments Traded */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400/90 pb-1 border-b border-zinc-800">
                {isEn ? "2. Traded Financial Instruments & Asset Classes" : "2. Instruments financiers & classes d'actifs pratiquées"}
              </h4>
              <p className="text-xs text-zinc-400">
                {isEn ? "Select all asset classes you have actively traded or managed:" : "Sélectionnez tous les instruments et actifs que vous avez déjà négociés :"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'stocks_etfs', labelEn: 'Stocks & Index ETFs', labelFr: 'Actions & ETFs Indépendants' },
                  { id: 'bonds', labelEn: 'Sovereign & Corporate Bonds', labelFr: 'Obligations d\'État & Corporate' },
                  { id: 'funds_pe', labelEn: 'Private Equity & VC Funds', labelFr: 'Fonds, Private Equity & VC' },
                  { id: 'options', labelEn: 'Stock & Index Options', labelFr: 'Options sur actions & indices' },
                  { id: 'futures', labelEn: 'Futures Contracts', labelFr: 'Futures / Contrats à terme' },
                  { id: 'cfd_forex', labelEn: 'CFDs, Forex & OTC Swaps', labelFr: 'CFDs, Forex & Swaps OTC' },
                  { id: 'structured_notes', labelEn: 'Structured Products & EMTN', labelFr: 'Produits Structurés & EMTN' },
                  { id: 'crypto_defi', labelEn: 'Digital Assets & DeFi', labelFr: 'Crypto-actifs, Tokens & DeFi' },
                  { id: 'leveraged_etps', labelEn: 'Turbos, Warrants & Leveraged ETPs', labelFr: 'Turbos, Warrants & ETPs à Levier' },
                  { id: 'short_selling_margin', labelEn: 'Short Selling & Margin Trading', labelFr: 'Vente à découvert & Marge' },
                ].map(item => {
                  const active = (formData.productsTraded || []).includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleArrayValue('productsTraded', item.id)}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        active 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30' 
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50'
                      }`}
                    >
                      <span className="pr-2">{isEn ? item.labelEn : item.labelFr}</span>
                      {active && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 3. Activity, Volume & Execution */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400/90 pb-1 border-b border-zinc-800">
                {isEn ? "3. Trading Activity, Annual Volume & Execution" : "3. Fréquence, Volume annuel & Ordres maîtrisés"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "Execution frequency" : "Fréquence des opérations"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.investmentFrequency || 'monthly'}
                    onChange={(e) => handleChange('investmentFrequency', e.target.value)}
                  >
                    <option value="daily">{isEn ? "Daily / Intraday (Day trading)" : "Quotidienne / Intraday (Day trading)"}</option>
                    <option value="weekly">{isEn ? "Weekly (Swing trading)" : "Hebdomadaire (Swing trading)"}</option>
                    <option value="monthly">{isEn ? "Monthly (Rebalancing)" : "Mensuelle (Rebalancement)"}</option>
                    <option value="quarterly">{isEn ? "Quarterly" : "Trimestrielle"}</option>
                    <option value="occasional">{isEn ? "Occasional / Buy & Hold" : "Occasionnelle / Long terme"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "Estimated annual trading volume (€/$)" : "Volume d'opérations annuel estimé (€ / $)"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.annualTradingVolume || '100k-500k'}
                    onChange={(e) => handleChange('annualTradingVolume', e.target.value)}
                  >
                    <option value="<25k">&lt; 25 000 €</option>
                    <option value="25k-100k">25 000 € - 100 000 €</option>
                    <option value="100k-500k">100 000 € - 500 000 €</option>
                    <option value="500k-2M">500 000 € - 2 000 000 €</option>
                    <option value=">2M">&gt; 2 000 000 € ({isEn ? "Institutional scale" : "Échelle institutionnelle"})</option>
                  </CustomSelect>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "Mastered order types & execution methods" : "Types d'ordres & méthodes d'exécution maîtrisées"}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'market_orders', labelEn: 'Market Orders', labelFr: 'Ordres au marché' },
                    { id: 'limit_stop_orders', labelEn: 'Limit & Stop-Loss', labelFr: 'Ordres Limite & Stop-Loss' },
                    { id: 'conditional_oco', labelEn: 'Trailing & OCO Orders', labelFr: 'Trailing Stops & Ordres OCO' },
                    { id: 'options_spreads', labelEn: 'Multi-Leg Options Spreads', labelFr: 'Spreads d\'Options Complexes' },
                    { id: 'algo_api_trading', labelEn: 'Algorithmic / API Trading', labelFr: 'Trading Algorithmique & API' },
                  ].map(item => {
                    const active = (formData.ordersExecutedTypes || []).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleArrayValue('ordersExecutedTypes', item.id)}
                        className={`p-2.5 rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer border ${
                          active 
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' 
                            : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700/40'
                        }`}
                      >
                        {isEn ? item.labelEn : item.labelFr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Advanced Technical Knowledge Test */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400/90 pb-1 border-b border-zinc-800">
                {isEn ? "4. Advanced Risk Comprehension & Technical Verification" : "4. Évaluation théorique & pratique des risques financiers"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "a. Leverage & Margin Call mechanics" : "a. Effet de levier & Appels de marge (Margin Call)"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.understandsDerivativesLeverage || 'yes_experienced'}
                    onChange={(e) => handleChange('understandsDerivativesLeverage', e.target.value)}
                  >
                    <option value="yes_experienced">{isEn ? "Full mastery & experienced in real markets" : "Maîtrise complète avec pratique en réel"}</option>
                    <option value="theory_only">{isEn ? "Theoretical understanding without leverage practice" : "Compréhension théorique sans pratique"}</option>
                    <option value="no_unfamiliar">{isEn ? "Unfamiliar / Prefer zero leverage" : "Non maîtrisé / Évite le levier"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "b. Options Sensitivity (Greeks: Delta, Gamma, Vega, Theta Decay)" : "b. Sensibilité des Options (Grecques: Delta, Gamma, Vega, Theta)"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.understandsOptionsGreeks || 'basic'}
                    onChange={(e) => handleChange('understandsOptionsGreeks', e.target.value)}
                  >
                    <option value="advanced_greeks">{isEn ? "Advanced mastery (Active Greeks & Volatility hedging)" : "Maîtrise avancée (Gestion des grecques et volatilité)"}</option>
                    <option value="basic">{isEn ? "Basic understanding (Strike & Time decay)" : "Notions de base (Valeur temps et Strike)"}</option>
                    <option value="none">{isEn ? "Do not understand options pricing" : "Non maîtrisé"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "c. Bond Yield vs Price Inverse Relationship" : "c. Relation Prix/Taux des obligations"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.understandsBondPriceYieldInverse || 'yes_fully'}
                    onChange={(e) => handleChange('understandsBondPriceYieldInverse', e.target.value)}
                  >
                    <option value="yes_fully">{isEn ? "Fully understood (Duration & Convexity impact)" : "Parfaitement compris (Impact de la duration)"}</option>
                    <option value="partial">{isEn ? "Partially understood" : "Incomplet"}</option>
                    <option value="no">{isEn ? "Not clear" : "Non compris"}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {isEn ? "d. Unlimited liabilities on Short Selling" : "d. Pertes potentiellement illimitées en Vente à Découvert"}
                  </label>
                  <CustomSelect 
                    className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                    value={formData.understandsShortSellingLiabilities || 'yes_fully'}
                    onChange={(e) => handleChange('understandsShortSellingLiabilities', e.target.value)}
                  >
                    <option value="yes_fully">{isEn ? "Yes, fully aware of infinite loss risk" : "Oui, parfaitement conscient des pertes illimitées"}</option>
                    <option value="partial">{isEn ? "Vaguely aware" : "Partiellement"}</option>
                    <option value="no">{isEn ? "Unaware" : "Non"}</option>
                  </CustomSelect>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "e. Active portfolio behavior during major market crashes (2008, 2020, 2022)" : "e. Comportement réel lors de krachs de marché majeurs (2008, 2020, 2022)"}
                </label>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.experiencedMajorMarketCrash || 'yes_managed_active'}
                  onChange={(e) => handleChange('experiencedMajorMarketCrash', e.target.value)}
                >
                  <option value="yes_managed_active">{isEn ? "Actively managed & rebalanced a real portfolio during severe crash" : "Géré et rebalancé un portefeuille réel pendant un krach majeur"}</option>
                  <option value="observed">{isEn ? "Observed markets as investor without major drawdown exposure" : "Observateur passif des marchés"}</option>
                  <option value="none">{isEn ? "New investor, never experienced market crash" : "Jamais expérimenté"}</option>
                </CustomSelect>
              </div>
            </div>
          </div>
        );

      /* ================= SECTION 5: RISK & OBJECTIVES ================= */
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 block mb-1">
                {isEn ? "Step 5 of 5 : Risk & objectives" : "Étape 5 sur 5 : Risque et objectifs"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isEn ? "Risk tolerance and investment objectives" : "Tolérance au risque et objectifs d'investissement"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {isEn 
                  ? "Define target duration, max acceptable drawdown, and growth orientation."
                  : "Définissez votre horizon temporel, votre perte maximale tolérable et votre objectif de rendement."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "1. Primary objective" : "1. Objectif principal"}
                </label>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.primaryObjective || 'growth'}
                  onChange={(e) => handleChange('primaryObjective', e.target.value)}
                >
                  <option value="preservation">{isEn ? "Capital Preservation" : "Préservation du capital"}</option>
                  <option value="income">{isEn ? "Income Generation / Dividends" : "Génération de revenus / Dividendes"}</option>
                  <option value="growth">{isEn ? "Capital Growth" : "Croissance du capital"}</option>
                  <option value="aggressive_growth">{isEn ? "Aggressive Capital Growth" : "Croissance forte / Spéculation"}</option>
                </CustomSelect>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    {isEn ? "2. Max acceptable drawdown" : "2. Perte temporaire maximale acceptable"}
                  </label>
                  <FieldHelp
                    titleEn="Max acceptable drawdown"
                    titleFr="Perte temporaire maximale (Drawdown)"
                    descEn="The maximum portfolio decline (%) you can emotionally and financially tolerate during a market crisis before requiring reallocation."
                    descFr="La baisse temporaire maximale en pourcentage de votre portefeuille que vous pouvez endurer lors d'une crise de marché sans céder à la panique ni altérer vos besoins vitaux."
                    isEn={isEn}
                    activeHelpId={activeHelpId}
                    helpId="maxDrawdownHelp"
                    onToggle={handleToggleHelp}
                  />
                </div>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.maxDrawdownAcceptable || '20_pct'}
                  onChange={(e) => handleChange('maxDrawdownAcceptable', e.target.value)}
                >
                  <option value="5_pct">&lt; 5% {isEn ? "(Very Low)" : "(Très Faible)"}</option>
                  <option value="10_pct">5% - 10% {isEn ? "(Low)" : "(Faible)"}</option>
                  <option value="20_pct">10% - 20% {isEn ? "(Moderate)" : "(Modéré)"}</option>
                  <option value="35_pct">20% - 35% {isEn ? "(High)" : "(Élevé)"}</option>
                  <option value="above_35">&gt; 35% {isEn ? "(Very High)" : "(Très Élevé)"}</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "3. Investment horizon" : "3. Horizon d'investissement"}
                </label>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.timeHorizon || '5_10_years'}
                  onChange={(e) => handleChange('timeHorizon', e.target.value)}
                >
                  <option value="<1_year">&lt; 1 {isEn ? "year" : "an"}</option>
                  <option value="1_3_years">1 - 3 {isEn ? "years" : "ans"}</option>
                  <option value="3_5_years">3 - 5 {isEn ? "years" : "ans"}</option>
                  <option value="5_10_years">5 - 10 {isEn ? "years" : "ans"}</option>
                  <option value=">10_years">&gt; 10 {isEn ? "years" : "ans"}</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "4. Risk tolerance profile" : "4. Profil de tolérance au risque"}
                </label>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.riskToleranceProfile || 'balanced'}
                  onChange={(e) => handleChange('riskToleranceProfile', e.target.value)}
                >
                  <option value="conservative">{isEn ? "Conservative" : "Conservateur"}</option>
                  <option value="moderate">{isEn ? "Moderate" : "Modéré"}</option>
                  <option value="balanced">{isEn ? "Balanced" : "Équilibré"}</option>
                  <option value="growth">{isEn ? "Growth" : "Dynamique"}</option>
                  <option value="aggressive">{isEn ? "Aggressive" : "Offensif"}</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "5. Reaction to a 20% market drop" : "5. Réaction à une baisse de 20%"}
                </label>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.reactionToMarketCrash || 'wait'}
                  onChange={(e) => handleChange('reactionToMarketCrash', e.target.value)}
                >
                  <option value="sell_all">{isEn ? "Sell everything" : "Vendre tout"}</option>
                  <option value="sell_some">{isEn ? "Sell a portion" : "Vendre une partie"}</option>
                  <option value="wait">{isEn ? "Wait and do nothing" : "Attendre et ne rien faire"}</option>
                  <option value="buy_more">{isEn ? "Buy more" : "Acheter plus"}</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  {isEn ? "6. Expected annual return" : "6. Rendement annuel espéré"}
                </label>
                <CustomSelect 
                  className="w-full bg-zinc-800/90 text-white rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium border border-zinc-700/60"
                  value={formData.expectedAnnualReturn || '5_8_pct'}
                  onChange={(e) => handleChange('expectedAnnualReturn', e.target.value)}
                >
                  <option value="<3_pct">&lt; 3%</option>
                  <option value="3_5_pct">3% - 5%</option>
                  <option value="5_8_pct">5% - 8%</option>
                  <option value="8_12_pct">8% - 12%</option>
                  <option value=">12_pct">&gt; 12%</option>
                </CustomSelect>
              </div>
            </div>
          </div>
        );



      default:
        return null;
    }
  };

  return (
    
    <div className="w-full flex flex-col gap-4">
      {/* Subtle Auto-save status header bar */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 text-[11px] font-medium">
            {cloudSyncStatus === 'offline' ? (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <CloudOff className="w-3.5 h-3.5" />
                <span>{isEn ? "Local-only (Sign in to sync cloud)" : "Brouillon local (Connectez-vous pour synchroniser)"}</span>
              </div>
            ) : cloudSyncStatus === 'saving' ? (
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span>{isEn ? "Syncing to Cloud..." : "Synchronisation cloud..."}</span>
              </div>
            ) : cloudSyncStatus === 'synced' ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Cloud className="w-3.5 h-3.5 shrink-0" />
                <span>{isEn ? "Saved to Cloud" : "Sauvegardé sur le Cloud"}</span>
                {lastSavedTime && (
                  <span className="text-zinc-500 font-mono text-[10px]">
                    ({lastSavedTime})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400">
                <CloudLightning className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                <span>{isEn ? "Cloud sync error" : "Erreur de synchro Cloud"}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleResetDraft}
            className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer underline"
          >
            {isEn ? "Reset draft" : "Réinitialiser le brouillon"}
          </button>
        </div>

        
      <div className="w-full flex-1 flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">
    
      {/* Sidebar / Steps Menu - NO BORDER, NO ICONS */}
      <div className="w-full md:w-64 lg:w-72 shrink-0 space-y-4 flex flex-col">
        <div className="bg-slate-900/90 shadow-2xl p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl border border-white/10 space-y-4 flex-1">
          <div className="pb-1">
            <span className="text-[11px] font-semibold text-blue-400 block mb-0.5">
              Quantrih suitability
            </span>
            <h2 className="text-base font-black text-white tracking-tight">
              {isEn ? "Strategy qualification" : "Qualification stratégique"}
            </h2>
          </div>

          <div className="space-y-2">
            {STEPS.map((step, idx) => {
              const active = idx === currentStep;
              const completed = isStepCompleted(idx);

              return (
                <motion.button
                  key={step.id}
                  type="button"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    active 
                      ? 'bg-blue-600 text-white font-bold shadow-[0_10px_25px_rgba(37,99,235,0.4)]' 
                      : completed 
                        ? 'bg-slate-800/60 text-slate-200 font-semibold hover:bg-slate-800 hover:text-white' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black transition-all ${
                    active 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : completed 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    {step.stepNum}
                  </div>
                  <span className="text-xs font-semibold leading-tight flex-1">
                    {isEn ? step.titleEn : step.titleFr}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Step Area - NO BORDER, NO ICONS */}
      <div className="w-full flex-1 bg-slate-900/90 shadow-2xl p-6 sm:p-10 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl border border-white/10 min-h-[700px] flex flex-col justify-between text-zinc-100 relative overflow-visible">
        {/* Animated Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800/60 overflow-hidden rounded-t-3xl">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          />
        </div>

        <div className="flex-1 pt-1" key={currentStep}>
          {renderStepContent()}
        </div>

        {/* Footer Navigation Controls - NO BORDER, NO ICONS */}
        <div className="flex items-center justify-between mt-10 pt-6">
          <motion.button
            type="button"
            whileHover={currentStep > 0 ? { scale: 1.02 } : {}}
            whileTap={currentStep > 0 ? { scale: 0.98 } : {}}
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-2xl font-semibold text-xs transition-all duration-200 ${
              currentStep === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 cursor-pointer border border-zinc-700/50'
            }`}
          >
            {isEn ? "Previous step" : "Étape précédente"}
          </motion.button>

          {currentStep < STEPS.length - 1 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={nextStep}
              className="px-8 py-3.5 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all duration-200 cursor-pointer"
            >
              {isEn ? "Next step" : "Étape suivante"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
</div>
  );

};
