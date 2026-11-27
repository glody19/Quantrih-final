// Everything the Education page shows besides the original book list:
// strategy categories, popularity order, extra books and research papers.
// Links: a DOI or an official page when it is known for certain, otherwise a search for the exact title.

import { BOOKS, type Book } from "./books";

export type CategoryId = "value" | "index" | "quant" | "trading" | "risk" | "macro" | "pricing";

export const CATEGORIES: { id: CategoryId; en: string; fr: string }[] = [
  { id: "value", en: "Value and fundamentals", fr: "Value et analyse fondamentale" },
  { id: "index", en: "Index investing and allocation", fr: "Gestion indicielle et allocation" },
  { id: "quant", en: "Momentum, trend and quant", fr: "Momentum, tendance et quant" },
  { id: "trading", en: "Trading and technical analysis", fr: "Trading et analyse technique" },
  { id: "risk", en: "Risk and behaviour", fr: "Risque et comportement" },
  { id: "macro", en: "Macro and market history", fr: "Macro et histoire des marchés" },
  { id: "pricing", en: "Derivatives and pricing", fr: "Dérivés et valorisation d'actifs" },
];

const TAG_CATEGORY: Record<string, CategoryId> = {
  "Value Investing": "value", "Investment Philosophy": "value", "Stock Picking": "value", "Growth Investing": "value", "Corporate Finance": "value",
  "Passive Investing": "index", "Asset Allocation": "index", "Personal Finance": "index",
  "Quant Investing": "quant", "Quant Strategy": "quant", "Trend Following": "quant", "Machine Learning": "quant", "Market Microstructure": "quant",
  "Technical Analysis": "trading", "Trading Psychology": "trading",
  "Risk Management": "risk", "Behavioral Finance": "risk", "Probability": "risk", "Fractal Geometry": "risk",
  "Macroeconomics": "macro", "Financial History": "macro", "Wall Street Culture": "macro",
  "Derivatives": "pricing", "Mathematical Finance": "pricing", "Fixed Income": "pricing",
};

export const categoryOf = (b: Book): CategoryId => TAG_CATEGORY[b.tag] ?? "value";

const g = (title: string, author: string) => `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${title} ${author}`)}`;
const scholar = (title: string) => `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${title}"`)}`;

type NewBook = Omit<Book, "link"> & { link?: string };

