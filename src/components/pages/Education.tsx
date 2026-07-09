import React, { useState, useEffect } from "react";
import { BookOpen, Search, Star, MoveRight, ArrowUpRight, GraduationCap, PlayCircle, FileText, Video, Library, Activity, TrendingUp, Zap, Database, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { AdvancedRealTimeChart, EconomicCalendar, TechnicalAnalysis } from "react-ts-tradingview-widgets";

interface Book {
 title: string;
 author: string;
 year: string;
 tag: string;
 summary: string;
 summaryFr: string;
 featured?: boolean;
 link: string;
 coverColor?: string;
 pattern?: "dots" | "lines" | "grid" | "none";
 isbn?: string;
}

interface VideoData {
 title: string;
 titleFr: string;
 speaker: string;
 tag: string;
 tagFr: string;
 lang: string;
 videoId: string;
 summary: string;
 summaryFr: string;
 featured?: boolean;
}

interface Research {
 title: string;
 titleFr: string;
 authors: string;
 year: string;
 tag: string;
 tagFr: string;
 summary: string;
 summaryFr: string;
 imageUrl: string;
 link: string;
 featured?: boolean;
}

const BOOKS: Book[] = [
 {
  title: "Options, Futures, and Other Derivatives",
  author: "John C. Hull",
  year: "2017",
  tag: "Derivatives",
  summary: "The definitive guide to derivatives markets and pricing models.",
  summaryFr: "Le guide définitif sur les marchés dérivés et les modèles de valorisation.",
  link: "https://www.amazon.com/Options-Futures-Other-Derivatives-10th/dp/013447208X",
  coverColor: "#b91c1c",
  isbn: "013447208X"
 },
 {
  title: "Thinking, Fast and Slow",
  author: "Daniel Kahneman",
  year: "2011",
  tag: "Behavioral Finance",
  summary: "Insights into human psychology, cognitive biases, and economic decision making.",
  summaryFr: "Perspectives sur la psychologie humaine, les biais cognitifs et la prise de décision économique.",
  featured: true,
  link: "https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555",
  coverColor: "#333",
  isbn: "0374533555"
 },
 {
  title: "The Misbehavior of Markets",
  author: "Benoit Mandelbrot",
  year: "2004",
  tag: "Quantitative",
  summary: "A fractal view of financial turbulence and market behavior.",
  summaryFr: "Une vision fractale des turbulences financières et du comportement des marchés.",
  link: "https://www.amazon.com/Misbehavior-Markets-Fractal-Financial-Turbulence/dp/0465043577",
  coverColor: "#1e3a8a",
  isbn: "0465043577"
 },
 {
  title: "Fooled by Randomness",
  author: "Nassim Nicholas Taleb",
  year: "2001",
  tag: "Risk Management",
  summary: "The hidden role of chance in life and in the markets.",
  summaryFr: "Le rôle caché du hasard dans la vie et sur les marchés.",
  link: "https://www.amazon.com/Fooled-Randomness-Hidden-Markets-Incerto/dp/0812975219",
  coverColor: "#1e3a8a",
  isbn: "0812975219"
 },
 {
  title: "Algorithmic Trading",
  author: "Ernie Chan",
  year: "2013",
  tag: "Algorithmic Trading",
  summary: "Winning strategies and their rationale in systematic trading.",
  summaryFr: "Stratégies gagnantes et leur logique dans le trading systématique.",
  link: "https://www.amazon.com/Algorithmic-Trading-Winning-Strategies-Rationale/dp/1118460146",
  coverColor: "#059669",
  isbn: "1118460146"
 },
 {
  title: "Quantitative Equity Portfolio Management",
  author: "Ludwig B. Chincarini",
  year: "2006",
  tag: "Portfolio Management",
  summary: "An active approach to portfolio construction and management.",
  summaryFr: "Une approche active de la construction et de la gestion de portefeuille.",
  link: "https://www.amazon.com/Quantitative-Equity-Portfolio-Management-Construction/dp/0071459391",
  coverColor: "#0f172a",
  isbn: "0071459391"
 },
 {
  title: "Machine Learning for Algorithmic Trading",
  author: "Stefan Jansen",
  year: "2020",
  tag: "Machine Learning",
  summary: "Predictive models to extract signals from market and alternative data.",
  summaryFr: "Modèles prédictifs pour extraire des signaux du marché et des données alternatives.",
  link: "https://www.amazon.com/Machine-Learning-Algorithmic-Trading-alternative/dp/1839217715",
  coverColor: "#4338ca",
  isbn: "1839217715"
 },
 // Corporate Finance & Valuation (CFO)
 { 
 title: "Valuation: Measuring and Managing the Value of Companies", 
 author: "McKinsey & Company", 
 year: "2020", 
 tag: "Valuation", 
 summary: "The ultimate guide to corporate valuation and financial strategy for CFOs.", 
 summaryFr: "Le guide de référence pour la valorisation d'entreprise et la stratégie financière.",
 featured: true, 
 link: "https://www.amazon.com/Valuation-Measuring-Managing-Companies-Finance/dp/1119610885", 
 coverColor: "#0f172a",
 isbn: "1119610885"
 },
 { 
 title: "Corporate Finance", 
 author: "Jonathan Berk, Peter DeMarzo", 
 year: "2019", 
 tag: "Corporate", 
 summary: "Core principles of modern corporate finance, capital structure, and funding.", 
 summaryFr: "Principes fondamentaux de la finance d'entreprise moderne et structure du capital.",
 link: "https://www.amazon.com/Corporate-Finance-Jonathan-Berk/dp/013408327X", 
 coverColor: "#b91c1c",
 isbn: "013408327X"
 },
 
 // Quantitative Engineering (CTO)
 { 
 title: "Advances in Financial Machine Learning", 
 author: "Marcos Lopez de Prado", 
 year: "2018", 
 tag: "Machine Learning", 
 summary: "Advanced techniques for applying ML to financial data avoiding overfitting.", 
 summaryFr: "Techniques avancées pour appliquer le ML aux données financières sans surapprentissage.",
 featured: true,
 link: "https://www.amazon.com/Advances-Financial-Machine-Learning-Marcos/dp/1119482089", 
 coverColor: "#4338ca",
 isbn: "1119482089"
 },
 { 
 title: "Active Portfolio Management", 
 author: "Richard Grinold, Ronald Kahn", 
 year: "1999", 
 tag: "Quant Investing", 
 summary: "Quantitative approach to providing consistent alpha, the bible of systematic managers.", 
 summaryFr: "L'approche quantitative pour générer de l'alpha régulier, la bible des gérants systématiques.",
 link: "https://www.amazon.com/Active-Portfolio-Management-Quantitative-Controlling/dp/0070248826", 
 coverColor: "#1e3a8a",
 isbn: "0070248826"
 },
 { 
 title: "Python for Data Analysis", 
 author: "Wes McKinney", 
 year: "2017", 
 tag: "Data Science", 
 summary: "Detailed guide to data manipulation for financial analysis by pandas creator.", 
 summaryFr: "Guide détaillé de manipulation de données pour l'analyse financière par le créateur de pandas.",
 link: "https://www.amazon.com/Python-Data-Analysis-Wrangling-IPython/dp/1491957662", 
 coverColor: "#059669",
 isbn: "1491957662"
 },
 
 // Value & Fundamentals
 { 
 title: "The Intelligent Investor", 
 author: "Benjamin Graham", 
 year: "1949", 
 tag: "Value Investing", 
 summary: "The definitive book on value investing and defensive portfolio management.", 
 summaryFr: "L'ouvrage de référence sur l'investissement axé sur la valeur.",
 featured: true, 
 link: "https://www.amazon.com/Intelligent-Investor-Benjamin-Graham/dp/0060555661", 
 coverColor: "#1e3a8a",
 isbn: "0060555661"
 },
 { 
 title: "Security Analysis", 
 author: "Benjamin Graham", 
 year: "1934", 
 tag: "Fundamental", 
 summary: "The roadmap for analysis of financial securities.", 
 summaryFr: "La feuille de route pour l'analyse des titres financiers.",
 link: "https://www.amazon.com/Security-Analysis-Classic-1934-Edition/dp/0071448209", 
 coverColor: "#1e3a8a",
 isbn: "0071448209"
 },
 { 
 title: "Margin of Safety", 
 author: "Seth Klarman", 
 year: "1991", 
 tag: "Risk Management", 
 summary: "Risk-averse value investing strategies for the thoughtful investor.", 
 summaryFr: "Stratégies d'investissement de valeur pour l'investisseur prudent.",
 link: "https://www.goodreads.com/book/show/711270.Margin_of_Safety", 
 coverColor: "#333",
 isbn: "9780887305108"
 },
 
 // Quantitative & Systematic
 { 
 title: "Portfolio Selection", 
 author: "Harry Markowitz", 
 year: "1952", 
 tag: "Quant Investing", 
 summary: "The foundational paper that introduced Modern Portfolio Theory.", 
 summaryFr: "Le document fondateur qui a introduit la théorie moderne du portefeuille.",
 featured: true,
 link: "https://www.amazon.com/Portfolio-Selection-Efficient-Diversification-Investment/dp/0300013728",
 coverColor: "#2c6cad",
 isbn: "0300013728"
 },
 { 
 title: "Expected Returns", 
 author: "Antti Ilmanen", 
 year: "2011", 
 tag: "Quant Investing", 
 summary: "An investor's guide to harvesting market rewards across asset classes.", 
 summaryFr: "Un guide complet sur les rendements attendus de toutes les grandes classes d'actifs.",
 link: "https://www.amazon.com/Expected-Returns-Investors-Harvesting-Rewards/dp/1119990726",
 coverColor: "#4338ca",
 isbn: "1119990726"
 },
 { 
 title: "Dynamic Hedging", 
 author: "Nassim Nicholas Taleb", 
 year: "1997", 
 tag: "Derivatives", 
 summary: "Managing vanilla and exotic options from a practitioner's perspective.", 
 summaryFr: "Gestion des options classiques et exotiques du point de vue d'un praticien.",
 link: "https://www.amazon.com/Dynamic-Hedging-Managing-Vanilla-Exotic/dp/0471152803",
 coverColor: "#b91c1c",
 isbn: "0471152803"
 },
 { 
 title: "Option Volatility and Pricing", 
 author: "Sheldon Natenberg", 
 year: "1994", 
 tag: "Derivatives", 
 summary: "Advanced trading strategies and techniques for options.", 
 summaryFr: "Stratégies avancées et techniques de trading sur les options.",
 link: "https://www.amazon.com/Option-Volatility-Pricing-Strategies-Techniques/dp/0071818774",
 coverColor: "#059669",
 isbn: "0071818774"
 },
 
 // Behavioral & Psychology
 { 
 title: "Thinking, Fast and Slow", 
 author: "Daniel Kahneman", 
 year: "2011", 
 tag: "Psychology", 
 summary: "Explores the psychological biases that influence human judgment.", 
 summaryFr: "Exploration des biais psychologiques influençant le jugement.",
 featured: true, 
 link: "https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555", 
 coverColor: "#991b1b",
 isbn: "0374533555"
 },
 { 
 title: "The Psychology of Money", 
 author: "Morgan Housel", 
 year: "2020", 
 tag: "Behavioral", 
 summary: "Timeless lessons on wealth, greed, and happiness in financial decision-making.", 
 summaryFr: "Leçons intemporelles sur la richesse et l'avidité.",
 link: "https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681",
 coverColor: "#b91c1c",
 isbn: "0857197681"
 },
 { 
 title: "The Misbehavior of Markets", 
 author: "Benoit Mandelbrot", 
 year: "2004", 
 tag: "Fractal Finance", 
 summary: "A fractal view of financial turbulence, risk, and reward.", 
 summaryFr: "Une vision fractale de la turbulence financière et du risque.",
 link: "https://www.amazon.com/Misbehavior-Markets-Fractal-Financial-Turbulence/dp/0465043577",
 coverColor: "#4338ca",
 isbn: "0465043577"
 },

 // Strategy & Institutional
 { 
 title: "Principles", 
 author: "Ray Dalio", 
 year: "2017", 
 tag: "Strategy", 
 summary: "Unconventional principles for life and work from Bridgewater founder.", 
 summaryFr: "Principes non conventionnels pour la vie et le travail.",
 featured: true, 
 link: "https://www.amazon.com/Principles-Life-Work-Ray-Dalio/dp/1501124021", 
 coverColor: "#333333",
 isbn: "1501124021"
 },
 
 // Market History & Trading
 { 
 title: "Reminiscences of a Stock Operator", 
 author: "Edwin Lefèvre", 
 year: "1923", 
 tag: "History", 
 summary: "A fictionalized biography of Jesse Livermore, one of the greatest traders of all time.", 
 summaryFr: "Biographie romancée de Jesse Livermore, l'un des plus grands traders.",
 link: "https://www.amazon.com/Reminiscences-Stock-Operator-Edwin-Lefèvre/dp/0471059706", 
 coverColor: "#451a03",
 isbn: "0471059706"
 },
 { 
 title: "Flash Boys", 
 author: "Michael Lewis", 
 year: "2014", 
 tag: "HFT", 
 summary: "A Wall Street revolt and the rise of high-frequency trading.", 
 summaryFr: "Une révolte à Wall Street et l'essor du trading à haute fréquence.",
 link: "https://www.amazon.com/Flash-Boys-Wall-Street-Revolt/dp/0393244660", 
 coverColor: "#0f172a",
 isbn: "0393244660"
 },
 { 
 title: "The Snowball", 
 author: "Alice Schroeder", 
 year: "2008", 
 tag: "Biography", 
 summary: "The definitive biography of Warren Buffett and his investment philosophy.", 
 summaryFr: "La biographie définitive de Warren Buffett et de sa philosophie.",
 link: "https://www.amazon.com/Snowball-Warren-Buffett-Business-Life/dp/0553384619", 
 coverColor: "#f59e0b",
 isbn: "0553384619"
 },
];

const VIDEOS: VideoData[] = [
  {
    title: "How The Economic Machine Works",
    titleFr: "Comment Fonctionne la Machine Économique",
    speaker: "Ray Dalio",
    tag: "Macroeconomics",
    tagFr: "Macroéconomie",
    lang: "EN",
    videoId: "PHe0bXAIuk0",
    summary: "Ray Dalio breaks down the fundamental logic of the economic machine, exploring credit, interest rates, and debt cycles.",
    summaryFr: "Ray Dalio explique la logique fondamentale de la machine économique, explorant le crédit, les taux et les cycles de la dette.",
    featured: true
  },
  {
    title: "Finance & Capital Markets",
    titleFr: "Finance et Marchés des Capitaux",
    speaker: "Khan Academy",
    tag: "Finance Basics",
    tagFr: "Bases de la finance",
    lang: "EN",
    videoId: "F3QpgXBtDeo",
    summary: "An introduction to finance and capital markets by Khan Academy.",
    summaryFr: "Une introduction à la finance et aux marchés des capitaux par la Khan Academy.",
    featured: false
  },
  {
    title: "William Ackman: Everything You Need to Know About Finance and Investing in Under an Hour",
    titleFr: "Tout ce que vous devez savoir sur la finance en moins d'une heure",
    speaker: "Big Think",
    tag: "Investing",
    tagFr: "Investissement",
    lang: "EN",
    videoId: "WEDIj9JBTC8",
    summary: "Hedge fund manager Bill Ackman explains the basics of finance.",
    summaryFr: "Le gestionnaire de fonds Bill Ackman explique les bases de la finance.",
    featured: false
  }
];

const RESEARCH: Research[] = [
 {
 title: "The Cross-Section of Expected Stock Returns",
 titleFr: "La coupe transversale des rendements boursiers attendus",
 authors: "Eugene F. Fama & Kenneth R. French",
 year: "1992",
 tag: "Factor Investing",
 tagFr: "Investissement Factoriel",
 summary: "The landmark paper that introduced the Fama-French Three-Factor Model, profoundly changing how investors construct fundamental portfolios.",
 summaryFr: "Le document historique qui a introduit le modèle à trois facteurs de Fama-French, modifiant profondément la manière dont les investisseurs construisent leurs portefeuilles.",
 imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
 link: "https://www.jstor.org/stable/2329112",
 featured: true
 },
 {
 title: "Does Asset Allocation Policy Explain 40, 90, or 100 Percent of Performance?",
 titleFr: "La politique d'allocation d'actifs explique-t-elle 40, 90 ou 100 % de la performance ?",
 authors: "Roger G. Ibbotson & Paul D. Kaplan",
 year: "2000",
 tag: "Asset Allocation",
 tagFr: "Allocation d'Actifs",
 summary: "A critical study demonstrating the true impact of asset allocation versus active management on total portfolio returns.",
 summaryFr: "Une étude critique démontrant le véritable impact de l'allocation d'actifs par rapport à la gestion active sur les rendements totaux du portefeuille.",
 imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
 link: "https://www.cfainstitute.org/en/research/faj/2000/faj.v56.n1.2327",
 featured: true
 },
 {
 title: "A Century of Asset Allocation",
 titleFr: "Un siècle d'allocation d'actifs",
 authors: "AQR Capital Management",
 year: "2020",
 tag: "Macro",
 tagFr: "Macro",
 summary: "Research assessing portfolio construction over 100 years of market data, including inflationary environments and financial crises.",
 summaryFr: "Recherche évaluant la construction de portefeuilles sur 100 ans de données de marché, y compris les environnements inflationnistes et les crises financières.",
 imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
 link: "https://www.aqr.com/Insights/Research/White-Papers/A-Century-of-Asset-Allocation",
 }
];

const COURSES = [
 {
 title: "AQR Capital Management Research",
 provider: "AQR",
 level: "Advanced",
 type: "Research",
 link: "https://www.aqr.com/Insights/Research",
 summary: "Institutional quantitative research articles and white papers.",
 summaryFr: "Recherche quantitative institutionnelle et livres blancs."
 },
 {
 title: "MIT Finance Theory I",
 provider: "MIT OpenCourseWare",
 level: "Intermediate",
 type: "Course",
 link: "https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/",
 summary: "An introduction to the theory of finance and modern portfolio theory.",
 summaryFr: "Une introduction à la théorie de la finance et à la gestion de portefeuille moderne."
 },
 {
 title: "Fama-French Data Library",
 provider: "Ken French",
 level: "Advanced",
 type: "Data",
 link: "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html",
 summary: "Historical data sets for Fama-French models and risk factors.",
 summaryFr: "Base de données historique sur les modèles et facteurs de risques Fama-French."
 },
 {
 title: "Damodaran Online",
 provider: "Aswath Damodaran",
 level: "Advanced",
 type: "Valuation",
 link: "https://pages.stern.nyu.edu/~adamodar/",
 summary: "Data, research and teaching on corporate finance and valuation.",
 summaryFr: "Données, recherches et cours sur la finance d'entreprise et l'approche par les flux."
 }
];

export function Education() {
 const [search, setSearch] = useState("");
 const [activeTab, setActiveTab] = useState<'books' | 'videos'>('books');
 const { t, language } = useTranslation();

 return (
 <div className="min-h-screen -mt-8 py-16 px-4 md:px-8">
 <div className="space-y-16 animate-fade-up w-full mx-auto pb-32">
 {/* Hero search bar only */}
 <div className="relative w-full rounded-[2rem] bg-surface-2 border border-border overflow-hidden mb-12">
 <div className="absolute inset-0 bg-gradient-to-br from-pv-blue/5 to-transparent z-0" />
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-pv-blue/10 blur-[100px] rounded-full z-0" />
 <div className="relative z-10 p-8 md:p-12 flex justify-center">
 <div className="relative w-full max-w-2xl">
 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-pv-blue" />
 <input 
 type="text" 
 placeholder={"Search concepts, books, authors..."}
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full pl-14 pr-6 py-4 bg-surface border border-border rounded-[2rem] text-sm font-medium text-text placeholder-text-4 outline-none focus:border-pv-blue focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all shadow-xl"
 />
 </div>
 </div>
 </div>

 <div className="space-y-12">
 <div className="flex flex-wrap gap-3 border-b border-border pb-4">
 <TabButton active={activeTab === 'books'} onClick={() => setActiveTab('books')} icon={<Library size={16}/>} label={'Literature'} />
 <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} icon={<Video size={16}/>} label={'Masterclasses'} />
 </div>

 <div className="min-h-[500px] animate-fade-in">
 {activeTab === 'books' && <BooksSection search={search} language={language} />}
 {activeTab === 'videos' && <VideosSection search={search} language={language} />}
 </div>


 </div>
 </div>
 </div>
 );
}

