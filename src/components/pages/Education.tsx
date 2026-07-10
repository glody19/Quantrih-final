import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  MoveRight, 
  ArrowUpRight, 
  PlayCircle, 
  Video, 
  Library, 
  TrendingUp, 
  Calendar, 
  Zap, 
  BookMarked,
  Award,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { AdvancedRealTimeChart, EconomicCalendar, TechnicalAnalysis } from "react-ts-tradingview-widgets";

interface Book {
  title: string;
  author: string;
  year: string;
  tag: string;
  tagFr: string;
  summary: string;
  summaryFr: string;
  review: string;
  reviewFr: string;
  keyTakeaways: string[];
  keyTakeawaysFr: string[];
  featured?: boolean;
  link: string;
  coverColor?: string;
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

const BOOKS: Book[] = [
  {
    title: "Options, Futures, and Other Derivatives",
    author: "John C. Hull",
    year: "2017",
    tag: "Derivatives",
    tagFr: "Produits Dérivés",
    summary: "The global benchmark on derivatives markets, trading dynamics, and risk management pricing architectures.",
    summaryFr: "La référence mondiale sur les marchés dérivés, la dynamique du trading et la tarification.",
    review: "This masterpiece dissects how contracts are created, traded, and valued. Essential reading for structured finance engineers and systematic quantitative managers.",
    reviewFr: "Ce chef-d'œuvre décortique la création, l'échange et l'évaluation des contrats. Lecture indispensable pour les ingénieurs quantitatifs.",
    keyTakeaways: [
      "Deep understanding of Black-Scholes-Merton pricing formulation.",
      "Hands-on risk neutral valuation of multi-asset exotics.",
      "Practical hedging techniques using delta, gamma, and vega parameters."
    ],
    keyTakeawaysFr: [
      "Compréhension approfondie de la formulation de Black-Scholes-Merton.",
      "Évaluation neutre au risque des options classiques et exotiques.",
      "Techniques pratiques de couverture utilisant le delta, le gamma et le vega."
    ],
    coverColor: "#b91c1c",
    isbn: "013447208X",
    featured: true,
    link: "https://www.amazon.com/Options-Futures-Other-Derivatives-10th/dp/013447208X"
  },
  {
    title: "Advances in Financial Machine Learning",
    author: "Marcos Lopez de Prado",
    year: "2018",
    tag: "Machine Learning",
    tagFr: "Apprentissage Automatique",
    summary: "A pioneering exploration of machine learning algorithms applied to modern quantitative asset pricing.",
    summaryFr: "Une exploration pionnière des algorithmes de machine learning appliqués à la tarification quantitative moderne.",
    review: "De Prado exposes why standard ML approaches fail in finance and details robust statistical solutions to avoid overfitting and data leakage.",
    reviewFr: "De Prado explique pourquoi les approches standards échouent en finance et détaille des solutions robustes pour éviter le surapprentissage.",
    keyTakeaways: [
      "Fractionally differentiated features to maintain signal and stationarity.",
      "Triple-barrier method for robust trade labeling and signal alignment.",
      "Purged and embargoed cross-validation to eliminate look-ahead leakage."
    ],
    keyTakeawaysFr: [
      "Différenciation fractionnaire pour préserver le signal tout en rendant stationnaire.",
      "Méthode de la triple barrière pour un étiquetage robuste des signaux.",
      "Validation croisée purgée et avec embargo pour éliminer les fuites de données."
    ],
    coverColor: "#4338ca",
    isbn: "1119482089",
    featured: true,
    link: "https://www.amazon.com/Advances-Financial-Machine-Learning-Marcos/dp/1119482089"
  },
  {
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    year: "1949",
    tag: "Value Investing",
    tagFr: "Investissement de Valeur",
    summary: "The definitive foundation on value investing, risk mitigation, and emotional market discipline.",
    summaryFr: "La fondation définitive sur l'investissement de valeur, l'atténuation des risques et la discipline du marché.",
    review: "Graham teaches the art of defensive portfolio building, focusing on intrinsic value and separation of speculative noise from real corporate assets.",
    reviewFr: "Graham enseigne l'art de la construction de portefeuille défensif, axé sur la valeur intrinsèque et le rejet du bruit spéculatif.",
    keyTakeaways: [
      "Strict margin of safety to protect capital against sudden market drawdowns.",
      "Defensive asset allocation adjusted for risk tolerance and time horizon.",
      "Adoption of 'Mr. Market' framework to exploit price swings rather than fear them."
    ],
    keyTakeawaysFr: [
      "Marge de sécurité stricte pour protéger le capital contre les baisses de marché.",
      "Allocation d'actifs défensive adaptée à la tolérance au risque.",
      "Adoption du cadre 'Mr. Market' pour exploiter les fluctuations de prix."
    ],
    coverColor: "#1e3a8a",
    isbn: "0060555661",
    featured: true,
    link: "https://www.amazon.com/Intelligent-Investor-Benjamin-Graham/dp/0060555661"
  },
  {
    title: "Active Portfolio Management",
    author: "Richard Grinold & Ronald Kahn",
    year: "1999",
    tag: "Quant Investing",
    tagFr: "Gestion Quantitative",
    summary: "The definitive mathematical guide for institutional investment managers and risk allocators.",
    summaryFr: "Le guide mathématique de référence pour les gestionnaires d'investissements institutionnels.",
    review: "Known as the Bible of Quantitative Finance, this text explains the rigorous optimization formulas required to consistently extract market alpha.",
    reviewFr: "Considéré comme la Bible de la finance quantitative, ce texte explique les formules rigoureuses pour extraire l'alpha.",
    keyTakeaways: [
      "The Fundamental Law of Active Management: Info Ratio = Info Coefficient × Sqrt(Breadth).",
      "Rigorous risk budgeting and covariance optimization frameworks.",
      "Implementation of transaction cost modeling into portfolio selection."
    ],
    keyTakeawaysFr: [
      "La Loi Fondamentale de la Gestion Active : Ratio d'Info = Coefficient d'Info × Racine(Largeur).",
      "Budgétisation rigoureuse des risques et cadres d'optimisation de la covariance.",
      "Intégration de la modélisation des coûts de transaction dans la sélection."
    ],
    coverColor: "#0f172a",
    isbn: "0070248826",
    featured: false,
    link: "https://www.amazon.com/Active-Portfolio-Management-Quantitative-Controlling/dp/0070248826"
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    year: "2011",
    tag: "Behavioral Finance",
    tagFr: "Finance Comportementale",
    summary: "Comprehensive investigation into cognitive biases, heuristics, and human decision architectures under risk.",
    summaryFr: "Enquête approfondie sur les biais cognitifs et l'architecture des décisions humaines face au risque.",
    review: "Nobel Laureate Daniel Kahneman reveals the dual systems of human thought, directly explaining why retail investors consistently panic.",
    reviewFr: "Le lauréat du prix Nobel Daniel Kahneman révèle les doubles systèmes de la pensée humaine face aux pertes.",
    keyTakeaways: [
      "System 1 (fast, intuitive) vs. System 2 (slow, analytical) cognitive allocation.",
      "Loss Aversion: humans feel the pain of losses twice as intensely as the pleasure of gains.",
      "Overconfidence bias leading to excessive speculative trading and cost drag."
    ],
    keyTakeawaysFr: [
      "Allocation cognitive entre le Système 1 (rapide, intuitif) et le Système 2 (lent, analytique).",
      "Aversion à la perte : la douleur d'une perte est ressentie deux fois plus que le plaisir d'un gain.",
      "Biais de surconfiance entraînant des transactions spéculatives excessives."
    ],
    coverColor: "#333333",
    isbn: "0374533555",
    featured: false,
    link: "https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555"
  },
  {
    title: "Principles",
    author: "Ray Dalio",
    year: "2017",
    tag: "Investment Philosophy",
    tagFr: "Philosophie d'Investissement",
    summary: "Dalio shares the core principles that guided his life and career, applicable to both personal decisions and systematic investment strategies.",
    summaryFr: "Dalio partage les principes fondamentaux qui ont guidé sa vie et sa carrière, applicables aux décisions personnelles et aux stratégies d'investissement.",
    review: "Essential for understanding long-term macro thinking and the importance of radical transparency in decision-making processes.",
    reviewFr: "Essentiel pour comprendre la réflexion macro à long terme et l'importance de la transparence radicale dans les processus de décision.",
    keyTakeaways: [
      "The importance of radical truth and transparency in all decision making.",
      "The evolution of systematic and algorithmic decision engines.",
      "Understanding the debt cycles and the macro-economic forces."
    ],
    keyTakeawaysFr: [
      "L'importance de la vérité radicale et de la transparence dans toute prise de décision.",
      "L'évolution des moteurs de décision systématiques et algorithmiques.",
      "Compréhension des cycles de la dette et des forces macro-économiques."
    ],
    coverColor: "#1e293b",
    isbn: "1501124021",
    featured: false,
    link: "https://www.amazon.com/Principles-Life-Work-Ray-Dalio/dp/1501124021"
  },
  {
    title: "The Little Book of Common Sense Investing",
    author: "John C. Bogle",
    year: "2007",
    tag: "Passive Investing",
    tagFr: "Investissement Passif",
    summary: "Bogle makes the compelling case for low-cost, long-term index fund investing over active stock selection.",
    summaryFr: "Bogle plaide de manière convaincante pour l'investissement passif à long terme via des fonds indiciels à bas coûts plutôt que la sélection active.",
    review: "The seminal work on why fees matter and why the market, as a whole, can be outpaced by simple, diversified, and cost-effective vehicles.",
    reviewFr: "L'ouvrage fondamental sur l'importance des frais et pourquoi le marché peut être surpassé par des véhicules simples, diversifiés et rentables.",
    keyTakeaways: [
      "The power of compounding returns over long investment horizons.",
      "Cost is the most important factor in long-term performance.",
      "The wisdom of staying the course and ignoring market noise."
    ],
    keyTakeawaysFr: [
      "Le pouvoir des rendements composés sur de longs horizons d'investissement.",
      "Le coût est le facteur le plus important de la performance à long terme.",
      "La sagesse de garder le cap et d'ignorer le bruit du marché."
    ],
    coverColor: "#e11d48",
    isbn: "0470102101",
    featured: false,
    link: "https://www.amazon.com/Little-Book-Common-Sense-Investing/dp/0470102101"
  },
  {
    title: "A Random Walk Down Wall Street",
    author: "Burton G. Malkiel",
    year: "1973",
    tag: "Investment Strategy",
    tagFr: "Stratégie d'Investissement",
    summary: "The classic argument for efficient market hypothesis and the superiority of index investing over active management.",
    summaryFr: "L'argument classique en faveur de l'hypothèse d'efficience du marché et de la supériorité de l'investissement indiciel.",
    review: "Essential reading that debunks technical analysis and stock picking in favor of a long-term, diversified strategy.",
    reviewFr: "Une lecture essentielle qui réfute l'analyse technique et la sélection d'actions au profit d'une stratégie diversifiée à long terme.",
    keyTakeaways: [
      "The random nature of short-term market movements.",
      "The difficulty of consistently beating the market.",
      "The benefits of low-cost, broad-market index funds."
    ],
    keyTakeawaysFr: [
      "La nature aléatoire des mouvements de marché à court terme.",
      "La difficulté de battre systématiquement le marché.",
      "Les avantages des fonds indiciels à bas coûts."
    ],
    coverColor: "#0891b2",
    isbn: "0393352242",
    featured: false,
    link: "https://www.amazon.com/Random-Walk-Down-Wall-Street/dp/0393352242"
  },
  {
    title: "Stocks for the Long Run",
    author: "Jeremy J. Siegel",
    year: "1994",
    tag: "Market History",
    tagFr: "Histoire du Marché",
    summary: "Comprehensive historical analysis showing that stocks are the best long-term asset class for wealth creation.",
    summaryFr: "Une analyse historique complète montrant que les actions sont la meilleure classe d'actifs à long terme pour la création de richesse.",
    review: "Siegel provides the definitive historical evidence that equity returns vastly outperform bonds and gold over multi-decade periods.",
    reviewFr: "Siegel fournit la preuve historique définitive que les rendements des actions surpassent largement les obligations et l'or sur plusieurs décennies.",
    keyTakeaways: [
      "Stocks as the best inflation hedge over the long term.",
      "The historical outperformance of equities compared to other asset classes.",
      "The role of dividends in total return generation."
    ],
    keyTakeawaysFr: [
      "Les actions comme meilleure protection contre l'inflation à long terme.",
      "La surperformance historique des actions par rapport aux autres classes d'actifs.",
      "Le rôle des dividendes dans la génération de rendement total."
    ],
    coverColor: "#15803d",
    isbn: "1260026266",
    featured: false,
    link: "https://www.amazon.com/Stocks-Long-Run-Fifth-Edition/dp/1260026266"
  }
];

const VIDEOS: VideoData[] = [
  {
    title: "Yale University: Financial Markets - Full Course with Robert Shiller",
    titleFr: "Université de Yale : Marchés Financiers - Cours Complet avec Robert Shiller",
    speaker: "Yale University (Robert Shiller)",
    tag: "Finance Course",
    tagFr: "Cours de Finance",
    lang: "EN",
    videoId: "WzD_63N0eX0",
    summary: "An exceptional, comprehensive introduction to financial markets, risk management, behavioral finance, and institutional dynamics by Nobel Laureate Robert Shiller. The gold standard of free collegiate finance courses.",
    summaryFr: "Une introduction exceptionnelle et complète aux marchés financiers, à la gestion des risques et à la finance comportementale par le lauréat du prix Nobel Robert Shiller.",
    featured: true
  },
  {
    title: "Portfolio Management & Construction Masterclass",
    titleFr: "Masterclass sur la Gestion et Construction de Portefeuille",
    speaker: "Aswath Damodaran (NYU Stern)",
    tag: "Portfolio Management",
    tagFr: "Gestion de Portefeuille",
    lang: "EN",
    videoId: "m9m_7F_e6f0",
    summary: "Renowned NYU Stern Professor Aswath Damodaran explains the rigorous mathematical foundations of constructing efficient portfolios, assessing risk metrics, and managing multi-asset allocations.",
    summaryFr: "Le célèbre professeur Aswath Damodaran explique les fondations rigoureuses de la construction de portefeuilles efficients et la gestion du risque.",
    featured: true
  },
  {
    title: "Advanced Investment Strategy: Factor Investing & Risk Premiums",
    titleFr: "Stratégie d'Investissement Avancée : Investissement Factoriel",
    speaker: "Ben Felix",
    tag: "Advanced Strategy",
    tagFr: "Stratégie Avancée",
    lang: "EN",
    videoId: "jH_79XfGgP8",
    summary: "A deep dive into advanced systematic strategies, exploring the Fama-French factors, value premium, size effect, and momentum strategies to beat broad-market indexing.",
    summaryFr: "Une analyse approfondie des stratégies systématiques avancées, explorant les facteurs de Fama-French, la prime de valeur et le momentum.",
    featured: false
  },
  {
    title: "Strategic Asset Allocation & Modern Portfolio Theory",
    titleFr: "Allocation d'Actifs Stratégique & Théorie Moderne du Portefeuille",
    speaker: "Kenji Explains",
    tag: "Asset Allocation",
    tagFr: "Allocation d'Actifs",
    lang: "EN",
    videoId: "3jQ_Fq9YmS8",
    summary: "Clear, highly visual guide to Markowitz's efficient frontier, capital allocation line, covariance structures, and finding the mathematically optimal risk-return profile.",
    summaryFr: "Guide visuel clair de la frontière efficiente de Markowitz, de la ligne d'allocation du capital et de l'optimisation mathématique.",
    featured: false
  }
];

export function Education() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'books' | 'videos'>('books');
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F6F9FC] py-12 px-4 md:px-8">
      {/* Search Header */}
      <div className="w-full max-w-[1400px] mx-auto mb-10">
        <div className="relative w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-[#635BFF]/10 to-transparent z-0" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#635BFF]/10 blur-[100px] rounded-full z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Financial Education</h1>
              <p className="text-slate-400 mt-2 max-w-xl text-base">
                Master advanced portfolio theory, systematic strategies, and derivative assets through curated books and institutional lectures.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={language === 'fr' ? "Rechercher des concepts, livres, auteurs..." : "Search concepts, books, authors..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-base text-white placeholder-slate-400 outline-none focus:border-[#635BFF] focus:shadow-[0_0_20px_rgba(99,91,255,0.25)] transition-all shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-[1400px] mx-auto mb-8">
        <div className="flex gap-4 border-b border-slate-200 pb-4">
          <TabButton 
            active={activeTab === 'books'} 
            onClick={() => setActiveTab('books')} 
            icon={<Library size={18}/>} 
            label={language === 'fr' ? 'Littérature Financière' : 'Financial Literature'} 
          />
          <TabButton 
            active={activeTab === 'videos'} 
            onClick={() => setActiveTab('videos')} 
            icon={<Video size={18}/>} 
            label={language === 'fr' ? 'Cours & Masterclasses' : 'Lectures & Masterclasses'} 
          />
        </div>
      </div>

      {/* Content wrapper with requested custom 80% zoom scale on Desktop, slightly scaled on mobile */}
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'books' && <BooksSection search={search} language={language} />}
              {activeTab === 'videos' && <VideosSection search={search} language={language} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-3 text-base font-bold rounded-2xl flex items-center gap-2 transition-all duration-300 cursor-pointer", 
        active 
          ? "bg-[#635BFF] text-white shadow-lg shadow-[#635BFF]/20" 
          : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm"
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
    b.tag.toLowerCase().includes(search.toLowerCase()) ||
    b.tagFr.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <BookOpen size={24} className="text-[#635BFF]" />
        <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">
          {language === 'fr' ? 'La Bibliothèque de Référence' : 'The Reference Library'}
        </h2>
      </div>
      
      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm font-medium">
          {language === 'fr' ? 'Aucun ouvrage trouvé.' : 'No books found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((b, i) => (
            <BookCard key={i} book={b} language={language} />
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
      const q = queryToSearch || "quantitative finance backtesting";
      const res = await fetch(`/api/youtube/videos?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const items = await res.json();
        const mapped: VideoData[] = items.map((item: any) => ({
          title: item.snippet.title,
          titleFr: item.snippet.title,
          speaker: item.snippet.channelTitle,
          tag: "YouTube Lecture",
          tagFr: "Conférence YouTube",
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
    // Lazy initial fetch
    fetchYoutube("portfolio construction investment analysis");
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
    <section className="space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <PlayCircle size={24} className="text-[#635BFF]" />
          <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">
            {language === 'fr' ? 'Leçons & Cours Académiques' : 'Masterclass Lectures'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder={language === 'fr' ? "Rechercher sur YouTube..." : "Search YouTube lectures..."}
            value={ytQuery}
            onChange={e => setYtQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchYoutube(ytQuery)}
            className="w-full sm:w-64 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#635BFF] transition-colors shadow-sm"
          />
          <button 
            onClick={() => fetchYoutube(ytQuery)}
            disabled={isLoading}
            className="px-4 py-2 bg-[#635BFF] text-white rounded-xl text-sm font-bold hover:bg-[#4B45D6] transition-colors whitespace-nowrap cursor-pointer"
          >
            {isLoading ? '...' : (language === 'fr' ? 'Rechercher' : 'Search')}
          </button>
        </div>
      </div>

      {/* Featured Videos with Highlighted Big Thumbnails */}
      {featured.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-[#635BFF] bg-[#635BFF]/10 w-max px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {language === 'fr' ? 'Sélection Recommandée' : 'Highly Recommended'}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featured.map((video, i) => (
              <VideoCard key={`feat-${i}`} video={video} language={language} isFeatured />
            ))}
          </div>
        </div>
      )}

      {/* Other Curated Videos */}
      {regular.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {language === 'fr' ? 'Autres Masterclasses' : 'More Curriculum'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regular.map((video, i) => (
              <VideoCard key={`reg-${i}`} video={video} language={language} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function BookCard({ book, language }: { book: Book, language: string }) {
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
    <motion.div
      whileHover={{ y: -8 }}
      className="group flex flex-col h-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(50,50,93,0.08)] transition-all duration-500 hover:border-[#635BFF]"
    >
      {/* Dynamic Cover Frame with realistic hardcover depth and spine border */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center bg-slate-50 h-80 border-b border-slate-100 p-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />
        
        {coverUrl ? (
          <div className="relative shadow-[10px_15px_30px_-5px_rgba(0,0,0,0.3)] group-hover:shadow-[15px_25px_40px_-5px_rgba(99,91,255,0.25)] rounded-r-md overflow-hidden transition-all duration-500 group-hover:scale-105 h-full max-w-[170px] border-l-[6px] border-slate-900/40">
            <img 
              src={coverUrl} 
              alt={book.title}
              className="w-auto h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setCoverUrl(null)}
            />
          </div>
        ) : (
          <div 
            className="w-48 h-64 rounded-r-xl shadow-[8px_12px_24px_rgba(0,0,0,0.15)] p-5 flex flex-col justify-between text-left relative overflow-hidden text-white"
            style={{ 
              backgroundColor: book.coverColor || '#3B82F6',
              borderLeft: '7px solid rgba(0,0,0,0.3)'
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-[4rem]" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                {language === 'fr' ? book.tagFr : book.tag}
              </span>
              <h4 className="font-extrabold text-base tracking-tight leading-snug mt-3 line-clamp-4">
                {book.title}
              </h4>
            </div>
            <div className="text-xs font-medium opacity-90 border-t border-white/20 pt-2">
              {book.author}
            </div>
          </div>
        )}
      </div>

      {/* Book Core Information */}
      <div className="p-6 flex flex-col flex-grow bg-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black text-[#635BFF] bg-[#635BFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'fr' ? book.tagFr : book.tag}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {book.year}
          </span>
        </div>

        <h4 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#635BFF] transition-colors line-clamp-2">
          {book.title}
        </h4>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          By {book.author}
        </p>

        {/* Short Summary Review */}
        <p className="text-sm text-slate-600 leading-relaxed italic mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          "{language === 'fr' ? book.reviewFr : book.review}"
        </p>

        {/* Detailed Book Key Takeaways ("les resuer du livre") */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex-grow">
          <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-[#635BFF]" />
            {language === 'fr' ? 'Principaux Enseignements' : 'Key Core Takeaways'}
          </h5>
          <ul className="space-y-1.5">
            {(language === 'fr' ? book.keyTakeawaysFr : book.keyTakeaways).map((takeaway, idx) => (
              <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                <span className="text-[#635BFF] font-extrabold mt-0.5">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Link Out to explore */}
        <a 
          href={finalLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-[#635BFF] hover:text-[#4B45D6] transition-colors cursor-pointer group/link"
        >
          <span className="flex items-center gap-1.5">
            {language === 'fr' ? 'Explorer cet ouvrage' : 'Explore this Book'}
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
          <MoveRight size={14} className="group-hover/link:translate-x-1.5 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}

function VideoCard({ video, language, isFeatured }: { video: VideoData, language: string, isFeatured?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col h-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(50,50,93,0.08)] transition-all duration-500 hover:border-[#635BFF]/50",
      isFeatured ? "shadow-md border-slate-300" : "shadow-sm"
    )}>
      {/* Outstandingly prominent Thumbnail Video container */}
      <div className="relative w-full bg-black overflow-hidden aspect-video">
        <a 
          href={`https://www.youtube.com/watch?v=${video.videoId}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute inset-0 flex items-center justify-center bg-slate-900 group"
        >
          {/* Dynamic high quality thumbnail from YouTube */}
          <img 
            src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`} 
            alt={video.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity duration-500 scale-[1.01]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
          
          {/* Play badge overlay */}
          <div className="relative z-10 flex items-center gap-2.5 text-white font-extrabold group-hover:scale-105 transition-transform bg-[#635BFF] hover:bg-[#4B45D6] px-6 py-3 rounded-full border border-white/10 shadow-2xl">
            <PlayCircle size={22} className="text-white fill-white/20 animate-pulse" />
            <span className="text-sm tracking-wide">{language === 'fr' ? 'Regarder sur YouTube' : 'Play on YouTube'}</span>
          </div>
        </a>
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex gap-2 items-center mb-3">
          <span className="text-xs font-black text-[#635BFF] bg-[#635BFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'fr' ? video.tagFr : video.tag}
          </span>
          <span className="text-xs font-mono text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md">
            {video.lang}
          </span>
        </div>
        
        <h3 className={cn("font-bold tracking-tight text-slate-950 leading-tight mb-2", isFeatured ? "text-2xl" : "text-lg md:text-xl")}>
          {language === 'fr' ? video.titleFr : video.title}
        </h3>
        
        <div className="text-sm font-bold text-slate-500 mb-4">
          Presented by {video.speaker}
        </div>
        
        <p className="text-sm md:text-base text-slate-600 leading-relaxed mt-auto border-t border-slate-100 pt-4">
          {language === 'fr' ? video.summaryFr : video.summary}
        </p>
      </div>
    </div>
  );
}
