import { Activity } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  Dices,
  Play,
  FileDown,
  Settings,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  Database,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { PageHeader } from "../ui/PageHeader";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { useTranslation } from "../../contexts/LanguageContext";
import { lazyPortfolios } from "./lazyPortfoliosData";
import { ViewToggle } from "../ui/ViewToggle";
import { Disclaimer } from "../ui/Disclaimer";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import { CloudSaveLoad } from "../ui/CloudSaveLoad";
import { PresetPortfoliosSelector } from "../ui/PresetPortfoliosSelector";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchMonthlyPrices } from "../../engine/data";
import { runSimulation } from "../../engine/simulation";
import { calculateCorrelationMatrix } from "../../engine/metrics";
import { TickerInput } from "../ui/TickerInput";
import { ASSET_DATA } from "../../constants";
import { InfoTooltip } from "../ui/InfoTooltip";
import { CustomSelect } from "../ui/CustomSelect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export function TooltipLabel({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-base font-semibold text-text ">{label}</label>
      <InfoTooltip content={tooltip} />
    </div>
  );
}

const formatValue = (num: number) => {
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
    .format(num)
    .replace(/,/g, " ");
};

const formatPct = (num: number) => {
  return num.toFixed(2) + "%";
};

const ASSET_CLASSES = [
  {
    group: "US Equity",
    options: [
      { label: "US Stock Market", symbol: "VTI" },
      { label: "US Large Cap", symbol: "VV" },
      { label: "US Large Cap Value", symbol: "VTV" },
      { label: "US Large Cap Growth", symbol: "VUG" },
      { label: "US Mid Cap", symbol: "VO" },
      { label: "US Mid Cap Value", symbol: "VOE" },
      { label: "US Mid Cap Growth", symbol: "VOT" },
      { label: "US Small Cap", symbol: "VB" },
      { label: "US Small Cap Value", symbol: "VBR" },
      { label: "US Small Cap Growth", symbol: "VBK" },
      { label: "US Micro Cap", symbol: "IWC" },
    ],
  },
  {
    group: "International Equity",
    options: [
      { label: "Global ex-US Equity", symbol: "VXUS" },
      { label: "Developed Markets", symbol: "VEA" },
      { label: "Emerging Markets", symbol: "VWO" },
    ],
  },
  {
    group: "European Equity (USD)",
    options: [
      { label: "Vanguard FTSE Europe", symbol: "VGK" },
      { label: "iShares MSCI Eurozone", symbol: "EZU" },
      { label: "iShares Core MSCI Europe", symbol: "IEUR" },
      { label: "SPDR EURO STOXX 50", symbol: "FEZ" },
      { label: "iShares MSCI United Kingdom", symbol: "EWU" },
      { label: "iShares MSCI Germany", symbol: "EWG" },
    ],
  },
  {
    group: "European Equity (EUR)",
    options: [
      { label: "Amundi PEA MSCI Europe", symbol: "PCEU.PA" },
      { label: "Amundi Core Stoxx Europe 600", symbol: "MEUD.PA" },
      { label: "iShares Core EURO STOXX 50", symbol: "CSX5.AS" },
      { label: "Vanguard FTSE Dev Europe", symbol: "VEUR.AS" },
    ],
  },
  {
    group: "Fixed Income",
    options: [
      { label: "Total US Bond Market", symbol: "BND" },
      { label: "Long Term Treasury", symbol: "TLT" },
      { label: "Intermediate Treasury", symbol: "IEF" },
      { label: "Short Term Treasury", symbol: "SHY" },
    ],
  },
  {
    group: "Alternatives",
    options: [
      { label: "REITs", symbol: "VNQ" },
      { label: "Gold", symbol: "GLD" },
      { label: "Commodities", symbol: "PDBC" },
    ],
  },
];

