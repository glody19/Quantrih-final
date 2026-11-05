export type BookLevel = "beginner" | "intermediate" | "advanced";

export interface Book {
  title: string;
  level: BookLevel;
  author: string;
  year: string;
  tag: string;
  tagFr: string;
  summary: string;
  summaryFr: string;
  review?: string;
  reviewFr?: string;
  keyTakeaways?: string[];
  keyTakeawaysFr?: string[];
  featured?: boolean;
  link: string;
  coverColor?: string;
  isbn?: string;
  /** Original language of the book when it is not English. */
  origin?: "fr";
}

const CORE_BOOKS: Book[] = [
  {
    title: "Options, Futures, and Other Derivatives",
    level: "advanced",
    author: "John C. Hull",
    year: "2017",
    tag: "Derivatives",
    tagFr: "Produits Dérivés",
    summary: "The global benchmark on derivatives markets, trading dynamics, and risk management pricing architectures.",
    summaryFr: "La référence mondiale sur les marchés dérivés, la dynamique du trading et la tarification.",
    coverColor: "#b91c1c",
    isbn: "013447208X",
    featured: true,
    link: "https://www.amazon.com/Options-Futures-Other-Derivatives-10th/dp/013447208X"
  },
  {
    title: "Advances in Financial Machine Learning",
    level: "advanced",
    author: "Marcos Lopez de Prado",
    year: "2018",
    tag: "Machine Learning",
    tagFr: "Apprentissage Automatique",
    summary: "A pioneering exploration of machine learning algorithms applied to modern quantitative asset pricing.",
    summaryFr: "Une exploration pionnière des algorithmes de machine learning appliqués à la tarification quantitative moderne.",
    coverColor: "#4338ca",
    isbn: "1119482089",
    featured: true,
    link: "https://www.amazon.com/Advances-Financial-Machine-Learning-Marcos/dp/1119482089"
  },
  {
    title: "The Intelligent Investor",
    level: "intermediate",
    author: "Benjamin Graham",
    year: "1949",
    tag: "Value Investing",
    tagFr: "Investissement de Valeur",
    summary: "The definitive foundation on value investing, risk mitigation, and emotional market discipline.",
    summaryFr: "La fondation définitive sur l'investissement de valeur, l'atténuation des risques et la discipline du marché.",
    coverColor: "#1e3a8a",
    isbn: "0060555661",
    featured: true,
    link: "https://www.amazon.com/Intelligent-Investor-Benjamin-Graham/dp/0060555661"
  },
  {
    title: "Active Portfolio Management",
    level: "advanced",
    author: "Richard Grinold & Ronald Kahn",
    year: "1999",
    tag: "Quant Investing",
    tagFr: "Gestion Quantitative",
    summary: "The definitive mathematical guide for institutional investment managers and risk allocators.",
    summaryFr: "Le guide mathématique de référence pour les gestionnaires d'investissements institutionnels.",
    coverColor: "#0f172a",
    isbn: "0070248826",
    featured: false,
    link: "https://www.amazon.com/Active-Portfolio-Management-Quantitative-Controlling/dp/0070248826"
  },
  {
    title: "Thinking, Fast and Slow",
    level: "intermediate",
    author: "Daniel Kahneman",
    year: "2011",
    tag: "Behavioral Finance",
    tagFr: "Finance Comportementale",
    summary: "Comprehensive investigation into cognitive biases, heuristics, and human decision architectures under risk.",
    summaryFr: "Enquête approfondie sur les biais cognitifs et l'architecture des décisions humaines face au risque.",
    coverColor: "#333333",
    isbn: "0374533555",
    featured: false,
    link: "https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555"
  },
  {
    title: "Principles",
    level: "beginner",
    author: "Ray Dalio",
    year: "2017",
    tag: "Investment Philosophy",
    tagFr: "Philosophie d'Investissement",
    summary: "Dalio shares the core principles that guided his life and career, applicable to both personal decisions and systematic investment strategies.",
    summaryFr: "Dalio partage les principes fondamentaux qui ont guidé sa vie et sa carrière, applicables aux décisions personnelles et aux stratégies d'investissement.",
    coverColor: "#1e293b",
    isbn: "1501124021",
    featured: false,
    link: "https://www.amazon.com/Principles-Life-Work-Ray-Dalio/dp/1501124021"
  },
  {
    title: "The Little Book of Common Sense Investing",
    level: "beginner",
    author: "John C. Bogle",
    year: "2007",
    tag: "Passive Investing",
    tagFr: "Investissement Passif",
    summary: "Bogle makes the compelling case for low-cost, long-term index fund investing over active stock selection.",
    summaryFr: "Bogle plaide de manière convaincante pour l'investissement passif à long terme via des fonds indiciels à bas coûts plutôt que la sélection active.",
    coverColor: "#e11d48",
    isbn: "0470102101",
    featured: false,
    link: "https://www.amazon.com/Little-Book-Common-Sense-Investing/dp/0470102101"
  },
  {
    title: "The Psychology of Money",
    level: "beginner",
    author: "Morgan Housel",
    year: "2020",
    tag: "Behavioral Finance",
    tagFr: "Finance Comportementale",
    summary: "Exploring the strange ways people think about money and teaching you how to make better sense of one of life's most important topics.",
    summaryFr: "Explorer les façons étranges dont les gens pensent à l'argent et vous apprendre à mieux comprendre l'un des sujets les plus importants de la vie.",
    coverColor: "#5B4BDB",
    isbn: "9780857197689",
    featured: false,
    link: "https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681"
  },
  {
    title: "Rich Dad Poor Dad",
    level: "beginner",
    author: "Robert Kiyosaki",
    year: "1997",
    tag: "Personal Finance",
    tagFr: "Finances Personnelles",
    summary: "What the rich teach their kids about money that the poor and middle class do not!",
    summaryFr: "Ce que les riches enseignent à leurs enfants sur l'argent et que les pauvres et la classe moyenne ne font pas !",
    coverColor: "#b91c1c",
    isbn: "9781612680194",
    featured: false,
    link: "https://www.amazon.com/Rich-Dad-Poor-Teach-Middle/dp/1612680194"
  },
  {
    title: "The Bogleheads' Guide to Investing",
    level: "beginner",
    author: "Taylor Larimore",
    year: "2006",
    tag: "Personal Finance",
    tagFr: "Finances Personnelles",
    summary: "A practical guide to the Boglehead investing philosophy, detailing early savings, simple indexing, and long-term discipline.",
    summaryFr: "Un guide pratique de la philosophie d'investissement Boglehead, détaillant l'épargne précoce et l'indiciation simple.",
    coverColor: "#eab308",
    isbn: "0470067365",
    featured: false,
    link: "https://www.amazon.com/Bogleheads-Guide-Investing-Taylor-Larimore/dp/0470067365"
  },
  {
    title: "One Up On Wall Street",
    level: "beginner",
    author: "Peter Lynch",
    year: "1989",
    tag: "Stock Picking",
    tagFr: "Sélection d'Actions",
    summary: "How to use what you already know to make money in the market by identifying outstanding local consumer trends.",
    summaryFr: "Comment utiliser ce que vous savez déjà pour gagner de l'argent en observant la qualité de votre quotidien.",
    coverColor: "#0ea5e9",
    isbn: "0743200403",
    featured: false,
    link: "https://www.amazon.com/One-Up-On-Wall-Street/dp/0743200403"
  },
  {
    title: "Common Stocks and Uncommon Profits",
    level: "intermediate",
    author: "Philip Fisher",
    year: "1958",
    tag: "Growth Investing",
    tagFr: "Investissement de Croissance",
    summary: "A classic guide to investing that emphasizes the importance of understanding a company's business and management.",
    summaryFr: "Un guide classique de l'investissement qui souligne l'importance de comprendre l'activité et la gestion d'une entreprise.",
    coverColor: "#065f46",
    isbn: "9780471445500",
    featured: false,
    link: "https://www.amazon.com/Common-Stocks-Uncommon-Profits-Other/dp/0471445500"
  },
  {
    title: "The Black Swan",
    level: "intermediate",
    author: "Nassim Nicholas Taleb",
    year: "2007",
    tag: "Risk Management",
    tagFr: "Gestion des Risques",
    summary: "The extreme impact of highly improbable, random events on financial planning architectures and structural market fragility.",
    summaryFr: "L'impact du hautement improbable sur notre vision du monde, la planification et les modèles financiers.",
    coverColor: "#020617",
    isbn: "1400063515",
    featured: true,
    link: "https://www.amazon.com/Black-Swan-Improbable-Robustness-Fragility/dp/1400063515"
  },
  {
    title: "Security Analysis",
    level: "advanced",
    author: "Benjamin Graham & David Dodd",
    year: "1934",
    tag: "Value Investing",
    tagFr: "Investissement de Valeur",
    summary: "The ultimate classic foundational blueprint for auditing balance sheets, earnings power, and detecting undervalued assets.",
    summaryFr: "Le modèle fondamental classique de l'investissement de valeur pour l'évaluation des actifs et l'audit du bilan.",
    coverColor: "#7c3aed",
    isbn: "0071596089",
    featured: false,
    link: "https://www.amazon.com/Security-Analysis-Classic-1940-Edition/dp/0071596089"
  },
  {
    title: "Market Wizards",
    level: "intermediate",
    author: "Jack D. Schwager",
    year: "1989",
    tag: "Trading Psychology",
    tagFr: "Psychologie du Trading",
    summary: "Interviews with legendary traders detailing their exact strategies, risk control parameters, and mental discipline.",
    summaryFr: "Entretiens avec les meilleurs traders de la planète décrivant leur discipline psychologique de fer.",
    coverColor: "#d97706",
    isbn: "0887306101",
    featured: false,
    link: "https://www.amazon.com/Market-Wizards-Interviews-Top-Traders/dp/0887306101"
  },
  {
    title: "The Misbehavior of Markets",
    level: "intermediate",
    author: "Benoit Mandelbrot",
    year: "2004",
    tag: "Fractal Geometry",
    tagFr: "Géométrie Fractale",
    summary: "A mathematical critique of the normal distribution, proving financial returns exhibit wild volatility clustering and heavy tails.",
    summaryFr: "Une vision fractale de la turbulence financière, brisant le mythe des distributions normales gaustiennes.",
    coverColor: "#4f46e5",
    isbn: "0465043577",
    featured: false,
    link: "https://www.amazon.com/Misbehavior-Markets-Fractal-Financial-Turbulence/dp/0465043577"
  },
  {
    title: "Fooled by Randomness",
    level: "intermediate",
    author: "Nassim Nicholas Taleb",
    year: "2001",
    tag: "Probability",
    tagFr: "Probabilité",
    summary: "An investigation of probability, luck, and survivorship bias, detailing why speculatives are often mistaken for geniuses.",
    summaryFr: "Le rôle caché du hasard dans la vie et les marchés, démontrant pourquoi nous confondons chance et talent.",
    coverColor: "#059669",
    isbn: "0812975219",
    featured: false,
    link: "https://www.amazon.com/Fooled-Randomness-Hidden-Chance-Markets/dp/0812975219"
  },
  {
    title: "Expected Returns",
    level: "advanced",
    author: "Antti Ilmanen",
    year: "2011",
    tag: "Asset Allocation",
    tagFr: "Allocation d'Actifs",
    summary: "A monumental masterclass on extracting historical risk premiums across equities, bonds, credit, and alternative styles.",
    summaryFr: "L'étude de référence pour récolter les primes de risque à long terme sous tous les régimes macroéconomiques.",
    coverColor: "#ea580c",
    isbn: "1119990726",
    featured: true,
    link: "https://www.amazon.com/Expected-Returns-An-Investors-Guide/dp/1119990726"
  },
  {
    title: "The Little Book of Value Investing",
    level: "beginner",
    author: "Christopher Browne",
    year: "2006",
    tag: "Value Investing",
    tagFr: "Investissement de Valeur",
    summary: "A simple and accessible guide to the principles of value investing, explaining how to find stocks trading below their intrinsic value.",
    summaryFr: "Un guide simple et accessible aux principes de l'investissement de valeur.",
    coverColor: "#1e40af",
    isbn: "9780470058893",
    featured: false,
    link: "https://www.amazon.com/Little-Book-Value-Investing/dp/0470058893"
  },
  {
    title: "When Genius Failed",
    level: "intermediate",
    author: "Roger Lowenstein",
    year: "2000",
    tag: "Financial History",
    tagFr: "Histoire Financière",
    summary: "The spectacular cautionary tale of LTCM, showing how Nobel-winning formulas collapsed under sudden liquidity crunches.",
    summaryFr: "La chronique de l'effondrement de LTCM, illustrant la fragilité des modèles face à des corrélations extrêmes.",
    coverColor: "#701a75",
    isbn: "0375758259",
    featured: false,
    link: "https://www.amazon.com/When-Genius-Failed-Long-Term-Management/dp/0375758259"
  },
  {
    title: "Inside the Black Box",
    level: "intermediate",
    author: "Rishi K. Narang",
    year: "2009",
    tag: "Quant Strategy",
    tagFr: "Stratégie Quantitative",
    summary: "A highly accessible professional guide detailing how quantitative systematic models generate trading signals.",
    summaryFr: "Un guide d'expert expliquant comment les algorithmes quantitatifs capturent l'alpha et contrôlent le risque.",
    coverColor: "#1e3a8a",
    isbn: "1118362462",
    featured: false,
    link: "https://www.amazon.com/Inside-Black-Box-Simple-Quantitative/dp/1118362462"
  },
  {
    title: "Quantitative Momentum",
    level: "intermediate",
    author: "Wesley R. Gray",
    year: "2016",
    tag: "Trend Following",
    tagFr: "Suivi de Tendance",
    summary: "A quantitative research analysis on capturing systematic relative and absolute momentum trends in equities.",
    summaryFr: "Une étude rigoureuse sur la façon de construire des portefeuilles capturant l'anomalie de momentum.",
    coverColor: "#b45309",
    isbn: "1119276225",
    featured: false,
    link: "https://www.amazon.com/Quantitative-Momentum-Practitioners-Investing-Strategies/dp/1119276225"
  },
  {
    title: "Flash Boys",
    level: "beginner",
    author: "Michael Lewis",
    year: "2014",
    tag: "Market Microstructure",
    tagFr: "Microstructure du Marché",
    summary: "A non-fiction book that explores the world of high-frequency trading in the US equity market.",
    summaryFr: "Un livre qui explore le monde du trading haute fréquence sur le marché boursier américain.",
    coverColor: "#0f172a",
    isbn: "9780393244663",
    featured: false,
    link: "https://www.amazon.com/Flash-Boys-Wall-Street-Revolt/dp/0393244660"
  },
  {
    title: "The Man Who Solved the Market",
    level: "beginner",
    author: "Gregory Zuckerman",
    year: "2019",
    tag: "Financial History",
    tagFr: "Histoire Financière",
    summary: "The masterfully reported biography of Jim Simons and the rise of Renaissance Technologies' Medallion Fund.",
    summaryFr: "La biographie fascinante de Jim Simons et la révolution des mathématiques pures appliquées au trading.",
    coverColor: "#0369a1",
    isbn: "073521798X",
    featured: true,
    link: "https://www.amazon.com/Man-Who-Solved-Market-Revolution/dp/073521798X"
  },
  {
    title: "Liar's Poker",
    level: "beginner",
    author: "Michael Lewis",
    year: "1989",
    tag: "Wall Street Culture",
    tagFr: "Culture de Wall Street",
    summary: "A semi-autobiographical account of the author's experiences as a bond salesman at Salomon Brothers in the late 1980s.",
    summaryFr: "Un récit semi-autobiographique des expériences de l'auteur en tant que vendeur d'obligations chez Salomon Brothers.",
    coverColor: "#1e1b4b",
    isbn: "9780393338690",
    featured: false,
    link: "https://www.amazon.com/Liars-Poker-Michael-Lewis/dp/039333869X"
  },
  {
    title: "Dynamic Hedging",
    level: "advanced",
    author: "Nassim Nicholas Taleb",
    year: "1997",
    tag: "Derivatives",
    tagFr: "Produits Dérivés",
    summary: "A practical guide to managing vanilla and exotic options risk parameters under volatile real-world market distributions.",
    summaryFr: "Le guide technique de référence sur la gestion active et la couverture dynamique des produits dérivés.",
    coverColor: "#be185d",
    isbn: "0471152803",
    featured: false,
    link: "https://www.amazon.com/Dynamic-Hedging-Managing-Vanilla-Options/dp/0471152803"
  },
  {
    title: "Continuous-Time Finance",
    level: "advanced",
    author: "Robert C. Merton",
    year: "1990",
    tag: "Mathematical Finance",
    tagFr: "Finance Mathématique",
    summary: "The foundational mathematical blueprint of continuous-time asset pricing, consumption plans, and stochastic derivatives modeling.",
    summaryFr: "La dérivation ultime en temps continu de l'évaluation des actifs de Merton, lauréat du prix Nobel.",
    coverColor: "#312e81",
    isbn: "0631185089",
    featured: true,
    link: "https://www.amazon.com/Continuous-Time-Finance-Robert-C-Merton/dp/0631185089"
  },
  {
    title: "Fixed Income Securities",
    level: "advanced",
    author: "Bruce Tuckman & Angel Serrat",
    year: "2011",
    tag: "Fixed Income",
    tagFr: "Produits de Taux",
    summary: "Advanced analytical tools for managing corporate debt pricing, repo trading, yield curves, and swap valuation.",
    summaryFr: "Un ouvrage analytique clé pour modéliser et gérer les risques de taux sur les obligations mondiales.",
    coverColor: "#a21caf",
    isbn: "047047839X",
    featured: false,
    link: "https://www.amazon.com/Fixed-Income-Securities-Valuation-Risk-Management/dp/047047839X"
  },
  {
    title: "Corporate Finance",
    level: "intermediate",
    author: "Stephen Ross, Randolph Westerfield, Jeffrey Jaffe",
    year: "2015",
    tag: "Corporate Finance",
    tagFr: "Finance d'Entreprise",
    summary: "The gold-standard academic handbook for net present value rules, capital budgeting, and corporate capital structure.",
    summaryFr: "Le manuel de référence mondiale pour comprendre les décisions financières et budgétaires des entreprises.",
    coverColor: "#4A3BC0",
    isbn: "1259918947",
    featured: false,
    link: "https://www.amazon.com/Corporate-Finance-Stephen-Ross/dp/1259918947"
  }
];