// Added with the page rebuild: French trading and investing authors, and recent releases by well-known names.
const MORE_BOOKS: NewBook[] = [
  { title: "L'art du trading", author: "Thami Kabbaj", year: "2007", tag: "Technical Analysis", tagFr: "Analyse Technique", origin: "fr", featured: true, coverColor: "#0B3558", isbn: "9782212539158",
    summary: "The French reference on discretionary trading: chart analysis, money management and the psychology that ties them together.",
    summaryFr: "La référence francophone du trading discrétionnaire : analyse graphique, money management et la psychologie qui relie les deux." },
  { title: "Psychologie des grands traders", author: "Thami Kabbaj", year: "2007", tag: "Trading Psychology", tagFr: "Psychologie du Trading", origin: "fr", coverColor: "#14466B", isbn: "9782212552263",
    summary: "Behavioural biases at the trading desk and the routines top traders use to keep discipline under pressure.",
    summaryFr: "Les biais comportementaux en salle de marché et les routines des meilleurs traders pour garder leur discipline sous pression." },
  { title: "Investir sans criser", author: "Thami Kabbaj", year: "2011", tag: "Trading Psychology", tagFr: "Psychologie du Trading", origin: "fr", coverColor: "#1D6FA8",
    summary: "Written after the 2008 crash: how to keep a method and manage risk when markets break down.",
    summaryFr: "Écrit après le krach de 2008 : conserver une méthode et gérer son risque quand les marchés décrochent." },
  { title: "Maîtriser l'analyse technique avec Thami Kabbaj", author: "Thami Kabbaj", year: "2011", tag: "Technical Analysis", tagFr: "Analyse Technique", origin: "fr", coverColor: "#0B3558", isbn: "9782212549560",
    summary: "Technical analysis in ten illustrated lessons, from chart patterns to a complete trading plan.",
    summaryFr: "L'analyse technique en dix leçons illustrées, des figures chartistes à un plan de trading complet." },
  { title: "Gagner en bourse avec Thami Kabbaj", author: "Thami Kabbaj", year: "2011", tag: "Stock Picking", tagFr: "Sélection d'Actions", origin: "fr", coverColor: "#14466B", isbn: "9782212549553",
    summary: "Twelve practical lessons on how markets work and the methods professionals use to invest.",
    summaryFr: "Douze leçons pratiques sur le fonctionnement des marchés et les méthodes des professionnels pour investir." },
  { title: "Gérer vos émotions en bourse avec Thami Kabbaj", author: "Thami Kabbaj", year: "2011", tag: "Trading Psychology", tagFr: "Psychologie du Trading", origin: "fr", coverColor: "#1D6FA8", isbn: "9782212549577",
    summary: "Thirteen lessons on fear, greed and discipline, to invest like a professional.",
    summaryFr: "Treize leçons sur la peur, l'avidité et la discipline, pour investir comme un professionnel." },
  { title: "Agir", author: "Thami Kabbaj", year: "2019", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#0E86C7", isbn: "9782212571325",
    summary: "Financial freedom as a decision: a five-year plan to stop depending on a salary and a banker.",
    summaryFr: "La liberté financière comme décision : un plan sur cinq ans pour ne plus dépendre d'un salaire ni de son banquier." },
  { title: "Analyse technique : pratiques et méthodes", author: "Thierry Béchu, Éric Bertrand & Julien Nebenzahl", year: "1992", tag: "Technical Analysis", tagFr: "Analyse Technique", origin: "fr", coverColor: "#1B3F72",
    summary: "The long-standing French university textbook on technical analysis, from Dow theory to indicators and trading systems.",
    summaryFr: "Le manuel universitaire français de l'analyse technique, de la théorie de Dow aux indicateurs et aux systèmes de trading." },
  { title: "Épargnant 3.0", author: "Edouard Petit", year: "2017", tag: "Passive Investing", tagFr: "Investissement Passif", origin: "fr", coverColor: "#0E86C7",
    summary: "Index investing applied to French wrappers: ETF selection, PEA and life insurance, allocation and rebalancing.",
    summaryFr: "La gestion indicielle appliquée aux enveloppes françaises : choix des ETF, PEA et assurance-vie, allocation et rééquilibrage." },

  // Charles Gave: economist, founder of Gavekal and a fund manager.
  { title: "Un libéral nommé Jésus", author: "Charles Gave", year: "2005", tag: "Macroeconomics", tagFr: "Macroéconomie", origin: "fr", coverColor: "#7C2D12", isbn: "9782849410202",
    summary: "Gave reads the Gospel parables on money, debt, wages and credit as a defence of individual liberty and free markets.",
    summaryFr: "Gave relit les paraboles de l'Évangile sur l'argent, la dette, le salaire et le crédit comme une défense de la liberté individuelle et du marché." },
  { title: "Sire, surtout ne faites rien !", author: "Charles Gave", year: "2016", tag: "Macroeconomics", tagFr: "Macroéconomie", origin: "fr", coverColor: "#1B3F72", isbn: "9782865532858",
    summary: "A pamphlet against state intervention: why French growth stalls when government tries to steer the economy.",
    summaryFr: "Un pamphlet contre l'interventionnisme : pourquoi la croissance française cale quand l'État prétend piloter l'économie." },
  // Marc Fiorentino: former investment banker and trader, columnist and author of money guides.
  { title: "Un trader ne meurt jamais", author: "Marc Fiorentino", year: "2009", tag: "Wall Street Culture", tagFr: "Culture de Wall Street", origin: "fr", coverColor: "#0C2233", isbn: "9782221112199",
    summary: "A novel: a trader obsessed with winning back a fortune lost on the markets, between oil, gold, the CAC 40 and the dollar.",
    summaryFr: "Un roman : un trader obsédé par l'idée de regagner une fortune perdue sur les marchés, entre pétrole, or, CAC 40 et dollar." },
  { title: "Sauvez votre argent !", author: "Marc Fiorentino", year: "2011", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#14466B",
    summary: "A health plan for your savings: the traps banks and advisers set, and the simple rules that protect a household's money.",
    summaryFr: "Un régime santé pour vos économies : les pièges des banques et des conseillers, et les règles simples qui protègent l'argent d'un ménage." },
  { title: "Faites sauter la banque !", author: "Marc Fiorentino", year: "2014", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#1D6FA8", isbn: "9782234077843",
    summary: "A guide to saving money on banking: fees, loans, insurance and investment products, and how to negotiate them.",
    summaryFr: "Le guide pour économiser sur sa banque : frais, crédits, assurances et produits de placement, et comment les négocier." },
  { title: "Votre argent", author: "Marc Fiorentino", year: "2018", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#0B3558", isbn: "9782221139028",
    summary: "Fiorentino's complete guide to managing money: saving, investing, property, retirement and passing wealth on.",
    summaryFr: "Le guide complet de Fiorentino pour gérer son argent : épargne, placements, immobilier, retraite et transmission." },
  { title: "Les meilleurs placements pour les Nuls", author: "Marc Fiorentino", year: "2021", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#B45309", isbn: "9782412064870",
    summary: "A plain-language tour of French investments: savings accounts, life insurance, PEA, shares, funds, property and their tax.",
    summaryFr: "Un tour clair des placements en France : livrets, assurance-vie, PEA, actions, fonds, immobilier et leur fiscalité." },
  // Finance creators and authors read by French investors.
  { title: "Tout le monde mérite d'être riche", author: "Olivier Seban", year: "2005", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#0E86C7", isbn: "9782818812075",
    summary: "A dialogue on building wealth in three stages, accumulation, investment and protection, without consumer credit traps.",
    summaryFr: "Un dialogue sur l'enrichissement en trois temps, accumuler, investir et protéger, sans tomber dans le piège du crédit à la consommation." },
  { title: "Tout le monde peut réussir en Bourse", author: "Matthieu Louvet", year: "2024", tag: "Passive Investing", tagFr: "Investissement Passif", origin: "fr", coverColor: "#22A06B", recent: true,
    summary: "The creator of S'investir sets out 21 evidence-based principles for investing in ETFs in a few minutes a month.",
    summaryFr: "Le créateur de S'investir pose 21 principes fondés sur la recherche pour investir en ETF en quelques minutes par mois." },
  { title: "Investir pour être libre", author: "Mounir Laggoune", year: "2024", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#0C2233", recent: true,
    summary: "The Finary co-founder's step-by-step method, from budget to shares, property and alternative assets, towards financial independence.",
    summaryFr: "La méthode pas à pas du cofondateur de Finary, du budget aux actions, à l'immobilier et aux actifs alternatifs, vers l'indépendance financière." },
  { title: "Prenez votre argent en main", author: "Matthias Baccino", year: "2024", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#14466B", recent: true,
    summary: "A pragmatic guide to building wealth when classic savings no longer keep up: ETFs, property, crypto, inflation and psychology.",
    summaryFr: "Un guide pragmatique pour s'enrichir quand l'épargne classique ne suffit plus : ETF, immobilier, crypto, inflation et psychologie." },
  // Fund managers and practitioners published in French.
  { title: "Bourse : seuls les meilleurs gagnent", author: "Peter Seilern", year: "2022", tag: "Growth Investing", tagFr: "Investissement de Croissance", origin: "fr", coverColor: "#0B3558", isbn: "9782818811429", recent: true,
    summary: "The founder of Seilern Investment Management on quality growth investing: ten golden rules for long-term returns with low risk.",
    summaryFr: "Le fondateur de Seilern Investment Management sur l'investissement en croissance de qualité : dix règles d'or pour des rendements durables à faible risque." },
  { title: "Investir en bourse et gagner", author: "Serge Belinski", year: "2025", tag: "Stock Picking", tagFr: "Sélection d'Actions", origin: "fr", coverColor: "#1D6FA8", isbn: "9782818812143",
    summary: "Picking stocks from the fundamentals: debt, balance sheet, results, cash flow and valuation, with a detailed case study.",
    summaryFr: "Choisir ses actions à partir des fondamentaux : dette, bilan, résultats, flux de trésorerie et valorisation, avec une étude de cas détaillée." },
  { title: "Savoir investir", author: "Gérald Autier", year: "2019", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", origin: "fr", coverColor: "#22A06B", isbn: "9782818808429",
    summary: "A practical guide for individual investors to every asset class, from shares and bonds to private equity, and how to combine them.",
    summaryFr: "Un guide pratique pour particuliers sur toutes les classes d'actifs, des actions et obligations au capital-investissement, et sur la façon de les combiner." },
  // The French classic novel about the stock exchange.
  { title: "L'Argent", author: "Émile Zola", year: "1891", tag: "Financial History", tagFr: "Histoire Financière", origin: "fr", coverColor: "#7C2D12",
    summary: "Zola's novel of the Paris Bourse: Saccard's bank, a speculative bubble and the small savers it ruins.",
    summaryFr: "Le roman de la Bourse de Paris : la banque de Saccard, une bulle spéculative et les petits épargnants qu'elle ruine." },

  // ── Other books by authors already in the library ──
  { title: "Skin in the Game", author: "Nassim Nicholas Taleb", year: "2018", tag: "Risk Management", tagFr: "Gestion des Risques", coverColor: "#0C2233", isbn: "9780425284629",
    summary: "Why decision makers must bear the consequences of their decisions, and what goes wrong when they do not.",
    summaryFr: "Pourquoi celui qui décide doit supporter les conséquences de ses décisions, et ce qui dérape quand ce n'est pas le cas." },
  { title: "The New Market Wizards", author: "Jack D. Schwager", year: "1992", tag: "Trading Psychology", tagFr: "Psychologie du Trading", coverColor: "#14466B", isbn: "9780887306679",
    summary: "A second round of interviews with top traders on method, risk control and discipline.",
    summaryFr: "Une deuxième série d'entretiens avec des traders d'exception sur la méthode, le contrôle du risque et la discipline." },
  { title: "Hedge Fund Market Wizards", author: "Jack D. Schwager", year: "2012", tag: "Trading Psychology", tagFr: "Psychologie du Trading", coverColor: "#1B3F72", isbn: "9781118273043",
    summary: "Interviews with fifteen hedge fund managers, from global macro to quantitative strategies.",
    summaryFr: "Entretiens avec quinze gérants de hedge funds, de la macro globale aux stratégies quantitatives." },
  { title: "The Disciplined Trader", author: "Mark Douglas", year: "1990", tag: "Trading Psychology", tagFr: "Psychologie du Trading", coverColor: "#0B3558", isbn: "9780132157575",
    summary: "Douglas's first book: the mental habits that make most traders lose, and how to rebuild them.",
    summaryFr: "Le premier livre de Douglas : les habitudes mentales qui font perdre la plupart des traders, et comment les reconstruire." },
  { title: "Common Sense on Mutual Funds", author: "John C. Bogle", year: "1999", tag: "Passive Investing", tagFr: "Investissement Passif", coverColor: "#1D6FA8", isbn: "9780470138137",
    summary: "Costs, turnover and the case for index funds, by the founder of Vanguard.",
    summaryFr: "Les frais, la rotation des portefeuilles et les arguments pour les fonds indiciels, par le fondateur de Vanguard." },
  { title: "Noise", author: "Daniel Kahneman, Olivier Sibony & Cass R. Sunstein", year: "2021", tag: "Behavioral Finance", tagFr: "Finance Comportementale", coverColor: "#0E86C7", isbn: "9780316451406",
    summary: "The random scatter in professional judgments, and the procedures that reduce it.",
    summaryFr: "La dispersion aléatoire des jugements professionnels, et les procédures qui la réduisent." },
  { title: "Narrative Economics", author: "Robert J. Shiller", year: "2019", tag: "Behavioral Finance", tagFr: "Finance Comportementale", coverColor: "#14466B", isbn: "9780691182292",
    summary: "How stories spread like epidemics and move markets and economies.",
    summaryFr: "Comment les récits se propagent comme des épidémies et font bouger les marchés et l'économie." },
  { title: "Come Into My Trading Room", author: "Alexander Elder", year: "2002", tag: "Technical Analysis", tagFr: "Analyse Technique", coverColor: "#0B3558", isbn: "9780471225348",
    summary: "Elder's follow-up: psychology, trading systems, money management and record keeping.",
    summaryFr: "La suite d'Elder : psychologie, systèmes de trading, gestion du capital et tenue d'un journal." },
  { title: "Intermarket Analysis", author: "John J. Murphy", year: "2004", tag: "Technical Analysis", tagFr: "Analyse Technique", coverColor: "#1B3F72", isbn: "9780471023296",
    summary: "The links between bonds, stocks, commodities and currencies, and how to use them in allocation.",
    summaryFr: "Les liens entre obligations, actions, matières premières et devises, et comment s'en servir pour l'allocation." },
  { title: "The Quants", author: "Scott Patterson", year: "2010", tag: "Quant Investing", tagFr: "Gestion Quantitative", coverColor: "#0C2233", isbn: "9780307453389",
    summary: "The quantitative hedge funds, their models, and the August 2007 quant crash.",
    summaryFr: "Les hedge funds quantitatifs, leurs modèles, et le krach des quants d'août 2007." },
  { title: "The Greatest Trade Ever", author: "Gregory Zuckerman", year: "2009", tag: "Financial History", tagFr: "Histoire Financière", coverColor: "#14466B", isbn: "9780385529945",
    summary: "How John Paulson bet against the US housing market and made billions in 2007.",
    summaryFr: "Comment John Paulson a parié contre l'immobilier américain et gagné des milliards en 2007." },
  { title: "Buffett: The Making of an American Capitalist", author: "Roger Lowenstein", year: "1995", tag: "Value Investing", tagFr: "Investissement de Valeur", coverColor: "#0B3558", isbn: "9780812979268",
    summary: "The reference biography of Warren Buffett, from Omaha to Berkshire Hathaway.",
    summaryFr: "La biographie de référence de Warren Buffett, d'Omaha à Berkshire Hathaway." },
  { title: "Machine Learning for Asset Managers", author: "Marcos López de Prado", year: "2020", tag: "Machine Learning", tagFr: "Apprentissage Automatique", coverColor: "#1D6FA8", isbn: "9781108792899",
    summary: "Denoising covariance matrices, clustering, feature importance and portfolio construction with machine learning.",
    summaryFr: "Débruitage des matrices de covariance, clustering, importance des variables et construction de portefeuille par l'apprentissage automatique." },
  { title: "Stocks on the Move", author: "Andreas F. Clenow", year: "2015", tag: "Quant Strategy", tagFr: "Stratégie Quantitative", coverColor: "#0E86C7", isbn: "9781511466141",
    summary: "A complete, rules-based momentum strategy for stocks, with its backtest.",
    summaryFr: "Une stratégie momentum sur actions entièrement codifiée, avec son backtest." },
  { title: "The Complete TurtleTrader", author: "Michael W. Covel", year: "2007", tag: "Trend Following", tagFr: "Suivi de Tendance", coverColor: "#14466B", isbn: "9780061241703",
    summary: "The Turtle experiment: Richard Dennis taught novices a trend-following system, and many became rich.",
    summaryFr: "L'expérience des Turtles : Richard Dennis apprend un système de suivi de tendance à des débutants, dont beaucoup feront fortune." },
  { title: "Risk Management and Financial Institutions", author: "John C. Hull", year: "2007", tag: "Risk Management", tagFr: "Gestion des Risques", coverColor: "#1B3F72", isbn: "9781119932482",
    summary: "Market, credit, liquidity and operational risk in banks and insurers, and the regulation behind them.",
    summaryFr: "Risques de marché, de crédit, de liquidité et opérationnel dans les banques et assurances, et la réglementation associée." },

  // ── Recent releases ──
  { title: "How Countries Go Broke", author: "Ray Dalio", year: "2025", tag: "Macroeconomics", tagFr: "Macroéconomie", recent: true, coverColor: "#0B3558",
    summary: "Dalio's template for sovereign debt cycles, applied to the United States and the other large debtor nations.",
    summaryFr: "La grille de lecture de Dalio sur les cycles de dette souveraine, appliquée aux États-Unis et aux grands pays endettés." },
  { title: "The Art of Spending Money", author: "Morgan Housel", year: "2025", tag: "Behavioral Finance", tagFr: "Finance Comportementale", recent: true, coverColor: "#14466B",
    summary: "The follow-up to The Psychology of Money, on how people actually use wealth once they have it.",
    summaryFr: "La suite de The Psychology of Money, sur l'usage réel que l'on fait de son patrimoine une fois constitué." },
  { title: "The Corporate Life Cycle", author: "Aswath Damodaran", year: "2024", tag: "Corporate Finance", tagFr: "Finance d'Entreprise", recent: true, coverColor: "#1B3F72",
    summary: "How valuation, financing and management should change as a company moves from start-up to decline.",
    summaryFr: "Comment la valorisation, le financement et la gestion doivent évoluer de la start-up au déclin de l'entreprise." },
  { title: "On the Edge", author: "Nate Silver", year: "2024", tag: "Probability", tagFr: "Probabilité", recent: true, coverColor: "#1D6FA8",
    summary: "Expected value thinking among poker players, hedge funds and venture capital, and where it goes wrong.",
    summaryFr: "Le raisonnement en espérance de gain chez les joueurs de poker, les hedge funds et le capital-risque, et ses dérives." },
  { title: "Same as Ever", author: "Morgan Housel", year: "2023", tag: "Behavioral Finance", tagFr: "Finance Comportementale", recent: true, coverColor: "#0E86C7",
    summary: "Short essays on the behaviours that do not change from one market cycle to the next.",
    summaryFr: "De courts essais sur les comportements qui ne changent pas d'un cycle de marché à l'autre." },
  { title: "The Missing Billionaires", author: "Victor Haghani & James White", year: "2023", tag: "Risk Management", tagFr: "Gestion des Risques", recent: true, coverColor: "#0C2233",
    summary: "Position sizing, expected utility and the Kelly criterion applied to private wealth, by a former LTCM partner.",
    summaryFr: "Taille des positions, utilité espérée et critère de Kelly appliqués au patrimoine privé, par un ancien associé de LTCM." },
  { title: "Going Infinite", author: "Michael Lewis", year: "2023", tag: "Financial History", tagFr: "Histoire Financière", recent: true, coverColor: "#0B3558",
    summary: "The rise and collapse of FTX and Sam Bankman-Fried, reported from the inside.",
    summaryFr: "L'ascension et l'effondrement de FTX et de Sam Bankman-Fried, racontés de l'intérieur." },
  { title: "Chaos Kings", author: "Scott Patterson", year: "2023", tag: "Risk Management", tagFr: "Gestion des Risques", recent: true, coverColor: "#14466B",
    summary: "Tail-risk hedging in practice: Universa, Taleb and Spitznagel, and the traders who profit from crashes.",
    summaryFr: "La couverture du risque extrême en pratique : Universa, Taleb, Spitznagel et les traders qui gagnent pendant les krachs." },
  { title: "Causal Factor Investing", author: "Marcos López de Prado", year: "2023", tag: "Quant Investing", tagFr: "Gestion Quantitative", recent: true, coverColor: "#1B3F72",
    summary: "Why most published factors fail out of sample, and how causal inference can make factor research scientific.",
    summaryFr: "Pourquoi la plupart des facteurs publiés échouent hors échantillon, et comment l'inférence causale peut rendre la recherche rigoureuse." },
  { title: "Investing Amid Low Expected Returns", author: "Antti Ilmanen", year: "2022", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", recent: true, coverColor: "#1D6FA8",
    summary: "Asset class premia, style premia and illiquidity, with the evidence updated for a low-yield starting point.",
    summaryFr: "Primes de classes d'actifs, primes de style et illiquidité, avec des preuves mises à jour pour un monde de rendements faibles." },
  { title: "The Price of Time", author: "Edward Chancellor", year: "2022", tag: "Financial History", tagFr: "Histoire Financière", recent: true, coverColor: "#0E86C7",
    summary: "A history of interest rates and of what happens to capital allocation when money is kept too cheap.",
    summaryFr: "Une histoire des taux d'intérêt et de ce que devient l'allocation du capital quand l'argent reste trop bon marché." },
  { title: "Trillions", author: "Robin Wigglesworth", year: "2021", tag: "Passive Investing", tagFr: "Investissement Passif", recent: true, coverColor: "#0C2233",
    summary: "How index funds went from an academic idea to the dominant force in asset management.",
    summaryFr: "Comment les fonds indiciels sont passés d'une idée académique à la force dominante de la gestion d'actifs." },
  { title: "In Pursuit of the Perfect Portfolio", author: "Andrew W. Lo & Stephen R. Foerster", year: "2021", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", recent: true, coverColor: "#0B3558",
    summary: "Markowitz, Sharpe, Fama, Bogle, Scholes, Merton, Shiller and others on how they would build a portfolio.",
    summaryFr: "Markowitz, Sharpe, Fama, Bogle, Scholes, Merton, Shiller et d'autres expliquent comment ils construiraient un portefeuille." },
  { title: "Richer, Wiser, Happier", author: "William Green", year: "2021", tag: "Investment Philosophy", tagFr: "Philosophie d'Investissement", recent: true, coverColor: "#14466B",
    summary: "Interviews with Munger, Marks, Templeton, Pabrai and other long-term investors on process and temperament.",
    summaryFr: "Entretiens avec Munger, Marks, Templeton, Pabrai et d'autres investisseurs de long terme sur la méthode et le tempérament." },
];

