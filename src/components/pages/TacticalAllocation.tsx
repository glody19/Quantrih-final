import React, { useState, useEffect } from "react";
import { useTranslation } from "../../contexts/LanguageContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "../../lib/utils";
import { PageHeader } from "../ui/PageHeader";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { InfoTooltip } from "../ui/InfoTooltip";
import { Play, Settings, Activity, Database, Trash2, Save, FileDown, Search } from "lucide-react";
import { TickerInput } from "../ui/TickerInput";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import { EliteDonut } from "../ui/EliteDonut";
import { ReturnsHeatmap } from "../ui/ReturnsHeatmap";
import { EfficientFrontier } from "../ui/EfficientFrontier";
import { PortfolioAnalysisExplication } from "./PortfolioAnalysisExplication";
import { runBacktest as engineRunBacktest } from "../../engine";
import { downloadCSV } from "../../utils/export";
import { ViewToggle } from "../ui/ViewToggle";
import { Disclaimer } from "../ui/Disclaimer";
import { ASSET_DATA } from "../../constants";
import { CloudSaveLoad } from "../ui/CloudSaveLoad";
import { PresetPortfoliosSelector } from "../ui/PresetPortfoliosSelector";
import { CustomSelect } from "../ui/CustomSelect";
import { collection, query, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSearchParams } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

function TooltipLabel({
  label,
  tooltip,
  className = "",
}: {
  label: React.ReactNode;
  tooltip: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className={cn("text-base font-bold text-text ", className)}>
        {label}
      </label>
      <InfoTooltip content={<>{tooltip}</>} />
    </div>
  );
}