export const SUMMARY_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Options, Futures, and Other Derivatives": {
    de: "Der globale Maßstab für Derivatemärkte, Handelsdynamik und Risikomanagement-Preise.",
    nl: "De wereldwijde benchmark voor derivatenmarkten, handelsdynamiek en risicobeheer.",
    es: "El referente mundial sobre mercados de derivados, dinámica de negociación y fijación de precios."
  },
  "Advances in Financial Machine Learning": {
    de: "Eine wegweisende Untersuchung von Algorithmen des maschinellen Lernens angewandt auf die quantitative Asset-Preisfindung.",
    nl: "Een baanbrekende verkenning van machine learning-algoritmen toegepast op kwantitatieve activaprijzen.",
    es: "Una exploración pionera de los algoritmos de aprendizaje automático aplicados a la fijación cuantitativa de precios de activos."
  },
  "The Intelligent Investor": {
    de: "Das definitive Fundament für Value Investing, Risikominderung und emotionale Marktdisziplin.",
    nl: "Het definitieve fundament voor waardebeleggen, risicomitigatie en emotionele marktdiscipline.",
    es: "La base definitiva sobre la inversión en valor, la mitigación de riesgos y la disciplina emocional del mercado."
  },
  "Active Portfolio Management": {
    de: "Der definitive mathematische Leitfaden für institutionelle Investmentmanager und Risikoallokatoren.",
    nl: "De definitieve wiskundige gids voor institutionele beleggingsbeheerders en risico-allocators.",
    es: "La guía matemática definitiva para gestores de inversiones institucionales y asignadores de riesgos."
  },
  "Thinking, Fast and Slow": {
    de: "Umfassende Untersuchung kognitiver Verzerrungen, Heuristiken und menschlicher Entscheidungsarchitekturen unter Risiko.",
    nl: "Uitgebreid onderzoek naar cognitieve biases, heuristieken en menselijke beslissingsarchitecturen onder risico.",
    es: "Investigación exhaustiva sobre sesgos cognitivos, heurísticas y arquitecturas de decisión humana bajo riesgo."
  },
  "Principles": {
    de: "Dalio teilt die Kernprinzipien, die sein Leben und seine Karriere geleitet haben, anwendbar auf persönliche Entscheidungen und systematische Anlagestrategien.",
    nl: "Dalio deelt de kernprincipes die zijn leven en carrière hebben geleid, toepasbaar op zowel persoonlijke beslissingen als systematische investeringsstrategieën.",
    es: "Dalio comparte los principios fundamentales que guiaron su vida y carrera, aplicables a decisiones personales y estrategias sistemáticas de inversión."
  },
  "The Little Book of Common Sense Investing": {
    de: "Bogle plädiert überzeugend für kostengünstiges, langfristiges Indexfonds-Investieren gegenüber aktiver Aktienauswahl.",
    nl: "Bogle pleit overtuigend voor goedkoop, langdurig indexbeleggen boven actieve aandelenselectie.",
    es: "Bogle defiende de manera convincente la inversión en fondos indexados a bajo costo y a largo plazo frente a la selección activa de acciones."
  },
  "The Psychology of Money": {
    de: "Erkundung der seltsamen Art und Weise, wie Menschen über Geld denken, und Vermittlung von Ansätzen für einen besseren Umgang mit Finanzen.",
    nl: "Onderzoek naar de vreemde manieren waarop mensen over geld denken en lessen om beter om te gaan met een van de belangrijkste onderwerpen van het leven.",
    es: "Exploración de las extrañas maneras en que la gente piensa sobre el dinero y lecciones sobre cómo tomar mejores decisiones financieras."
  },
  "Rich Dad Poor Dad": {
    de: "Was die Reichen ihren Kindern über Geld beibringen, was die Armen und die Mittelschicht nicht tun!",
    nl: "Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen!",
    es: "¡Lo que los ricos enseñan a sus hijos sobre el dinero que los pobres y la clase media no!"
  },
  "The Bogleheads' Guide to Investing": {
    de: "Ein praktischer Leitfaden zur Boglehead-Investmentphilosophie, der frühes Sparen, einfache Indexierung und langfristige Disziplin beschreibt.",
    nl: "Een praktische gids voor de Boglehead-beleggingsfilosofie, met details over vroeg sparen, eenvoudige indexering en langetermijndiscipline.",
    es: "Una guía práctica sobre la filosofía de inversión de los Bogleheads, detallando el ahorro temprano, la indexación simple y la disciplina a largo plazo."
  },
  "One Up On Wall Street": {
    de: "Wie Sie das nutzen, was Sie bereits wissen, um an den Märkten Geld zu verdienen, indem Sie herausragende lokale Konsumtrends erkennen.",
    nl: "Hoe u kunt gebruiken wat u al weet om geld te verdienen op de markt door uitstekende lokale consumententrends te identificeren.",
    es: "Cómo usar lo que ya sabe para ganar dinero en el mercado identificando tendencias destacadas de consumo local."
  },
  "Common Stocks and Uncommon Profits": {
    de: "Ein klassischer Leitfaden für Investitionen, der die Bedeutung des Verständnisses des Geschäfts und Managements eines Unternehmens hervorhebt.",
    nl: "Een klassieke gids voor beleggen die de nadruk legt op het belang van inzicht in de activiteiten en het management van een bedrijf.",
    es: "Una guía clásica de inversión que enfatiza la importancia de comprender el negocio y la gestión de una empresa."
  },
  "The Black Swan": {
    de: "Die extremen Auswirkungen höchst unwahrscheinlicher, zufälliger Ereignisse auf Finanzplanungsarchitekturen und strukturelle Marktfragilität.",
    nl: "De extreme impact van hoogst onwaarschijnlijke, willekeurige gebeurtenissen op financiële planning en structurele marktketsbaarheid.",
    es: "El impacto extremo de eventos aleatorios y altamente improbables en las arquitecturas de planificación financiera y la fragilidad estructural del mercado."
  },
  "Security Analysis": {
    de: "Der ultimative klassische Grundriss zur Prüfung von Bilanzen, Ertragskraft und zur Erkennung unterbewerteter Vermögenswerte.",
    nl: "De ultieme klassieke blauwdruk voor het controleren van balansen, winstkracht en het opsporen van ondergewaardeerde activa.",
    es: "El plano clásico definitivo para auditar balances, poder de ganancias y detectar activos infravalorados."
  },
  "Market Wizards": {
    de: "Interviews mit legendären Tradern, die ihre genauen Strategien, Risikokontrollparameter und mentale Disziplin beschreiben.",
    nl: "Interviews met legendarische handelaren waarin zij hun exacte strategieën, risicobeheersingsparameters en mentale discipline toelichten.",
    es: "Entrevistas con operadores legendarios que detallan sus estrategias exactas, parámetros de control de riesgos y disciplina mental."
  },
  "The Misbehavior of Markets": {
    de: "Eine mathematische Kritik der Normalverteilung, die beweist, dass Finanzrenditen wilde Volatilitätscluster und schwere Ränder aufweisen.",
    nl: "Een wiskundige kritiek op de normale verdeling, die bewijst dat financiële rendementen extreme volatiliteitsclustering en 'heavy tails' vertonen.",
    es: "Una crítica matemática de la distribución normal, que demuestra que los rendimientos financieros muestran una volatilidad agrupada salvaje y colas pesadas."
  },
  "Fooled by Randomness": {
    de: "Eine Untersuchung von Wahrscheinlichkeit, Glück und Überlebenden-Verzerrung, die zeigt, warum Spekulanten oft mit Genies verwechselt werden.",
    nl: "Een onderzoek naar waarschijnlijkheid, geluk en survivorship bias, met de details waarom speculanten vaak voor genieën worden aangezien.",
    es: "Una investigación de la probabilidad, la suerte y el sesgo de supervivencia, detallando por qué los especuladores a menudo son confundidos con genios."
  },
  "Expected Returns": {
    de: "Eine monumentale Meisterklasse über die Gewinnung historischer Risikoprämien bei Aktien, Anleihen, Krediten und alternativen Stilen.",
    nl: "Een monumentale masterclass over het oogsten van historische risicopremies op aandelen, obligaties, krediet- en alternatieve stijlen.",
    es: "Una clase magistral monumental sobre la obtención de primas de riesgo históricas en acciones, bonos, crédito y estilos alternativos."
  },
  "The Little Book of Value Investing": {
    de: "Ein einfacher und zugänglicher Leitfaden zu den Prinzipien des Value Investing, der erklärt, wie man Aktien findet, die unter ihrem inneren Wert gehandelt werden.",
    nl: "Een eenvoudige en toegankelijke gids voor de principes van waardebeleggen, waarin wordt uitgelegd hoe u aandelen kunt vinden die onder hun intrinsieke waarde worden verhandeld.",
    es: "Una guía sencilla y accesible sobre los principios de la inversión en valor, explicando cómo encontrar acciones que cotizan por debajo de su valor intrínseco."
  },
  "When Genius Failed": {
    de: "Die spektakuläre Mahnung von LTCM, die zeigt, wie nobelpreisgekrönte Formeln unter plötzlichen Liquiditätsengpässen zusammenbrachen.",
    nl: "Het spectaculaire waarschuwingsverhaal van LTCM, dat laat zien hoe Nobelprijs-winnende formules instortten onder plotselinge liquiditeitscrisissen.",
    es: "La espectacular historia de advertencia de LTCM, que muestra cómo las fórmulas ganadoras del Nobel colapsaron bajo repentinas crisis de liquidez."
  },
  "Inside the Black Box": {
    de: "Ein leicht verständlicher, professioneller Leitfaden, der detailliert beschreibt, wie quantitative systematische Modelle Handelssignale generieren.",
    nl: "Een zeer toegankelijke professionele gids die in detail beschrijft hoe kwantitatieve systematische modellen handelssignalen genereren.",
    es: "Una guía profesional altamente accesible que detalla cómo los modelos sistemáticos cuantitativos generan señales comerciales."
  },
  "Quantitative Momentum": {
    de: "Eine quantitative Forschungsanalyse zur Erfassung systematischer relativer und absoluter Momentumtrends bei Aktien.",
    nl: "Een kwantitatieve onderzoeksanalyse over het vastleggen van systematische relatieve en absolute momentumtrends in aandelen.",
    es: "Un análisis de investigación cuantitativa sobre la captura de tendencias de impulso sistemático relativo y absoluto en acciones."
  },
  "Flash Boys": {
    de: "Ein Sachbuch, das die Welt des Hochfrequenzhandels auf dem US-Aktienmarkt untersucht.",
    nl: "Een non-fictieboek dat de wereld van high-frequency trading op de Amerikaanse aandelenmarkt verkent.",
    es: "Un libro de no ficción que explora el mundo del trading de alta frecuencia en el mercado de valores de EE. UU."
  },
  "The Man Who Solved the Market": {
    de: "Die meisterhaft erzählte Biografie von Jim Simons und dem Aufstieg des Medallion Funds von Renaissance Technologies.",
    nl: "De meesterlijk geschreven biografie van Jim Simons en de opkomst van het Medallion Fund van Renaissance Technologies.",
    es: "La biografía magistralmente reportada de Jim Simons y el surgimiento del Medallion Fund de Renaissance Technologies."
  },
  "Liar's Poker": {
    de: "Ein halb-autobiografischer Bericht über die Erfahrungen des Autors als Rentenverkäufer bei Salomon Brothers Ende der 1980er Jahre.",
    nl: "Een semi-autobiografisch verslag van de ervaringen van de auteur als obligatieverkoper bij Salomon Brothers in de late jaren 1980.",
    es: "Un relato semiautobiográfico de las experiencias del autor como vendedor de bonos en Salomon Brothers a fines de la década de 1980."
  },
  "Dynamic Hedging": {
    de: "Ein praktischer Leitfaden zur Verwaltung von Vanilla- und exotischen Optionsrisikoparametern unter volatilen realen Marktverteilungen.",
    nl: "Een praktische gids voor het beheer van vanille- en exotica-optierisicoparameters onder volatiele reële marktdistributies.",
    es: "Una guía práctica para gestionar los parámetros de riesgo de opciones vanilla y exóticas bajo distribuciones de mercado reales y volátiles."
  },
  "Continuous-Time Finance": {
    de: "Der grundlegende mathematische Entwurf für die kontinuierliche Preisbewertung von Vermögenswerten, Konsumplänen und stochastischen Derivatmodellen.",
    nl: "De fundamentele wiskundige blauwdruk van continue-tijd activaprijzen, consumptieplannen en stochastische derivatenmodellering.",
    es: "El modelo matemático fundamental de la fijación de precios de activos en tiempo continuo, los planes de consumo y el modelado estocástico de derivados."
  },
  "Fixed Income Securities": {
    de: "Fortgeschrittene analytische Instrumente für das Management der Preisgestaltung von Unternehmensanleihen, Repo-Geschäften, Renditekurven und Swap-Bewertungen.",
    nl: "Geavanceerde analytische tools voor het beheren van de prijsstelling van bedrijfsschulden, repo-handel, rendementscurven en swapwaardering.",
    es: "Herramientas analíticas avanzadas para gestionar la fijación de precios de deuda corporativa, la negociación de repos, las curvas de rendimiento y la valoración de swaps."
  },
  "Corporate Finance": {
    de: "Das erstklassige akademische Handbuch für Kapitalwertregeln, Investitionsbudgetierung und Unternehmenskapitalstruktur.",
    nl: "Het academische handboek bij uitstek voor netto contante waarderegels, kapitaalbudgettering en de kapitaalstructuur van ondernemingen.",
    es: "El manual académico de referencia para las reglas de valor presente neto, la presupuestación de capital y la estructura de capital corporativo."
  }
};

