// Single source of truth for page metadata: used by the app at runtime (App.tsx) and by
// scripts/prerender-seo.ts, which writes one static HTML file per route plus sitemap.xml.

export const SITE_URL = "https://quantrih.com";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export type SeoSection = "home" | "tools" | "markets" | "learn" | "platforms" | "company" | "legal";

/** Sections in the order they appear in sitemap.xml and on the /sitemap page. */
export const SEO_SECTIONS: { id: SeoSection; en: string; fr: string }[] = [
  { id: "home", en: "Home", fr: "Accueil" },
  { id: "tools", en: "Portfolio tools", fr: "Outils de portefeuille" },
  { id: "markets", en: "Markets and ETFs", fr: "Marchés et ETF" },
  { id: "platforms", en: "Investment platforms", fr: "Plateformes d'investissement" },
  { id: "learn", en: "Learn", fr: "Apprendre" },
  { id: "company", en: "About Quantrih", fr: "À propos de Quantrih" },
  { id: "legal", en: "Legal", fr: "Mentions légales" },
];

export interface SeoRoute {
  path: string;
  section: SeoSection;
  /** Free web application (adds WebApplication structured data). */
  app?: boolean;
  /** Included in sitemap.xml and prerendered. */
  indexable: boolean;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  fr: { title: string; description: string; h1: string; summary: string };
  en: { title: string; description: string; h1: string; summary: string };
}