const localLabels: Record<string, Record<string, string>> = {
  en: {
    modifyConfig: "Modify Configuration",
    portfolio: "Portfolio",
    initial: "Initial",
    final: "Final",
    bestWorst: "Best / Worst",
    since: "Since",
    dotcom: "Dotcom Tech Crash",
    gfc: "Global Financial Crisis",
    covid: "COVID-19 Pandemic Shock",
    inflation: "Inflation Spike & Global Tightening",
    outsideScope: "OUTSIDE SCOPE",
    heatmap: "Monthly Heatmap",
    assetAllocation: "Asset Allocation",
    assetAllocDetails: "Asset Allocation Details",
    title: "Tactical Allocation",
    badge: "Momentum Suite",
    description: "Tactical allocation involves actively adjusting a portfolio's composition to capitalize on short or medium-term market anomalies while maintaining an overarching strategy. Explore how different dynamic strategies can optimize returns. The backtest begins at the year of common data availability for the assets.",
    simulator: "Simulator",
    savedScenarios: "Saved Scenarios",
    tabSeasonal: "Seasonal Model",
    tabMaSingle: "Moving Averages - Single Asset",
    tabMaPortfolio: "Moving Averages - Portfolio Assets",
    tabMomRelative: "Momentum - Relative Strength",
    tabMomDual: "Momentum - Dual Momentum",
    tabMomAdaptive: "Momentum - Adaptive Allocation",
    savedStrategies: "Saved Strategies",
    total: "Total",
    noSavedYet: "No saved strategies yet. Save one in the Simulator.",
    activateSavedScenarios: "Activate Saved Scenarios",
    loginToSave: "Log in to save your tactical strategies and access them from anywhere.",
    loadingStrategies: "Loading your strategies...",
    strategyParameters: "Strategy Parameters",
    parameters: "Parameters",
    portfolioAssets: "Portfolio Assets",
    timePeriod: "Time Period",
    timePeriodTooltip: "Select whether the period is calculated year over year or month over month.",
    yearToYear: "Year-to-Year",
    monthToMonth: "Month-to-Month",
    startYearLabel: "Start Year",
    startYearTooltip: "Start year of the backtest.",
    endYearLabel: "End Year",
    endYearTooltip: "End year of the backtest.",
    includeYtd: "Include YTD",
    includeYtdTooltip: "Include the current year (Year-To-Date) in the calculations.",
    yes: "Yes",
    no: "No",
    initialAmountLabel: "Initial Amount",
    initialAmountTooltip: "The initial investment capital.",
    brokerLabel: "Broker Fees",
    brokerTooltip: "The broker platform determines the fee structure for the simulated backtest.",
    noFee: "No Fee (0€)",
    otherCustom: "Other / Custom",
    customFeeLabel: "Fee per order",
    cashflowsLabel: "Cashflows",
    cashflowsTooltip: "Regular contributions or withdrawals applied to the portfolio.",
    none: "None",
    contributeFixed: "Contribute fixed amount",
    withdrawFixed: "Withdraw fixed amount",
    outOfMarketStartMonth: "Out Of Market Start Month",
    outOfMarketStartMonthTooltip: "Month from which to exit the market (seasonal effect).",
    outOfMarketEndMonth: "Out Of Market End Month",
    outOfMarketEndMonthTooltip: "Month from which to re-enter the market (seasonal effect).",
    outOfMarketAsset: "Out of Market Asset",
    outOfMarketAssetTooltip: "Safe haven asset to invest in when the signal is to exit the main market.",
    leverageType: "Leverage Type",
    leverageTypeTooltip: "Use of leverage or margin to increase exposure.",
    marginFactor: "Margin Factor",
    margin: "Margin",
    comparedAllocation: "Compared Allocation",
    comparedAllocationTooltip: "The reference allocation used for comparison (Benchmark).",
    defaultAlloc: "Default",
    customAlloc: "Custom",
    benchmarkLabel: "Benchmark",
    benchmarkTooltip: "The benchmark index to compare overall performance.",
    buySignal: "Buy Signal",
    buySignalTooltip: "The condition necessary to trigger a buy signal.",
    priceGteMa: "Price >= Moving average",
    priceGtMa: "Price > Moving average",
    typeOfMovingAverage: "Type of Moving Average",
    typeOfMovingAverageTooltip: "The smoothing method (Simple or Exponential) of the moving average.",
    simpleMa: "Simple Moving Average",
    exponentialMa: "Exponential Moving Average",
    lookbackPeriod: "Lookback Period",
    lookbackPeriodTooltip: "The past observation period to calculate signals (e.g. 10 months, 200 days).",
    months10: "10 months",
    months12: "12 months",
    days200: "200 days",
    stopLoss: "Stop Loss",
    stopLossTooltip: "Maximum drawdown level tolerated before automatic liquidation of a position.",
    noStopLoss: "No stop-loss",
    trailingStopLoss: "Trailing stop-loss",
    tradingFrequency: "Trading Frequency",
    tradingFrequencyTooltip: "How often the strategy checks its signals to potentially readjust positions.",
    monthly: "Monthly",
    weekly: "Weekly",
    daily: "Daily",
    signalAsset: "Signal Asset",
    signalAssetTooltip: "The asset observed to generate market signals (may be different from the invested asset).",
    sameAsInvestment: "Same as investment",
    tradeExecution: "Trade Execution",
    tradeExecutionTooltip: "Determines if the trade is executed at the closing price or at the opening of the next period.",
    tradeAtEndOfMonth: "Trade at end of month price",
    tradeAtNextMonthOpen: "Trade at next month open",
    tickers: "Tickers",
    tickersTooltip: "List of asset symbols (tickers) to analyze.",
    tickersPlaceholder: "Ticker symbols (comma separated)...",
    singleAbsoluteMomentum: "Single absolute momentum",
    singleAbsoluteMomentumTooltip: "Apply a single absolute momentum filter to the entire portfolio.",
    performancePeriods: "Performance Periods",
    performancePeriodsTooltip: "Calculate momentum over one or more performance periods.",
    singlePeriod: "Single Period",
    multiplePeriods: "Multiple Periods",
    lookbackPeriodMom: "Lookback Period",
    months6: "6 months",
    months3: "3 months",
    months1: "1 month",
    excludePreviousMonth: "Exclude Previous Month",
    excludePreviousMonthTooltip: "Excludes the most recent month in momentum calculation to avoid short-term stock market mean reversion.",
    assetsToHold: "Assets to hold",
    assetsToHoldTooltip: "The maximum number of assets to hold simultaneously in the portfolio.",
    allocationWeights: "Allocation Weights",
    allocationWeightsTooltip: "The method to distribute capital (equal weight, risk parity, inverse volatility).",
    equalWeight: "Equal Weight",
    inverseVolatility: "Inverse Volatility",
    volatilityPeriod: "Volatility Period",
    volatilityPeriodTooltip: "Observation period to estimate recent historical volatility.",
    riskParity: "Risk Parity",
    minimumVariance: "Minimum Variance",
    asset: "Asset",
    addMoreAssets: "+ Add more assets",
    confirmDelete: "Confirm?",
    delete: "Delete",
    loadButton: "Load",
    year: "Year"
  },
  fr: {
    modifyConfig: "Modifier la configuration",
    portfolio: "Portefeuille",
    initial: "Initial",
    final: "Final",
    bestWorst: "Meilleure / Pire",
    since: "Depuis",
    dotcom: "Krach des Dotcoms",
    gfc: "Crise Financière Globale",
    covid: "Choc de la Pandémie COVID-19",
    inflation: "Pic d'Inflation & Resserrement Global",
    outsideScope: "HORS CHAMP",
    heatmap: "Carte Thermique Mensuelle",
    assetAllocation: "Allocation d'Actifs",
    assetAllocDetails: "Détails de l'Allocation d'Actifs",
    title: "Allocation Tactique",
    badge: "Suite Momentum",
    description: "L'allocation tactique consiste à ajuster activement la composition d'un portefeuille pour tirer parti des anomalies de marché à court ou moyen terme tout en maintenant une stratégie globale. Explorez comment différentes stratégies dynamiques peuvent optimiser les rendements. Le backtest commence à l'année de disponibilité commune des données pour les actifs.",
    simulator: "Simulateur",
    savedScenarios: "Scénarios Sauvegardés",
    tabSeasonal: "Modèle Saisonnier",
    tabMaSingle: "Moyennes Mobiles - Actif Unique",
    tabMaPortfolio: "Moyennes Mobiles - Actifs du Portefeuille",
    tabMomRelative: "Momentum - Force Relative",
    tabMomDual: "Momentum - Double Momentum",
    tabMomAdaptive: "Momentum - Allocation Adaptative",
    savedStrategies: "Stratégies Sauvegardées",
    total: "Total",
    noSavedYet: "Aucune stratégie sauvegardée pour le moment. Enregistrez-en une dans le Simulateur.",
    activateSavedScenarios: "Activer les Scénarios Sauvegardés",
    loginToSave: "Connectez-vous pour sauvegarder vos stratégies tactiques et y accéder de n'importe où.",
    loadingStrategies: "Chargement de vos stratégies...",
    strategyParameters: "Paramètres de la Stratégie",
    parameters: "Paramètres",
    portfolioAssets: "Actifs du Portefeuille",
    timePeriod: "Période",
    timePeriodTooltip: "Sélectionnez si la période est calculée d'une année sur l'autre ou d'un mois sur l'autre.",
    yearToYear: "D'une année sur l'autre",
    monthToMonth: "D'un mois sur l'autre",
    startYearLabel: "Année de Départ",
    startYearTooltip: "Année de départ du backtest.",
    endYearLabel: "Année de Fin",
    endYearTooltip: "Année de fin du backtest.",
    includeYtd: "Inclure l'Année en Cours (YTD)",
    includeYtdTooltip: "Inclure l'année en cours (Year-To-Date) dans les calculs.",
    yes: "Oui",
    no: "Non",
    initialAmountLabel: "Montant Initial",
    initialAmountTooltip: "Le capital d'investissement initial.",
    brokerLabel: "Frais de Courtage",
    brokerTooltip: "La plateforme du courtier détermine la structure des frais pour le backtest simulé.",
    noFee: "Sans frais (0€)",
    otherCustom: "Autre / Personnalisé",
    customFeeLabel: "Frais par ordre",
    cashflowsLabel: "Flux de Trésorerie",
    cashflowsTooltip: "Versements ou retraits réguliers appliqués au portefeuille.",
    none: "Aucun",
    contributeFixed: "Verser un montant fixe",
    withdrawFixed: "Retirer un montant fixe",
    outOfMarketStartMonth: "Mois de Sortie du Marché",
    outOfMarketStartMonthTooltip: "Mois à partir duquel sortir du marché (effet saisonnier).",
    outOfMarketEndMonth: "Mois de Retour sur le Marché",
    outOfMarketEndMonthTooltip: "Mois à partir duquel revenir sur le marché (effet saisonnier).",
    outOfMarketAsset: "Actif Hors Marché",
    outOfMarketAssetTooltip: "Actif refuge dans lequel investir lorsque le signal de sortie du marché principal est déclenché.",
    leverageType: "Type de Levier",
    leverageTypeTooltip: "Utilisation de l'effet de levier ou de marge pour augmenter l'exposition.",
    marginFactor: "Facteur de Marge",
    margin: "Marge",
    comparedAllocation: "Allocation Comparée",
    comparedAllocationTooltip: "L'allocation de référence utilisée pour la comparaison (Benchmark).",
    defaultAlloc: "Par défaut",
    customAlloc: "Personnalisée",
    benchmarkLabel: "Indice de Référence",
    benchmarkTooltip: "L'indice de référence pour comparer la performance globale.",
    buySignal: "Signal d'Achat",
    buySignalTooltip: "La condition nécessaire pour déclencher un signal d'achat.",
    priceGteMa: "Prix >= Moyenne mobile",
    priceGtMa: "Prix > Moyenne mobile",
    typeOfMovingAverage: "Type de Moyenne Mobile",
    typeOfMovingAverageTooltip: "La méthode de lissage (Simple ou Exponentielle) de la moyenne mobile.",
    simpleMa: "Moyenne Mobile Simple",
    exponentialMa: "Moyenne Mobile Exponentielle",
    lookbackPeriod: "Période d'Observation",
    lookbackPeriodTooltip: "La période d'observation passée pour calculer les signaux (ex. 10 mois, 200 jours).",
    months10: "10 mois",
    months12: "12 mois",
    days200: "200 jours",
    stopLoss: "Stop Loss",
    stopLossTooltip: "Niveau de perte maximal toléré avant liquidation automatique de la position.",
    noStopLoss: "Pas de stop-loss",
    trailingStopLoss: "Stop-loss suiveur",
    tradingFrequency: "Fréquence de Trading",
    tradingFrequencyTooltip: "Fréquence à laquelle la stratégie vérifie ses signaux pour réajuster ses positions.",
    monthly: "Mensuel",
    weekly: "Hebdomadaire",
    daily: "Quotidien",
    signalAsset: "Actif du Signal",
    signalAssetTooltip: "L'actif observé pour générer les signaux de marché (peut différer de l'actif investi).",
    sameAsInvestment: "Identique à l'investissement",
    tradeExecution: "Exécution de l'Ordre",
    tradeExecutionTooltip: "Détermine si la transaction est exécutée au prix de clôture ou à l'ouverture de la période suivante.",
    tradeAtEndOfMonth: "Négocier au prix de fin de mois",
    tradeAtNextMonthOpen: "Négocier à l'ouverture du mois suivant",
    tickers: "Tickers",
    tickersTooltip: "Liste des symboles d'actifs (tickers) à analyser.",
    tickersPlaceholder: "Symboles des tickers (séparés par des virgules)...",
    singleAbsoluteMomentum: "Momentum absolu unique",
    singleAbsoluteMomentumTooltip: "Appliquer un filtre de momentum absolu unique à l'ensemble du portefeuille.",
    performancePeriods: "Périodes de Performance",
    performancePeriodsTooltip: "Calculer le momentum sur une ou plusieurs périodes de performance.",
    singlePeriod: "Période unique",
    multiplePeriods: "Périodes multiples",
    lookbackPeriodMom: "Période d'Observation",
    months6: "6 mois",
    months3: "3 mois",
    months1: "1 mois",
    excludePreviousMonth: "Exclure le Mois Précédent",
    excludePreviousMonthTooltip: "Exclut le mois le plus récent dans le calcul du momentum pour éviter le retour à la moyenne à court terme.",
    assetsToHold: "Actifs à Détenir",
    assetsToHoldTooltip: "Le nombre maximum d'actifs à détenir simultanément dans le portefeuille.",
    allocationWeights: "Poids d'Allocation",
    allocationWeightsTooltip: "La méthode de répartition du capital (poids égal, parité des risques, inverse de la volatilité).",
    equalWeight: "Poids Égal",
    inverseVolatility: "Volatilité Inverse",
    volatilityPeriod: "Période de Volatilité",
    volatilityPeriodTooltip: "Période d'observation pour estimer la volatilité historique récente.",
    riskParity: "Parité des Risques",
    minimumVariance: "Variance Minimale",
    asset: "Actif",
    addMoreAssets: "+ Ajouter d'autres actifs",
    confirmDelete: "Confirmer ?",
    delete: "Supprimer",
    loadButton: "Charger",
    year: "Année"
  },
  de: {
    modifyConfig: "Konfiguration ändern",
    portfolio: "Portfolio",
    initial: "Anfangswert",
    final: "Endwert",
    bestWorst: "Bestes / Schlechtestes",
    since: "Seit",
    dotcom: "Dotcom-Crash",
    gfc: "Globale Finanzkrise",
    covid: "COVID-19 Pandemie-Schock",
    inflation: "Inflationsanstieg & globale Straffung",
    outsideScope: "AUßERHALB DES ZEITRAUMS",
    heatmap: "Monatliche Heatmap",
    assetAllocation: "Asset-Allokation",
    assetAllocDetails: "Details zur Asset-Allokation",
    title: "Taktische Allokation",
    badge: "Momentum Suite",
    description: "Taktische Allokation beinhaltet die aktive Anpassung des Portfolios, um von kurz- oder mittelfristigen Marktanomalien zu profitieren.",
    simulator: "Simulator",
    savedScenarios: "Gespeicherte Szenarien",
    tabSeasonal: "Saisonales Modell",
    tabMaSingle: "Gleitende Durchschnitte - Einzelwert",
    tabMaPortfolio: "Gleitende Durchschnitte - Portfolio",
    tabMomRelative: "Momentum - Relative Stärke",
    tabMomDual: "Momentum - Duales Momentum",
    tabMomAdaptive: "Momentum - Adaptive Allokation",
    savedStrategies: "Gespeicherte Strategien",
    total: "Gesamt",
    noSavedYet: "Noch keine gespeicherten Strategien.",
    activateSavedScenarios: "Gespeicherte Szenarien aktivieren",
    loginToSave: "Melden Sie sich an, um Ihre Strategien zu speichern.",
    loadingStrategies: "Lade Strategien...",
    strategyParameters: "Strategie-Parameter",
    parameters: "Parameter",
    portfolioAssets: "Portfolio-Anlageklassen",
    timePeriod: "Zeitraum",
    timePeriodTooltip: "Zeitraum-Modus wählen.",
    yearToYear: "Jahr-zu-Jahr",
    monthToMonth: "Monat-zu-Monat",
    startYearLabel: "Startjahr",
    startYearTooltip: "Startjahr des Backtests.",
    endYearLabel: "Endjahr",
    endYearTooltip: "Endjahr des Backtests.",
    includeYtd: "YTD einbeziehen",
    includeYtdTooltip: "Aktuelles Jahr einbeziehen.",
    yes: "Ja",
    no: "Nein",
    initialAmountLabel: "Anfangswert",
    initialAmountTooltip: "Anfängliches Investitionskapital.",
    brokerLabel: "Broker-Gebühren",
    brokerTooltip: "Gebührenstruktur des Brokers.",
    noFee: "Keine Gebühren (0€)",
    otherCustom: "Andere / Benutzerdefiniert",
    customFeeLabel: "Gebühr pro Order",
    cashflowsLabel: "Cashflows",
    cashflowsTooltip: "Regelmäßige Einzahlungen oder Entnahmen.",
    none: "Keine",
    contributeFixed: "Festen Betrag einzahlen",
    withdrawFixed: "Festen Betrag entnehmen",
    outOfMarketStartMonth: "Startmonat außerhalb des Marktes",
    outOfMarketStartMonthTooltip: "Startmonat für den Marktaustritt.",
    outOfMarketEndMonth: "Endmonat außerhalb des Marktes",
    outOfMarketEndMonthTooltip: "Endmonat für den Markteintritt.",
    outOfMarketAsset: "Sicherer Hafen Wertpapier",
    outOfMarketAssetTooltip: "Sicherer Hafen bei Marktaustritt.",
    leverageType: "Hebeltyp",
    leverageTypeTooltip: "Einsatz von Hebel oder Margin.",
    marginFactor: "Margin-Faktor",
    margin: "Margin",
    comparedAllocation: "Vergleichsallokation",
    comparedAllocationTooltip: "Referenzallokation für den Vergleich.",
    defaultAlloc: "Standard",
    customAlloc: "Benutzerdefiniert",
    benchmarkLabel: "Benchmark",
    benchmarkTooltip: "Benchmark-Index für den Leistungsvergleich.",
    buySignal: "Kaufsignal",
    buySignalTooltip: "Bedingung für ein Kaufsignal.",
    priceGteMa: "Preis >= Gleitender Durchschnitt",
    priceGtMa: "Preis > Gleitender Durchschnitt",
    typeOfMovingAverage: "Typ des gleitenden Durchschnitts",
    typeOfMovingAverageTooltip: "Glättungsmethode des gleitenden Durchschnitts.",
    simpleMa: "Einfacher gleitender Durchschnitt",
    exponentialMa: "Exponentieller gleitender Durchschnitt",
    lookbackPeriod: "Beobachtungszeitraum",
    lookbackPeriodTooltip: "Beobachtungszeitraum für Signale.",
    months10: "10 Monate",
    months12: "12 Monate",
    days200: "200 Tage",
    stopLoss: "Stop-Loss",
    stopLossTooltip: "Maximal tolerierter Verlust vor automatischer Liquidation.",
    noStopLoss: "Kein Stop-Loss",
    trailingStopLoss: "Trailing Stop-Loss",
    tradingFrequency: "Handelshäufigkeit",
    tradingFrequencyTooltip: "Häufigkeit der Signalprüfung.",
    monthly: "Monatlich",
    weekly: "Wöchentlich",
    daily: "Täglich",
    signalAsset: "Signal-Wertpapier",
    signalAssetTooltip: "Beobachteter Wert für Signale.",
    sameAsInvestment: "Wie Investment",
    tradeExecution: "Orderausführung",
    tradeExecutionTooltip: "Ausführungszeitpunkt der Order.",
    tradeAtEndOfMonth: "Zum Monatsendpreis handeln",
    tradeAtNextMonthOpen: "Zur nächsten Monatsöffnung handeln",
    tickers: "Tickers",
    tickersTooltip: "Liste der Tickersymbole.",
    tickersPlaceholder: "Tickersymbole (kommagetrennt)...",
    singleAbsoluteMomentum: "Einzelnes absolutes Momentum",
    singleAbsoluteMomentumTooltip: "Absolutes Momentum auf das gesamte Portfolio anwenden.",
    performancePeriods: "Performance-Zeiträume",
    performancePeriodsTooltip: "Momentum über einen oder mehrere Zeiträume berechnen.",
    singlePeriod: "Einzelner Zeitraum",
    multiplePeriods: "Mehrere Zeiträume",
    lookbackPeriodMom: "Beobachtungszeitraum",
    months6: "6 Monate",
    months3: "3 Monate",
    months1: "1 Monat",
    excludePreviousMonth: "Letzten Monat ausschließen",
    excludePreviousMonthTooltip: "Letzten Monat zur Vermeidung kurzfristiger Mean Reversion ausschließen.",
    assetsToHold: "Zu haltende Werte",
    assetsToHoldTooltip: "Maximale Anzahl gleichzeitig gehaltener Werte.",
    allocationWeights: "Allokationsgewichte",
    allocationWeightsTooltip: "Methode zur Kapitalverteilung.",
    equalWeight: "Gleichgewichtet",
    inverseVolatility: "Invers-Volatilität",
    volatilityPeriod: "Volatilitätszeitraum",
    volatilityPeriodTooltip: "Beobachtungszeitraum für historische Volatilität.",
    riskParity: "Risikoparität",
    minimumVariance: "Minimum-Varianz",
    asset: "Wertpapier",
    addMoreAssets: "+ Mehr hinzufügen",
    confirmDelete: "Bestätigen?",
    delete: "Löschen",
    loadButton: "Laden",
    year: "Jahr"
  },
  nl: {
    modifyConfig: "Wijzig configuratie",
    portfolio: "Portefeuille",
    initial: "Initieel",
    final: "Eindsaldo",
    bestWorst: "Beste / Slechtste",
    since: "Sinds",
    dotcom: "Dotcom Tech Crash",
    gfc: "Wereldwijde Financiële Crisis",
    covid: "COVID-19 Pandemie Schok",
    inflation: "Inflatiespiek & Wereldwijde Verkrapping",
    outsideScope: "BUITEN BEREIK",
    heatmap: "Maandelijkse Heatmap",
    assetAllocation: "Asset Allocatie",
    assetAllocDetails: "Details Asset Allocatie",
    title: "Tactische Allocatie",
    badge: "Momentum Suite",
    description: "Tactische allocatie houdt in dat de samenstelling van een portefeuille actief wordt aangepast om te profiteren van marktanomalieën op korte of middellange termijn.",
    simulator: "Simulator",
    savedScenarios: "Opgeslagen scenario's",
    tabSeasonal: "Seizoensgebonden Model",
    tabMaSingle: "Voortschrijdend Gemiddelde - Enkel Actief",
    tabMaPortfolio: "Voortschrijdend Gemiddelde - Portefeuille",
    tabMomRelative: "Momentum - Relatieve Sterkte",
    tabMomDual: "Momentum - Dual Momentum",
    tabMomAdaptive: "Momentum - Adaptieve Allocatie",
    savedStrategies: "Opgeslagen Strategieën",
    total: "Totaal",
    noSavedYet: "Nog geen opgeslagen strategieën.",
    activateSavedScenarios: "Activeer opgeslagen scenario's",
    loginToSave: "Log in om uw strategieën op te slaan.",
    loadingStrategies: "Laden van uw strategieën...",
    strategyParameters: "Strategie Parameters",
    parameters: "Parameters",
    portfolioAssets: "Portefeuille Activa",
    timePeriod: "Tijdsperiode",
    timePeriodTooltip: "Kies de berekeningsperiode.",
    yearToYear: "Jaar-tot-Jaar",
    monthToMonth: "Maand-tot-Maand",
    startYearLabel: "Startjaar",
    startYearTooltip: "Startjaar van de backtest.",
    endYearLabel: "Eindjaar",
    endYearTooltip: "Eindjaar van de backtest.",
    includeYtd: "Inclusief YTD",
    includeYtdTooltip: "Inclusief lopende jaar.",
    yes: "Ja",
    no: "Nee",
    initialAmountLabel: "Initieel Bedrag",
    initialAmountTooltip: "Het initiële investeringskapitaal.",
    brokerLabel: "Transactiekosten",
    brokerTooltip: "Kostenstructuur van de broker.",
    noFee: "Geen kosten (0€)",
    otherCustom: "Ander / Handmatig",
    customFeeLabel: "Kosten per order",
    cashflowsLabel: "Cashflows",
    cashflowsTooltip: "Regelmatige stortingen of opnames.",
    none: "Geen",
    contributeFixed: "Vast bedrag storten",
    withdrawFixed: "Vast bedrag opnemen",
    outOfMarketStartMonth: "Startmaand buiten de markt",
    outOfMarketStartMonthTooltip: "Maand om de markt te verlaten.",
    outOfMarketEndMonth: "Eindmaand buiten de markt",
    outOfMarketEndMonthTooltip: "Maand om terug in de markt te stappen.",
    outOfMarketAsset: "Veilige Haven Actief",
    outOfMarketAssetTooltip: "Veilig actief om in te beleggen bij marktaustritt.",
    leverageType: "Hefboom Type",
    leverageTypeTooltip: "Gebruik van hefboomwerking.",
    marginFactor: "Margin Factor",
    margin: "Margin",
    comparedAllocation: "Vergeleken Allocatie",
    comparedAllocationTooltip: "Referentieallocatie voor vergelijking.",
    defaultAlloc: "Standaard",
    customAlloc: "Handmatig",
    benchmarkLabel: "Benchmark",
    benchmarkTooltip: "Benchmark-index om prestaties te vergelijken.",
    buySignal: "Koopsignaal",
    buySignalTooltip: "Voorwaarde voor een koopsignaal.",
    priceGteMa: "Prijs >= Voortschrijdend gemiddelde",
    priceGtMa: "Prijs > Voortschrijdend gemiddelde",
    typeOfMovingAverage: "Type voortschrijdend gemiddelde",
    typeOfMovingAverageTooltip: "Type voortschrijdend gemiddelde.",
    simpleMa: "Simpel voortschrijdend gemiddelde",
    exponentialMa: "Exponentieel voortschrijdend gemiddelde",
    lookbackPeriod: "Lookback Periode",
    lookbackPeriodTooltip: "Observatieperiode voor signalen.",
    months10: "10 maanden",
    months12: "12 maanden",
    days200: "200 dagen",
    stopLoss: "Stop Loss",
    stopLossTooltip: "Maximaal acceptabel verlies.",
    noStopLoss: "Geen stop-loss",
    trailingStopLoss: "Trailing stop-loss",
    tradingFrequency: "Handelsfrequentie",
    tradingFrequencyTooltip: "Hoe vaak signalen worden gecontroleerd.",
    monthly: "Maandelijks",
    weekly: "Wekelijks",
    daily: "Dagelijks",
    signalAsset: "Signaal Actief",
    signalAssetTooltip: "Geadviseerd actief voor signalen.",
    sameAsInvestment: "Zelfde als investering",
    tradeExecution: "Transactie-uitvoering",
    tradeExecutionTooltip: "Moment van uitvoering.",
    tradeAtEndOfMonth: "Handel tegen slotkoers",
    tradeAtNextMonthOpen: "Handel tegen openingskoers volgende maand",
    tickers: "Tickers",
    tickersTooltip: "Lijst met tickersymbolen.",
    tickersPlaceholder: "Tickersymbolen (gescheiden door komma's)...",
    singleAbsoluteMomentum: "Enkel absoluut momentum",
    singleAbsoluteMomentumTooltip: "Absoluut momentum toepassen op de hele portefeuille.",
    performancePeriods: "Prestatieperioden",
    performancePeriodsTooltip: "Momentum berekenen over perioden.",
    singlePeriod: "Enkele periode",
    multiplePeriods: "Meerdere perioden",
    lookbackPeriodMom: "Lookback Periode",
    months6: "6 maanden",
    months3: "3 maanden",
    months1: "1 maand",
    excludePreviousMonth: "Vorige maand uitsluiten",
    excludePreviousMonthTooltip: "Vorige maand uitsluiten om korte termijn mean reversion te voorkomen.",
    assetsToHold: "Aantal activa te houden",
    assetsToHoldTooltip: "Maximaal aantal gelijktijdig te houden activa.",
    allocationWeights: "Allocatiegewichten",
    allocationWeightsTooltip: "Methode om kapitaal te verdelen.",
    equalWeight: "Gelijk gewicht",
    inverseVolatility: "Inverse volatiliteit",
    volatilityPeriod: "Volatilitetsperiode",
    volatilityPeriodTooltip: "Observatieperiode voor historische volatiliteit.",
    riskParity: "Risk Parity",
    minimumVariance: "Minimum Variantie",
    asset: "Activa",
    addMoreAssets: "+ Activa toevoegen",
    confirmDelete: "Bevestigen?",
    delete: "Verwijderen",
    loadButton: "Laden",
    year: "Jaar"
  },
  es: {
    modifyConfig: "Modificar configuración",
    portfolio: "Cartera",
    initial: "Inicial",
    final: "Final",
    bestWorst: "Mejor / Peor",
    since: "Desde",
    dotcom: "Crisis de las Dotcom",
    gfc: "Crisis Financiera Global",
    covid: "Impacto de la Pandemia COVID-19",
    inflation: "Pico de Inflación y Ajuste Global",
    outsideScope: "FUERA DE RANGO",
    heatmap: "Mapa de Calor Mensual",
    assetAllocation: "Asignación de Activos",
    assetAllocDetails: "Detalles de Asignación de Activos",
    title: "Asignación Táctica",
    badge: "Suite Momentum",
    description: "La asignación táctica consiste en ajustar activamente la composición de una cartera para aprovechar las anomalías del mercado a corto o medio plazo.",
    simulator: "Simulador",
    savedScenarios: "Escenarios Guardados",
    tabSeasonal: "Modelo Estacional",
    tabMaSingle: "Medias Móviles - Activo Único",
    tabMaPortfolio: "Medias Móviles - Cartera",
    tabMomRelative: "Momentum - Fuerza Relativa",
    tabMomDual: "Momentum - Doble Momentum",
    tabMomAdaptive: "Momentum - Asignación Adaptativa",
    savedStrategies: "Estrategias Guardadas",
    total: "Total",
    noSavedYet: "No hay estrategias guardadas aún.",
    activateSavedScenarios: "Activar escenarios guardados",
    loginToSave: "Inicie sesión para guardar sus estrategias.",
    loadingStrategies: "Cargando estrategias...",
    strategyParameters: "Parámetros de la Estrategia",
    parameters: "Parámetros",
    portfolioAssets: "Activos de la Cartera",
    timePeriod: "Período de Tiempo",
    timePeriodTooltip: "Seleccione el modo de período.",
    yearToYear: "Año a Año",
    monthToMonth: "Mes a Mes",
    startYearLabel: "Año de Inicio",
    startYearTooltip: "Año de inicio del backtest.",
    endYearLabel: "Año de Fin",
    endYearTooltip: "Año de fin del backtest.",
    includeYtd: "Incluir YTD",
    includeYtdTooltip: "Incluir año en curso.",
    yes: "Sí",
    no: "No",
    initialAmountLabel: "Monto Inicial",
    initialAmountTooltip: "El capital de inversión inicial.",
    brokerLabel: "Comisiones del Broker",
    brokerTooltip: "Comisiones simuladas.",
    noFee: "Sin comisiones (0€)",
    otherCustom: "Otro / Personalizado",
    customFeeLabel: "Comisión por orden",
    cashflowsLabel: "Flujos de Efectivo",
    cashflowsTooltip: "Contribuciones o retiros regulares.",
    none: "Ninguno",
    contributeFixed: "Contribuir monto fijo",
    withdrawFixed: "Retirar monto fijo",
    outOfMarketStartMonth: "Mes de salida del mercado",
    outOfMarketStartMonthTooltip: "Mes para salir del mercado.",
    outOfMarketEndMonth: "Mes de reingreso al mercado",
    outOfMarketEndMonthTooltip: "Mes para volver a entrar al mercado.",
    outOfMarketAsset: "Activo fuera de mercado",
    outOfMarketAssetTooltip: "Activo refugio cuando se sale del mercado.",
    leverageType: "Tipo de apalancamiento",
    leverageTypeTooltip: "Uso de apalancamiento o margen.",
    marginFactor: "Factor de Margen",
    margin: "Margen",
    comparedAllocation: "Asignación Comparada",
    comparedAllocationTooltip: "Asignación de referencia.",
    defaultAlloc: "Por Defecto",
    customAlloc: "Personalizada",
    benchmarkLabel: "Benchmark",
    benchmarkTooltip: "Índice de referencia.",
    buySignal: "Señal de Compra",
    buySignalTooltip: "Condición para señal de compra.",
    priceGteMa: "Precio >= Media móvil",
    priceGtMa: "Precio > Media móvil",
    typeOfMovingAverage: "Tipo de Media Móvil",
    typeOfMovingAverageTooltip: "Método de suavizado de media móvil.",
    simpleMa: "Media Móvil Simple",
    exponentialMa: "Media Móvil Exponencial",
    lookbackPeriod: "Período retrospectivo",
    lookbackPeriodTooltip: "Período para calcular señales.",
    months10: "10 meses",
    months12: "12 meses",
    days200: "200 días",
    stopLoss: "Stop Loss",
    stopLossTooltip: "Nivel de pérdida tolerado antes de liquidar.",
    noStopLoss: "Sin stop-loss",
    trailingStopLoss: "Stop-loss suiveur",
    tradingFrequency: "Frecuencia de Operaciones",
    tradingFrequencyTooltip: "Frecuencia con la que se verifican señales.",
    monthly: "Mensual",
    weekly: "Semanal",
    daily: "Diario",
    signalAsset: "Activo de Señal",
    signalAssetTooltip: "Activo observado para señales.",
    sameAsInvestment: "Igual que la inversión",
    tradeExecution: "Ejecución de Orden",
    tradeExecutionTooltip: "Momento de ejecución.",
    tradeAtEndOfMonth: "Negociar al precio de fin de mes",
    tradeAtNextMonthOpen: "Negociar a la apertura del mes siguiente",
    tickers: "Tickers",
    tickersTooltip: "Lista de símbolos.",
    tickersPlaceholder: "Símbolos de tickers (separados por comas)...",
    singleAbsoluteMomentum: "Momentum absoluto único",
    singleAbsoluteMomentumTooltip: "Aplicar momentum absoluto a toda la cartera.",
    performancePeriods: "Períodos de Rendimiento",
    performancePeriodsTooltip: "Calcular momentum sobre períodos.",
    singlePeriod: "Período Único",
    multiplePeriods: "Múltiples Períodos",
    lookbackPeriodMom: "Período retrospectivo",
    months6: "6 meses",
    months3: "3 meses",
    months1: "1 mes",
    excludePreviousMonth: "Excluir mes anterior",
    excludePreviousMonthTooltip: "Excluir mes anterior para evitar mean reversion.",
    assetsToHold: "Activos a mantener",
    assetsToHoldTooltip: "Máximo de activos a mantener.",
    allocationWeights: "Pesos de Asignación",
    allocationWeightsTooltip: "Método de distribución de capital.",
    equalWeight: "Equitativo",
    inverseVolatility: "Volatilidad Inversa",
    volatilityPeriod: "Período de Volatilidad",
    volatilityPeriodTooltip: "Período de observación de volatilidad.",
    riskParity: "Paridad de Riesgo",
    minimumVariance: "Mínima Varianza",
    asset: "Activo",
    addMoreAssets: "+ Añadir más activos",
    confirmDelete: "¿Confirmar?",
    delete: "Eliminar",
    loadButton: "Cargar",
    year: "Año"
  }
};