// Most read first. Titles that are not listed follow, featured ones before the rest.
const POPULARITY: string[] = [
  "The Intelligent Investor", "A Random Walk Down Wall Street", "The Psychology of Money", "Thinking, Fast and Slow",
  "One Up On Wall Street", "The Little Book of Common Sense Investing", "Market Wizards", "The Black Swan",
  "Reminiscences of a Stock Operator", "Principles", "The Most Important Thing", "L'art du trading",
  "Security Analysis", "Common Stocks and Uncommon Profits", "Fooled by Randomness", "The Big Short",
  "Trading in the Zone", "Technical Analysis of the Financial Markets", "Stocks for the Long Run", "Margin of Safety",
  "Poor Charlie's Almanack", "The Essays of Warren Buffett", "Options, Futures, and Other Derivatives", "Flash Boys",
  "The Man Who Solved the Market", "When Genius Failed", "Liar's Poker", "Irrational Exuberance", "Antifragile",
  "The Four Pillars of Investing", "The Little Book That Still Beats the Market", "Beating the Street", "Misbehaving",
  "Japanese Candlestick Charting Techniques", "Trading for a Living", "Trend Following", "Dual Momentum Investing",
  "The Ivy Portfolio", "Expected Returns", "Advances in Financial Machine Learning", "Le Capital au XXIe siècle",
  "Psychologie des grands traders", "The Bogleheads' Guide to Investing", "Rich Dad Poor Dad", "The Simple Path to Wealth",
  "Against the Gods", "Manias, Panics, and Crashes", "The Ascent of Money", "Big Debt Crises", "The Changing World Order",
  "Mastering the Market Cycle", "Investment Valuation", "Quantitative Momentum", "Quantitative Value", "Following the Trend",
  "Efficiently Inefficient", "Active Portfolio Management", "Si la Bourse m'était contée", "Finance d'entreprise",
];
const rank = new Map(POPULARITY.map((t, i) => [t, i]));