export const SEO_ROUTES: SeoRoute[] = [
  {
    path: "/",
    section: "home",
    indexable: true,
    priority: 1.0,
    changefreq: "weekly",
    fr: {
      title: "Quantrih | Backtest de portefeuille et simulateur d'investissement",
      description:
        "Testez gratuitement vos portefeuilles d'ETF et d'actions sur des données historiques : backtest, Monte Carlo, allocation tactique, comparateur de plateformes d'investissement en Belgique et en France.",
      h1: "Quantrih : backtest de portefeuille et outils d'investissement",
      summary:
        "Quantrih aide les investisseurs particuliers européens à tester leurs allocations d'actifs avant d'investir : backtest historique, simulation de Monte Carlo, stratégies de suivi de tendance, bibliothèque financière et comparaison des courtiers et banques en Belgique et en France.",
    },
    en: {
      title: "Quantrih | Portfolio Backtesting & Investment Tools",
      description:
        "Backtest ETF and stock portfolios on historical data, run Monte Carlo simulations and tactical strategies, and compare investment platforms in Europe.",
      h1: "Quantrih: portfolio backtesting and investment tools",
      summary:
        "Quantrih helps European retail investors test asset allocations before investing: historical backtests, Monte Carlo simulation, trend-following strategies, a finance library and a comparison of brokers and banks.",
    },
  },
  {
    path: "/portfolio-backtest",
    section: "tools",
    app: true,
    indexable: true,
    priority: 0.9,
    changefreq: "weekly",
    fr: {
      title: "Backtest de portefeuille gratuit (ETF, actions) | Quantrih",
      description:
        "Simulez la performance historique de votre portefeuille : rendement annualisé (CAGR), volatilité, ratio de Sharpe, pire baisse (max drawdown), rééquilibrage et frais.",
      h1: "Backtest de portefeuille",
      summary:
        "Comparez plusieurs portefeuilles d'ETF et d'actions sur des décennies de données, avec rééquilibrage, versements programmés, frais de courtage et indicateurs de risque expliqués simplement.",
    },
    en: {
      title: "Free Portfolio Backtest (ETFs, stocks) | Quantrih",
      description:
        "Simulate the historical performance of your portfolio: CAGR, volatility, Sharpe ratio, max drawdown, rebalancing and fees.",
      h1: "Portfolio backtest",
      summary:
        "Compare several ETF and stock portfolios over decades of data, with rebalancing, regular contributions, broker fees and plainly explained risk metrics.",
    },
  },
  {
    path: "/asset-allocation",
    section: "tools",
    app: true,
    indexable: true,
    priority: 0.8,
    changefreq: "weekly",
    fr: {
      title: "Simulateur d'allocation d'actifs | Quantrih",
      description:
        "Construisez et comparez jusqu'à six allocations d'actifs : actions, obligations, or, immobilier, crypto. Corrélations, risques et répartition géographique.",
      h1: "Allocation d'actifs",
      summary:
        "Répartissez votre capital entre classes d'actifs, visualisez les corrélations et l'exposition géographique, et comparez le couple rendement risque de chaque allocation.",
    },
    en: {
      title: "Asset Allocation Simulator | Quantrih",
      description:
        "Build and compare up to six asset allocations across stocks, bonds, gold, real estate and crypto, with correlations and geographic exposure.",
      h1: "Asset allocation",
      summary:
        "Split your capital across asset classes, visualise correlations and geographic exposure, and compare the risk and return of each allocation.",
    },
  },
  {
    path: "/montecarlo",
    section: "tools",
    app: true,
    indexable: true,
    priority: 0.8,
    changefreq: "weekly",
    fr: {
      title: "Simulation de Monte Carlo pour votre épargne et retraite | Quantrih",
      description:
        "Projetez l'évolution de votre capital avec des milliers de scénarios : probabilité d'atteindre votre objectif, retraits, inflation et risque de séquence.",
      h1: "Simulation de Monte Carlo",
      summary:
        "Estimez la probabilité de réussite de votre plan d'épargne ou de retraite grâce à des milliers de trajectoires simulées, en tenant compte de l'inflation et des retraits.",
    },
    en: {
      title: "Monte Carlo Simulation for Savings and Retirement | Quantrih",
      description:
        "Project your wealth across thousands of scenarios: probability of reaching your goal, withdrawals, inflation and sequence risk.",
      h1: "Monte Carlo simulation",
      summary:
        "Estimate the probability of success of your savings or retirement plan across thousands of simulated paths, including inflation and withdrawals.",
    },
  },
  {
    path: "/tactical-allocation",
    section: "tools",
    app: true,
    indexable: true,
    priority: 0.8,
    changefreq: "weekly",
    fr: {
      title: "Allocation tactique : moyenne mobile, Dual Momentum | Quantrih",
      description:
        "Testez des stratégies de suivi de tendance : moyenne mobile 200 jours, Dual Momentum, force relative, avec passage automatique en liquidités ou obligations.",
      h1: "Allocation tactique",
      summary:
        "Programmez des règles de suivi de tendance et mesurez leur effet sur la performance et les pertes maximales face à une allocation fixe.",
    },
    en: {
      title: "Tactical Allocation: Moving Average, Dual Momentum | Quantrih",
      description:
        "Backtest trend-following rules: 200-day moving average, Dual Momentum and relative strength, switching to cash or bonds automatically.",
      h1: "Tactical allocation",
      summary:
        "Program trend-following rules and measure their effect on returns and drawdowns compared with a static allocation.",
    },
  },
  {
    path: "/platforms",
    section: "platforms",
    indexable: true,
    priority: 0.9,
    changefreq: "weekly",
    fr: {
      title: "Plateformes d'investissement en Belgique et en France : comparatif | Quantrih",
      description:
        "Comparez les courtiers en ligne et banques en Belgique et en France : Bolero, Keytrade, DEGIRO, Saxo, ING, BoursoBank, Fortuneo. Frais, taxe sur les opérations de bourse, points forts et sources officielles.",
      h1: "Plateformes d'investissement en Belgique et en France",
      summary:
        "Comparatif des courtiers en ligne, banques et néobanques accessibles aux investisseurs belges et français : frais de courtage, fiscalité, marchés disponibles et liens vers les grilles tarifaires officielles.",
    },
    en: {
      title: "Investment Platforms in Belgium and France Compared | Quantrih",
      description:
        "Compare online brokers and banks in Belgium and France: fees, local tax handling, strengths and links to official price lists.",
      h1: "Investment platforms in Belgium and France",
      summary:
        "Comparison of online brokers, banks and neobanks for Belgian and French investors: fees, tax handling, available markets and official price lists.",
    },
  },
  {
    path: "/education",
    section: "learn",
    indexable: true,
    priority: 0.7,
    changefreq: "monthly",
    fr: {
      title: "Bibliothèque de l'investisseur : 90 livres de finance | Quantrih",
      description:
        "Les meilleurs livres sur l'investissement, la bourse, le trading et la finance comportementale, classés par niveau et par thème, en français et en anglais.",
      h1: "Bibliothèque de l'investisseur",
      summary:
        "Une sélection de livres de référence en investissement : value investing, gestion passive, allocation d'actifs, trading, macroéconomie et finance comportementale.",
    },
    en: {
      title: "Investor Library: 90 Finance Books | Quantrih",
      description:
        "The best books on investing, stock markets, trading and behavioural finance, sorted by level and theme.",
      h1: "Investor library",
      summary:
        "A curated selection of reference books on value investing, passive investing, asset allocation, trading, macroeconomics and behavioural finance.",
    },
  },
  {
    path: "/virtual-portfolio",
    section: "markets",
    indexable: true,
    priority: 0.8,
    changefreq: "monthly",
    fr: {
      title: "Portefeuille virtuel : investir 100 000 $ fictifs | Quantrih",
      description: "Simulateur d'investissement à but pédagogique : achetez actions, ETF et cryptos aux cours réels avec 100 000 $ fictifs.",
      h1: "Portefeuille virtuel",
      summary: "Entraînez-vous à investir sans risque avec un compte fictif de 100 000 $, des cours réels et des allocations modèles.",
    },
    en: {
      title: "Virtual Portfolio: Invest $100,000 of Play Money | Quantrih",
      description: "An educational investing simulator: buy stocks, ETFs and crypto at real prices with a $100,000 paper account.",
      h1: "Virtual portfolio",
      summary: "Practise investing without risk using a $100,000 paper account, real market prices and model allocations.",
    },
  },
  {
    path: "/etf-overview",
    section: "markets",
    indexable: true,
    priority: 0.7,
    changefreq: "weekly",
    fr: {
      title: "Comparateur d'ETF UCITS européens | Quantrih",
      description:
        "Comparez les ETF UCITS disponibles en Europe : frais (TER), réplication, encours, devise et indice suivi.",
      h1: "Comparateur d'ETF UCITS",
      summary:
        "Parcourez les principaux ETF UCITS cotés en Europe et comparez leurs frais, leur méthode de réplication et leur taille.",
    },
    en: {
      title: "European UCITS ETF Screener | Quantrih",
      description: "Compare UCITS ETFs available in Europe: TER, replication method, fund size, currency and index.",
      h1: "UCITS ETF screener",
      summary: "Browse the main UCITS ETFs listed in Europe and compare their fees, replication method and size.",
    },
  },
  {
    path: "/market",
    section: "markets",
    indexable: true,
    priority: 0.6,
    changefreq: "daily",
    fr: {
      title: "Marchés : cours, graphiques et ratios financiers | Quantrih",
      description:
        "Cours de bourse, graphiques historiques, ratios de valorisation et états financiers des actions européennes et américaines.",
      h1: "Marchés et analyse d'actions",
      summary:
        "Consultez les cours, l'historique et les principaux ratios financiers des actions européennes et américaines.",
    },
    en: {
      title: "Markets: Quotes, Charts and Financial Ratios | Quantrih",
      description: "Stock quotes, historical charts, valuation ratios and financial statements for European and US stocks.",
      h1: "Markets and stock analysis",
      summary: "Check quotes, history and key financial ratios for European and US stocks.",
    },
  },
  {
    path: "/about",
    section: "company",
    indexable: true,
    priority: 0.5,
    changefreq: "monthly",
    fr: {
      title: "À propos de Quantrih",
      description: "La mission de Quantrih : rendre les outils d'analyse de portefeuille professionnels accessibles aux investisseurs particuliers européens.",
      h1: "À propos de Quantrih",
      summary: "Quantrih rend accessibles les outils d'analyse de portefeuille utilisés par les professionnels.",
    },
    en: {
      title: "About Quantrih",
      description: "Quantrih's mission: making professional portfolio analysis tools accessible to European retail investors.",
      h1: "About Quantrih",
      summary: "Quantrih makes professional portfolio analysis tools accessible to everyone.",
    },
  },
  {
    path: "/sitemap",
    section: "company",
    indexable: true,
    priority: 0.3,
    changefreq: "monthly",
    fr: {
      title: "Plan du site | Quantrih",
      description: "Toutes les pages de Quantrih classées par rubrique : outils de portefeuille, marchés et ETF, plateformes d'investissement, ressources.",
      h1: "Plan du site",
      summary: "Retrouvez toutes les pages de Quantrih, classées par rubrique.",
    },
    en: {
      title: "Sitemap | Quantrih",
      description: "Every Quantrih page by section: portfolio tools, markets and ETFs, investment platforms and resources.",
      h1: "Sitemap",
      summary: "Every Quantrih page, organised by section.",
    },
  },
  {
    path: "/auth",
    section: "company",
    indexable: false,
    priority: 0.1,
    changefreq: "yearly",
    fr: { title: "Connexion | Quantrih", description: "Connectez-vous pour retrouver vos portefeuilles et analyses sauvegardés.", h1: "Connexion", summary: "" },
    en: { title: "Sign in | Quantrih", description: "Sign in to access your saved portfolios and analyses.", h1: "Sign in", summary: "" },
  },
  {
    path: "/privacy",
    section: "legal",
    indexable: true,
    priority: 0.2,
    changefreq: "yearly",
    fr: { title: "Politique de confidentialité | Quantrih", description: "Comment Quantrih collecte, utilise et protège vos données personnelles.", h1: "Politique de confidentialité", summary: "" },
    en: { title: "Privacy Policy | Quantrih", description: "How Quantrih collects, uses and protects your personal data.", h1: "Privacy policy", summary: "" },
  },
  {
    path: "/cookies",
    section: "legal",
    indexable: true,
    priority: 0.2,
    changefreq: "yearly",
    fr: { title: "Politique de cookies | Quantrih", description: "Les cookies utilisés par Quantrih et comment les gérer.", h1: "Politique de cookies", summary: "" },
    en: { title: "Cookies Policy | Quantrih", description: "Cookies used by Quantrih and how to manage them.", h1: "Cookies policy", summary: "" },
  },
];

export function findSeoRoute(pathname: string): SeoRoute {
  const clean = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  const alias: Record<string, string> = { "/home": "/", "/portfolio": "/portfolio-backtest" };
  const target = alias[clean] ?? clean;
  return SEO_ROUTES.find((r) => r.path === target) ?? SEO_ROUTES[0];
}