export function TacticalAllocation() {
  const { t, language } = useTranslation();
  const currentLabels = localLabels[language] || localLabels["en"];
  const [user] = useAuthState(auth);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useLocalStorage("ta_activeTab", "seasonal");
  const [saveName, setSaveName] = useState("");
  const [activeMainView, setActiveMainView] = useState<"simulator" | "dashboard">("simulator");
  const [configsLoading, setConfigsLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [results, setResults] = useState<any[] | null>(null);
  const [activeResIdx, setActiveResIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [startYear, setStartYear] = useLocalStorage("ta_startYear", 2010);
  const [endYear, setEndYear] = useLocalStorage("ta_endYear", 2025);
  const [initialAmount, setInitialAmount] = useLocalStorage(
    "ta_initialAmount",
    10000,
  );
  const [broker, setBroker] = useLocalStorage("ta_broker", "free");
  const [customFee, setCustomFee] = useLocalStorage("ta_customFee", 1.5);
  const [timePeriod, setTimePeriod] = useLocalStorage("ta_timePeriod", "year");
  const [includeYtd, setIncludeYtd] = useLocalStorage("ta_includeYtd", "no");
  const [cashflowType, setCashflowType] = useLocalStorage<"none" | "contribute" | "withdraw">("ta_cashflowType", "none");
  const [cashflowAmount, setCashflowAmount] = useLocalStorage("ta_cashflowAmount", 500);
  const [cashflowFrequency, setCashflowFrequency] = useLocalStorage<"monthly" | "annually">("ta_cashflowFrequency", "monthly");

  const [maPortfolioAssets, setMaPortfolioAssets] = useLocalStorage(
    "ta_maPortfolioAssets_v2", [
      { symbol: "VFINX", alloc: "60" },
      { symbol: "VBMFX", alloc: "40" },
      { symbol: "VGTSX", alloc: "0" },
      { symbol: "VGSIX", alloc: "0" },
      { symbol: "GLD", alloc: "0" },
    ],
  );
  const [adaptivePortfolioAssets, setAdaptivePortfolioAssets] = useLocalStorage(
    "ta_adaptivePortfolioAssets_v2", [
      { symbol: "VFINX", alloc: "40" },
      { symbol: "VGTSX", alloc: "20" },
      { symbol: "VBMFX", alloc: "40" },
      { symbol: "VGSIX", alloc: "0" },
      { symbol: "GLD", alloc: "0" },
    ],
  );

  const [relativeTickers, setRelativeTickers] = useLocalStorage(
    "ta_relativeTickers",
    "VFINX, VGTSX, VBMFX",
  );
  const [dualTickers, setDualTickers] = useLocalStorage(
    "ta_dualTickers",
    "VFINX, VGTSX, VBMFX",
  );
  const [adaptiveTickers, setAdaptiveTickers] = useLocalStorage(
    "ta_adaptiveTickers",
    "VFINX, VGTSX, VBMFX, CASH",
  );
  const [momLookback, setMomLookback] = useLocalStorage("ta_momLookback", 12);
  const [momTopK, setMomTopK] = useLocalStorage("ta_momTopK", 1);
  const [momSafeAsset, setMomSafeAsset] = useLocalStorage(
    "ta_momSafeAsset",
    "CASH",
  );
  const [momOutMarket, setMomOutMarket] = useLocalStorage(
    "ta_momOutMarket",
    true,
  );
  const [targetVolatility, setTargetVolatility] = useLocalStorage(
    "ta_targetVolatility",
    10,
  );
  const [pe10Equity, setPe10Equity] = useLocalStorage("ta_pe10Equity", "VFINX");
  const [pe10Bond, setPe10Bond] = useLocalStorage("ta_pe10Bond", "VBMFX");
  const [maSingleAsset, setMaSingleAsset] = useLocalStorage(
    "ta_maSingleAsset",
    "VFINX",
  );
  const [maSingleMonths, setMaSingleMonths] = useLocalStorage(
    "ta_maSingleMonths",
    10,
  );

  const [portfolioNames, setPortfolioNames] = useLocalStorage<
    { id: string; name: string }[]
  >(
    "ta_portfolioNames_v8",
    [
      { id: "1", name: "Portfolio 1" },
      { id: "2", name: "Portfolio 2" },
      { id: "3", name: "Portfolio 3" },
    ]
  );

  const [portfolioAssets, setPortfolioAssets] = useLocalStorage<
    { symbol: string; weights: string[] }[]
  >(
    "ta_portfolioAssets_v8",
    [
      { symbol: "VTI", weights: ["60", "30", "100"] },
      { symbol: "BND", weights: ["40", "0", "0"] },
      { symbol: "TLT", weights: ["0", "40", "0"] },
      { symbol: "IEF", weights: ["0", "15", "0"] },
      { symbol: "GLD", weights: ["0", "15", "0"] },
    ]
  );

  const addPortfolio = () => {
    if (portfolioNames.length >= 6) return;
    const newId = (
      Math.max(0, ...portfolioNames.map((p) => Number(p.id) || 0)) + 1
    ).toString();
    setPortfolioNames([
      ...portfolioNames,
      { id: newId, name: `${t("pb.portfolio") || "Portfolio"} ${portfolioNames.length + 1}` },
    ]);
    setPortfolioAssets(
      portfolioAssets.map((asset) => ({
        ...asset,
        weights: [...asset.weights, "0"],
      })),
    );
  };

  const removePortfolio = (idx: number) => {
    if (portfolioNames.length <= 1) return;
    setPortfolioNames(portfolioNames.filter((_, i) => i !== idx));
    setPortfolioAssets(
      portfolioAssets.map((asset) => ({
        ...asset,
        weights: asset.weights.filter((_, i) => i !== idx),
      })),
    );
  };

  const updatePortfolioName = (idx: number, name: string) => {
    const newNames = [...portfolioNames];
    newNames[idx] = { ...newNames[idx], name };
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

  const updateAssetSymbol = (aIdx: number, symbol: string) => {
    const newAssets = [...portfolioAssets];
    newAssets[aIdx] = { ...newAssets[aIdx], symbol };
    setPortfolioAssets(newAssets);
  };

  const updateAssetWeight = (aIdx: number, pIdx: number, weight: string) => {
    const newAssets = [...portfolioAssets];
    const newWeights = [...newAssets[aIdx].weights];
    newWeights[pIdx] = weight;
    newAssets[aIdx] = { ...newAssets[aIdx], weights: newWeights };
    setPortfolioAssets(newAssets);
  };

  const lazyPortfolios = [
    {
      name: "Balanced (60/40)",
      allocations: [
        { symbol: "VTI", weight: 60 },
        { symbol: "BND", weight: 40 },
      ],
    },
    {
      name: "All-Weather (Dalio)",
      allocations: [
        { symbol: "VTI", weight: 30 },
        { symbol: "TLT", weight: 40 },
        { symbol: "IEF", weight: 15 },
        { symbol: "GLD", weight: 7.5 },
        { symbol: "PDBC", weight: 7.5 },
      ],
    },
    {
      name: "Warren Buffett",
      allocations: [
        { symbol: "VTI", weight: 90 },
        { symbol: "BND", weight: 10 },
      ],
    },
    {
      name: "Permanent Portfolio",
      allocations: [
        { symbol: "VTI", weight: 25 },
        { symbol: "TLT", weight: 25 },
        { symbol: "GLD", weight: 25 },
        { symbol: "BIL", weight: 25 },
      ],
    },
  ];

  const applyPredefinedPortfolio = (preset: {
    name: string;
    allocations: { symbol: string; weight: number }[];
  }) => {
    if (portfolioNames.length >= 6) return;
    const newId = (
      Math.max(0, ...portfolioNames.map((p) => Number(p.id) || 0)) + 1
    ).toString();
    const newPIdx = portfolioNames.length;
    const updatedNames = [...portfolioNames, { id: newId, name: preset.name }];
    setPortfolioNames(updatedNames);

    const existingSymbols = portfolioAssets.map((a) => a.symbol.toUpperCase());
    const newAssets = [...portfolioAssets];

    preset.allocations.forEach((alloc) => {
      const symbolUpper = alloc.symbol.toUpperCase();
      const existingIdx = existingSymbols.indexOf(symbolUpper);
      if (existingIdx >= 0) {
        const w = [...newAssets[existingIdx].weights];
        w[newPIdx] = alloc.weight.toString();
        newAssets[existingIdx] = { ...newAssets[existingIdx], weights: w };
      } else {
        const w = Array(newPIdx).fill("0");
        w.push(alloc.weight.toString());
        newAssets.push({ symbol: alloc.symbol, weights: w });
        existingSymbols.push(symbolUpper);
      }
    });

    const normalized = newAssets.map((a) => {
      const w = [...a.weights];
      while (w.length < updatedNames.length) {
        w.push("0");
      }
      return { ...a, weights: w };
    });

    setPortfolioAssets(normalized);
  };

  const renderPortfolioAssetsTable = () => (
    <div className="pt-6 border-t border-border space-y-6 mt-8">
      {/* Simple Clean Suggested Model Portfolios Pill Bar */}
      <div className="pt-2 border-t border-border mt-2 w-full mb-6">
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <Activity size={14} className="text-pv-blue" />
            {t("aa.sugg") || "Suggested Portfolios"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {lazyPortfolios.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const assets = preset.allocations || [];
                  applyPredefinedPortfolio({
                    name: preset.name,
                    allocations: assets.map((a: any) => ({ symbol: a.symbol, weight: a.weight }))
                  });
                }}
                disabled={portfolioNames.length >= 6}
                className="text-xs bg-surface-2 border border-border px-3.5 py-1.5 rounded-xl hover:border-pv-blue hover:text-pv-blue transition-all transform hover:scale-105 disabled:opacity-50 font-semibold shadow-sm cursor-pointer"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header & Add Portfolio Button */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pv-blue/10 flex items-center justify-center border border-pv-blue/20">
            <Database size={14} className="text-pv-blue" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text flex items-center gap-2">
              {currentLabels.portfolioAssets || "Portfolio Assets"}
            </h3>
          </div>
        </div>
        <button
          onClick={addPortfolio}
          disabled={portfolioNames.length >= 6}
          className="text-xs bg-gradient-to-r from-sky-500/10 to-blue-500/10 text-sky-500 px-4 py-2 border border-sky-500/30 rounded-2xl font-bold hover:from-sky-500/20 hover:to-blue-500/20 transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          + {t("pb.add") || "Add Portfolio"}
        </button>
      </div>

      {/* Main Portfolio Table */}
      <div className="w-full max-w-full mx-auto overflow-x-auto bg-surface rounded-[2rem] border border-border mt-4 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[280px] lg:min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="py-2.5 px-2.5 text-xs lg:text-sm font-semibold text-text w-auto whitespace-nowrap">
                {currentLabels.asset || "Asset"}
              </th>
              <th className="py-2.5 px-2.5 min-w-[320px] lg:min-w-[400px] w-80 lg:w-96 border-r border-border font-semibold text-text text-xs lg:text-sm whitespace-nowrap">
                Ticker & Name
              </th>
              {portfolioNames.map((pn, i) => (
                <th
                  key={pn.id}
                  className="p-3.5 text-base font-semibold min-w-[140px] text-center group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      value={pn.name}
                      onChange={(e) => updatePortfolioName(i, e.target.value)}
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
            {portfolioAssets.map((asset, aIdx) => {
              const assetName = ASSET_DATA[asset.symbol.toUpperCase()]?.label || "";
              return (
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
                        + {currentLabels.addMoreAssets || "Add More"}
                      </button>
                    )}
                  </td>
                  <td className="py-2 pl-1 pr-2.5 border-r border-border min-w-[320px] lg:min-w-[420px]">
                    <div className="flex items-center gap-2 w-full">
                      <div className="relative flex items-center shadow-sm w-40 bg-surface-2 border border-border rounded-[1.5rem] px-3 py-1.5 shrink-0">
                        <TickerInput
                          value={asset.symbol}
                          onChange={(val) => updateAssetSymbol(aIdx, val)}
                          placeholder="e.g. VTI"
                          className="bg-transparent text-xs border-0 outline-none focus:ring-0 w-full box-border font-mono font-bold"
                        />
                        <Search className="w-3.5 h-3.5 text-text-3 shrink-0 ml-1" />
                      </div>
                      {assetName ? (
                        <span className="text-xs text-pv-blue font-semibold truncate flex-1 leading-tight" title={assetName}>
                          {assetName}
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
                          onChange={(e) => updateAssetWeight(aIdx, i, e.target.value)}
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
              );
            })}
            {/* Totals Row */}
            <tr className="bg-surface-2 font-bold">
              <td className="p-3.5 text-sm lg:text-base font-bold text-text" colSpan={2}>
                {t("aa.totals") || "Total Allocation"}
              </td>
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
    </div>
  );

  const updateMaPortfolioAsset = (
    index: number,
    field: "symbol" | "alloc",
    value: string,
  ) => {
    const newAssets = [...maPortfolioAssets];
    newAssets[index][field] = value;
    setMaPortfolioAssets(newAssets);
  };

  const updateAdaptiveAsset = (
    index: number,
    field: "symbol" | "alloc",
    value: string,
  ) => {
    const newAssets = [...adaptivePortfolioAssets];
    newAssets[index][field] = value;
    setAdaptivePortfolioAssets(newAssets);
  };

  const tabs = [
    { id: "seasonal", label: currentLabels.tabSeasonal || "Seasonal Model" },
    { id: "ma_single", label: currentLabels.tabMaSingle || "Moving Averages - Single Asset" },
    { id: "ma_portfolio", label: currentLabels.tabMaPortfolio || "Moving Averages - Portfolio Assets" },
    { id: "mom_relative", label: currentLabels.tabMomRelative || "Momentum - Relative Strength" },
    { id: "mom_dual", label: currentLabels.tabMomDual || "Momentum - Dual Momentum" },
    { id: "mom_adaptive", label: currentLabels.tabMomAdaptive || "Momentum - Adaptive Allocation" },
  ];

  const handleCloudLoad = (data: any) => {
    if (!data) return;
    if (data.activeTab) setActiveTab(data.activeTab);
    if (data.startYear) setStartYear(data.startYear);
    if (data.endYear) setEndYear(data.endYear);
    if (data.initialAmount) setInitialAmount(data.initialAmount);
    if (data.broker) setBroker(data.broker);
    if (data.customFee) setCustomFee(data.customFee);
    
    if (data.activeTab === "ma_portfolio" && data.maPortfolioAssets) {
      setMaPortfolioAssets(data.maPortfolioAssets);
    }
    if (data.activeTab === "mom_adaptive" && data.adaptivePortfolioAssets) {
      setAdaptivePortfolioAssets(data.adaptivePortfolioAssets);
    }
    
    setActiveMainView("simulator");
    setTimeout(() => {
      handleRunBacktest();
    }, 100);
  };

  const handleSaveConfig = async () => {
    // This is handled by CloudSaveLoad but we might want a shortcut
  };

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
        .filter((c: any) => c.pageId === "tactical-allocation");
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
        <div className="bg-surface border border-border p-12 rounded-[2rem] text-center max-w-2xl mx-auto my-12 shadow-sm flex flex-col items-center gap-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-pv-blue/10 flex items-center justify-center text-pv-blue">
            <Database size={32} />
          </div>
          <h2 className="text-xl font-bold text-text">
            {isEn ? "Activate Saved Scenarios" : "Activer les scénarios sauvegardés"}
          </h2>
          <p className="text-sm text-text-2 leading-relaxed">
            {isEn 
              ? "Log in to save your tactical allocation strategies and access them from anywhere."
              : "Connectez-vous pour sauvegarder vos stratégies d'allocation tactique et y accéder de n'importe où."}
          </p>
        </div>
      );
    }

    if (configsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-4 border-pv-blue/30 border-t-pv-blue rounded-full animate-spin" />
          <p className="text-text-3 font-medium animate-pulse">
            {isEn ? "Loading your strategies..." : "Chargement de vos stratégies..."}
          </p>
        </div>
      );
    }

    // Advanced Stats Calculations
    const totalCount = savedConfigs.length;
    let bestCagr = 0;
    let bestCagrName = "";
    let bestSharpe = 0;
    let bestSharpeName = "";

    savedConfigs.forEach(c => {
      if (c.data?.resultsSummary) {
        c.data.resultsSummary.forEach((r: any) => {
          const cagrVal = Number(r.cagr) || 0;
          const sharpeVal = Number(r.sharpe) || 0;
          
          if (cagrVal > bestCagr) {
            bestCagr = cagrVal;
            bestCagrName = `${c.name} (${r.name})`;
          }
          if (sharpeVal > bestSharpe) {
            bestSharpe = sharpeVal;
            bestSharpeName = `${c.name} (${r.name})`;
          }
        });
      }
    });

    const recommendations: any[] = [];
    let hasMom = false;
    let hasMa = false;

    savedConfigs.forEach(c => {
      const tab = c.data?.activeTab;
      if (tab?.includes("mom") || tab?.includes("momentum")) {
        hasMom = true;
      }
      if (tab?.includes("ma") || tab?.includes("moving")) {
        hasMa = true;
      }
    });

    if (hasMom) {
      recommendations.push({
        type: "warning",
        title: isEn ? "Momentum Reversal Risk" : "Risque de retournement du momentum",
        text: isEn 
          ? "Momentum-based strategies can suffer severe drawdowns during abrupt regime shifts (momentum crashes). Ensure you include a low-correlation cash or treasury component to filter sudden bear market entries."
          : "Les stratégies de momentum peuvent subir des pertes importantes lors de retournements brutaux. Intégrez un filtre monétaire ou obligataire pour amortir ces phases."
      });
    }

    if (hasMa) {
      recommendations.push({
        type: "tip",
        title: isEn ? "Whipsaw / Sideways Chop mitigation" : "Limiter l'effet de whipsaw",
        text: isEn
          ? "Moving average crossovers can trigger excessive trades in a directionless sideways market. Consider utilizing standard exponential moving averages (EMA) or buffer zones to filter minor price oscillations."
          : "Les croisements de moyennes mobiles peuvent générer de faux signaux sur un marché latéral sans tendance. Utilisez des filtres d'écart ou des moyennes exponentielles."
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "tip",
        title: isEn ? "Seasonality & Execution Costs" : "Saisonnalité & Frais d'exécution",
        text: isEn
          ? "Tactical allocation involves active rebalancing which incurs transaction fees and slippage. Configure the realistic broker commission settings in your backtest to verify net strategy outperformance."
          : "L'allocation tactique implique un rééquilibrage actif générateur de frais de courtage. Configurez des frais réalistes dans le simulateur pour évaluer la surperformance nette."
      });
    }

    const formatVal = (n: number) => {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n).replace(/,/g, " ");
    };

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
              {isEn ? "Total Strategies" : "Stratégies totales"}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-text">{totalCount}</p>
              <p className="text-[11px] text-text-4 font-medium mt-1">
                {isEn ? "Tactical setups stored in cloud" : "Modèles tactiques enregistrés"}
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-500">
              {isEn ? "Best CAGR Rate" : "Meilleur TCAC (CAGR)"}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-emerald-600">
                {bestCagr > 0 ? `${bestCagr.toFixed(2)}%` : "N/A"}
              </p>
              <p className="text-[11px] text-text-4 font-medium truncate mt-1" title={bestCagrName}>
                {bestCagrName || (isEn ? "No results generated" : "Aucun résultat généré")}
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-500">
              {isEn ? "Best Sharpe Ratio" : "Meilleur ratio de Sharpe"}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-indigo-600">
                {bestSharpe > 0 ? bestSharpe.toFixed(2) : "N/A"}
              </p>
              <p className="text-[11px] text-text-4 font-medium truncate mt-1" title={bestSharpeName}>
                {bestSharpeName || (isEn ? "No results generated" : "Aucun résultat généré")}
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
                {isEn ? "Saved Strategies" : "Stratégies sauvegardées"}
              </h3>
              <span className="text-xs font-bold bg-pv-blue/10 text-pv-blue px-2.5 py-1 rounded-full">
                {savedConfigs.length} {isEn ? "Stored" : "Enregistrées"}
              </span>
            </div>

            <div className="divide-y divide-border overflow-x-auto">
              {savedConfigs.length === 0 ? (
                <div className="p-12 text-center text-text-4 font-medium">
                  {isEn 
                    ? "No saved strategies yet. Save your parameters in the simulator."
                    : "Aucune stratégie enregistrée. Sauvegardez vos paramètres dans le simulateur."}
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-2 text-text-3 font-semibold text-xs border-b border-border">
                      <th className="p-4 pl-6">{isEn ? "Strategy Name" : "Nom de la stratégie"}</th>
                      <th className="p-4">{isEn ? "Date Created" : "Date de création"}</th>
                      <th className="p-4">{isEn ? "Model Type" : "Type de modèle"}</th>
                      <th className="p-4">{isEn ? "Starting Capital" : "Capital initial"}</th>
                      <th className="p-4">{isEn ? "Max CAGR" : "CAGR Max"}</th>
                      <th className="p-4 pr-6 text-right">{isEn ? "Actions" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-medium text-text-2">
                    {savedConfigs.map((config) => {
                      const tab = config.data?.activeTab || "N/A";
                      const initAmt = config.data?.initialAmount 
                        ? `$${formatVal(config.data.initialAmount)}` 
                        : "N/A";
                      
                      const maxCagrObj = config.data?.resultsSummary?.reduce(
                        (max: number, r: any) => (r.cagr > max ? r.cagr : max), 
                        0
                      );
                      const maxCagrText = maxCagrObj !== undefined && maxCagrObj > 0
                        ? `${maxCagrObj.toFixed(2)}%` 
                        : "N/A";

                      const modelNames: Record<string, string> = {
                        ma_single: isEn ? "Single Asset MA" : "Moyenne Mobile Unique",
                        ma_portfolio: isEn ? "Portfolio MA" : "Moyenne Mobile Portefeuille",
                        seasonal: isEn ? "Seasonal Swaps" : "Saisonnier (Sell in May)",
                        mom_relative: isEn ? "Relative Strength" : "Force Relative (Momentum)",
                        dual_momentum: isEn ? "Dual Momentum" : "Momentum Double",
                        adaptive: isEn ? "Adaptive Allocation" : "Allocation Adaptive",
                      };

                      return (
                        <tr key={config.id} className="hover:bg-surface-2/60 transition-colors">
                          <td className="p-4 pl-6 font-bold text-text text-sm">
                            {config.name}
                          </td>
                          <td className="p-4">
                            {formatDate(config.createdAt)}
                          </td>
                          <td className="p-4 font-semibold text-pv-blue">
                            {modelNames[tab] || tab}
                          </td>
                          <td className="p-4 font-mono">
                            {initAmt}
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {maxCagrText}
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
                {isEn ? "Tactical Guidelines" : "Conseils tactiques"}
              </h3>
              <p className="text-[10px] text-text-3 font-medium mt-1">
                {isEn 
                  ? "Execution and structural trading analysis"
                  : "Analyse d'exécution et de structure de trading"}
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
  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const initialAmount = 10000;
      let currentAssets: { symbol: string; weight: number }[] = [];
      let tacticalModel: any = null;

      if (activeTab === "ma_single") {
        tacticalModel = {
          type: "moving_average",
          movingAverageMonths: maSingleMonths,
          safeAsset: momSafeAsset,
        };
      } else if (activeTab === "ma_portfolio") {
        tacticalModel = {
          type: "moving_average",
          movingAverageMonths: 10,
          safeAsset: momSafeAsset,
        };
      } else if (activeTab === "seasonal") {
        tacticalModel = {
          type: "seasonal",
          outOfMarketStartMonth: 5,
          outOfMarketEndMonth: 10,
          safeAsset: momSafeAsset,
        };
      } else if (activeTab === "mom_relative") {
        const symbols = relativeTickers
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        currentAssets = symbols.map((s) => ({
          symbol: s,
          weight: 1 / (symbols.length || 1),
        }));
        tacticalModel = {
          type: "relative_momentum",
          lookbackMonths: momLookback,
          topK: momTopK,
        };
      } else if (activeTab === "mom_dual") {
        const symbols = dualTickers
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        currentAssets = symbols.map((s) => ({
          symbol: s,
          weight: 1 / (symbols.length || 1),
        }));
        tacticalModel = {
          type: "dual_momentum",
          lookbackMonths: momLookback,
          safeAsset: momSafeAsset,
        };
      } else if (activeTab === "mom_adaptive") {
        const symbols = adaptiveTickers
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        currentAssets = symbols.map((s) => ({
          symbol: s,
          weight: 1 / (symbols.length || 1),
        }));
        tacticalModel = {
          type: "adaptive_allocation",
          lookbackMonths: momLookback,
          volatilityMonths: 6,
        };
      } else if (activeTab === "valuation_pe10") {
        currentAssets = [
          { symbol: pe10Equity, weight: 0.6 },
          { symbol: pe10Bond, weight: 0.4 },
        ];
        tacticalModel = {
          type: "pe10",
          baselineEquity: pe10Equity,
          baselineBond: pe10Bond,
        };
      } else if (activeTab === "target_volatility") {
        currentAssets = [{ symbol: pe10Equity, weight: 1.0 }];
        tacticalModel = {
          type: "target_volatility",
          targetVolatility: targetVolatility / 100,
          safeAsset: momSafeAsset,
          lookbackMonths: momLookback,
        };
      } else {
        currentAssets = [
          { symbol: "VFINX", weight: 0.6 },
          { symbol: "VBMFX", weight: 0.4 },
        ];
      }

      let enginePortfolios: any[] = [];
      if (["seasonal", "ma_single", "ma_portfolio"].includes(activeTab)) {
        enginePortfolios = portfolioNames.map((pn, pIdx) => {
          const total = portfolioAssets.reduce(
            (sum, a) => sum + (parseFloat(a.weights[pIdx] || "0") || 0),
            0
          ) || 1;
          let assetsForP = portfolioAssets
            .filter((a) => a.symbol && parseFloat(a.weights[pIdx] || "0") > 0)
            .map((a) => ({
              symbol: a.symbol.toUpperCase(),
              weight: (parseFloat(a.weights[pIdx] || "0") || 0) / (total || 1),
            }));
          if (assetsForP.length === 0) {
            assetsForP = [{ symbol: "SPY", weight: 1.0 }];
          }
          return {
            id: `tactical-${pIdx + 1}`,
            name: pn.name,
            allocations: assetsForP,
            tacticalModel,
          };
        });
      } else {
        enginePortfolios = [
          {
            id: "tactical-1",
            name: "Tactical Allocation",
            allocations: currentAssets,
            tacticalModel,
          },
        ];
      }

      const engineOptions = {
        initialBalance: initialAmount,
        startDate: `${startYear}-01-01`,
        endDate: `${endYear}-12-31`,
        rebalanceFrequency: "annually" as const,
        cashflowAmount: cashflowType === "none" ? 0 : (cashflowType === "withdraw" ? -Math.abs(cashflowAmount) : Math.abs(cashflowAmount)),
        cashflowFrequency: cashflowType === "none" ? "none" as const : (cashflowFrequency as any),
        reinvestDividends: true,
        dividendTaxRate: 0,
        capitalGainsTaxRate: 0,
        transactionFeeAmount: broker === "custom" ? customFee : 0,
      };

      const res = await engineRunBacktest(enginePortfolios, engineOptions);

      const finalResults: any[] = res.map((r, i) => {
        const startY =
          r.equityCurve.length > 0
            ? parseInt(r.equityCurve[0].date.substring(0, 4))
            : new Date().getFullYear();
        const endY =
          r.equityCurve.length > 0
            ? parseInt(
                r.equityCurve[r.equityCurve.length - 1].date.substring(0, 4),
              )
            : new Date().getFullYear();

        const colors = ["#2c6cad", "#eab308", "#ef4444", "#10b981", "#8b5cf6"];
        const color = colors[i % colors.length];

        const yearsInteger = Array.from(
          new Set(r.equityCurve.map((e) => parseInt(e.date.split("-")[0]))),
        );
        const annualReturns: number[] = [];
        let prevYearValue = initialAmount;
        for (const yr of yearsInteger) {
          const yearData = r.equityCurve.filter((e) =>
            e.date.startsWith(yr.toString()),
          );
          if (yearData.length > 0) {
            const yearEndVal = yearData[yearData.length - 1].value;
            annualReturns.push((yearEndVal / prevYearValue - 1) * 100);
            prevYearValue = yearEndVal;
          }
        }

        const alloc: Record<string, number> = {};
        enginePortfolios[i].allocations.forEach((a) => {
          alloc[a.symbol] = a.weight * 100;
        });

        return {
          id: r.portfolioId || enginePortfolios[i].name,
          name: enginePortfolios[i].name,
          startYear: startY,
          endYear: endY,
          initialAmount: initialAmount,
          endBalance: r.metrics.endBalance,
          cagr: r.metrics.cagr * 100,
          stdev: r.metrics.volatility * 100,
          bestYear: r.metrics.bestYear * 100,
          worstYear: r.metrics.worstYear * 100,
          maxDrawdown: -r.metrics.maxDrawdown * 100,
          sharpe: r.metrics.sharpeRatio,
          sortino: r.metrics.sortinoRatio,
          balances: r.equityCurve.map((e) => e.value),
          drawdowns: r.metrics.drawdowns.map((d) => -d * 100),
          monthlyReturns: r.metrics.monthlyReturns || [],
          rolling1Y: r.metrics.rolling1Y,
          rolling3Y: r.metrics.rolling3Y,
          rolling5Y: r.metrics.rolling5Y,
          rolling10Y: r.metrics.rolling10Y,
          years: r.equityCurve.map((e) => {
            const yr = parseInt(e.date.substring(0, 4));
            const mo = parseInt(e.date.substring(5, 7));
            return yr + mo / 12;
          }),
          dates: r.equityCurve.map((e) => e.date),
          assets: r.assets?.map((a) => ({
            symbol: a.symbol,
            returns: a.monthlyReturns,
          })),
          metrics: {
            correlationMatrix: r.metrics.correlationMatrix,
            monteCarlo: r.metrics.monteCarlo,
            alpha: r.metrics.alpha,
            beta: r.metrics.beta,
            trackingError: r.metrics.trackingError,
            informationRatio: r.metrics.informationRatio,
            upCapture: r.metrics.upCapture,
            downCapture: r.metrics.downCapture,
          },
          holdingsHistory: r.equityCurve.map((e) => e.holdings || {}),
          warnings: r.warnings,
          yearsInteger,
          annualReturns,
          color,
          alloc,
        };
      });
      setResults(finalResults);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <MobileZoomWrapper scaleMobile={0.4}>
      <div className="min-h-screen bg-bg text-text selection:bg-pv-blue selection:text-white font-sans overflow-x-hidden">
      <div className="space-y-8 animate-fade-up w-full max-w-[1600px] mx-auto px-4 md:px-12 pb-24">
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("ta.title")}
            badge={t("ta.badge")}
            description={t("ta.description")}
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
              <div className="flex flex-wrap gap-2 mb-6 bg-surface-2 p-2 rounded-[2rem] border border-border/60">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 py-3 text-base font-semibold whitespace-nowrap transition-all rounded-[1.5rem] cursor-pointer",
                      activeTab === tab.id
                        ? "bg-pv-blue text-white shadow-md font-extrabold"
                        : "text-text hover:text-text hover:bg-surface-3",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <h2 className="text-base font-semibold tracking-tight text-text flex items-center gap-2">
                    <Settings size={14} className="text-pv-blue" />
                    {currentLabels.strategyParameters || "Strategy Parameters"}
                  </h2>
                  <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 w-full xl:w-auto">
                    <label className="hidden md:inline-block text-base font-semibold text-text ">
                      {t("mc.portfolio_name")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("mc.portfolio_name")}
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0.5 text-center font-bold text-text w-full max-w-[200px]"
                    />
                  </div>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <TooltipLabel
                  label={currentLabels.timePeriod || "Time Period"}
                  tooltip={
                    currentLabels.timePeriodTooltip || "Select whether the period is calculated year over year or month over month."
                  }
                />
                <CustomSelect
                  value={timePeriod}
                  onChange={(e: any) => setTimePeriod(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                >
                  <option value="year">{currentLabels.yearToYear || "Year-to-Year"}</option>
                  <option value="month">{currentLabels.monthToMonth || "Month-to-Month"}</option>
                </CustomSelect>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={currentLabels.includeYtd || "Include YTD"}
                  tooltip={
                    currentLabels.includeYtdTooltip || "Include the current year (Year-To-Date) in the calculations."
                  }
                />
                <CustomSelect
                  value={includeYtd}
                  onChange={(e: any) => setIncludeYtd(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                >
                  <option value="no">{currentLabels.no || "No"}</option>
                  <option value="yes">{currentLabels.yes || "Yes"}</option>
                </CustomSelect>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={currentLabels.startYearLabel || "Start Year"}
                  tooltip={currentLabels.startYearTooltip || "Start year of the backtest."}
                />
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={currentLabels.endYearLabel || "End Year"}
                  tooltip={currentLabels.endYearTooltip || "End year of the backtest."}
                />
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={currentLabels.initialAmountLabel || "Initial Amount"}
                  tooltip={currentLabels.initialAmountTooltip || "The initial investment capital."}
                />
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={
                    <>
                      {t("pb.broker")} / {currentLabels.parameters || "Parameters"}
                    </>
                  }
                  tooltip={
                    currentLabels.brokerTooltip || "The broker platform determines the fee structure for the simulated backtest."
                  }
                />
                <CustomSelect
                  value={broker}
                  onChange={(e: any) => setBroker(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                >
                  <option value="free">{currentLabels.noFee || "No Fee (0€)"}</option>
                  <option value="custom">{currentLabels.otherCustom || "Other / Custom"}</option>
                </CustomSelect>
                {broker === "custom" && (
                  <div className="pt-1">
                    <label className="text-xs font-bold text-text mb-1 block">
                      {t("pb.customFee")}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFee}
                      onChange={(e) => setCustomFee(Number(e.target.value))}
                      className="w-full bg-surface-2 border border-border text-text rounded-[1.5rem] px-3 py-2 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={currentLabels.cashflowsLabel || "Cashflows"}
                  tooltip={
                    currentLabels.cashflowsTooltip || "Regular contributions or withdrawals applied to the portfolio."
                  }
                />
                <CustomSelect
                  value={cashflowType}
                  onChange={(e: any) => setCashflowType(e.target.value as any)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                >
                  <option value="none">{currentLabels.none || "None"}</option>
                  <option value="contribute">{currentLabels.contributeFixed || "Contribute fixed amount"}</option>
                  <option value="withdraw">{currentLabels.withdrawFixed || "Withdraw fixed amount"}</option>
                </CustomSelect>
              </div>
              {cashflowType !== "none" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text block">
                      {currentLabels.amount || "Amount"} (€/$)
                    </label>
                    <input
                      type="number"
                      value={cashflowAmount}
                      onChange={(e) => setCashflowAmount(Number(e.target.value))}
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text block">
                      {currentLabels.frequency || "Frequency"}
                    </label>
                    <CustomSelect
                      value={cashflowFrequency}
                      onChange={(e: any) => setCashflowFrequency(e.target.value as any)}
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                    >
                      <option value="monthly">{t("aa.monthly") || "Monthly"}</option>
                      <option value="annually">{t("aa.annually") || "Annually"}</option>
                    </CustomSelect>
                  </div>
                </div>
              )}
          </div>

          {activeTab === "seasonal" && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {currentLabels.parameters || "Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.outOfMarketStartMonth || "Out Of Market Start Month"}
                      tooltip={
                        currentLabels.outOfMarketStartMonthTooltip || "Month from which to exit the market (seasonal effect)."
                      }
                    />
                    <select
                      defaultValue="May"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.outOfMarketEndMonth || "Out Of Market End Month"}
                      tooltip={
                        currentLabels.outOfMarketEndMonthTooltip || "Month from which to re-enter the market (seasonal effect)."
                      }
                    />
                    <select
                      defaultValue="Oct"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.outOfMarketAsset || "Out of Market Asset"}
                      tooltip={
                        currentLabels.outOfMarketAssetTooltip || "Safe haven asset to invest in when the signal is to exit the main market."
                      }
                    />
                    <select
                      defaultValue="Cash"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option>{currentLabels.cash || "Cash"}</option>
                      <option>{currentLabels.bil || "BIL (1-3 Month T-Bill)"}</option>
                      <option>{currentLabels.shv || "SHV (Short Term Treasuries)"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.leverageType || "Leverage Type"}
                      tooltip={
                        currentLabels.leverageTypeTooltip || "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="none">{currentLabels.none || "None"}</option>
                      <option>{currentLabels.marginFactor || "Margin Factor"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.comparedAllocation || "Compared Allocation"}
                      tooltip={
                        currentLabels.comparedAllocationTooltip || "The reference allocation used for comparison (Benchmark)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Default</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.benchmarkLabel || "Benchmark"}
                      tooltip={
                        currentLabels.benchmarkTooltip || "The benchmark index to compare overall performance."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="none">{currentLabels.none || "None"}</option>
                      <option>S&P 500</option>
                      <option>Vanguard 60/40</option>
                    </select>
                  </div>
                </div>
              </div>

              {renderPortfolioAssetsTable()}
            </>
          )}

          {(activeTab === "ma_single" || activeTab === "ma_portfolio") && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {currentLabels.parameters || "Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.outOfMarketAsset || "Out of Market Asset"}
                      tooltip={
                        currentLabels.outOfMarketAssetTooltip || "Safe haven asset to invest in when the signal is to exit the main market."
                      }
                    />
                    <select
                      defaultValue="Cash"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option>{currentLabels.cash || "Cash"}</option>
                      <option>{currentLabels.bil || "BIL (1-3 Month T-Bill)"}</option>
                      <option>{currentLabels.shv || "SHV (Short Term Treasuries)"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.buySignal || "Buy Signal"}
                      tooltip={
                        currentLabels.buySignalTooltip || "The condition necessary to trigger a buy signal."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Price &gt;= Moving average</option>
                      <option>Price &gt; Moving average</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.typeOfMovingAverage || "Type of Moving Average"}
                      tooltip={
                        currentLabels.typeOfMovingAverageTooltip || "The smoothing method (Simple or Exponential) of the moving average."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.simpleMovingAverage || "Simple Moving Average"}</option>
                      <option>{currentLabels.exponentialMovingAverage || "Exponential Moving Average"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.lookbackPeriod || "Lookback Period"}
                      tooltip={
                        currentLabels.lookbackPeriodTooltip || "The past observation period to calculate signals (e.g. 10 months, 200 days)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.months10 || "10 months"}</option>
                      <option>{currentLabels.months12 || "12 months"}</option>
                      <option>{currentLabels.days200 || "200 days"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.stopLoss || "Stop Loss"}
                      tooltip={
                        currentLabels.stopLossTooltip || "Maximum drawdown level tolerated before automatic liquidation of a position."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.noStopLoss || "No stop-loss"}</option>
                      <option>{currentLabels.trailingStopLoss || "Trailing stop-loss"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.tradingFrequency || "Trading Frequency"}
                      tooltip={
                        currentLabels.tradingFrequencyTooltip || "How often the strategy checks its signals to potentially readjust positions."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.monthly || "Monthly"}</option>
                      <option>{currentLabels.weekly || "Weekly"}</option>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.signalAsset || "Signal Asset"}
                      tooltip={
                        currentLabels.signalAssetTooltip || "The asset observed to generate market signals (may be different from the invested asset)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Same as investment</option>
                      <option>S&P 500 (SPY)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.tradeExecution || "Trade Execution"}
                      tooltip={
                        currentLabels.tradeExecutionTooltip || "Determines if the trade is executed at the closing price or at the opening of the next period."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.tradeAtEndOfMonth || "Trade at end of month price"}</option>
                      <option>{currentLabels.tradeAtNextMonthOpen || "Trade at next month open"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.leverageType || "Leverage Type"}
                      tooltip={
                        currentLabels.leverageTypeTooltip || "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="none">{currentLabels.none || "None"}</option>
                      <option>{currentLabels.marginFactor || "Margin Factor"}</option>
                    </select>
                  </div>
                </div>
              </div>

              {renderPortfolioAssetsTable()}
            </>
          )}

          {(activeTab === "mom_relative" || activeTab === "mom_dual") && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {currentLabels.parameters || "Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <TooltipLabel
                      label={currentLabels.tickers || "Tickers"}
                      tooltip={currentLabels.tickersTooltip || "List of asset symbols (tickers) to analyze."}
                    />
                    <input
                      type="text"
                      value={relativeTickers}
                      onChange={(e) => setRelativeTickers(e.target.value)}
                      placeholder="Ticker symbols (comma separated)..."
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.singleAbsoluteMomentum || "Single absolute momentum"}
                      tooltip={
                        currentLabels.singleAbsoluteMomentumTooltip || "Apply a single absolute momentum filter to the entire portfolio."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="no">{currentLabels.no || "No"}</option>
                      <option value="yes">{currentLabels.yes || "Yes"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.outOfMarketAsset || "Out of Market Asset"}
                      tooltip={
                        currentLabels.outOfMarketAssetTooltip || "Safe haven asset to invest in when the signal is to exit the main market."
                      }
                    />
                    <select
                      defaultValue="Cash"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option>{currentLabels.cash || "Cash"}</option>
                      <option>{currentLabels.bil || "BIL (1-3 Month T-Bill)"}</option>
                      <option>{currentLabels.shv || "SHV (Short Term Treasuries)"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.performancePeriods || "Performance Periods"}
                      tooltip={
                        currentLabels.performancePeriodsTooltip || "Calculate momentum over one or more performance periods."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.singlePeriod || "Single Period"}</option>
                      <option>{currentLabels.multiplePeriods || "Multiple Periods"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.lookbackPeriod || "Lookback Period"}
                      tooltip={
                        currentLabels.lookbackPeriodTooltip || "The past observation period to calculate signals (e.g. 10 months, 200 days)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.months12 || "12 months"}</option>
                      <option>{currentLabels.months6 || "6 months"}</option>
                      <option>{currentLabels.months3 || "3 months"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.excludePreviousMonth || "Exclude Previous Month"}
                      tooltip={
                        currentLabels.excludePreviousMonthTooltip || "Excludes the most recent month in momentum calculation to avoid short-term stock market mean reversion."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="no">{currentLabels.no || "No"}</option>
                      <option value="yes">{currentLabels.yes || "Yes"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.assetsToHold || "Assets to hold"}
                      tooltip={
                        currentLabels.assetsToHoldTooltip || "The maximum number of assets to hold simultaneously in the portfolio."
                      }
                    />
                    <input
                      type="number"
                      defaultValue="1"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.allocationWeights || "Allocation Weights"}
                      tooltip={
                        currentLabels.allocationWeightsTooltip || "The method to distribute capital (equal weight, risk parity, inverse volatility)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.equalWeight || "Equal Weight"}</option>
                      <option>{currentLabels.inverseVolatility || "Inverse Volatility"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.stopLoss || "Stop Loss"}
                      tooltip={
                        currentLabels.stopLossTooltip || "Maximum drawdown level tolerated before automatic liquidation of a position."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.noStopLoss || "No stop-loss"}</option>
                      <option>{currentLabels.trailingStopLoss || "Trailing stop-loss"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.tradingFrequency || "Trading Frequency"}
                      tooltip={
                        currentLabels.tradingFrequencyTooltip || "How often the strategy checks its signals to potentially readjust positions."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.monthly || "Monthly"}</option>
                      <option>{currentLabels.weekly || "Weekly"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.tradeExecution || "Trade Execution"}
                      tooltip={
                        currentLabels.tradeExecutionTooltip || "Determines if the trade is executed at the closing price or at the opening of the next period."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.tradeAtEndOfMonth || "Trade at end of month price"}</option>
                      <option>{currentLabels.tradeAtNextMonthOpen || "Trade at next month open"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.leverageType || "Leverage Type"}
                      tooltip={
                        currentLabels.leverageTypeTooltip || "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="none">{currentLabels.none || "None"}</option>
                      <option>{currentLabels.margin || "Margin"}</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "mom_adaptive" && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {currentLabels.parameters || "Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <TooltipLabel
                      label={currentLabels.tickers || "Tickers"}
                      tooltip={currentLabels.tickersTooltip || "List of asset symbols (tickers) to analyze."}
                    />
                    <input
                      type="text"
                      value={adaptiveTickers}
                      onChange={(e) => setAdaptiveTickers(e.target.value)}
                      placeholder="Ticker symbols (comma separated)..."
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.performancePeriods || "Performance Periods"}
                      tooltip={
                        currentLabels.performancePeriodsTooltip || "Calculate momentum over one or more performance periods."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.singlePeriod || "Single Period"}</option>
                      <option>{currentLabels.multiplePeriods || "Multiple Periods"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.lookbackPeriod || "Lookback Period"}
                      tooltip={
                        currentLabels.lookbackPeriodTooltip || "The past observation period to calculate signals (e.g. 10 months, 200 days)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.months12 || "12 months"}</option>
                      <option>{currentLabels.months6 || "6 months"}</option>
                      <option>{currentLabels.months3 || "3 months"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.excludePreviousMonth || "Exclude Previous Month"}
                      tooltip={
                        currentLabels.excludePreviousMonthTooltip || "Excludes the most recent month in momentum calculation to avoid short-term stock market mean reversion."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="no">{currentLabels.no || "No"}</option>
                      <option value="yes">{currentLabels.yes || "Yes"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.volatilityPeriod || "Volatility Period"}
                      tooltip={
                        currentLabels.volatilityPeriodTooltip || "Observation period to estimate recent historical volatility."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.months3 || "3 months"}</option>
                      <option>{currentLabels.months6 || "6 months"}</option>
                      <option>{currentLabels.months1 || "1 month"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.assetsToHold || "Assets to hold"}
                      tooltip={
                        currentLabels.assetsToHoldTooltip || "The maximum number of assets to hold simultaneously in the portfolio."
                      }
                    />
                    <input
                      type="number"
                      defaultValue="2"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.allocationWeights || "Allocation Weights"}
                      tooltip={
                        currentLabels.allocationWeightsTooltip || "The method to distribute capital (equal weight, risk parity, inverse volatility)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.riskParity || "Risk Parity"}</option>
                      <option>{currentLabels.minimumVariance || "Minimum Variance"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.stopLoss || "Stop Loss"}
                      tooltip={
                        currentLabels.stopLossTooltip || "Maximum drawdown level tolerated before automatic liquidation of a position."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.noStopLoss || "No stop-loss"}</option>
                      <option>{currentLabels.trailingStopLoss || "Trailing stop-loss"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.tradingFrequency || "Trading Frequency"}
                      tooltip={
                        currentLabels.tradingFrequencyTooltip || "How often the strategy checks its signals to potentially readjust positions."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.monthly || "Monthly"}</option>
                      <option>{currentLabels.weekly || "Weekly"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.tradeExecution || "Trade Execution"}
                      tooltip={
                        currentLabels.tradeExecutionTooltip || "Determines if the trade is executed at the closing price or at the opening of the next period."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>{currentLabels.tradeAtEndOfMonth || "Trade at end of month price"}</option>
                      <option>{currentLabels.tradeAtNextMonthOpen || "Trade at next month open"}</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={currentLabels.leverageType || "Leverage Type"}
                      tooltip={
                        currentLabels.leverageTypeTooltip || "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                      <option value="none">{currentLabels.none || "None"}</option>
                      <option>{currentLabels.margin || "Margin"}</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4 items-center">
            <CloudSaveLoad
              pageId="tactical-allocation"
              currentData={{
                activeTab,
                startYear,
                endYear,
                initialAmount,
                broker,
                customFee,
                maPortfolioAssets,
                adaptivePortfolioAssets,
                resultsSummary: results ? results.map(r => ({ name: r.name, cagr: r.cagr, sharpe: r.sharpe })) : []
              }}
              onLoad={handleCloudLoad}
              onListUpdate={loadSavedConfigs}
            />
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="py-3 px-8 bg-pv-blue text-white rounded-[1.5rem] text-base font-semibold hover:bg-pv-blue-l transition-colors shadow-lg shadow-pv-blue/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} fill="currentColor" />{" "}
              {isRunning ? t("pb.running") : t("pb.run")}
            </button>
          </div>
        </div>
        <div id="bt-results-anchor" className="h-4"></div>

        {(!results || results.length === 0) && (
          <div className="h-full min-h-[500px] border border-border/30 rounded-[2rem] relative overflow-hidden bg-surface-2/20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20 mix-blend-screen transition-opacity duration-1000 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-bg/50 to-bg/90"></div>
          </div>
        )}

        {results && results.length > 0 && (
          <div
            id="report-content"
            className="space-y-12 pb-24 transition-all duration-700 bg-surface-2 pt-12 border-t border-border mt-12"
          >
            <div className="w-full max-w-[1308px] mx-auto px-4 md:px-8 text-base text-text font-sans">
              {/* Header info */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-border pb-12">
                <div className="space-y-2">
                  <p className="text-text font-medium italic text-left">
                    {t("pb.simSpan")} {results[0].yearsInteger[0]} {t("pb.to")}{" "}
                    {
                      results[0].yearsInteger[
                        results[0].yearsInteger.length - 1
                      ]
                    }
                  </p>
                  {results.some((r) => r.warnings && r.warnings.length > 0) && (
                    <div className="flex flex-col gap-1 mt-4 text-gold bg-surface-3 px-4 py-2.5 rounded-[2rem] text-base font-semibold border border-gold/50 text-left">
                      {results
                        .flatMap((r) => r.warnings || [])
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((w, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-surface-3 shrink-0"></div>
                            <span>{w}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {}}
                    className="text-base font-medium text-text hover:text-text transition-colors bg-surface border border-border hover:bg-surface-2 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 "
                  >
                    {currentLabels.modifyConfig}
                  </button>
                  <button
                    onClick={() => {
                      results.forEach((r) =>
                        downloadCSV(
                          r.dates.map((d, idx) => ({
                            Date: d,
                            Balance: r.balances[idx].toFixed(2),
                            Drawdown: r.drawdowns[idx].toFixed(2) + "%",
                          })),
                          `portfolio_${r.name.replace(/\s+/g, "_")}_monthly`,
                        ),
                      );
                    }}
                    className="text-base font-medium text-text hover:text-text transition-colors bg-surface border border-border hover:bg-surface-2 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 "
                  >
                    {t("pb.export")}
                  </button>
                </div>
              </div>

              {/* Portfolio Summaries (Charts + Metrics) */}
              <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 text-left">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text tracking-tight">
                    {t("pb.portSummaries")}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-base font-sans border-collapse">
                    <thead>
                      <tr className="bg-surface-2 border-b border-border">
                        <th className="px-6 py-4 text-left font-semibold text-text">
                          {currentLabels.portfolio}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {t("pb.alloc")}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {currentLabels.initial}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {currentLabels.final}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          CAGR
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {t("pb.vol")}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {t("pb.maxDd")}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Sharpe
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Sortino
                        </th>
                        {results.some((r) => r.metrics.alpha !== undefined) && (
                          <th className="px-4 py-4 text-center font-medium text-text">
                            Alpha
                          </th>
                        )}
                        {results.some((r) => r.metrics.beta !== undefined) && (
                          <th className="px-4 py-4 text-center font-medium text-text">
                            Beta
                          </th>
                        )}
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {currentLabels.bestWorst}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.map((r, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-surface-2/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: r.color }}
                              ></div>
                              <div>
                                <div className="font-semibold text-text">
                                  {r.name}
                                </div>
                                <div className="text-base text-text-4">
                                  {currentLabels.since} {r.startYear}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center relative max-w-[200px]">
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {Object.entries(r.alloc)
                                .slice(0, 3)
                                .map(([sym, w]) => (
                                  <span
                                    key={sym}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-3 font-medium"
                                  >
                                    {sym} {String(w)}%
                                  </span>
                                ))}
                              {Object.keys(r.alloc).length > 3 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-3 font-medium">
                                  +{Object.keys(r.alloc).length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-text tabular-nums text-base">
                            $
                            {r.initialAmount.toLocaleString("en-US", {
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-text tabular-nums text-base">
                            $
                            {r.endBalance.toLocaleString("en-US", {
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-4 text-center font-semibold tabular-nums text-base",
                              r.cagr >= 0 ? "text-green" : "text-red",
                            )}
                          >
                            {r.cagr >= 0 ? "+" : ""}
                            {r.cagr.toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 text-center text-text tabular-nums text-base">
                            {r.stdev.toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-red tabular-nums text-base">
                            -{Math.abs(r.maxDrawdown).toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 text-center tabular-nums text-base font-medium text-text">
                            {r.sharpe.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-center tabular-nums text-base font-medium text-text">
                            {r.sortino.toFixed(2)}
                          </td>
                          {results.some(
                            (r) => r.metrics.alpha !== undefined,
                          ) && (
                            <td
                              className={cn(
                                "px-4 py-4 text-center tabular-nums text-base font-medium",
                                r.metrics.alpha !== undefined &&
                                  r.metrics.alpha >= 0
                                  ? "text-green"
                                  : "text-red",
                              )}
                            >
                              {r.metrics.alpha !== undefined
                                ? (r.metrics.alpha >= 0 ? "+" : "") +
                                  (r.metrics.alpha * 100).toFixed(2) +
                                  "%"
                                : "-"}
                            </td>
                          )}
                          {results.some(
                            (r) => r.metrics.beta !== undefined,
                          ) && (
                            <td className="px-4 py-4 text-center text-text tabular-nums text-base">
                              {r.metrics.beta !== undefined
                                ? r.metrics.beta.toFixed(2)
                                : "-"}
                            </td>
                          )}
                          <td className="px-4 py-4 text-center tabular-nums text-base whitespace-nowrap">
                            <span
                              className={cn(
                                "font-medium",
                                r.bestYear >= 0 ? "text-green" : "text-red",
                              )}
                            >
                              {r.bestYear >= 0 ? "+" : ""}
                              {r.bestYear.toFixed(2)}%
                            </span>
                            <span className="text-text-4 mx-1.5">/</span>
                            <span
                              className={cn(
                                "font-medium",
                                r.worstYear >= 0 ? "text-green" : "text-red",
                              )}
                            >
                              {r.worstYear > 0 ? "+" : ""}
                              {r.worstYear.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Portfolio Growth Graph */}
              <div className="bg-surface border border-border rounded-3xl mb-8 text-left shadow-sm">
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-2">
                  <h3 className="text-base font-semibold text-text flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pv-blue animate-pulse"></span>
                    {t("aa.chart.wealth")}
                  </h3>
                </div>
                <div className="p-8">
                  <div className="h-[400px]">
                    <Line
                      data={{
                        labels: results[0].dates,
                        datasets: results.map((r) => ({
                          label: r.name,
                          data: r.balances,
                          borderColor: r.color,
                          backgroundColor: r.color + "05",
                          borderWidth: 3,
                          pointRadius: 0,
                          pointHoverRadius: 5,
                          pointHoverBackgroundColor: r.color,
                          pointHoverBorderColor: "#ffffff",
                          pointHoverBorderWidth: 2,
                          tension: 0.15,
                          fill: false,
                        })),
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: "index", intersect: false },
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              usePointStyle: true,
                              pointStyle: "rectRounded",
                              boxWidth: 12,
                              boxHeight: 12,
                              padding: 24,
                              font: {
                                family: "sans-serif",
                                size: 13,
                                weight: "bold",
                              },
                              color: "#334155",
                            },
                          },
                          tooltip: {
                            backgroundColor: "#0f172a",
                            titleColor: "#94a3b8",
                            bodyColor: "#f8fafc",
                            borderColor: "#1e293b",
                            borderWidth: 1,
                            padding: 14,
                            cornerRadius: 8,
                            displayColors: true,
                            boxPadding: 6,
                            usePointStyle: true,
                            callbacks: {
                              label: (context) => {
                                let label = context.dataset.label || "";
                                if (label) label += ": ";
                                if (context.parsed.y !== null) {
                                  label += new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                  }).format(context.parsed.y);
                                }
                                return label;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            border: { display: false },
                            ticks: {
                              font: { family: "sans-serif", size: 10 },
                              color: "#64748b",
                              maxTicksLimit: 52,
                            },
                          },
                          y: {
                            ticks: {
                              callback: (v) =>
                                "$" + Number(v).toLocaleString("en-US"),
                              font: { family: "sans-serif", size: 10 },
                              color: "#64748b",
                            },
                            grid: { color: "#f1f5f9" },
                            border: { display: false, dash: [4, 4] },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-12 mb-8 text-left">
                {/* Annual Returns Bar Chart */}
                <div className="bg-surface border border-border rounded-3xl shadow-sm">
                  <div className="px-8 py-6 border-b border-border bg-surface-2">
                    <h3 className="text-base font-semibold text-text flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      {t("aa.chart.annual")}
                    </h3>
                  </div>
                  <div className="p-8">
                    <div className="h-[500px]">
                      <Bar
                        data={{
                          labels: results[0].yearsInteger,
                          datasets: results.map((r, i) => ({
                            label: r.name,
                            data: r.annualReturns,
                            backgroundColor: r.annualReturns.map((val) =>
                              val >= 0 ? r.color : "#e11d48",
                            ),
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: "rgba(0,0,0,0.1)",
                            barPercentage: 0.85,
                            categoryPercentage: 0.9,
                          })),
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: { mode: "index", intersect: false },
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                usePointStyle: true,
                                pointStyle: "rectRounded",
                                boxWidth: 12,
                                boxHeight: 12,
                                padding: 24,
                                font: {
                                  family: "sans-serif",
                                  size: 13,
                                  weight: "bold",
                                },
                                color: "#334155",
                              },
                            },
                            tooltip: {
                              backgroundColor: "#0f172a",
                              titleColor: "#94a3b8",
                              bodyColor: "#f8fafc",
                              borderColor: "#1e293b",
                              borderWidth: 1,
                              padding: 14,
                              cornerRadius: 8,
                              displayColors: true,
                              boxPadding: 6,
                              usePointStyle: true,
                              callbacks: {
                                label: (context) => {
                                  let label = context.dataset.label || "";
                                  if (label) label += ": ";
                                  if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(2) + "%";
                                  }
                                  return label;
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              border: { display: false },
                              ticks: {
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                              },
                            },
                            y: {
                              ticks: {
                                callback: (v) => v + "%",
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                              },
                              grid: { color: "#f1f5f9" },
                              border: { display: false, dash: [4, 4] },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Drawdowns Chart */}
                <div className="bg-surface border border-border rounded-3xl shadow-sm">
                  <div className="px-8 py-6 border-b border-border bg-surface-2">
                    <h3 className="text-base font-semibold text-text flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                      {t("aa.chart.drawdowns")}
                    </h3>
                  </div>
                  <div className="p-8">
                    <div className="h-[500px]">
                      <Line
                        data={{
                          labels: results[0].dates,
                          datasets: results.map((r, dIdx) => ({
                            label: r.name,
                            data: r.drawdowns,
                            borderColor: r.color,
                            backgroundColor: r.color + "08",
                            fill: true,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            borderWidth: 1,
                            tension: 0.15,
                          })),
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: { mode: "index", intersect: false },
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                usePointStyle: true,
                                pointStyle: "rectRounded",
                                boxWidth: 12,
                                boxHeight: 12,
                                padding: 24,
                                font: {
                                  family: "sans-serif",
                                  size: 13,
                                  weight: "bold",
                                },
                                color: "#334155",
                              },
                            },
                            tooltip: {
                              backgroundColor: "#0f172a",
                              titleColor: "#94a3b8",
                              bodyColor: "#f8fafc",
                              borderColor: "#1e293b",
                              borderWidth: 1,
                              padding: 14,
                              cornerRadius: 8,
                              displayColors: true,
                              boxPadding: 6,
                              usePointStyle: true,
                              callbacks: {
                                label: (context) => {
                                  let label = context.dataset.label || "";
                                  if (label) label += ": ";
                                  if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(2) + "%";
                                  }
                                  return label;
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              border: { display: false },
                              ticks: {
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                                maxTicksLimit: 52,
                              },
                            },
                            y: {
                              max: 0,
                              ticks: {
                                callback: (v) => v + "%",
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                              },
                              grid: { color: "#f1f5f9" },
                              border: { display: false, dash: [4, 4] },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trailing Returns Table */}
              <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 text-left">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text tracking-tight">
                    {t("aa.chart.trailing")}
                  </h3>
                </div>
                <div className="overflow-x-auto p-6">
                  <table className="w-full text-base border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                          {currentLabels.portfolio || "Portfolio"}
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                          {currentLabels.oneYear || "1 Year"}
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                          {currentLabels.threeYears || "3 Years (Ann.)"}
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                          {currentLabels.fiveYears || "5 Years (Ann.)"}
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                          {currentLabels.tenYears || "10 Years (Ann.)"}
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                          {currentLabels.fullPeriod || "Full Period"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => {
                        const calcPeriod = (yearsAgo: number) => {
                          const len = r.annualReturns.length;
                          if (len < yearsAgo) return null;
                          const sub = r.annualReturns.slice(-yearsAgo);
                          let prod = 1;
                          sub.forEach((x) => (prod *= 1 + x / 100));
                          return (Math.pow(prod, 1 / yearsAgo) - 1) * 100;
                        };
                        return (
                          <tr
                            key={i}
                            className="border-b border-border hover:bg-surface-2 transition-colors"
                          >
                            <td className="text-left py-4 px-4 font-medium flex items-center gap-3 whitespace-nowrap text-text">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0 "
                                style={{ backgroundColor: r.color }}
                              ></div>
                              {r.name}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {r.annualReturns[
                                r.annualReturns.length - 1
                              ]?.toFixed(2) || "N/A"}
                              %
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {calcPeriod(3)?.toFixed(2) || "N/A"}
                              {calcPeriod(3) ? "%" : ""}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {calcPeriod(5)?.toFixed(2) || "N/A"}
                              {calcPeriod(5) ? "%" : ""}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {calcPeriod(10)?.toFixed(2) || "N/A"}
                              {calcPeriod(10) ? "%" : ""}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-semibold tabular-nums text-green">
                              {r.cagr.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annual Returns Table */}
              <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 text-left">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text tracking-tight">
                    {t("aa.table.annual")}
                  </h3>
                </div>
                <div className="overflow-x-auto p-6">
                  <table className="w-full text-base border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                          {currentLabels.year}
                        </th>
                        {results.map((r, i) => (
                          <th
                            key={i}
                            className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap"
                          >
                            {r.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...results[0].yearsInteger]
                        .reverse()
                        .map((year, yearIndex) => {
                          const actualIdx =
                            results[0].yearsInteger.length - 1 - yearIndex;
                          return (
                            <tr
                              key={actualIdx}
                              className="border-b border-border hover:bg-surface-2 transition-colors"
                            >
                              <td className="text-left py-3 px-4 font-semibold text-text">
                                {year}
                              </td>
                              {results.map((r, i) => {
                                const val = r.annualReturns[actualIdx];
                                return (
                                  <td
                                    key={i}
                                    className={`text-right py-3 px-4 whitespace-nowrap font-medium tabular-nums ${val < 0 ? "text-red" : "text-green"}`}
                                  >
                                    {val !== undefined
                                      ? (val > 0 ? "+" : "") +
                                        val.toFixed(2) +
                                        "%"
                                      : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical Stress Scenarios Table */}
              <div className="bg-surface border border-border rounded-3xl shadow-md mb-12 border-2 border-border text-left">
                <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-surface-2">
                  <h3 className="text-base font-semibold text-text ">
                    {t("aa.table.stress")}
                  </h3>
                </div>
                <div className="overflow-x-auto p-10">
                  <table className="w-full text-base border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left font-semibold text-text py-5 px-6 text-base whitespace-nowrap">
                          {t("aa.table.stress_period")}
                        </th>
                        <th className="text-left font-semibold text-text py-5 px-6 text-base whitespace-nowrap">
                          {t("aa.table.timeline")}
                        </th>
                        {results.map((r, i) => (
                          <th
                            key={i}
                            className="text-right font-semibold text-text py-5 px-6 text-base whitespace-nowrap"
                          >
                            {r.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: "dotcom", start: 2000, end: 2002 },
                        { key: "gfc", start: 2008, end: 2008 },
                        { key: "covid", start: 2020, end: 2020 },
                        { key: "inflation", start: 2022, end: 2022 },
                      ].map((event, ei) => (
                        <tr
                          key={ei}
                          className="border-b border-border hover:bg-pv-blue/5 transition-all font-sans group"
                        >
                          <td className="py-6 px-6 font-bold text-text whitespace-nowrap text-left text-base tracking-tight">
                            {currentLabels[event.key]}
                          </td>
                          <td className="py-6 px-6 text-text whitespace-nowrap text-left font-mono tabular-nums">
                            {event.start === event.end
                              ? event.start
                              : `${event.start} - ${event.end}`}
                          </td>
                          {results.map((r, i) => {
                            const sub = r.annualReturns.filter(
                              (_, idx) =>
                                r.yearsInteger[idx] >= event.start &&
                                r.yearsInteger[idx] <= event.end,
                            );
                            if (!sub.length)
                              return (
                                <td
                                  key={i}
                                  className="py-6 px-6 text-right text-text font-bold italic text-base font-mono"
                                >
                                  {currentLabels.outsideScope}
                                </td>
                              );
                            let prod = 1;
                            sub.forEach((x) => (prod *= 1 + x / 100));
                            const ret = (prod - 1) * 100;
                            return (
                              <td
                                key={i}
                                className={`py-6 px-6 whitespace-nowrap font-bold text-base text-right tabular-nums tracking-tighter font-mono ${ret < 0 ? "text-red" : "text-green"}`}
                              >
                                {ret > 0 ? "+" : ""}
                                {ret.toFixed(2)}%
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabbed Detailed Analysis Container */}
              <div className="bg-surface border border-border rounded-3xl p-8 space-y-6 text-left">
                <div className="flex border-b border-border flex-wrap gap-2 mb-6 bg-surface-2 p-2 rounded-[2rem]">
                  {results.map((r, idx) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveResIdx(idx)}
                      className={cn(
                        "px-6 py-3 text-base font-semibold whitespace-nowrap transition-all rounded-[1.5rem]",
                        activeResIdx === idx
                          ? "bg-pv-blue text-white shadow-md font-extrabold"
                          : "text-text hover:text-text hover:bg-surface-3",
                      )}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>

                {results[activeResIdx] && (
                  <div
                    key={`details-${results[activeResIdx].id}`}
                    className="space-y-12"
                  >
                    <div className="flex flex-col xl:flex-row gap-12 items-start">
                      <div className="flex-1 w-full xl:w-2/3 overflow-x-auto ">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-base font-semibold flex items-center gap-2 text-text">
                            <Activity size={14} /> {currentLabels.heatmap}
                          </h3>
                        </div>
                        <ReturnsHeatmap
                          monthlyReturns={results[activeResIdx].monthlyReturns}
                        />
                      </div>
                      <div className="w-full xl:w-1/3 shrink-0">
                        <h3 className="text-base font-semibold mb-6 flex items-center gap-2 text-text">
                          <Activity size={14} /> {currentLabels.assetAllocation}
                        </h3>
                        <div className="bg-[#0f172a] rounded-[2rem] p-8 shadow-2xl border border-surface-3">
                          <EliteDonut
                            assets={results[activeResIdx].assets || []}
                            allocations={results[activeResIdx].alloc || {}}
                            title={currentLabels.assetAllocDetails}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <PortfolioAnalysisExplication results={results} />
              <Disclaimer />
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</div>
</div>
    </MobileZoomWrapper>
  );
}