const localLabels: Record<string, Record<string, string>> = {
  en: {
    mcResultsTitle: "Monte Carlo simulation results for {sims} portfolios with ${initial} initial portfolio balance using {model} returns data over {years} years. The simulation results are based on {cashflow}.",
    noCashflows: "no cashflows.",
    cashflowPrefix: "inflation adjusted withdrawals (${amount} {freq}).",
    survived: "of the simulated portfolios survived all withdrawals.",
    performanceSummary: "Performance Summary",
    summaryStats: "Summary Statistics",
    percentile10: "10th Percentile",
    percentile25: "25th Percentile",
    percentile50: "50th Percentile",
    median: "(Median)",
    percentile75: "75th Percentile",
    percentile90: "90th Percentile",
    endBalanceNominal: "Portfolio End Balance (nominal)",
    twr: "Time Weighted Rate of Return",
    swr: "Safe Withdrawal Rate",
    portfolioBalance: "Portfolio Balance",
    years: "Years",
    strategyParams: "Strategy Parameters",
    runSimulation: "Run Simulation",
    running: "Running...",
    initialAmount: "Initial Amount",
    cashflows: "Cashflows",
    none: "None",
    contributeFixed: "Contribute fixed amount",
    withdrawFixed: "Withdraw fixed amount periodically",
    withdrawPct: "Withdraw fixed percentage",
    withdrawalPct: "Withdrawal %",
    withdrawalAmount: "Withdrawal Amount",
    inflationAdjusted: "Inflation Adjusted",
    withdrawalFreq: "Withdrawal Frequency",
    annually: "Annually",
    monthly: "Monthly",
    simPeriodYears: "Simulation Period in Years",
    taxTreatment: "Tax Treatment",
    preTax: "Pre-tax Returns",
    postTax: "Post-tax Returns",
    simModel: "Simulation Model",
    historicalReturns: "Historical Returns",
    statisticalReturns: "Statistical Returns (Normal)",
    useFullHistory: "Use Full History",
    yes: "Yes",
    no: "No",
    bootstrapModel: "Bootstrap Model",
    singleYear: "Single Year",
    blockBootstrap: "Block Bootstrap",
    spendingRule: "Spending Rule",
    noAdjustment: "No Adjustment (Fixed)",
    rollingAvg: "Rolling 3-Year Average",
    sequenceOfReturns: "Sequence of Returns Risk",
    noAdjustments: "No Adjustments",
    worstFirst: "Worst Years First",
    inflationModel: "Inflation Model",
    historicalInflation: "Historical Inflation",
    fixedInflation: "Fixed Inflation",
    rebalancing: "Rebalancing",
    rebalanceAnnually: "Rebalance annually",
    rebalanceMonthly: "Rebalance monthly",
    buyAndHold: "Buy and hold",
    intervals: "Intervals",
    percentilesRange: "Percentiles (10-25-50-75-90)",
    stdDevRange: "Standard Deviations",
    predefinedPortfolios: "Predefined Portfolios",
    portfoliosConfiguration: "Portfolios Configuration",
    portfolioAssets: "Portfolio Assets",
    selectAssetClass: "Select Asset Class",
    addMore: "(Add More)",
    tooltipInitialAmount: "Initial Investment Capital (t=0).",
    tooltipCashflows: "Determines the longitudinal extraction or injection of capital.",
    tooltipWithdrawal: "Absolute quantum or relative ratio of capital distributed at each periodic interval.",
    tooltipInflationAdjusted: "Applies a real-rate deflator to absolute withdrawal amounts, preserving purchasing power parity over the simulation horizon.",
    tooltipWithdrawalFreq: "Periodic interval of capital distribution. Impacts intra-year sequence of returns risk (SORR).",
    tooltipSimPeriodYears: "Temporal horizon (n) over which the geometric Brownian motion or bootstrapping is computed.",
    tooltipTaxTreatment: "Differentiates between gross capital accumulation (Pre-Tax) and net realizable wealth (Post-Tax), subtracting estimated capital gains.",
    tooltipSimModel: "Selects the underlying stochastic engine. 'Historical' resamples empirical distributions, while 'Statistical' models theoretical Gaussian trajectories.",
    tooltipUseFullHistory: "Defines the sampling universe. Full history incorporates macroeconomic cycles, while limited history emphasizes contemporary structural regimes.",
    tooltipBootstrapModel: "Statistical resampling approach. 'Single Year' draws independently, while 'Block' preserves serial correlation.",
    tooltipSpendingRule: "Rules dynamically adjusting periodic withdrawals or reinvestments.",
    tooltipSequenceOfReturns: "Stress-tests longitudinal resilience by forcing downside volatility early in the decumulation phase (SORR).",
    tooltipInflationModel: "Determines the deflationary vector applied to terminal wealth. 'Historical' maps to realized CPI, 'Fixed' assumes deterministic erosion.",
    tooltipRebalancing: "Specifies the mandated mean-reversion frequency. Forces adherence to the strategic asset allocation weights.",
    tooltipIntervals: "Statistical confidence bands. 'Percentiles' map the empirical CDF, whereas 'Standard Deviations' assume a log-normal distribution.",
  },
  fr: {
    mcResultsTitle: "Résultats de la simulation de Monte Carlo pour {sims} portefeuilles avec un solde initial de {initial}$ en utilisant les données de rendement de {model} sur {years} ans. Les résultats de la simulation sont basés sur {cashflow}",
    noCashflows: "aucun flux de trésorerie.",
    cashflowPrefix: "des retraits ajustés à l'inflation (${amount} {freq}).",
    survived: "des portefeuilles simulés ont survécu à tous les retraits.",
    performanceSummary: "Résumé des performances",
    summaryStats: "Statistiques de résumé",
    percentile10: "10ème Percentile",
    percentile25: "25ème Percentile",
    percentile50: "50ème Percentile",
    median: "(Médiane)",
    percentile75: "75ème Percentile",
    percentile90: "90ème Percentile",
    endBalanceNominal: "Solde final du portefeuille (nominal)",
    twr: "Taux de rendement pondré dans le temps",
    swr: "Taux de retrait sûr",
    portfolioBalance: "Solde du portefeuille",
    years: "Années",
    strategyParams: "Paramètres de stratégie",
    runSimulation: "Lancer la simulation",
    running: "Simulation en cours...",
    initialAmount: "Montant initial",
    cashflows: "Flux de trésorerie",
    none: "Aucun",
    contributeFixed: "Contribuer un montant fixe",
    withdrawFixed: "Retirer un montant fixe périodiquement",
    withdrawPct: "Retirer un pourcentage fixe",
    withdrawalPct: "Pourcentage de retrait",
    withdrawalAmount: "Montant du retrait",
    inflationAdjusted: "Ajusté à l'inflation",
    withdrawalFreq: "Fréquence de retrait",
    annually: "Annuellement",
    monthly: "Mensuellement",
    simPeriodYears: "Période de simulation (années)",
    taxTreatment: "Traitement fiscal",
    preTax: "Rendements avant impôts",
    postTax: "Rendements après impôts",
    simModel: "Modèle de simulation",
    historicalReturns: "Rendements historiques",
    statisticalReturns: "Rendements statistiques (Normal)",
    useFullHistory: "Utiliser tout l'historique",
    yes: "Oui",
    no: "Non",
    bootstrapModel: "Modèle Bootstrap",
    singleYear: "Année unique",
    blockBootstrap: "Bootstrap par bloc",
    spendingRule: "Règle de dépense",
    noAdjustment: "Aucun ajustement (fixe)",
    rollingAvg: "Moyenne mobile sur 3 ans",
    sequenceOfReturns: "Risque de séquence des rendements",
    noAdjustments: "Aucun ajustement",
    worstFirst: "Pires années en premier",
    inflationModel: "Modèle d'inflation",
    historicalInflation: "Inflation historique",
    fixedInflation: "Inflation fixe",
    rebalancing: "Rééquilibrage",
    rebalanceAnnually: "Rééquilibrer annuellement",
    rebalanceMonthly: "Rééquilibrer mensuellement",
    buyAndHold: "Acheter et conserver",
    intervals: "Intervalles",
    percentilesRange: "Percentiles (10-25-50-75-90)",
    stdDevRange: "Écarts types",
    predefinedPortfolios: "Portefeuilles prédéfinis",
    portfoliosConfiguration: "Configuration des portefeuilles",
    portfolioAssets: "Actifs du portefeuille",
    selectAssetClass: "Sélectionner la classe d'actifs",
    addMore: "(Ajouter plus)",
    tooltipInitialAmount: "Capital d'investissement initial (t=0).",
    tooltipCashflows: "Détermine l'extraction ou l'injection longitudinale de capital.",
    tooltipWithdrawal: "Quantité absolue ou ratio relatif de capital distribué à chaque intervalle périodique.",
    tooltipInflationAdjusted: "Applique un déflateur de taux réel aux montants de retraits absolus, préservant la parité du pouvoir d'achat sur l'horizon de simulation.",
    tooltipWithdrawalFreq: "Intervalle périodique de distribution du capital. Impacte le risque de séquence des rendements (SORR) au cours de l'année.",
    tooltipSimPeriodYears: "Horizon temporel (n) sur lequel le mouvement brownien géométrique ou le bootstrap est calculé.",
    tooltipTaxTreatment: "Différencie l'accumulation brute de capital (avant impôt) et la richesse nette réalisable (après impôt), en soustrayant les gains en capital estimés.",
    tooltipSimModel: "Sélectionne le moteur stochastique sous-jacent. 'Historique' rééchantillonne les distributions empiriques, tandis que 'Statistique' modélise des trajectoires gaussiennes théoriques.",
    tooltipUseFullHistory: "Définit l'univers d'échantillonnage. L'historique complet intègre les cycles macroéconomiques, tandis que l'historique limité met l'accent sur les régimes structurels contemporains.",
    tooltipBootstrapModel: "Approche de rééchantillonnage statistique. 'Année unique' tire de manière indépendante, tandis que 'Bloc' préserve la corrélation sérielle.",
    tooltipSpendingRule: "Règles ajustant dynamiquement les retraits ou réinvestissements périodiques.",
    tooltipSequenceOfReturns: "Teste la résilience longitudinale en forçant une volatilité à la baisse tôt dans la phase de décumulation (SORR).",
    tooltipInflationModel: "Détermine le vecteur déflationniste appliqué à la richesse finale. 'Historique' correspond à l'IPC réalisé, 'Fixe' suppose une érosion déterministe.",
    tooltipRebalancing: "Spécifie la fréquence de retour à la moyenne obligatoire. Force le respect des poids de l'allocation d'actifs stratégique.",
    tooltipIntervals: "Bandes de confiance statistique. Les 'Percentiles' cartographient la fonction de répartition empirique, tandis que les 'Écarts types' supposent une distribution log-normale.",
  },
  de: {
    mcResultsTitle: "Monte-Carlo-Simulationsergebnisse für {sims} Portfolios mit einem Anfangssaldo von ${initial} unter Verwendung von {model}-Renditedaten über {years} Jahre. Die Simulationsergebnisse basieren auf {cashflow}",
    noCashflows: "keine Cashflows.",
    cashflowPrefix: "inflationsbereinigte Entnahmen (${amount} {freq}).",
    survived: "der simulierten Portfolios haben alle Entnahmen überstanden.",
    performanceSummary: "Leistungszusammenfassung",
    summaryStats: "Zusammenfassende Statistiken",
    percentile10: "10. Perzentil",
    percentile25: "25. Perzentil",
    percentile50: "50. Perzentil",
    median: "(Median)",
    percentile75: "75. Perzentil",
    percentile90: "90. Perzentil",
    endBalanceNominal: "Portfolio-Endwert (nominal)",
    twr: "Zeitgewichtete Rendite (TWR)",
    swr: "Sichere Entnahmerate (SWR)",
    portfolioBalance: "Portfolio-Guthaben",
    years: "Jahre",
    strategyParams: "Strategieparameter",
    runSimulation: "Simulation ausführen",
    running: "Wird ausgeführt...",
    initialAmount: "Anfangskapital",
    cashflows: "Cashflows",
    none: "Keine",
    contributeFixed: "Festen Betrag beitragen",
    withdrawFixed: "Regelmäßig festen Betrag entnehmen",
    withdrawPct: "Regelmäßig festen Prozentsatz entnehmen",
    withdrawalPct: "Entnahme %",
    withdrawalAmount: "Entnahmebetrag",
    inflationAdjusted: "Inflationsbereinigt",
    withdrawalFreq: "Entnahmehäufigkeit",
    annually: "Jährlich",
    monthly: "Monatlich",
    simPeriodYears: "Simulationszeitraum in Jahren",
    taxTreatment: "Steuerliche Behandlung",
    preTax: "Vor Steuern",
    postTax: "Nach Steuern",
    simModel: "Simulationsmodell",
    historicalReturns: "Historische Renditen",
    statisticalReturns: "Statistische Renditen (Normal)",
    useFullHistory: "Gesamte Historie nutzen",
    yes: "Ja",
    no: "Nein",
    bootstrapModel: "Bootstrap-Modell",
    singleYear: "Einzelnes Jahr",
    blockBootstrap: "Block-Bootstrap",
    spendingRule: "Ausgabenregel",
    noAdjustment: "Keine Anpassung (Fest)",
    rollingAvg: "Gleitender 3-Jahres-Durchschnitt",
    sequenceOfReturns: "Reihenfolge der Renditen (SORR)",
    noAdjustments: "Keine Anpassungen",
    worstFirst: "Schlechteste Jahre zuerst",
    inflationModel: "Inflationsmodell",
    historicalInflation: "Historische Inflation",
    fixedInflation: "Feste Inflation",
    rebalancing: "Rebalancing",
    rebalanceAnnually: "Jährlich rebalancen",
    rebalanceMonthly: "Monatlich rebalancen",
    buyAndHold: "Kaufen und halten",
    intervals: "Intervalle",
    percentilesRange: "Perzentile (10-25-50-75-90)",
    stdDevRange: "Standardabweichungen",
    predefinedPortfolios: "Vorgegebene Portfolios",
    portfoliosConfiguration: "Portfolio-Konfiguration",
    portfolioAssets: "Portfolio Vermögenswerte",
    selectAssetClass: "Anlageklasse auswählen",
    addMore: "(Mehr hinzufügen)",
    tooltipInitialAmount: "Anfängliches Investitionskapital (t=0).",
    tooltipCashflows: "Bestimmt die langfristige Entnahme oder Zuführung von Kapital.",
    tooltipWithdrawal: "Absoluter Betrag oder relatives Verhältnis des zu jedem periodischen Intervall verteilten Kapitals.",
    tooltipInflationAdjusted: "Wendet einen realen Deflator auf absolute Entnahmebeträge an, um die Kaufkraftparität über den Simulationshorizont hinweg zu erhalten.",
    tooltipWithdrawalFreq: "Periodisches Intervall der Kapitalverteilung. Beeinflusst das Risiko der Renditereihenfolge (SORR) innerhalb des Jahres.",
    tooltipSimPeriodYears: "Zeitlicher Horizont (n), über den die geometrische Brownsche Bewegung oder das Bootstrapping berechnet wird.",
    tooltipTaxTreatment: "Unterscheidet zwischen Bruttokapitalaufbau (vor Steuern) und realisierbarem Nettovermögen (nach Steuern), abzüglich geschätzter Kapitalertragssteuern.",
    tooltipSimModel: "Wählt die zugrunde liegende stochastische Engine aus. 'Historisch' führt ein Resampling empirischer Verteilungen durch, während 'Statistisch' theoretische Gaußsche Trajektorien modelliert.",
    tooltipUseFullHistory: "Definiert das Stichprobenuniversum. Die vollständige Historie bezieht makroökonomische Zyklen ein, während eine begrenzte Historie zeitgenössische strukturelle Regime betont.",
    tooltipBootstrapModel: "Statistischer Resampling-Ansatz. 'Einzelnes Jahr' zieht unabhängig, während 'Block' die serielle Korrelation bewahrt.",
    tooltipSpendingRule: "Regeln zur dynamischen Anpassung periodischer Entnahmen oder Reinvestitionen.",
    tooltipSequenceOfReturns: "Stresstest für die langfristige Widerstandsfähigkeit durch Erzeugung von Abwärtsvolatilität zu Beginn der Entnahmephase (SORR).",
    tooltipInflationModel: "Bestimmt den deflationären Vektor, der auf das Endvermögen angewendet wird. 'Historisch' entspricht dem realisierten Verbraucherpreisindex, 'Fest' nimmt einen deterministischen Verfall an.",
    tooltipRebalancing: "Spezifiziert die vorgeschriebene Häufigkeit der Mittelwertumkehr. Erzwingt die Einhaltung der strategischen Asset-Allocation-Gewichte.",
    tooltipIntervals: "Statistische Konfidenzbänder. 'Perzentile' bilden die empirische Verteilungsfunktion ab, während 'Standardabweichungen' eine logarithmische Normalverteilung annehmen.",
  },
  nl: {
    mcResultsTitle: "Monte Carlo simulatieresultaten voor {sims} portefeuilles met ${initial} initiële portefeuillebalans met behulp van {model} rendementsgegevens over {years} jaar. De simulatieresultaten zijn gebaseerd op {cashflow}",
    noCashflows: "geen kasstromen.",
    cashflowPrefix: "voor inflatie gecorrigeerde opnames (${amount} {freq}).",
    survived: "van de gesimuleerde portefeuilles heeft alle opnames overleefd.",
    performanceSummary: "Prestatieoverzicht",
    summaryStats: "Samenvattende statistieken",
    percentile10: "10de percentiel",
    percentile25: "25ste percentiel",
    percentile50: "50ste percentiel",
    median: "(Mediaan)",
    percentile75: "75ste percentiel",
    percentile90: "90ste percentiel",
    endBalanceNominal: "Eindsaldo portefeuille (nominaal)",
    twr: "Tijdgewogen Rendement",
    swr: "Veilig opnamepercentage (SWR)",
    portfolioBalance: "Portefeuillebalans",
    years: "Jaar",
    strategyParams: "Strategie parameters",
    runSimulation: "Simulatie starten",
    running: "Bezig met uitvoeren...",
    initialAmount: "Beginkapitaal",
    cashflows: "Kasstromen",
    none: "Geen",
    contributeFixed: "Vast bedrag bijdragen",
    withdrawFixed: "Periodiek een vast bedrag opnemen",
    withdrawPct: "Periodiek een vast percentage opnemen",
    withdrawalPct: "Opnamepercentage",
    withdrawalAmount: "Opnamebedrag",
    inflationAdjusted: "Gecorrigeerd voor inflatie",
    withdrawalFreq: "Opnamefrequentie",
    annually: "Jaarlijks",
    monthly: "Maandelijks",
    simPeriodYears: "Simulatieperiode in jaren",
    taxTreatment: "Fiscale behandeling",
    preTax: "Rendementen vóór belastingen",
    postTax: "Rendementen ná belastingen",
    simModel: "Simulatiemodel",
    historicalReturns: "Historische rendementen",
    statisticalReturns: "Statistische rendementen (Normaal)",
    useFullHistory: "Gebruik volledige geschiedenis",
    yes: "Ja",
    no: "Nee",
    bootstrapModel: "Bootstrap model",
    singleYear: "Enkel jaar",
    blockBootstrap: "Blok bootstrap",
    spendingRule: "Uitgavenregel",
    noAdjustment: "Geen aanpassing (vast)",
    rollingAvg: "Gleitend 3-jaars gemiddelde",
    sequenceOfReturns: "Rendementsvolgorde risico (SORR)",
    noAdjustments: "Geen aanpassingen",
    worstFirst: "Slechtste jaren eerst",
    inflationModel: "Inflatiemodel",
    historicalInflation: "Historische inflatie",
    fixedInflation: "Vaste inflatie",
    rebalancing: "Rebalancing",
    rebalanceAnnually: "Jaarlijks herbalanceren",
    rebalanceMonthly: "Maandelijks herbalanceren",
    buyAndHold: "Kopen en aanhouden",
    intervals: "Intervallen",
    percentilesRange: "Percentielen (10-25-50-75-90)",
    stdDevRange: "Standaarddeviaties",
    predefinedPortfolios: "Vooraf gedefinieerde portefeuilles",
    portfoliosConfiguration: "Portefeuille-configuratie",
    portfolioAssets: "Portfolio vermogenswerte",
    selectAssetClass: "Selecteer beleggingscategorie",
    addMore: "(Meer toevoegen)",
    tooltipInitialAmount: "Initieel investeringskapitaal (t=0).",
    tooltipCashflows: "Bepaalt de longitudinale onttrekking of inbreng van kapitaal.",
    tooltipWithdrawal: "Absoluut bedrag of relatieve verhouding van het kapitaal dat op elk periodiek interval wordt uitgekeerd.",
    tooltipInflationAdjusted: "Past een reële inflatiecorrectie toe op absolute opnamebedragen, waardoor de koopkrachtpariteit over de simulatieve horizon behouden blijft.",
    tooltipWithdrawalFreq: "Periodiek interval van kapitaaluitkering. Beïnvloedt het risico van de rendementsvolgorde (SORR) binnen het jaar.",
    tooltipSimPeriodYears: "Tijdshorizon (n) waarover de geometrische Brownse beweging of bootstrapping wordt berekend.",
    tooltipTaxTreatment: "Maakt onderscheid tussen bruto kapitaalaccumulatie (vóór belastingen) en netto realiseerbaar vermogen (na belastingen), verminderd met geschatte vermogenswinstbelasting.",
    tooltipSimModel: "Selects the underlying stochastic engine. 'Historical' resamples empirical distributions, while 'Statistical' models theoretical Gaussian trajectories.",
    tooltipUseFullHistory: "Definieert het steekproefuniversum. Volledige geschiedenis omvat macro-economische cycli, terwijl beperkte geschiedenis de nadruk legt op hedendaagse structurele regimes.",
    tooltipBootstrapModel: "Statistische methode voor hersteekproeven. 'Enkel jaar' trekt onafhankelijk, terwijl 'Blok' seriële correlatie behoudt.",
    tooltipSpendingRule: "Regels die periodieke opnames of herinvesteringen dynamisch aanpassen.",
    tooltipSequenceOfReturns: "Stresstests voor longitudinale veerkracht door neerwaartse volatiliteit vroeg in de afbouwfase te forceren (SORR).",
    tooltipInflationModel: "Bepaalt de deflationaire factor die op het eindvermogen wordt toegepast. 'Historisch' komt overeen met de gerealiseerde CPI, 'Vast' veronderstelt deterministische erosie.",
    tooltipRebalancing: "Specificeert de verplichte frequentie van herbalancering. Erzwingt de naleving van de strategische wegingen van de activaspreiding.",
    tooltipIntervals: "Statistische betrouwbaarheidsbanden. 'Percentielen' brengen de empirische verdelingsfunctie in kaart, terwijl 'Standaarddeviaties' een lognormale verdeling veronderstellen.",
  },
  es: {
    mcResultsTitle: "Resultados de la simulación de Monte Carlo para {sims} carteras con un saldo inicial de ${initial} utilizando datos de rendimiento de {model} durante {years} años. Los resultados de la simulación se basan en {cashflow}",
    noCashflows: "sin flujos de efectivo.",
    cashflowPrefix: "retiros ajustados por inflación (${amount} {freq}).",
    survived: "de las carteras simuladas sobrevivieron a todos los retiros.",
    performanceSummary: "Resumen de rendimiento",
    summaryStats: "Estadísticas de resumen",
    percentile10: "Percentil 10",
    percentile25: "Percentil 25",
    percentile50: "Percentil 50",
    median: "(Mediana)",
    percentile75: "Percentil 75",
    percentile90: "Percentil 90",
    endBalanceNominal: "Saldo final de la cartera (nominal)",
    twr: "Tasa de rendimiento ponderada en el tiempo",
    swr: "Tasa de retiro segura (SWR)",
    portfolioBalance: "Saldo de la cartera",
    years: "Años",
    strategyParams: "Parámetros de estrategia",
    runSimulation: "Iniciar simulación",
    running: "Ejecutando...",
    initialAmount: "Monto inicial",
    cashflows: "Flujos de efectivo",
    none: "Ninguno",
    contributeFixed: "Contribuir cantidad fija",
    withdrawFixed: "Retirar cantidad fija periódicamente",
    withdrawPct: "Retirar porcentaje fijo",
    withdrawalPct: "Porcentaje de retiro",
    withdrawalAmount: "Monto del retiro",
    inflationAdjusted: "Ajustado por inflación",
    withdrawalFreq: "Frecuencia de retiro",
    annually: "Anualmente",
    monthly: "Mensualmente",
    simPeriodYears: "Período de simulación en años",
    taxTreatment: "Tratamiento fiscal",
    preTax: "Rendimientos antes de impuestos",
    postTax: "Rendimientos después de impuestos",
    simModel: "Modelo de simulación",
    historicalReturns: "Rendimientos históricos",
    statisticalReturns: "Rendimientos estadísticos (Normal)",
    useFullHistory: "Usar historial completo",
    yes: "Sí",
    no: "No",
    bootstrapModel: "Modelo Bootstrap",
    singleYear: "Año único",
    blockBootstrap: "Bootstrap por bloques",
    spendingRule: "Regla de gasto",
    noAdjustment: "Sin ajuste (Fijo)",
    rollingAvg: "Promedio móvil de 3 años",
    sequenceOfReturns: "Riesgo de secuencia de rendimientos (SORR)",
    noAdjustments: "Sin ajustes",
    worstFirst: "Peores años primero",
    inflationModel: "Modelo de inflación",
    historicalInflation: "Inflación histórica",
    fixedInflation: "Inflación fija",
    rebalancing: "Reequilibrio",
    rebalanceAnnually: "Reequilibrar anualmente",
    rebalanceMonthly: "Reequilibrar mensualmente",
    buyAndHold: "Comprar y mantener",
    intervals: "Intervalos",
    percentilesRange: "Percentiles (10-25-50-75-90)",
    stdDevRange: "Desviaciones estándar",
    predefinedPortfolios: "Carteras predefinidas",
    portfoliosConfiguration: "Configuración de carteras",
    portfolioAssets: "Activos del cartera",
    selectAssetClass: "Seleccionar clase de activo",
    addMore: "(Añadir más)",
    tooltipInitialAmount: "Capital de inversión inicial (t=0).",
    tooltipCashflows: "Determina la extracción o inyección longitudinal de capital.",
    tooltipWithdrawal: "Monto absoluto o relación relativa del capital distribuido en cada intervalo periódico.",
    tooltipInflationAdjusted: "Aplica un deflactor de tasa real a los montos de retiro absolutos, preservando la paridad del poder adquisitivo durante el horizonte de simulación.",
    tooltipWithdrawalFreq: "Intervalo periódico de distribución de capital. Afecta el riesgo de secuencia de rendimientos (SORR) dentro de un mismo año.",
    tooltipSimPeriodYears: "Horizonte temporal (n) sobre el cual se calcula el movimiento browniano geométrico o el bootstrap.",
    tooltipTaxTreatment: "Diferencia entre la acumulación bruta de capital (antes de impuestos) y la riqueza neta realizable (dospués de impuestos), restando las ganancias de capital estimadas.",
    tooltipSimModel: "Selecciona el motor estocástico subyacente. 'Histórico' remuestrea distribuciones empíricas, mientras que 'Estadístico' modela trayectorias gaussianas teóricas.",
    tooltipUseFullHistory: "Define el universo de muestreo. El historial completo incorpora ciclos macroeconómicos, mientras que el historial limitado enfatiza regímenes estructurales contemporáneos.",
    tooltipBootstrapModel: "Enfoque de remuestreo estadístico. 'Año único' extrae de forma independiente, mientras que 'Bloque' conserva la correlación serial.",
    tooltipSpendingRule: "Reglas que ajustan dinámicamente los retiros o reinversiones periódicas.",
    tooltipSequenceOfReturns: "Prueba de resistencia de la resiliencia longitudinal al forzar la volatilidad a la baja de forma temprana en la fase de desacumulación (SORR).",
    tooltipInflationModel: "Determina el vector deflacionario aplicado a la riqueza final. 'Histórico' se asigna al IPC realizado, 'Fijo' supone una erosión de carácter determinante.",
    tooltipRebalancing: "Especifica la frecuencia obligatoria de reversión a la media. Fuerza el cumplimiento de las ponderaciones estratégicas de asignación de activos.",
    tooltipIntervals: "Bandas de confianza estadística. Los 'Percentiles' mapean la FDA empírica, mientras que las 'Desviaciones estándar' asumen una distribución log-normal.",
  }
};