const g = (title: string, author: string) =>
  `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${title} ${author}`)}`;

type NewBook = Omit<Book, "link"> & { link?: string };

const EXTRA_BOOKS: NewBook[] = [
  // ── Investment philosophy & value ─────────────────────────────
  { title: "The Most Important Thing", author: "Howard Marks", year: "2011", level: "intermediate", tag: "Investment Philosophy", tagFr: "Philosophie d'Investissement", featured: true, isbn: "9780231153683", coverColor: "#1f2937",
    summary: "Oaktree's co-founder on second-level thinking, risk control and buying when others are fearful.",
    summaryFr: "Le cofondateur d'Oaktree sur la pensée de second niveau, la maîtrise du risque et l'art d'acheter quand les autres ont peur." },
  { title: "Mastering the Market Cycle", author: "Howard Marks", year: "2018", level: "intermediate", tag: "Investment Philosophy", tagFr: "Philosophie d'Investissement", isbn: "9781328479259", coverColor: "#0f766e",
    summary: "How to recognise where we stand in economic, credit and sentiment cycles, and position a portfolio accordingly.",
    summaryFr: "Comment repérer où l'on se situe dans les cycles économiques, du crédit et du sentiment, et ajuster son portefeuille." },
  { title: "The Essays of Warren Buffett", author: "Warren Buffett & Lawrence Cunningham", year: "1997", level: "intermediate", tag: "Value Investing", tagFr: "Investissement de Valeur", featured: true, isbn: "9781611637588", coverColor: "#7c2d12",
    summary: "Buffett's shareholder letters organised by theme: governance, capital allocation, valuation and accounting.",
    summaryFr: "Les lettres aux actionnaires de Buffett classées par thème : gouvernance, allocation du capital, valorisation et comptabilité." },
  { title: "Margin of Safety", author: "Seth Klarman", year: "1991", level: "advanced", tag: "Value Investing", tagFr: "Investissement de Valeur", featured: true, isbn: "0887305105", coverColor: "#334155",
    summary: "The rare, risk-averse value investing manual from the founder of Baupost Group.",
    summaryFr: "Le manuel rare et prudent de value investing écrit par le fondateur de Baupost Group." },
  { title: "The Little Book That Still Beats the Market", author: "Joel Greenblatt", year: "2010", level: "beginner", tag: "Value Investing", tagFr: "Investissement de Valeur", isbn: "9780470624159", coverColor: "#b45309",
    summary: "The Magic Formula: buying good companies at cheap prices, explained in plain language.",
    summaryFr: "La Formule Magique : acheter de bonnes entreprises à bas prix, expliqué simplement." },
  { title: "You Can Be a Stock Market Genius", author: "Joel Greenblatt", year: "1997", level: "intermediate", tag: "Stock Picking", tagFr: "Sélection d'Actions", isbn: "9780684840079", coverColor: "#9a3412",
    summary: "Special situations investing: spin-offs, restructurings, mergers and other hidden opportunities.",
    summaryFr: "L'investissement en situations spéciales : scissions, restructurations, fusions et autres opportunités cachées." },
  { title: "Beating the Street", author: "Peter Lynch", year: "1993", level: "beginner", tag: "Stock Picking", tagFr: "Sélection d'Actions", isbn: "0671891634", coverColor: "#166534",
    summary: "Lynch walks through his Magellan Fund years and the checklist he used to pick winning stocks.",
    summaryFr: "Lynch revient sur ses années au fonds Magellan et sur la grille qu'il utilisait pour choisir ses actions." },
  { title: "Poor Charlie's Almanack", author: "Charlie Munger", year: "2005", level: "intermediate", tag: "Investment Philosophy", tagFr: "Philosophie d'Investissement", isbn: "9781578645015", coverColor: "#78350f",
    summary: "Munger's talks on mental models, incentives and the psychology of human misjudgment.",
    summaryFr: "Les discours de Munger sur les modèles mentaux, les incitations et la psychologie des erreurs de jugement." },
  { title: "The Dhandho Investor", author: "Mohnish Pabrai", year: "2007", level: "beginner", tag: "Value Investing", tagFr: "Investissement de Valeur", isbn: "9780470043899", coverColor: "#c2410c",
    summary: "Low-risk, high-return investing: few bets, big bets, infrequent bets.",
    summaryFr: "Investir avec peu de risque et beaucoup de rendement : peu de paris, de gros paris, rarement." },
  { title: "Value Investing: From Graham to Buffett and Beyond", author: "Bruce Greenwald", year: "2001", level: "advanced", tag: "Value Investing", tagFr: "Investissement de Valeur", isbn: "9780471463399", coverColor: "#1e3a5f",
    summary: "Columbia's framework for valuing assets, earnings power and franchise growth.",
    summaryFr: "La méthode de Columbia pour valoriser les actifs, la capacité bénéficiaire et la croissance des franchises." },

  // ── Passive investing & allocation ───────────────────────────
  { title: "A Random Walk Down Wall Street", author: "Burton G. Malkiel", year: "1973", level: "beginner", tag: "Passive Investing", tagFr: "Investissement Passif", featured: true, isbn: "9780393358384", coverColor: "#0e7490",
    summary: "The classic case that markets are hard to beat, and that low-cost index funds win over time.",
    summaryFr: "La démonstration classique que le marché est difficile à battre et que les fonds indiciels à bas coût gagnent sur la durée." },
  { title: "Stocks for the Long Run", author: "Jeremy J. Siegel", year: "1994", level: "intermediate", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", featured: true, isbn: "9780071800518", coverColor: "#1d4ed8",
    summary: "Two centuries of data on why equities have outperformed bonds, bills and gold over long horizons.",
    summaryFr: "Deux siècles de données montrant pourquoi les actions ont battu obligations, monétaire et or sur le long terme." },
  { title: "The Four Pillars of Investing", author: "William J. Bernstein", year: "2002", level: "beginner", tag: "Passive Investing", tagFr: "Investissement Passif", isbn: "9780071385299", coverColor: "#475569",
    summary: "Theory, history, psychology and business: the four foundations of a sound portfolio.",
    summaryFr: "Théorie, histoire, psychologie et industrie : les quatre piliers d'un portefeuille solide." },
  { title: "The Intelligent Asset Allocator", author: "William J. Bernstein", year: "2000", level: "intermediate", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", isbn: "9780071362368", coverColor: "#155e75",
    summary: "How correlation and rebalancing let a diversified portfolio beat its individual parts.",
    summaryFr: "Comment la corrélation et le rééquilibrage permettent à un portefeuille diversifié de faire mieux que ses composantes." },
  { title: "Unconventional Success", author: "David F. Swensen", year: "2005", level: "intermediate", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", isbn: "9780743228381", coverColor: "#1e40af",
    summary: "Yale's CIO on building a simple, low-cost, diversified portfolio for individual investors.",
    summaryFr: "Le directeur des investissements de Yale explique comment bâtir un portefeuille simple, peu coûteux et diversifié." },
  { title: "Pioneering Portfolio Management", author: "David F. Swensen", year: "2000", level: "advanced", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", isbn: "9781416544692", coverColor: "#172554",
    summary: "The Yale endowment model: equity bias, diversification and alternative assets for institutions.",
    summaryFr: "Le modèle de la fondation de Yale : biais actions, diversification et actifs alternatifs pour les institutions." },
  { title: "The Ivy Portfolio", author: "Mebane Faber & Eric Richardson", year: "2009", level: "intermediate", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", isbn: "9780470282489", coverColor: "#14532d",
    summary: "How to replicate Harvard and Yale endowment strategies with ETFs and a simple trend filter.",
    summaryFr: "Reproduire les stratégies des fondations de Harvard et Yale avec des ETF et un simple filtre de tendance." },
  { title: "Global Asset Allocation", author: "Mebane Faber", year: "2015", level: "beginner", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", coverColor: "#065f46",
    summary: "A data-driven comparison of the best-known allocation portfolios and what really drives their returns.",
    summaryFr: "Une comparaison chiffrée des allocations les plus connues et de ce qui détermine vraiment leurs rendements." },
  { title: "The Simple Path to Wealth", author: "JL Collins", year: "2016", level: "beginner", tag: "Personal Finance", tagFr: "Finances Personnelles", isbn: "9781533667922", coverColor: "#0f766e",
    summary: "Spend less than you earn, avoid debt, invest in a broad index fund. Financial independence made plain.",
    summaryFr: "Dépenser moins que ses revenus, éviter les dettes, investir dans un fonds indiciel large. L'indépendance financière expliquée simplement." },
  { title: "The Millionaire Next Door", author: "Thomas J. Stanley & William D. Danko", year: "1996", level: "beginner", tag: "Personal Finance", tagFr: "Finances Personnelles", isbn: "9781589795471", coverColor: "#92400e",
    summary: "A study of how real millionaires live: frugal, disciplined and far from the clichés of wealth.",
    summaryFr: "Une étude sur la vie des vrais millionnaires : économes, disciplinés et loin des clichés de la richesse." },

  // ── Quant, factors & trend following ─────────────────────────
  { title: "Dual Momentum Investing", author: "Gary Antonacci", year: "2014", level: "intermediate", tag: "Trend Following", tagFr: "Suivi de Tendance", isbn: "9780071849449", coverColor: "#4c1d95",
    summary: "Combining relative and absolute momentum to capture upside and sidestep bear markets.",
    summaryFr: "Combiner momentum relatif et absolu pour profiter des hausses et éviter les marchés baissiers." },
  { title: "Following the Trend", author: "Andreas F. Clenow", year: "2012", level: "advanced", tag: "Trend Following", tagFr: "Suivi de Tendance", isbn: "9781118410851", coverColor: "#3730a3",
    summary: "A practitioner's blueprint for diversified futures trend following, with full backtests.",
    summaryFr: "Le plan d'un praticien pour le suivi de tendance diversifié sur contrats à terme, backtests complets à l'appui." },
  { title: "Trend Following", author: "Michael W. Covel", year: "2004", level: "intermediate", tag: "Trend Following", tagFr: "Suivi de Tendance", coverColor: "#5b21b6",
    summary: "The history, track records and rules of the traders who ride trends instead of predicting them.",
    summaryFr: "L'histoire, les performances et les règles des traders qui suivent les tendances au lieu de les prédire." },
  { title: "Quantitative Value", author: "Wesley R. Gray & Tobias E. Carlisle", year: "2012", level: "advanced", tag: "Quant Investing", tagFr: "Gestion Quantitative", isbn: "9781118328071", coverColor: "#312e81",
    summary: "A systematic, backtested version of value investing that removes behavioural bias from stock selection.",
    summaryFr: "Une version systématique et testée du value investing qui retire les biais comportementaux de la sélection." },
  { title: "Efficiently Inefficient", author: "Lasse Heje Pedersen", year: "2015", level: "advanced", tag: "Quant Strategy", tagFr: "Stratégie Quantitative", isbn: "9780691166193", coverColor: "#1e1b4b",
    summary: "How hedge funds earn returns from equity, macro and arbitrage strategies, with interviews of top managers.",
    summaryFr: "Comment les hedge funds gagnent de l'argent avec les stratégies actions, macro et d'arbitrage, entretiens à l'appui." },
  { title: "Asset Pricing", author: "John H. Cochrane", year: "2001", level: "advanced", tag: "Mathematical Finance", tagFr: "Finance Mathématique", isbn: "9780691121376", coverColor: "#0c4a6e",
    summary: "The stochastic discount factor framework that unifies modern asset pricing theory.",
    summaryFr: "Le cadre du facteur d'actualisation stochastique qui unifie la théorie moderne de l'évaluation des actifs." },

  // ── Valuation & corporate finance ─────────────────────────────
  { title: "Investment Valuation", author: "Aswath Damodaran", year: "1996", level: "advanced", tag: "Corporate Finance", tagFr: "Finance d'Entreprise", isbn: "9781118011522", coverColor: "#7f1d1d",
    summary: "The reference on DCF, relative valuation and pricing any asset, from start-ups to banks.",
    summaryFr: "La référence sur les DCF, la valorisation relative et l'évaluation de tout actif, de la start-up à la banque." },
  { title: "The Little Book of Valuation", author: "Aswath Damodaran", year: "2011", level: "beginner", tag: "Corporate Finance", tagFr: "Finance d'Entreprise", isbn: "9781118004777", coverColor: "#991b1b",
    summary: "A short, practical introduction to valuing a company before you buy its shares.",
    summaryFr: "Une introduction courte et pratique pour valoriser une entreprise avant d'acheter ses actions." },
  { title: "Narrative and Numbers", author: "Aswath Damodaran", year: "2017", level: "intermediate", tag: "Corporate Finance", tagFr: "Finance d'Entreprise", isbn: "9780231180481", coverColor: "#9f1239",
    summary: "Why every good valuation connects a credible story to the numbers behind it.",
    summaryFr: "Pourquoi toute bonne valorisation relie une histoire crédible aux chiffres qui la soutiennent." },

  // ── Behavioural finance & probability ────────────────────────
  { title: "Irrational Exuberance", author: "Robert J. Shiller", year: "2000", level: "intermediate", tag: "Behavioral Finance", tagFr: "Finance Comportementale", isbn: "9780691173122", coverColor: "#a16207",
    summary: "The Nobel laureate's anatomy of speculative bubbles in stocks and real estate.",
    summaryFr: "L'anatomie des bulles spéculatives sur les actions et l'immobilier, par le prix Nobel." },
  { title: "Misbehaving", author: "Richard H. Thaler", year: "2015", level: "beginner", tag: "Behavioral Finance", tagFr: "Finance Comportementale", isbn: "9780393352795", coverColor: "#ca8a04",
    summary: "How behavioural economics was born, told by one of its founders.",
    summaryFr: "La naissance de l'économie comportementale racontée par l'un de ses fondateurs." },
  { title: "Nudge", author: "Richard H. Thaler & Cass R. Sunstein", year: "2008", level: "beginner", tag: "Behavioral Finance", tagFr: "Finance Comportementale", isbn: "9780143115267", coverColor: "#eab308",
    summary: "How small changes in choice design lead to better decisions about savings, health and money.",
    summaryFr: "Comment de petits changements dans la présentation des choix améliorent nos décisions d'épargne, de santé et d'argent." },
  { title: "Thinking in Bets", author: "Annie Duke", year: "2018", level: "beginner", tag: "Probability", tagFr: "Probabilité", isbn: "9780735216358", coverColor: "#be123c",
    summary: "A former poker champion on judging decisions by their process rather than their outcome.",
    summaryFr: "Une ancienne championne de poker explique comment juger une décision sur son processus plutôt que sur son résultat." },
  { title: "Superforecasting", author: "Philip E. Tetlock & Dan Gardner", year: "2015", level: "intermediate", tag: "Probability", tagFr: "Probabilité", isbn: "9780804136716", coverColor: "#0369a1",
    summary: "What makes some people consistently better at predicting the future, and how to learn it.",
    summaryFr: "Ce qui rend certaines personnes meilleures pour prévoir l'avenir, et comment l'apprendre." },
  { title: "Antifragile", author: "Nassim Nicholas Taleb", year: "2012", level: "intermediate", tag: "Risk Management", tagFr: "Gestion des Risques", isbn: "9780812979688", coverColor: "#111827",
    summary: "Systems that gain from disorder, and how to build a portfolio that benefits from volatility.",
    summaryFr: "Les systèmes qui profitent du désordre, et comment construire un portefeuille qui tire parti de la volatilité." },
  { title: "Against the Gods", author: "Peter L. Bernstein", year: "1996", level: "beginner", tag: "Risk Management", tagFr: "Gestion des Risques", isbn: "9780471295631", coverColor: "#57534e",
    summary: "The remarkable story of how humanity learned to measure and manage risk.",
    summaryFr: "La belle histoire de la façon dont l'humanité a appris à mesurer et à gérer le risque." },
  { title: "Value at Risk", author: "Philippe Jorion", year: "1996", level: "advanced", tag: "Risk Management", tagFr: "Gestion des Risques", isbn: "9780071464956", coverColor: "#44403c",
    summary: "The standard text on measuring market risk with VaR, stress tests and backtesting.",
    summaryFr: "Le manuel de référence pour mesurer le risque de marché avec la VaR, les stress tests et le backtesting." },

  // ── Trading & technical analysis ──────────────────────────────
  { title: "Reminiscences of a Stock Operator", author: "Edwin Lefèvre", year: "1923", level: "beginner", tag: "Trading Psychology", tagFr: "Psychologie du Trading", featured: true, isbn: "9780471770886", coverColor: "#713f12",
    summary: "The thinly veiled life of Jesse Livermore. Still the most quoted book on speculation.",
    summaryFr: "La vie à peine romancée de Jesse Livermore. Toujours le livre le plus cité sur la spéculation." },
  { title: "Trading in the Zone", author: "Mark Douglas", year: "2000", level: "intermediate", tag: "Trading Psychology", tagFr: "Psychologie du Trading", isbn: "9780735201446", coverColor: "#831843",
    summary: "Thinking in probabilities and building the mental discipline that consistent trading requires.",
    summaryFr: "Penser en probabilités et construire la discipline mentale qu'exige un trading régulier." },
  { title: "Technical Analysis of the Financial Markets", author: "John J. Murphy", year: "1999", level: "intermediate", tag: "Technical Analysis", tagFr: "Analyse Technique", isbn: "9780735200661", coverColor: "#0f172a",
    summary: "The comprehensive guide to charts, trends, indicators and intermarket analysis.",
    summaryFr: "Le guide complet des graphiques, tendances, indicateurs et de l'analyse intermarchés." },
  { title: "Trading for a Living", author: "Alexander Elder", year: "1993", level: "intermediate", tag: "Technical Analysis", tagFr: "Analyse Technique", isbn: "9780471592242", coverColor: "#155e75",
    summary: "Psychology, trading tactics and money management combined into one method.",
    summaryFr: "Psychologie, tactiques de trading et gestion du capital réunies en une seule méthode." },
  { title: "Japanese Candlestick Charting Techniques", author: "Steve Nison", year: "1991", level: "intermediate", tag: "Technical Analysis", tagFr: "Analyse Technique", isbn: "9780735201811", coverColor: "#b91c1c",
    summary: "The book that introduced candlestick charts to Western traders.",
    summaryFr: "Le livre qui a fait découvrir les chandeliers japonais aux traders occidentaux." },

  // ── Derivatives ───────────────────────────────────────────────
  { title: "Option Volatility and Pricing", author: "Sheldon Natenberg", year: "1994", level: "advanced", tag: "Derivatives", tagFr: "Produits Dérivés", isbn: "9780071818773", coverColor: "#7e22ce",
    summary: "The options trader's handbook on volatility, the Greeks and spread strategies.",
    summaryFr: "Le manuel du trader d'options sur la volatilité, les grecques et les stratégies d'écarts." },
  { title: "Volatility Trading", author: "Euan Sinclair", year: "2008", level: "advanced", tag: "Derivatives", tagFr: "Produits Dérivés", isbn: "9781118347133", coverColor: "#6b21a8",
    summary: "How to forecast volatility, size positions and trade the gap between implied and realised volatility.",
    summaryFr: "Prévoir la volatilité, dimensionner ses positions et exploiter l'écart entre volatilité implicite et réalisée." },

  // ── History & macro ───────────────────────────────────────────
  { title: "The Big Short", author: "Michael Lewis", year: "2010", level: "beginner", tag: "Financial History", tagFr: "Histoire Financière", isbn: "9780393338829", coverColor: "#dc2626",
    summary: "The few investors who saw the 2008 subprime collapse coming and bet against it.",
    summaryFr: "Les rares investisseurs qui ont vu venir la crise des subprimes de 2008 et ont parié contre." },
  { title: "The Great Crash 1929", author: "John Kenneth Galbraith", year: "1954", level: "beginner", tag: "Financial History", tagFr: "Histoire Financière", isbn: "9780547248165", coverColor: "#374151",
    summary: "A brisk, ironic account of the speculation that led to the 1929 crash.",
    summaryFr: "Un récit vif et ironique de la spéculation qui a mené au krach de 1929." },
  { title: "Manias, Panics, and Crashes", author: "Charles P. Kindleberger", year: "1978", level: "intermediate", tag: "Financial History", tagFr: "Histoire Financière", isbn: "9780230365353", coverColor: "#4b5563",
    summary: "Four centuries of financial crises and the recurring pattern behind them.",
    summaryFr: "Quatre siècles de crises financières et le schéma qui se répète derrière chacune." },
  { title: "Capital Ideas", author: "Peter L. Bernstein", year: "1992", level: "intermediate", tag: "Financial History", tagFr: "Histoire Financière", isbn: "9780471731740", coverColor: "#525252",
    summary: "How Markowitz, Sharpe, Black, Scholes and others invented modern portfolio theory.",
    summaryFr: "Comment Markowitz, Sharpe, Black, Scholes et d'autres ont inventé la théorie moderne du portefeuille." },
  { title: "Lords of Finance", author: "Liaquat Ahamed", year: "2009", level: "intermediate", tag: "Financial History", tagFr: "Histoire Financière", isbn: "9781594201820", coverColor: "#713f12",
    summary: "Four central bankers and the decisions that led the world into the Great Depression.",
    summaryFr: "Quatre banquiers centraux et les décisions qui ont plongé le monde dans la Grande Dépression." },
  { title: "The Ascent of Money", author: "Niall Ferguson", year: "2008", level: "beginner", tag: "Financial History", tagFr: "Histoire Financière", isbn: "9780143116172", coverColor: "#a16207",
    summary: "A financial history of the world, from Mesopotamian credit to modern hedge funds.",
    summaryFr: "Une histoire financière du monde, du crédit mésopotamien aux hedge funds modernes." },
  { title: "This Time Is Different", author: "Carmen M. Reinhart & Kenneth S. Rogoff", year: "2009", level: "advanced", tag: "Macroeconomics", tagFr: "Macroéconomie", isbn: "9780691152646", coverColor: "#1e293b",
    summary: "Eight centuries of data on sovereign defaults, banking crises and inflation.",
    summaryFr: "Huit siècles de données sur les défauts souverains, les crises bancaires et l'inflation." },
  { title: "Big Debt Crises", author: "Ray Dalio", year: "2018", level: "advanced", tag: "Macroeconomics", tagFr: "Macroéconomie", isbn: "9781732689800", coverColor: "#0f172a",
    summary: "Bridgewater's template for how debt cycles build up, break and get resolved.",
    summaryFr: "Le modèle de Bridgewater sur la formation, l'éclatement et la résolution des cycles d'endettement." },
  { title: "The Changing World Order", author: "Ray Dalio", year: "2021", level: "intermediate", tag: "Macroeconomics", tagFr: "Macroéconomie", isbn: "9781982160272", coverColor: "#7f1d1d",
    summary: "The rise and decline of reserve currencies and empires over five hundred years.",
    summaryFr: "L'essor et le déclin des monnaies de réserve et des empires sur cinq siècles." },

  // ── Ouvrages francophones ─────────────────────────────────────
  { title: "Le Capital au XXIe siècle", author: "Thomas Piketty", year: "2013", level: "intermediate", tag: "Macroeconomics", tagFr: "Macroéconomie", featured: true, origin: "fr", isbn: "9782021082289", coverColor: "#991b1b",
    summary: "A historical study of wealth and income inequality, built on three centuries of tax data.",
    summaryFr: "Une étude historique des inégalités de patrimoine et de revenus, fondée sur trois siècles de données fiscales." },
  { title: "Finance d'entreprise", author: "Pierre Vernimmen", year: "1974", level: "intermediate", tag: "Corporate Finance", tagFr: "Finance d'Entreprise", featured: true, origin: "fr", coverColor: "#1e3a8a",
    summary: "The French-speaking reference on corporate finance, valuation and financial analysis, updated every year.",
    summaryFr: "La référence francophone de la finance d'entreprise, de la valorisation et de l'analyse financière, mise à jour chaque année." },
  { title: "Marchés financiers : gestion de portefeuille et des risques", author: "Bertrand Jacquillat, Bruno Solnik & Christophe Pérignon", year: "1988", level: "advanced", tag: "Asset Allocation", tagFr: "Allocation d'Actifs", origin: "fr", coverColor: "#0e7490",
    summary: "The French university standard on portfolio theory, asset pricing and risk management.",
    summaryFr: "Le manuel universitaire français de référence sur la théorie du portefeuille, l'évaluation des actifs et la gestion des risques." },
  { title: "Psychologie de l'investisseur et des marchés financiers", author: "Mickaël Mangot", year: "2008", level: "beginner", tag: "Behavioral Finance", tagFr: "Finance Comportementale", origin: "fr", coverColor: "#a21caf",
    summary: "A clear French introduction to the biases that drive investors and market anomalies.",
    summaryFr: "Une introduction claire aux biais qui guident les investisseurs et aux anomalies de marché." },
  { title: "Si la Bourse m'était contée", author: "André Kostolany", year: "1960", level: "beginner", tag: "Investment Philosophy", tagFr: "Philosophie d'Investissement", origin: "fr", coverColor: "#854d0e",
    summary: "The great European speculator shares anecdotes and lessons from a lifetime on the markets.",
    summaryFr: "Le grand spéculateur européen partage anecdotes et leçons tirées d'une vie passée sur les marchés." },
  { title: "Des lions menés par des ânes", author: "Charles Gave", year: "2003", level: "intermediate", tag: "Macroeconomics", tagFr: "Macroéconomie", origin: "fr", coverColor: "#b45309",
    summary: "A liberal economist's critique of European monetary policy and its effects on growth and markets.",
    summaryFr: "La critique, par un économiste libéral, de la politique monétaire européenne et de ses effets sur la croissance et les marchés." },
  { title: "Le Commerce des promesses", author: "Pierre-Noël Giraud", year: "2001", level: "intermediate", tag: "Financial History", tagFr: "Histoire Financière", origin: "fr", coverColor: "#475569",
    summary: "An essay on what finance really is: a trade in promises about the future, and why it is unstable.",
    summaryFr: "Un essai sur la nature de la finance : un commerce de promesses sur l'avenir, et pourquoi il est instable." },
  { title: "La crise, et après ?", author: "Jacques Attali", year: "2008", level: "beginner", tag: "Macroeconomics", tagFr: "Macroéconomie", origin: "fr", coverColor: "#1f2937",
    summary: "A short analysis of the 2008 crisis, its causes and the reforms it called for.",
    summaryFr: "Une analyse courte de la crise de 2008, de ses causes et des réformes qu'elle appelait." },
  { title: "Jusqu'à quand ? Pour en finir avec les crises financières", author: "Frédéric Lordon", year: "2008", level: "intermediate", tag: "Macroeconomics", tagFr: "Macroéconomie", origin: "fr", coverColor: "#7f1d1d",
    summary: "A critical look at financial deregulation and proposals to prevent future crises.",
    summaryFr: "Un regard critique sur la dérégulation financière et des propositions pour prévenir les crises." },
  { title: "La Bourse pour les Nuls", author: "Gérard Horny", year: "2006", level: "beginner", tag: "Personal Finance", tagFr: "Finances Personnelles", origin: "fr", coverColor: "#ca8a04",
    summary: "A step-by-step introduction to stocks, funds, orders and taxation for French-speaking beginners.",
    summaryFr: "Une introduction pas à pas aux actions, aux fonds, aux ordres de bourse et à la fiscalité pour débutants." },
];

const LEVEL_ORDER: Record<BookLevel, number> = { beginner: 0, intermediate: 1, advanced: 2 };

/** All books, featured titles first, then by level and title. */
export const BOOKS: Book[] = [
  ...CORE_BOOKS,
  ...EXTRA_BOOKS.map((b) => ({ ...b, link: b.link ?? g(b.title, b.author) })),
].sort((a, b) =>
  Number(!!b.featured) - Number(!!a.featured) ||
  LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] ||
  a.title.localeCompare(b.title)
);