/** Every book, most popular first. */
export const LIBRARY: Book[] = [
  ...BOOKS,
  ...MORE_BOOKS.map((b) => ({ ...b, link: b.link ?? g(b.title, b.author) })),
].sort((a, b) =>
  (rank.get(a.title) ?? 999) - (rank.get(b.title) ?? 999) ||
  Number(!!b.featured) - Number(!!a.featured) ||
  Number(b.year) - Number(a.year)
);

const plain = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** URL slug of a book, e.g. "lart-du-trading". */
export const bookSlug = (b: Book) => plain(b.title).replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const findBookBySlug = (slug: string) => LIBRARY.find((b) => bookSlug(b) === slug);

/** Individual authors of a book ("A, B & C" → ["a", "b", "c"]), accents removed. */
export const authorsOf = (b: Book) =>
  b.author.split(/\s*(?:,|&|\band\b|\bet\b)\s*/).map((a) => plain(a).replace(/\./g, "").trim()).filter(Boolean);

/** Other books that share at least one author, newest first. */
export const otherBooksByAuthor = (b: Book) => {
  const mine = new Set(authorsOf(b));
  return LIBRARY.filter((x) => x !== b && authorsOf(x).some((a) => mine.has(a))).sort((x, y) => Number(y.year) - Number(x.year));
};