function TheoryModule({ title, concept, description, icon, color }: { title: string, concept: string, description: string, icon: React.ReactNode, color: string }) {
 return (
 <div className={cn(
 "bg-surface border border-border rounded-[2rem] p-8 space-y-4 hover:shadow-2xl transition-all duration-500 group",
 color === 'blue' ? "hover:border-pv-blue" : color === 'emerald' ? "hover:border-emerald-500" : "hover:border-indigo-500"
 )}>
 <div className={cn(
 "w-12 h-12 rounded-[2rem] flex items-center justify-center transition-all duration-500",
 color === 'blue' ? "bg-pv-blue/10 text-pv-blue group-hover:bg-pv-blue group-hover:text-white" :
 color === 'emerald' ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
 "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white"
 )}>
 {icon}
 </div>
 <div className="space-y-1">
 <span className="text-xs font-semibold text-text">{concept}</span>
 <h3 className="text-xl font-bold text-text tracking-tight">{title}</h3>
 </div>
 <p className="text-sm text-text font-normal leading-relaxed">{description}</p>
 </div>
 );
}

function GlossaryItem({ term, definition }: { term: string, definition: string }) {
 return (
 <div className="space-y-2">
 <div className="text-sm font-semibold text-pv-blue border-b border-pv-blue/20 pb-2 w-max">{term}</div>
 <p className="text-sm text-text leading-relaxed font-normal">{definition}</p>
 </div>
 );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
 return (
 <button 
 onClick={onClick}
 className={cn(
 "px-5 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 transition-all duration-300", 
 active 
 ? "bg-pv-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
 : "bg-surface text-text hover:text-text border border-border hover:border-text-4"
 )}
 >
 {icon} {label}
 </button>
 );
}