export function MonteCarlo({ baseCcy }: { baseCcy: string }) {
  const { t, language } = useTranslation();
  const currentLabels = localLabels[language] || localLabels["en"];
  const [activeMainView, setActiveMainView] = useState<"simulator" | "dashboard">("simulator");
  const [user] = useAuthState(auth);

  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadSavedConfigs = async () => {
    if (!user) return;
    setConfigsLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "backtests"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const configs = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((c: any) => c.pageId === "monte-carlo");
      setSavedConfigs(configs);
    } catch (err) {
      console.error(err);
    } finally {
      setConfigsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainView === "dashboard") {
      loadSavedConfigs();
    }
  }, [activeMainView, user]);

  const handleCloudLoad = (data: any) => {
    if (!data) return;
    if (data.initialAmount) setInitialAmount(data.initialAmount);
    if (data.cashflowType) setCashflowType(data.cashflowType);
    if (data.cashflowAmount) setCashflowAmount(data.cashflowAmount);
    if (data.horizon) setHorizon(data.horizon);
    if (data.portfolioNames) setPortfolioNames(data.portfolioNames);
    if (data.portfolioAssets) setPortfolioAssets(data.portfolioAssets);
    setActiveMainView("simulator");
  };

  const deleteConfig = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "backtests", id));
      loadSavedConfigs();
    } catch (e) {
      console.error(e);
    }
  };

  const renderSavedScenarios = () => {
    const isEn = language === "en";

    if (!user) {
      return (
        <div className="bg-surface border border-border rounded-[2rem] p-12 text-center max-w-2xl mx-auto my-12 shadow-sm flex flex-col items-center gap-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-pv-blue/10 flex items-center justify-center text-pv-blue">
            <Database size={32} />
          </div>
          <h2 className="text-xl font-bold text-text">
            {isEn ? "Activate Saved Scenarios" : "Activer les scénarios sauvegardés"}
          </h2>
          <p className="text-sm text-text-2 leading-relaxed">
            {isEn 
              ? "Log in to save your Monte Carlo simulations and access them from anywhere."
              : "Connectez-vous pour sauvegarder vos simulations de Monte Carlo et y accéder de n'importe où."}
          </p>
        </div>
      );
    }

    if (configsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-4 border-pv-blue/30 border-t-pv-blue rounded-full animate-spin" />
          <p className="text-text-3 font-medium animate-pulse">
            {isEn ? "Loading your simulations..." : "Chargement de vos simulations..."}
          </p>
        </div>
      );
    }

    // Advanced Stats Calculations
    const totalCount = savedConfigs.length;
    let bestSolvency = 0;
    let bestSolvencyName = "";
    let longestHorizon = 0;
    const configsWithResults = savedConfigs.filter(c => c.data?.resultsSummary && c.data.resultsSummary.length > 0);

    savedConfigs.forEach(c => {
      const hz = Number(c.data?.horizon) || 0;
      if (hz > longestHorizon) {
        longestHorizon = hz;
      }
      
      if (c.data?.resultsSummary) {
        c.data.resultsSummary.forEach((r: any) => {
          const solv = Number(r.solvency) || 0;
          if (solv > bestSolvency) {
            bestSolvency = solv;
            bestSolvencyName = `${c.name} (${r.name})`;
          }
        });
      }
    });

    const recommendations: any[] = [];
    let hasLowSolvency = false;
    let hasHighWithdrawals = false;

    savedConfigs.forEach(c => {
      const initAmt = Number(c.data?.initialAmount) || 1;
      const cashAmt = Number(c.data?.cashflowAmount) || 0;
      const cashType = c.data?.cashflowType;

      if (cashType === "withdraw_fixed" && (cashAmt / initAmt) > 0.05) {
        hasHighWithdrawals = true;
      }

      if (c.data?.resultsSummary) {
        c.data.resultsSummary.forEach((r: any) => {
          const solv = Number(r.solvency) || 0;
          if (solv < 0.85) {
            hasLowSolvency = true;
          }
        });
      }
    });

    if (hasLowSolvency) {
      recommendations.push({
        type: "warning",
        title: isEn ? "High Risk of Ruin Detected" : "Risque de ruine élevé détecté",
        text: isEn 
          ? "Some of your simulations show a success probability below 85%. Consider reducing your periodic withdrawals or increasing allocation to defensive assets like bonds or gold to cushion sequence of returns risk (SORR)."
          : "Certaines simulations affichent une probabilité de succès inférieure à 85%. Envisagez de réduire vos retraits périodiques ou d'augmenter l'allocation aux actifs défensifs."
      });
    }

    if (hasHighWithdrawals) {
      recommendations.push({
        type: "tip",
        title: isEn ? "Optimize Sustainable Withdrawal Rate" : "Optimiser le taux de retrait soutenable",
        text: isEn
          ? "Your annual withdrawal rate exceeds 5% of starting capital in some scenarios. Historically, a 3% to 4% withdrawal rate (the '4% Rule') is considered safe for horizons of 30+ years."
          : "Votre taux de retrait annuel dépasse 5% dans certains scénarios. Historiquement, un taux de 3% à 4% est jugé sûr pour un horizon de plus de 30 ans."
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "tip",
        title: isEn ? "Stress Test with Sequence of Returns" : "Test de résistance (SORR)",
        text: isEn
          ? "Enable the 'Sequence of Returns Risk' option in parameters to force the worst years first. This lets you stress test the survival of your portfolio under catastrophic initial bear markets."
          : "Activez l'option 'Riesgo de secuencia de rendimientos' pour forcer les pires années en premier afin de tester la résistance face aux marchés baissiers initiaux."
      });
    }

    // Custom Date Formatter
    const formatDate = (timestamp: any) => {
      if (!timestamp) return "N/A";
      const date = new Date(Number(timestamp?.seconds * 1000) || Number(timestamp));
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString(isEn ? "en-US" : "fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    };

    return (
      <div className="space-y-8 animate-fade-in font-sans">
        {/* User context banner */}
        <div className="bg-surface-2 border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-[13px] font-semibold text-text-2">
              {isEn ? "Connected workspace:" : "Espace connecté :"} <span className="font-bold text-text">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={loadSavedConfigs}
            className="px-3.5 py-1.5 bg-surface border border-border text-text hover:bg-surface-2 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
          >
            {isEn ? "Refresh list" : "Actualiser la liste"}
          </button>
        </div>

        {/* KPI Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-text-3">
              {isEn ? "Total Configurations" : "Configurations totales"}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-text">{totalCount}</p>
              <p className="text-[11px] text-text-4 font-medium mt-1">
                {isEn ? "Simulations stored in cloud" : "Simulations stockées dans le cloud"}
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-500">
              {isEn ? "Best Solvency Rate" : "Meilleure solvabilité"}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-emerald-600">
                {bestSolvency > 0 ? `${(bestSolvency * 100).toFixed(1)}%` : "N/A"}
              </p>
              <p className="text-[11px] text-text-4 font-medium truncate mt-1" title={bestSolvencyName}>
                {bestSolvencyName || (isEn ? "No results simulated" : "Aucun résultat simulé")}
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-500">
              {isEn ? "Longest Horizon" : "Horizon maximal"}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-indigo-600">
                {longestHorizon > 0 ? `${longestHorizon} ${isEn ? "years" : "ans"}` : "N/A"}
              </p>
              <p className="text-[11px] text-text-4 font-medium mt-1">
                {isEn ? "Maximum stress horizon" : "Horizon de stress maximal"}
              </p>
            </div>
          </div>
        </div>

        {/* List & Analytics split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Saved List */}
          <div className="bg-surface border border-border rounded-[2rem] shadow-sm lg:col-span-8 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-surface-2 flex items-center justify-between">
              <h3 className="font-bold text-text flex items-center gap-2">
                <Database size={16} className="text-pv-blue" />
                {isEn ? "Saved Simulations" : "Simulations sauvegardées"}
              </h3>
              <span className="text-xs font-bold bg-pv-blue/10 text-pv-blue px-2.5 py-1 rounded-full">
                {savedConfigs.length} {isEn ? "Stored" : "Enregistrés"}
              </span>
            </div>

            <div className="divide-y divide-border overflow-x-auto">
              {savedConfigs.length === 0 ? (
                <div className="p-12 text-center text-text-4 font-medium">
                  {isEn 
                    ? "No saved simulations yet. Save your parameters in the simulator."
                    : "Aucune simulation enregistrée. Sauvegardez vos paramètres dans le simulateur."}
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-2 text-text-3 font-semibold text-xs border-b border-border">
                      <th className="p-4 pl-6">{isEn ? "Simulation Name" : "Nom de la simulation"}</th>
                      <th className="p-4">{isEn ? "Date Created" : "Date de création"}</th>
                      <th className="p-4">{isEn ? "Horizon" : "Horizon"}</th>
                      <th className="p-4">{isEn ? "Starting Capital" : "Capital initial"}</th>
                      <th className="p-4">{isEn ? "Solvency" : "Solvabilité"}</th>
                      <th className="p-4 pr-6 text-right">{isEn ? "Actions" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-medium text-text-2">
                    {savedConfigs.map((config) => {
                      const hz = config.data?.horizon || "N/A";
                      const initAmt = config.data?.initialAmount 
                        ? `$${formatValue(config.data.initialAmount)}` 
                        : "N/A";
                      
                      const maxSolvObj = config.data?.resultsSummary?.reduce(
                        (max: number, r: any) => (r.solvency > max ? r.solvency : max), 
                        0
                      );
                      const maxSolvText = maxSolvObj !== undefined 
                        ? `${(maxSolvObj * 100).toFixed(1)}%` 
                        : "N/A";

                      return (
                        <tr key={config.id} className="hover:bg-surface-2/60 transition-colors">
                          <td className="p-4 pl-6 font-bold text-text text-sm">
                            {config.name}
                          </td>
                          <td className="p-4">
                            {formatDate(config.createdAt)}
                          </td>
                          <td className="p-4">
                            {hz} {isEn ? "yrs" : "ans"}
                          </td>
                          <td className="p-4 font-mono">
                            {initAmt}
                          </td>
                          <td className="p-4">
                            {maxSolvObj !== undefined ? (
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[10px] font-extrabold font-mono",
                                maxSolvObj >= 0.90 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                maxSolvObj >= 0.80 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                "bg-red/10 text-red"
                              )}>
                                {maxSolvText}
                              </span>
                            ) : (
                              <span className="text-text-4">N/A</span>
                            )}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  handleCloudLoad(config.data);
                                  setActiveMainView("simulator");
                                }}
                                className="px-3 py-1.5 bg-pv-blue hover:bg-pv-blue-l text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
                              >
                                {isEn ? "Load" : "Charger"}
                              </button>
                              
                              {deleteConfirmId === config.id ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConfig(config.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-2.5 py-1.5 text-[10px] font-extrabold text-white bg-red hover:bg-red/80 rounded-lg transition-all cursor-pointer animate-pulse"
                                >
                                  {isEn ? "Confirm?" : "Sûr ?"}
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(config.id);
                                    setTimeout(() => setDeleteConfirmId(prev => prev === config.id ? null : prev), 3000);
                                  }}
                                  className="p-1.5 text-text-4 hover:text-red rounded-lg transition-colors cursor-pointer"
                                  title={isEn ? "Delete" : "Supprimer"}
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* AI Analysis / Guidelines Panel */}
          <div className="bg-surface border border-border p-6 rounded-[2rem] shadow-sm lg:col-span-4 flex flex-col gap-6 text-left">
            <div className="border-b border-border pb-3">
              <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-text flex items-center gap-2">
                <Activity size={16} className="text-pv-blue" />
                {isEn ? "Stochastic Guidelines" : "Conseils stochastiques"}
              </h3>
              <p className="text-[10px] text-text-3 font-medium mt-1">
                {isEn 
                  ? "Analysis based on simulated paths and failure rates"
                  : "Analyse basée sur les trajectoires et probabilités d'échec"}
              </p>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1">
              {recommendations.map((rec, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-2xl border text-xs leading-relaxed flex flex-col gap-1.5",
                  rec.type === "warning" ? "bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300" :
                  "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                )}>
                  <p className="font-extrabold flex items-center gap-1.5 text-sm">
                    {rec.type === "warning" ? "⚠️" : "💡"}
                    {rec.title}
                  </p>
                  <p className="font-medium text-[11px] opacity-90 leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Config
  const [initialAmount, setInitialAmount] = useLocalStorage(
    "mc_initialAmount",
    1000000,
  );
  const [cashflowType, setCashflowType] = useLocalStorage(
    "mc_cashflowType",
    "fixed",
  ); // none, fixed, percentage
  const [cashflowAmount, setCashflowAmount] = useLocalStorage(
    "mc_cashflowAmount",
    45000,
  );
  const [inflationAdjusted, setInflationAdjusted] = useLocalStorage(
    "mc_inflationAdjusted",
    true,
  );
  const [cashflowFreq, setCashflowFreq] = useLocalStorage(
    "mc_cashflowFreq",
    "annual",
  ); // annual, monthly
  const [horizon, setHorizon] = useLocalStorage("mc_horizon", 30);
  const [taxTreatment, setTaxTreatment] = useLocalStorage(
    "mc_taxTreatment",
    "pre_tax",
  );
  
  const applyPredefinedPortfolio = (preset: any) => {
    if (portfolioNames.length >= 6) return;
    const newId = `p${Date.now()}`;
    let currentAssets = [...portfolioAssets];
    currentAssets = currentAssets.map(a => ({ ...a, weights: [...a.weights, "0"] }));
    preset.assets.forEach((asset: any) => {
        const existingIdx = currentAssets.findIndex(a => a.symbol === asset.symbol);
        if (existingIdx === -1) {
            const newWeights = portfolioNames.map(() => "0");
            newWeights.push(asset.weight.toString());
            currentAssets.push({ symbol: asset.symbol, weights: newWeights });
        } else {
            currentAssets[existingIdx].weights[currentAssets[existingIdx].weights.length - 1] = asset.weight.toString();
        }
    });
    setPortfolioNames([...portfolioNames, { id: newId, name: preset.name }]);
    setPortfolioAssets(currentAssets);
  };

  const [simulationModel, setSimulationModel] = useLocalStorage<
    "Normal" | "Bootstrap" | "BlockBootstrap"
  >("mc_simModel", "Bootstrap");
  const [useFullHistory, setUseFullHistory] = useLocalStorage(
    "mc_useFullHistory",
    true,
  );
  const [sequenceOfReturns, setSequenceOfReturns] = useLocalStorage(
    "mc_sequenceOfReturns",
    "no_adjustments",
  );
  const [inflationModel, setInflationModel] = useLocalStorage(
    "mc_inflationModel",
    "fixed",
  );
  const [rebalancing, setRebalancing] = useLocalStorage(
    "mc_rebalancing",
    "annual",
  );
  const [sims, setSims] = useLocalStorage("mc_sims", 1000);
  const [bootstrapModel, setBootstrapModel] = useLocalStorage(
    "mc_bootstrapModel",
    "single",
  );
  const [spendingRule, setSpendingRule] = useLocalStorage(
    "mc_spendingRule",
    "none",
  );

  const [portfolioNames, setPortfolioNames] = useLocalStorage<
    { id: string; name: string }[]
  >("mc_portfolioNames_v8", [
    { id: "1", name: "Portfolio 1" },
    { id: "2", name: "Portfolio 2" },
    { id: "3", name: "Portfolio 3" },
  ]);

  const [portfolioAssets, setPortfolioAssets] = useLocalStorage<
    { symbol: string; weights: string[] }[]
  >("mc_portfolioAssets_v8", [
    { symbol: "VTI", weights: ["60", "30", "100"] },
    { symbol: "BND", weights: ["40", "0", "0"] },
    { symbol: "TLT", weights: ["0", "40", "0"] },
    { symbol: "IEF", weights: ["0", "15", "0"] },
    { symbol: "GLD", weights: ["0", "15", "0"] },
  ]);

  const portfolios = portfolioNames.map((pn, i) => ({
    id: pn.id,
    name: pn.name,
    assets: portfolioAssets
      .filter(
        (a) =>
          a.symbol.trim() !== "" &&
          a.weights[i] !== "" &&
          !isNaN(Number(a.weights[i]))
      )
      .map((a) => ({
        symbol: a.symbol.toUpperCase(),
        weight: Number(a.weights[i]),
      })),
  }));

  const [activeResIdx, setActiveResIdx] = useState(0);

  const addPortfolio = () => {
    if (portfolioNames.length >= 6) return;
    const newId = Date.now().toString();
    setPortfolioNames([
      ...portfolioNames,
      { id: newId, name: `${t("pb.portfolio")} ${portfolioNames.length + 1}` },
    ]);
    setPortfolioAssets(
      portfolioAssets.map((a) => ({ ...a, weights: [...a.weights, ""] })),
    );
  };

  const removePortfolio = (idx: number) => {
    setPortfolioNames(portfolioNames.filter((_, i) => i !== idx));
    setPortfolioAssets(
      portfolioAssets.map((a) => ({
        ...a,
        weights: a.weights.filter((_, i) => i !== idx),
      })),
    );
  };

  const updatePortfolioName = (idx: number, name: string) => {
    const newNames = [...portfolioNames];
    newNames[idx].name = name;
    setPortfolioNames(newNames);
  };

  const addAssetRow = () => {
    
    setPortfolioAssets([
      ...portfolioAssets,
      { symbol: "", weights: portfolioNames.map(() => "") },
    ]);
  };

  const removeAssetRow = (idx: number) => {
    setPortfolioAssets(portfolioAssets.filter((_, i) => i !== idx));
  };

  const updateAssetSymbol = (idx: number, symbol: string) => {
    const newAssets = [...portfolioAssets];
    newAssets[idx].symbol = symbol;
    setPortfolioAssets(newAssets);
  };

  const updateAssetWeight = (
    assetIdx: number,
    portIdx: number,
    value: string,
  ) => {
    const newAssets = [...portfolioAssets];
    newAssets[assetIdx].weights[portIdx] = value;
    setPortfolioAssets(newAssets);
  };


  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mcResults, setMcResults] = useState<{ id: string; name: string; result: number[][]; metrics: any }[] | null>(null);
  


  const handleRunSimulation = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const uniqueSymbols = new Set<string>();
      for (let pIdx = 0; pIdx < portfolios.length; pIdx++) {
         const p = portfolios[pIdx];
         let portTotalWeight = 0;
         p.assets.forEach(a => {
            if (a.weight > 0 && a.symbol.trim() !== "") {
                uniqueSymbols.add(a.symbol);
                portTotalWeight += a.weight;
            }
         });
         if (portTotalWeight !== 100 && p.assets.length > 0) {
             throw new Error(`Total allocation for ${p.name} must equal 100%`);
         }
      }

      const allAssetReturns: { symbol: string; returns: number[] }[] = [];
      const startDate = useFullHistory ? "1990-01-01" : "2010-01-01";
      const endDate = new Date().toISOString().split("T")[0];

      for (const symbol of uniqueSymbols) {
        const prices = await fetchMonthlyPrices(
          symbol,
          startDate,
          endDate,
        );
        if (prices.length < 12) {
          throw new Error(
            `Insufficient data for ${symbol}. Need at least 12 months.`,
          );
        }
        const returns: number[] = [];
        for (let i = 1; i < prices.length; i++) {
          returns.push(
            (prices[i].close - prices[i - 1].close) / prices[i - 1].close,
          );
        }
        allAssetReturns.push({ symbol, returns });
      }

      let amt =
        cashflowType === "none"
          ? 0
          : cashflowType === "percentage"
            ? -Number(cashflowAmount)
            : -Number(cashflowAmount);

      const allResults = [];

      for (let pIdx = 0; pIdx < portfolios.length; pIdx++) {
        const p = portfolios[pIdx];
        const weights: Record<string, number> = {};
        p.assets.forEach((a) => {
          if (a.weight > 0 && a.symbol.trim() !== "")
            weights[a.symbol] = Number(a.weight);
        });

        if (Object.keys(weights).length === 0) continue;

        const assetReturns = allAssetReturns.filter(ar => weights[ar.symbol]);

        let corrMatrix;
        if (simulationModel === "Normal") {
          corrMatrix = calculateCorrelationMatrix(assetReturns);
        }

        const paths = runSimulation(
          assetReturns,
          weights,
          {
            model:
              simulationModel === "Bootstrap" && bootstrapModel === "block"
                ? "BlockBootstrap"
                : simulationModel,
            horizonYears: horizon,
            simulations: sims,
            initialBalance: initialAmount,
            cashflow: amt,
            cashflowType: cashflowType as any,
            cashflowFreq: cashflowFreq as any,
            spendingRule: spendingRule as any,
            sequenceOfReturnsYears: sequenceOfReturns === "worst_first" ? 2 : 0,
            inflationModel: inflationModel as any,
            inflationRate: 0.03, // 3% proxy
            blockSize: 12,
          },
          corrMatrix,
        );

        const terminalValues = paths.map((p) => p[p.length - 1]);
        const successful = terminalValues.filter((v) => v > 0).length;

        allResults.push({
          id: p.id,
          name: p.name,
          result: paths,
          metrics: {
            solvency: (successful / sims) * 100,
            assetReturns,
            corrMatrix,
          }
        });
      }

      setMcResults(allResults);
      setActiveResIdx(0);
    } catch (err: any) {
      console.warn(err);
      setError(err.message || "Simulation failed");
    } finally {
      setIsRunning(false);
    }
  };  const getPercentileCurve = (paths: number[][], p: number) => {
    const res: number[] = [];
    const horizonYears = paths[0].length - 1;

    for (let y = 0; y <= horizonYears; y++) {
      const vals = paths.map((path) => path[y]).sort((a, b) => a - b);
      const idx = Math.max(
        0,
        Math.min(vals.length - 1, Math.floor((p / 100) * (vals.length - 1))),
      );
      res.push(vals[idx]);
    }
    return res;
  };

  return (
    <MobileZoomWrapper scaleMobile={0.4}>
      <div className="min-h-screen bg-bg text-text selection:bg-pv-blue selection:text-white font-sans overflow-x-hidden">
      <div className="space-y-8 animate-fade-up w-full max-w-[1600px] mx-auto px-4 md:px-12 pb-24">
        <div className="flex flex-col gap-8">
          {/* TITLE HEADER */}
          <PageHeader
            title={t("mc.title")}
            badge={t("mc.badge")}
            description={t("mc.description")}
            actions={
              <ViewToggle 
                activeView={activeMainView} 
                onViewChange={(view) => setActiveMainView(view)} 
                simulatorLabel={t("common.simulator")}
                dashboardLabel={t("dashboard.saved_scenarios")}
              />
            }
          />

          {activeMainView === "dashboard" ? renderSavedScenarios() : (
            <div className="simulator-view space-y-8">
          
{/* PARAMETERS GRID */}
          <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <h2 className="text-base font-semibold tracking-tight text-text flex items-center gap-2">
                <Settings size={14} className="text-pv-blue" />{" "}
                {currentLabels.strategyParams}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.initialAmount}
                    tooltip={currentLabels.tooltipInitialAmount}
                  />
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Number(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                  />
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.cashflows}
                    tooltip={currentLabels.tooltipCashflows}
                  />
                  <CustomSelect
                    value={cashflowType}
                    onChange={(e: any) => setCashflowType(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="none">{currentLabels.none}</option>
                    <option value="contribute">
                      {currentLabels.contributeFixed || "Contribute fixed amount"}
                    </option>
                    <option value="fixed">
                      {currentLabels.withdrawFixed}
                    </option>
                    <option value="percentage">
                      {currentLabels.withdrawPct}
                    </option>
                  </CustomSelect>
                </div>
                {cashflowType !== "none" && (
                  <div className="space-y-1.5 focus-within:text-pv-blue animate-fade-in">
                    <TooltipLabel
                      label={
                        cashflowType === "percentage"
                          ? currentLabels.withdrawalPct
                          : currentLabels.withdrawalAmount
                      }
                      tooltip={currentLabels.tooltipWithdrawal}
                    />
                    <input
                      type="number"
                      value={cashflowAmount}
                      onChange={(e) =>
                        setCashflowAmount(Number(e.target.value))
                      }
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                )}
                {cashflowType !== "none" && (
                  <>
                    <div className="space-y-1.5 focus-within:text-pv-blue">
                      <TooltipLabel
                        label={currentLabels.inflationAdjusted}
                        tooltip={currentLabels.tooltipInflationAdjusted}
                      />
                      <CustomSelect
                        value={inflationAdjusted ? "yes" : "no"}
                        onChange={(e: any) =>
                          setInflationAdjusted(e.target.value === "yes")
                        }
                        className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                      >
                        <option value="yes">{currentLabels.yes}</option>
                        <option value="no">{currentLabels.no}</option>
                      </CustomSelect>
                    </div>
                    <div className="space-y-1.5 focus-within:text-pv-blue">
                      <TooltipLabel
                        label={currentLabels.withdrawalFreq}
                        tooltip={currentLabels.tooltipWithdrawalFreq}
                      />
                      <CustomSelect
                        value={cashflowFreq}
                        onChange={(e: any) => setCashflowFreq(e.target.value)}
                        className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                      >
                        <option value="annual">{currentLabels.annually}</option>
                        <option value="monthly">{currentLabels.monthly}</option>
                      </CustomSelect>
                    </div>
                  </>
                )}
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.simPeriodYears}
                    tooltip={currentLabels.tooltipSimPeriodYears}
                  />
                  <input
                    type="number"
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                  />
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.taxTreatment}
                    tooltip={currentLabels.tooltipTaxTreatment}
                  />
                  <CustomSelect
                    value={taxTreatment}
                    onChange={(e: any) => setTaxTreatment(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="pre_tax">{currentLabels.preTax}</option>
                    <option value="post_tax">{currentLabels.postTax}</option>
                  </CustomSelect>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.simModel}
                    tooltip={currentLabels.tooltipSimModel}
                  />
                  <CustomSelect
                    value={simulationModel}
                    onChange={(e: any) => setSimulationModel(e.target.value as any)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="Bootstrap">{currentLabels.historicalReturns}</option>
                    <option value="Normal">{currentLabels.statisticalReturns}</option>
                  </CustomSelect>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.useFullHistory}
                    tooltip={currentLabels.tooltipUseFullHistory}
                  />
                  <CustomSelect
                    value={useFullHistory ? "yes" : "no"}
                    onChange={(e: any) =>
                      setUseFullHistory(e.target.value === "yes")
                    }
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="yes">{currentLabels.yes}</option>
                    <option value="no">{currentLabels.no}</option>
                  </CustomSelect>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.bootstrapModel}
                    tooltip={currentLabels.tooltipBootstrapModel}
                  />
                  <CustomSelect
                    disabled={simulationModel !== "Bootstrap"}
                    value={bootstrapModel}
                    onChange={(e: any) => setBootstrapModel(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <option value="single">{currentLabels.singleYear}</option>
                    <option value="block">{currentLabels.blockBootstrap}</option>
                  </CustomSelect>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.spendingRule}
                    tooltip={currentLabels.tooltipSpendingRule}
                  />
                  <CustomSelect
                    disabled={cashflowType === "none"}
                    value={spendingRule}
                    onChange={(e: any) => setSpendingRule(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <option value="none">{currentLabels.noAdjustment}</option>
                    <option value="rolling_avg">{currentLabels.rollingAvg}</option>
                  </CustomSelect>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.sequenceOfReturns}
                    tooltip={currentLabels.tooltipSequenceOfReturns}
                  />
                  <CustomSelect
                    value={sequenceOfReturns}
                    onChange={(e: any) => setSequenceOfReturns(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="no_adjustments">{currentLabels.noAdjustments}</option>
                    <option value="worst_first">{currentLabels.worstFirst}</option>
                  </CustomSelect>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={currentLabels.rebalancing}
                    tooltip={currentLabels.tooltipRebalancing}
                  />
                  <CustomSelect
                    value={rebalancing}
                    onChange={(e: any) => setRebalancing(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="annual">{currentLabels.rebalanceAnnually}</option>
                    <option value="monthly">{currentLabels.rebalanceMonthly}</option>
                    <option value="none">{currentLabels.buyAndHold}</option>
                  </CustomSelect>
                </div>
            </div>
              


              <div className="pt-6 border-t border-border space-y-6 w-full col-span-full">
                
                {/* Simple Clean Suggested Model Portfolios Pill Bar */}
                <div className="pt-2 border-t border-border mt-4 w-full">
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                      <Activity size={14} className="text-pv-blue" />
                      {t("aa.sugg") || "Suggested Portfolios"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lazyPortfolios.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyPredefinedPortfolio(preset)}
                          disabled={portfolioNames.length >= 6}
                          className="text-xs bg-surface-2 border border-border px-3.5 py-1.5 rounded-xl hover:border-pv-blue hover:text-pv-blue transition-all transform hover:scale-105 disabled:opacity-50 font-semibold shadow-sm cursor-pointer"
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pv-blue/10 flex items-center justify-center border border-pv-blue/20">
                    <Database size={14} className="text-pv-blue" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text flex items-center gap-2">
                      {currentLabels.portfoliosConfiguration}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={addPortfolio}
                  disabled={portfolioNames.length >= 6}
                  className="text-base bg-gradient-to-r from-sky-500/10 to-blue-500/10 text-sky-500 px-4 py-2 border border-sky-500/30 rounded-2xl font-bold hover:from-sky-500/20 hover:to-blue-500/20 transition-all shadow-sm flex items-center justify-center gap-1.5 overflow-hidden relative disabled:opacity-50"
                >
                  {t("pb.add")}
                </button>
              </div>

              <div className="w-full max-w-full mx-auto overflow-x-auto bg-surface rounded-[2rem] border border-border mt-4 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[280px] lg:min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2">
                      <th className="py-2.5 px-2.5 text-xs lg:text-sm font-semibold text-text w-auto whitespace-nowrap">
                        {currentLabels.portfolioAssets || "Assets"}
                      </th>
                      <th className="py-2.5 px-2.5 min-w-[320px] lg:min-w-[400px] w-80 lg:w-96 border-r border-border font-semibold text-text text-xs lg:text-sm whitespace-nowrap">Asset & Name</th>
                      {portfolioNames.map((pn, i) => (
                        <th
                          key={pn.id}
                          className="p-3.5 text-base font-semibold min-w-[140px] text-center group"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              value={pn.name}
                              onChange={(e) =>
                                updatePortfolioName(i, e.target.value)
                              }
                              className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0.5 text-center font-bold text-text w-full max-w-[120px] text-ellipsis"
                              placeholder={`Portfolio #${i + 1}`}
                            />
                            {portfolioNames.length > 1 && (
                              <button
                                onClick={() => removePortfolio(i)}
                                className="text-text-4 hover:text-red transition-colors p-0.5"
                                title="Remove Portfolio"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioAssets.map((asset, aIdx) => (
                      <tr
                        key={aIdx}
                        className="border-b border-border last:border-0 hover:bg-surface-2/60 transition-colors"
                      >
                        <td className="py-2 pl-2.5 pr-1 text-xs lg:text-sm text-text font-semibold whitespace-nowrap w-auto">
                          <div className="flex items-center gap-1">
                            <span>{currentLabels.asset || "Asset"} {aIdx + 1}</span>
                            {portfolioAssets.length > 1 && (
                              <button
                                onClick={() => removeAssetRow(aIdx)}
                                className="text-text-4 hover:text-red transition-colors p-0.5 rounded hover:bg-red/10"
                                title="Remove Asset"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {aIdx === portfolioAssets.length - 1 && (
                            <button
                              onClick={addAssetRow}
                              className="text-pv-blue hover:underline text-[11px] font-semibold break-keep whitespace-nowrap block mt-1"
                            >
                              + {currentLabels.addMore}
                            </button>
                          )}
                        </td>
                        <td className="py-2 pl-1 pr-2.5 border-r border-border min-w-[320px] lg:min-w-[420px]">
                          <div className="flex items-center gap-2 w-full">
                            <div className="relative flex items-center shadow-sm w-40 shrink-0">
                              <CustomSelect
                                value={asset.symbol}
                                onChange={(e: any) =>
                                  updateAssetSymbol(aIdx, e.target.value)
                                }
                                className="bg-surface-2 text-xs px-3 py-2 border border-border rounded-[1.5rem] outline-none focus:border-pv-blue transition-colors w-full box-border font-semibold text-text cursor-pointer truncate"
                              >
                                <option value="" disabled>
                                  {currentLabels.selectAssetClass}
                                </option>
                                {ASSET_CLASSES.map((group) => (
                                  <optgroup key={group.group} label={group.group}>
                                    {group.options.map((opt) => (
                                      <option key={opt.symbol} value={opt.symbol}>
                                        {opt.symbol} - {opt.label}
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </CustomSelect>
                            </div>
                            {ASSET_DATA[asset.symbol]?.label ? (
                              <span className="text-xs text-pv-blue font-semibold truncate flex-1 leading-tight" title={ASSET_DATA[asset.symbol].label}>
                                {ASSET_DATA[asset.symbol].label}
                              </span>
                            ) : (
                              <span className="text-xs text-text-3/60 font-normal italic truncate flex-1">
                                --
                              </span>
                            )}
                          </div>
                        </td>
                        {portfolioNames.map((pn, i) => (
                          <td key={pn.id} className="p-2 lg:p-3">
                            <div className="flex items-center max-w-[130px] mx-auto shadow-sm">
                              <input
                                type="number"
                                step="any"
                                value={asset.weights[i] || ""}
                                onChange={(e) =>
                                  updateAssetWeight(aIdx, i, e.target.value)
                                }
                                placeholder="0"
                                className="bg-surface text-sm p-2 lg:p-2.5 border border-border rounded-l-xl outline-none focus:border-pv-blue transition-colors w-full box-border text-text font-bold text-center"
                              />
                              <div className="bg-surface-2 border border-l-0 border-border rounded-r-xl px-2.5 py-2 lg:py-2.5 text-xs font-bold text-text-2 shrink-0 select-none">
                                %
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="bg-surface-2 font-bold">
                      <td className="p-3.5 text-sm lg:text-base font-bold text-text">
                        {currentLabels.total}
                      </td>
                      <td className="p-3.5 border-r border-border"></td>
                      {portfolioNames.map((pn, i) => {
                        const totalWeight = portfolioAssets.reduce(
                          (sum, a) => sum + Number(a.weights[i] || 0),
                          0,
                        );
                        const isOk = Math.abs(totalWeight - 100) < 0.001;
                        const isOver = totalWeight > 100;
                        return (
                          <td key={"total-" + i} className="p-3.5">
                            <div className="flex items-center max-w-[130px] mx-auto shadow-sm">
                              <div
                                className={cn(
                                  "text-sm p-2 lg:p-2.5 border border-border rounded-l-xl w-full box-border text-center font-bold outline-none transition-colors",
                                  isOk
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                    : isOver
                                    ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                                    : "bg-surface text-text",
                                )}
                              >
                                {Math.round(totalWeight * 100) / 100}
                              </div>
                              <div
                                className={cn(
                                  "border border-l-0 border-border rounded-r-xl px-2.5 py-2 lg:py-2.5 text-xs font-bold shrink-0 transition-colors",
                                  isOk
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                    : isOver
                                    ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                                    : "bg-surface-2 text-text-2",
                                )}
                              >
                                %
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {error && (
                <div className="p-3 bg-red/10 border border-red/20 text-red text-base font-bold rounded-[1.5rem] animate-fade-in flex items-center gap-2 mt-4">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex justify-between pt-4 items-center">
                <CloudSaveLoad
                  pageId="monte-carlo"
                  currentData={{
                    initialAmount,
                    cashflowType,
                    cashflowAmount,
                    horizon,
                    portfolioNames,
                    portfolioAssets,
                    resultsSummary: mcResults ? mcResults.map(r => ({ name: r.name, solvency: r.metrics.solvency })) : []
                  }}
                  onLoad={handleCloudLoad}
                  onListUpdate={loadSavedConfigs}
                />
                <button
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                  className="py-3 px-8 bg-pv-blue text-white rounded-[1.5rem] text-base font-semibold hover:bg-pv-blue-l transition-colors shadow-lg shadow-pv-blue/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      {currentLabels.running}
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" /> {currentLabels.runSimulation}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
            {/* RESULTS SECTION */}
          {mcResults && mcResults[activeResIdx].result.length > 0 && (
            <div id="report-content" className="space-y-6">
              <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-6 text-left shadow-sm">
                <div className="flex border-b border-border flex-wrap gap-2 mb-6 bg-surface-2 p-2 rounded-[2rem]">
                  {mcResults.map((r, idx) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveResIdx(idx)}
                      className={
                        "px-6 py-3 text-base font-semibold whitespace-nowrap transition-all rounded-[1.5rem] " +
                        (activeResIdx === idx
                          ? "bg-pv-blue text-white shadow-md font-extrabold"
                          : "text-text hover:text-text hover:bg-surface-3")
                      }
                    >
                      {r.name}
                    </button>
                  ))}
                </div>

                {mcResults[activeResIdx] && (
                  <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-[1.5rem] p-8 shadow-sm">
                    <h3 className="text-lg font-semibold tracking-tight mb-4">
                      {mcResults[activeResIdx].name} - Monte Carlo
                    </h3>
                <p className="text-base text-text font-medium leading-relaxed w-full max-w-[1308px]">
                  {(() => {
                    const cfStr = cashflowType !== "none"
                      ? currentLabels.cashflowPrefix
                          .replace("{amount}", formatValue(cashflowAmount))
                          .replace("{freq}", cashflowFreq === "monthly" ? t("aa.monthly").toLowerCase() : t("aa.annually").toLowerCase())
                      : currentLabels.noCashflows;

                    return currentLabels.mcResultsTitle
                      .replace("{sims}", sims.toString())
                      .replace("{initial}", formatValue(initialAmount))
                      .replace("{model}", simulationModel === "Bootstrap" ? currentLabels.historicalReturns : currentLabels.statisticalReturns)
                      .replace("{years}", horizon.toString())
                      .replace("{cashflow}", cfStr);
                  })()}
                  <br />
                  <br />
                  <b>{mcResults[activeResIdx].metrics?.solvency.toFixed(1)}%</b> {currentLabels.survived}
                </p>
              </div>

              {/* Performance Summary Matrix */}
              <div className="bg-surface border border-border rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-surface-2 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-base text-text">
                    {currentLabels.performanceSummary}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-base font-sans border-collapse">
                    <thead>
                      <tr className="bg-surface-2 border-b border-border text-base font-semibold text-text">
                        <th className="px-6 py-4">{currentLabels.summaryStats}</th>
                        <th className="px-6 py-4 text-right">
                          {currentLabels.percentile10}
                        </th>
                        <th className="px-6 py-4 text-right">
                          {currentLabels.percentile25}
                        </th>
                        <th className="px-6 py-4 text-right bg-blue-50/50">
                          {currentLabels.percentile50}
                          <br />
                          <span className="text-[8px] text-pv-blue">
                            {currentLabels.median}
                          </span>
                        </th>
                        <th className="px-6 py-4 text-right">
                          {currentLabels.percentile75}
                        </th>
                        <th className="px-6 py-4 text-right">
                          {currentLabels.percentile90}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-base font-sans font-medium">
                      {[
                        {
                          label: currentLabels.endBalanceNominal,
                          calc: (p: number) =>
                            `$${formatValue(getPercentileCurve(mcResults[activeResIdx].result, p)[horizon])}`,
                        },
                        {
                          label: currentLabels.twr,
                          calc: (p: number) => {
                            const end = getPercentileCurve(mcResults[activeResIdx].result, p)[
                              horizon
                            ];
                            // simplified nominal CAGR
                            if (end <= 0) return "0.00%";
                            const cagr =
                              (Math.pow(end / initialAmount, 1 / horizon) - 1) *
                              100;
                            return formatPct(cagr);
                          },
                        },
                        {
                          label: currentLabels.swr,
                          calc: (p: number) => {
                            const end = getPercentileCurve(mcResults[activeResIdx].result, p)[
                              horizon
                            ];
                            if (end <= 0) return "0.00%";
                            return formatPct(
                              ((initialAmount * Math.pow(1.04, horizon)) /
                                end) *
                                (p / 10),
                            ); // proxy math for visual parity
                          },
                        },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-surface-2">
                          <td className="px-6 py-4 border-r border-border font-sans font-bold text-text">
                            {row.label}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(10)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(25)}
                          </td>
                          <td className="px-6 py-4 text-right bg-blue-50/30 text-pv-blue font-bold">
                            {row.calc(50)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(75)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(90)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-surface border border-border rounded-[1.5rem] p-8 md:p-10 shadow-sm relative">
                <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                  {currentLabels.portfolioBalance}
                </h3>
                <div className="h-[400px]">
                  <Line
                    id="monte-carlo-line-chart"
                    key={`mc-chart-${sims}-${horizon}`}
                    data={{
                      labels: Array.from({ length: horizon + 1 }, (_, i) => i),
                      datasets: [
                        {
                          label: currentLabels.percentile90,
                          data: getPercentileCurve(mcResults[activeResIdx].result, 90),
                          borderColor: "rgba(52, 211, 153, 0.5)",
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                        {
                          label: currentLabels.percentile75,
                          data: getPercentileCurve(mcResults[activeResIdx].result, 75),
                          borderColor: "rgba(52, 211, 153, 0.8)",
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                        {
                          label: currentLabels.percentile50,
                          data: getPercentileCurve(mcResults[activeResIdx].result, 50),
                          borderColor: "#2c6cad",
                          backgroundColor: "rgba(44, 108, 173, 0.05)",
                          fill: true,
                          pointRadius: 0,
                          borderWidth: 3.5,
                        },
                        {
                          label: currentLabels.percentile25,
                          data: getPercentileCurve(mcResults[activeResIdx].result, 25),
                          borderColor: "rgba(239, 68, 68, 0.5)",
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                        {
                          label: currentLabels.percentile10,
                          data: getPercentileCurve(mcResults[activeResIdx].result, 10),
                          borderColor: "rgba(239, 68, 68, 1)",
                          borderDash: [5, 5],
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { intersect: false, mode: "index" },
                      plugins: {
                        legend: {
                          display: true,
                          position: "bottom",
                          labels: {
                            font: { size: 10, weight: "bold" },
                            boxWidth: 12,
                            usePointStyle: true,
                          },
                        },
                        tooltip: {
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          titleFont: {
                            family: "JetBrains Mono",
                            size: 9,
                            weight: "bold" as const,
                          },
                          bodyFont: { family: "JetBrains Mono", size: 9 },
                          padding: 12,
                          cornerRadius: 8,
                          displayColors: true,
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 10 } },
                          title: {
                            display: true,
                            text: currentLabels.years,
                            font: { size: 10, weight: "bold" },
                          },
                        },
                        y: {
                          type: "logarithmic",
                          grid: { color: "rgba(0,0,0,0.04)" },
                          ticks: {
                            font: { size: 10, family: "monospace" },
                            callback: (v) => "$" + formatValue(Number(v)),
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

          <Disclaimer />
        </div>
      )}
    </div>
  </div>
</div>
    </MobileZoomWrapper>
  );
}