/** The well-known titles shown first. */
export const HEADLINERS: Book[] = LIBRARY.filter((b) => (rank.get(b.title) ?? 999) < 12);
/** Best sellers: stock market investing and trading only (no real estate, no general personal finance), well-known authors. */
const BEST_SELLER_TITLES = [
  "The Intelligent Investor", "A Random Walk Down Wall Street", "One Up On Wall Street", "The Little Book of Common Sense Investing",
  "Common Stocks and Uncommon Profits", "The Essays of Warren Buffett", "Security Analysis", "Reminiscences of a Stock Operator",
  "Market Wizards", "Stocks for the Long Run", "The Most Important Thing", "Beating the Street", "L'art du trading",
  "Si la Bourse m'était contée", "Technical Analysis of the Financial Markets", "Trading in the Zone", "Psychologie des grands traders",
  "The Little Book That Still Beats the Market", "Margin of Safety", "Fooled by Randomness",
];
export const BEST_SELLERS: Book[] = BEST_SELLER_TITLES.map((t) => LIBRARY.find((b) => b.title === t)).filter(Boolean) as Book[];
/** Recent releases, newest first. */
export const RECENT: Book[] = LIBRARY.filter((b) => b.recent).sort((a, b) => Number(b.year) - Number(a.year));

// ───────────────────────── Research ─────────────────────────