function BooksSection({ search, language }: { search: string, language: string }) {
 const filtered = BOOKS.filter(b => 
 b.title.toLowerCase().includes(search.toLowerCase()) || 
 b.author.toLowerCase().includes(search.toLowerCase()) ||
 b.tag.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <section className="space-y-16">
 <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
 <BookOpen size={20} className="text-pv-blue" />
 <h2 className="text-sm md:text-base font-bold text-text">
 {'The Literature Collection'}
 </h2>
 </div>
 
 {filtered.length === 0 ? (
 <div className="text-center text-text py-20">{'No books found.'}</div>
 ) : (
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
 {filtered.map((b, i) => (
 <BookCard key={i} book={b} language={language} isSmall />
 ))}
 </div>
 )}
 </section>
 );
}

function VideosSection({ search, language }: { search: string, language: string }) {
  const [youtubeVideos, setYoutubeVideos] = useState<VideoData[]>([]);
  const [ytQuery, setYtQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchYoutube = async (queryToSearch: string) => {
    setIsLoading(true);
    try {
      const q = queryToSearch || "finance education";
      const res = await fetch(`/api/youtube/videos?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const items = await res.json();
        const mapped: VideoData[] = items.map((item: any) => ({
          title: item.snippet.title,
          titleFr: item.snippet.title,
          speaker: item.snippet.channelTitle,
          tag: "YouTube",
          tagFr: "YouTube",
          lang: "EN",
          videoId: item.id.videoId,
          summary: item.snippet.description,
          summaryFr: item.snippet.description,
          featured: false
        }));
        setYoutubeVideos(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch YouTube videos', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for quantitative finance videos
    fetchYoutube("quantitative finance backtesting");
  }, []);

  const allVideos = [...VIDEOS, ...youtubeVideos];

  const filtered = allVideos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) || 
    v.titleFr.toLowerCase().includes(search.toLowerCase()) || 
    v.speaker.toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered.filter(v => v.featured);
  const regular = filtered.filter(v => !v.featured);

  return (
    <section className="space-y-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <PlayCircle size={20} className="text-pv-blue" />
          <h2 className="text-sm md:text-base font-bold text-text">
            {'Lectures & Masterclasses'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search YouTube..."
            value={ytQuery}
            onChange={e => setYtQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchYoutube(ytQuery)}
            className="w-full md:w-64 px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm text-text placeholder-text-4 outline-none focus:border-pv-blue transition-colors"
          />
          <button 
            onClick={() => fetchYoutube(ytQuery)}
            disabled={isLoading}
            className="px-4 py-2 bg-pv-blue text-white rounded-xl text-sm font-semibold hover:bg-pv-blue-d transition-colors whitespace-nowrap"
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </div>
      </div>

 {featured.length > 0 && (
 <div className="space-y-6">
 <h3 className="text-xs font-bold text-pv-blue bg-pv-blue-bg w-max px-3 py-1 rounded">Featured Masterclasses</h3>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {featured.map((video, i) => (
 <VideoCard key={`feat-${i}`} video={video} language={language} isFeatured />
 ))}
 </div>
 </div>
 )}

 {regular.length > 0 && (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {regular.map((video, i) => (
 <VideoCard key={`reg-${i}`} video={video} language={language} />
 ))}
 </div>
 </div>
 )}
 </section>
 );
}

function ResearchSection({ search, language }: { search: string, language: string }) {
 const filtered = RESEARCH.filter(r => 
 r.title.toLowerCase().includes(search.toLowerCase()) || 
 r.titleFr.toLowerCase().includes(search.toLowerCase()) || 
 r.authors.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <section>
 <div className="flex items-center gap-3 mb-8">
 <FileText size={16} className="text-pv-blue" />
 <h2 className="text-xs md:text-sm font-bold text-text">
 {'Studies & Research Papers'}
 </h2>
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {filtered.map((research, i) => (
 <ResearchCard key={i} research={research} language={language} />
 ))}
 </div>
 </section>
 );
}

function CoursesSection({ language }: { language: string }) {
 return (
 <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {COURSES.map((course, i) => (
 <motion.a
 href={course.link}
 target="_blank"
 rel="noopener noreferrer"
 key={i}
 whileHover={{ y: -5 }}
 className="group p-8 bg-surface border border-border rounded-[1.5rem] text-left overflow-hidden relative shadow-sm hover:bg-surface-2 hover:border-pv-blue transition-all"
 >
 <div className="flex justify-between items-start mb-6">
 <div className="flex flex-col gap-2">
 <span className="text-xs font-bold text-pv-blue bg-pv-blue-bg px-3 py-1 rounded w-max">{course.type}</span>
 <h3 className="text-lg font-medium tracking-tighter italic">{course.title}</h3>
 </div>
 <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-surface-2 group-hover:bg-pv-blue transition-all">
 <ArrowUpRight size={20} className="text-text group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
 </div>
 </div>
 <div className="flex gap-4 mb-4 text-sm font-mono text-text ">
 <span>{course.provider}</span>
 <span className="text-border">|</span>
 <span>Level: {course.level}</span>
 </div>
 <p className="text-base text-text leading-relaxed">
 {language === 'fr' ? course.summaryFr : course.summary}
 </p>
 </motion.a>
 ))}
 </section>
 );
}


function BookCard({ book, language, isSmall }: { book: Book, language: string, isSmall?: boolean }) {
 const [coverUrl, setCoverUrl] = useState<string | null>(book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : null);

 useEffect(() => {
 if (!book.isbn) {
 const fetchCover = async () => {
 try {
 const query = encodeURIComponent(`intitle:${book.title} inauthor:${book.author}`);
 const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
 const data = await res.json();
 const img = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
 if (img) {
 setCoverUrl(img.replace('http:', 'https:').replace('zoom=1', 'zoom=2'));
 }
 } catch (e) {}
 };
 const timeoutId = setTimeout(fetchCover, Math.random() * 1000);
 return () => clearTimeout(timeoutId);
 }
 }, [book.title, book.author, book.isbn]);

 const searchLink = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
 const finalLink = book.link === "#" || book.link.includes('amazon.') ? searchLink : book.link;

 return (
 <motion.a
 href={finalLink}
 target="_blank"
 rel="noopener noreferrer"
 whileHover={{ y: -4 }}
 className="group flex flex-col h-full bg-surface border border-border rounded-[1.5rem] overflow-hidden shadow-sm transition-all duration-300 hover:border-pv-blue"
 >
 <div className="relative overflow-hidden flex flex-col items-center justify-center bg-surface-2 h-32 lg:h-36">
 
 {coverUrl ? (
 <img 
 src={coverUrl} 
 alt={book.title}
 className="w-auto h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-10 py-2"
 referrerPolicy="no-referrer"
 onError={() => setCoverUrl(null)}
 />
 ) : (
 <div className="flex-1 flex flex-col justify-center items-start p-4 text-left w-full h-full" style={{ borderLeft: `4px solid ${book.coverColor || '#3B82F6'}` }}>
 <div className="text-[8px] font-bold text-text mb-1 line-clamp-1">{book.tag}</div>
 <div className="font-medium tracking-tight text-text leading-tight text-xs sm:text-xs mb-1 line-clamp-4">{book.title}</div>
 <div className="text-xs text-text line-clamp-1">{book.author}</div>
 </div>
 )}
 </div>

 <div className="p-3 flex flex-col flex-1">
 <h4 className="text-xs sm:text-sm font-bold text-text leading-tight group-hover:text-pv-blue transition-colors line-clamp-2">
 {book.title}
 </h4>
 <p className="text-xs sm:text-xs text-text font-normal leading-relaxed italic flex-1 mt-2 mb-2" title={language === 'fr' ? book.summaryFr : book.summary}>
 {language === 'fr' ? book.summaryFr : book.summary}
 </p>
 <div className="pt-2 mt-2 border-t border-border flex items-center justify-between text-xs font-semibold text-pv-blue opacity-80 group-hover:opacity-100 transition-opacity">
 <span className="hidden sm:inline-block">{'Explore'}</span>
 <MoveRight size={12} className="group-hover:translate-x-1 transition-transform ml-auto" />
 </div>
 </div>
 </motion.a>
 );
}

function VideoCard({ video, language, isFeatured }: { video: VideoData, language: string, isFeatured?: boolean }) {
 return (
 <div className={cn(
 "flex flex-col h-full bg-surface border border-border rounded-[2rem] overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300 hover:border-pv-blue/50",
 isFeatured ? "shadow-md shadow-pv-blue/5" : "shadow-sm"
 )}>
 <div className={cn("relative w-full bg-black overflow-hidden", isFeatured ? "aspect-video" : "aspect-video")}>
 <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-surface-2 transition-colors group">
    <img src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity duration-300" />
    <div className="relative z-10 flex items-center gap-2 text-white font-bold group-hover:scale-105 transition-transform bg-black/60 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm">
        <PlayCircle size={24} className="text-white" />
        <span className="text-sm">Watch on YouTube</span>
    </div>
</a>
 </div>
 <div className="p-6 md:p-8 flex flex-col flex-1">
 <div className="flex gap-2 items-center mb-3">
 <span className="text-xs font-bold text-pv-blue bg-pv-blue-bg px-2 py-0.5 rounded">
 {language === 'fr' ? video.tagFr : video.tag}
 </span>
 <span className="text-xs font-mono text-text border border-border px-2 py-0.5 rounded">
 {video.lang}
 </span>
 </div>
 
 <h3 className={cn("font-medium tracking-tighter italic leading-tight text-text mb-1", isFeatured ? "text-2xl" : "text-lg md:text-xl")}>
 {language === 'fr' ? video.titleFr : video.title}
 </h3>
 
 <div className="text-xs font-bold text-text mb-4">
 {video.speaker}
 </div>
 
 <p className="text-xs md:text-sm text-text leading-relaxed mt-auto border-t border-border pt-4">
 {language === 'fr' ? video.summaryFr : video.summary}
 </p>
 </div>
 </div>
 );
}

function InteractiveLab({ language }: { language: string }) {
 return (
 <section className="space-y-12">
 <div className="flex items-center gap-3 mb-8">
 <Activity size={16} className="text-pv-blue" />
 <h2 className="text-xs md:text-sm font-bold text-text">
 {'Live Analysis & Macroeconomics'}
 </h2>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-max">
 <div className="lg:col-span-2 space-y-6">
 <h3 className="text-sm font-bold text-text flex items-center gap-2">
 <TrendingUp size={14} className="text-emerald-500" />
 {'Real-Time Chart'}
 </h3>
 <div className="bg-surface border border-border rounded-[2rem] overflow-hidden h-[600px] shadow-sm relative">
 <AdvancedRealTimeChart 
 theme="light" 
 symbol="NASDAQ:AAPL"
 autosize
 hide_top_toolbar={false}
 hide_legend={false}
 />
 </div>
 </div>

 <div className="space-y-6">
 <h3 className="text-sm font-bold text-text flex items-center gap-2">
 <Calendar size={14} className="text-pv-blue" />
 {'Economic Calendar'}
 </h3>
 <div className="bg-surface border border-border rounded-[2rem] overflow-hidden h-[600px] shadow-sm">
 <EconomicCalendar 
 colorTheme="light" 
 height="100%" 
 width="100%" 
 locale={'en'}
 />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-8 mt-12">
 <div className="space-y-6">
 <h3 className="text-sm font-bold text-text flex items-center gap-2">
 <Zap size={14} className="text-amber-500" />
 {'Technical Analysis (S&P 500)'}
 </h3>
 <div className="bg-surface border border-border rounded-[2rem] overflow-hidden h-[450px] shadow-sm">
 <TechnicalAnalysis 
 colorTheme="light" 
 symbol="SP:SPX"
 height="100%"
 width="100%"
 locale={'en'}
 />
 </div>
 </div>
 </div>
 </section>
 );
}

function ResearchCard({ research, language }: { research: Research, language: string }) {
 return (
 <motion.a 
 href={research.link}
 target="_blank"
 rel="noopener noreferrer"
 whileHover={{ y: -5 }}
 className="group flex flex-col md:flex-row h-full bg-surface border border-border rounded-[2rem] overflow-hidden shadow-sm hover:border-pv-blue hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300"
 >
 <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-surface-2 border-b md:border-b-0 md:border-r border-border">
 {research.featured && (
 <div className="absolute top-4 left-4 bg-bg text-text text-xs font-semibold px-3 py-1.5 rounded-full z-20 shadow-md">
 Top Paper
 </div>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
 <img 
 src={research.imageUrl} 
 alt={research.title}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
 />
 <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
 <span className="text-xs font-mono text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur-md">
 {research.year}
 </span>
 </div>
 </div>
 
 <div className="p-6 md:p-8 flex flex-col flex-1 md:w-3/5">
 <div className="flex gap-2 items-center mb-4">
 <span className="text-xs font-bold text-pv-blue bg-pv-blue-bg px-2.5 py-1 rounded">
 {language === 'fr' ? research.tagFr : research.tag}
 </span>
 </div>
 
 <h3 className="text-xl md:text-lg font-medium tracking-tighter italic leading-[1.1] text-text mb-4">
 {language === 'fr' ? research.titleFr : research.title}
 </h3>
 
 <div className="text-xs font-bold text-text mb-6">
 {research.authors}
 </div>
 
 <p className="text-sm md:text-base text-text leading-relaxed mb-6 italic">
 {language === 'fr' ? research.summaryFr : research.summary}
 </p>

 <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
 <span className="text-xs font-semibold text-text opacity-70 group-hover:opacity-100 transition-opacity">
 {'Read Paper'}
 </span>
 <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center bg-surface group-hover:bg-pv-blue transition-colors">
 <ArrowUpRight size={14} className="text-text group-hover:text-white transition-colors" />
 </div>
 </div>
 </div>
 </motion.a>
 );
}