export interface Paper {
  title: string;
  authors: string;
  year: number;
  venue: string;
  cat: CategoryId;
  en: string;
  fr: string;
  url: string;
}

const doi = (id: string) => `https://doi.org/${id}`;

/** Ordered by how often the work is cited in practice, within the page's own topics. */
export const PAPERS: Paper[] = [
  { title: "Portfolio Selection", authors: "Harry Markowitz", year: 1952, venue: "The Journal of Finance", cat: "index", url: doi("10.2307/2975974"),
    en: "Mean-variance optimisation: the efficient frontier that every allocation tool still starts from.",
    fr: "L'optimisation moyenne-variance : la frontière efficiente dont partent encore tous les outils d'allocation." },
  { title: "Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk", authors: "William F. Sharpe", year: 1964, venue: "The Journal of Finance", cat: "index", url: doi("10.1111/j.1540-6261.1964.tb02865.x"),
    en: "The CAPM: beta as the only priced risk, and the origin of the benchmark-relative view of performance.",
    fr: "Le MEDAF : le bêta comme seul risque rémunéré, et l'origine de la mesure de performance relative à un indice." },
  { title: "Efficient Capital Markets: A Review of Theory and Empirical Work", authors: "Eugene F. Fama", year: 1970, venue: "The Journal of Finance", cat: "index", url: doi("10.2307/2325486"),
    en: "The weak, semi-strong and strong forms of market efficiency, and the tests behind each.",
    fr: "Les formes faible, semi-forte et forte de l'efficience des marchés, et les tests associés." },
  { title: "Common Risk Factors in the Returns on Stocks and Bonds", authors: "Eugene F. Fama & Kenneth R. French", year: 1993, venue: "Journal of Financial Economics", cat: "quant", url: doi("10.1016/0304-405X(93)90023-5"),
    en: "The three-factor model: market, size and value explain most of the cross-section of returns.",
    fr: "Le modèle à trois facteurs : marché, taille et value expliquent l'essentiel des écarts de rendement entre actions." },
  { title: "Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency", authors: "Narasimhan Jegadeesh & Sheridan Titman", year: 1993, venue: "The Journal of Finance", cat: "quant", url: doi("10.1111/j.1540-6261.1993.tb04702.x"),
    en: "The paper that documented cross-sectional momentum over 3 to 12 month horizons.",
    fr: "L'article qui a établi le momentum relatif sur des horizons de 3 à 12 mois." },
  { title: "On Persistence in Mutual Fund Performance", authors: "Mark M. Carhart", year: 1997, venue: "The Journal of Finance", cat: "quant", url: doi("10.1111/j.1540-6261.1997.tb03808.x"),
    en: "Adds momentum as a fourth factor and shows that fund persistence is mostly costs and factor exposure.",
    fr: "Ajoute le momentum comme quatrième facteur et montre que la persistance des fonds tient surtout aux frais et aux facteurs." },
  { title: "A Quantitative Approach to Tactical Asset Allocation", authors: "Mebane T. Faber", year: 2007, venue: "The Journal of Wealth Management", cat: "quant", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=962461",
    en: "The 10-month moving average rule across five asset classes: similar returns, much smaller drawdowns.",
    fr: "La règle de la moyenne mobile 10 mois sur cinq classes d'actifs : rendement comparable, pertes maximales bien plus faibles." },
  { title: "Time Series Momentum", authors: "Tobias J. Moskowitz, Yao Hua Ooi & Lasse Heje Pedersen", year: 2012, venue: "Journal of Financial Economics", cat: "quant", url: doi("10.1016/j.jfineco.2011.11.003"),
    en: "Trend following measured on 58 futures markets: an asset's own past 12 months predict its next month.",
    fr: "Le suivi de tendance mesuré sur 58 marchés à terme : les 12 derniers mois d'un actif prédisent le mois suivant." },
  { title: "Value and Momentum Everywhere", authors: "Clifford S. Asness, Tobias J. Moskowitz & Lasse Heje Pedersen", year: 2013, venue: "The Journal of Finance", cat: "quant", url: doi("10.1111/jofi.12021"),
    en: "Value and momentum premia in eight markets and asset classes, negatively correlated with each other.",
    fr: "Les primes value et momentum dans huit marchés et classes d'actifs, négativement corrélées entre elles." },
  { title: "A Five-Factor Asset Pricing Model", authors: "Eugene F. Fama & Kenneth R. French", year: 2015, venue: "Journal of Financial Economics", cat: "quant", url: doi("10.1016/j.jfineco.2014.10.010"),
    en: "Profitability and investment join market, size and value.",
    fr: "La rentabilité et l'investissement rejoignent le marché, la taille et la value." },
  { title: "Momentum Crashes", authors: "Kent Daniel & Tobias J. Moskowitz", year: 2016, venue: "Journal of Financial Economics", cat: "quant", url: doi("10.1016/j.jfineco.2015.12.002"),
    en: "When momentum fails: sharp reversals after bear markets, and how volatility scaling limits them.",
    fr: "Quand le momentum échoue : retournements brutaux après les marchés baissiers, et comment le pilotage par la volatilité les limite." },
  { title: "Betting Against Beta", authors: "Andrea Frazzini & Lasse Heje Pedersen", year: 2014, venue: "Journal of Financial Economics", cat: "quant", url: doi("10.1016/j.jfineco.2013.10.005"),
    en: "The low-beta anomaly explained by leverage constraints.",
    fr: "L'anomalie des actions à faible bêta expliquée par les contraintes de levier." },
  { title: "Pseudo-Mathematics and Financial Charlatanism: The Effects of Backtest Overfitting on Out-of-Sample Performance", authors: "David H. Bailey, Jonathan M. Borwein, Marcos López de Prado & Qiji Jim Zhu", year: 2014, venue: "Notices of the American Mathematical Society", cat: "risk", url: scholar("Pseudo-Mathematics and Financial Charlatanism: The Effects of Backtest Overfitting on Out-of-Sample Performance"),
    en: "How few trials it takes to produce a backtest that looks excellent and means nothing. Required reading before trusting any simulation.",
    fr: "Combien d'essais suffisent pour obtenir un backtest excellent qui ne veut rien dire. À lire avant de se fier à une simulation." },
  { title: "... and the Cross-Section of Expected Returns", authors: "Campbell R. Harvey, Yan Liu & Heqing Zhu", year: 2016, venue: "The Review of Financial Studies", cat: "risk", url: doi("10.1093/rfs/hhv059"),
    en: "Hundreds of published factors, and the higher statistical bar a new one should clear given that much data mining.",
    fr: "Des centaines de facteurs publiés, et le seuil statistique plus élevé qu'un nouveau facteur devrait franchir après autant de data mining." },
  { title: "Optimal Versus Naive Diversification: How Inefficient is the 1/N Portfolio Strategy?", authors: "Victor DeMiguel, Lorenzo Garlappi & Raman Uppal", year: 2009, venue: "The Review of Financial Studies", cat: "index", url: doi("10.1093/rfs/hhm075"),
    en: "Equal weighting is hard to beat out of sample: estimation error eats the gains of optimisation.",
    fr: "L'équipondération est difficile à battre hors échantillon : l'erreur d'estimation absorbe les gains de l'optimisation." },
  { title: "Determinants of Portfolio Performance", authors: "Gary P. Brinson, L. Randolph Hood & Gilbert L. Beebower", year: 1986, venue: "Financial Analysts Journal", cat: "index", url: scholar("Determinants of Portfolio Performance"),
    en: "The study behind the claim that asset allocation policy explains most of the variation in portfolio returns.",
    fr: "L'étude à l'origine de l'idée que la politique d'allocation explique l'essentiel de la variation des rendements d'un portefeuille." },
  { title: "Determining Withdrawal Rates Using Historical Data", authors: "William P. Bengen", year: 1994, venue: "Journal of Financial Planning", cat: "index", url: scholar("Determining Withdrawal Rates Using Historical Data"),
    en: "The origin of the 4% rule, built on rolling historical periods.",
    fr: "L'origine de la règle des 4 %, construite sur des périodes historiques glissantes." },
  { title: "Beyond the Status Quo: A Critical Assessment of Lifecycle Investment Advice", authors: "Aizhan Anarkulova, Scott Cederburg & Michael S. O'Doherty", year: 2023, venue: "SSRN working paper", cat: "index", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4590406",
    en: "Bootstrap evidence from 38 developed markets that challenges bonds and target-date glide paths for retirement savers.",
    fr: "Des simulations sur 38 marchés développés qui remettent en cause les obligations et les fonds à horizon pour l'épargne retraite." },
  { title: "Do Stocks Outperform Treasury Bills?", authors: "Hendrik Bessembinder", year: 2018, venue: "Journal of Financial Economics", cat: "value", url: doi("10.1016/j.jfineco.2018.06.004"),
    en: "Most individual stocks underperform T-bills over their lifetime; a small minority creates all the net wealth.",
    fr: "La plupart des actions font moins bien que les bons du Trésor sur leur durée de vie ; une petite minorité crée toute la richesse nette." },
  { title: "Trading Is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors", authors: "Brad M. Barber & Terrance Odean", year: 2000, venue: "The Journal of Finance", cat: "trading", url: doi("10.1111/0022-1082.00226"),
    en: "66,000 brokerage accounts: the households that trade most earn the lowest net returns.",
    fr: "66 000 comptes de courtage : les ménages qui traitent le plus obtiennent les rendements nets les plus faibles." },
  { title: "Prospect Theory: An Analysis of Decision under Risk", authors: "Daniel Kahneman & Amos Tversky", year: 1979, venue: "Econometrica", cat: "risk", url: doi("10.2307/1914185"),
    en: "Loss aversion and reference dependence, the foundation of behavioural finance.",
    fr: "L'aversion aux pertes et la dépendance au point de référence, le socle de la finance comportementale." },
  { title: "The Pricing of Options and Corporate Liabilities", authors: "Fischer Black & Myron Scholes", year: 1973, venue: "Journal of Political Economy", cat: "pricing", url: doi("10.1086/260062"),
    en: "The option pricing formula and the replication argument behind it.",
    fr: "La formule de valorisation des options et l'argument de réplication qui la fonde." },
  { title: "A Century of Evidence on Trend-Following Investing", authors: "Brian Hurst, Yao Hua Ooi & Lasse Heje Pedersen", year: 2017, venue: "The Journal of Portfolio Management", cat: "quant", url: scholar("A Century of Evidence on Trend-Following Investing"),
    en: "Time series momentum tested back to 1880 across equities, bonds, currencies and commodities.",
    fr: "Le momentum absolu testé depuis 1880 sur actions, obligations, devises et matières premières." },
  { title: "The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting, and Non-Normality", authors: "David H. Bailey & Marcos López de Prado", year: 2014, venue: "The Journal of Portfolio Management", cat: "risk", url: scholar("The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality"),
    en: "A Sharpe ratio adjusted for the number of strategies tried and for fat tails.",
    fr: "Un ratio de Sharpe corrigé du nombre de stratégies testées et des queues épaisses." },
  { title: "SPIVA Scorecards", authors: "S&P Dow Jones Indices", year: 2025, venue: "Semi-annual report", cat: "index", url: "https://www.spglobal.com/spdji/en/research-insights/spiva/",
    en: "Twice a year, the share of active funds beaten by their benchmark, by region and horizon.",
    fr: "Deux fois par an, la part des fonds actifs battus par leur indice, par région et par horizon." },
];
