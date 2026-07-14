import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  MoveRight, 
  Library, 
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";

interface Book {
  title: string;
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
    coverColor: "#e11d48",
    isbn: "0470102101",
    featured: false,
    link: "https://www.amazon.com/Little-Book-Common-Sense-Investing/dp/0470102101"
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    year: "2020",
    tag: "Behavioral Finance",
    tagFr: "Finance Comportementale",
    summary: "Exploring the strange ways people think about money and teaching you how to make better sense of one of life's most important topics.",
    summaryFr: "Explorer les façons étranges dont les gens pensent à l'argent et vous apprendre à mieux comprendre l'un des sujets les plus importants de la vie.",
    coverColor: "#2563eb",
    isbn: "9780857197689",
    featured: false,
    link: "https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681"
  },
  {
    title: "Rich Dad Poor Dad",
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
    author: "Stephen Ross, Randolph Westerfield, Jeffrey Jaffe",
    year: "2015",
    tag: "Corporate Finance",
    tagFr: "Finance d'Entreprise",
    summary: "The gold-standard academic handbook for net present value rules, capital budgeting, and corporate capital structure.",
    summaryFr: "Le manuel de référence mondiale pour comprendre les décisions financières et budgétaires des entreprises.",
    coverColor: "#1d4ed8",
    isbn: "1259918947",
    featured: false,
    link: "https://www.amazon.com/Corporate-Finance-Stephen-Ross/dp/1259918947"
  }
];

export function Education() {
  const [search, setSearch] = useState("");
  const { language } = useTranslation();

  return (
    <MobileZoomWrapper scaleMobile={0.3}>
      <style>{`
        @media (max-width: 640px) {
          /* Enlarge font-sizes for legible reading at 30% scale on mobile */
          .text-xs { font-size: 1.05rem !important; line-height: 1.4 !important; }
          .text-sm { font-size: 1.25rem !important; line-height: 1.4 !important; }
          .text-base { font-size: 1.45rem !important; line-height: 1.4 !important; }
          .text-lg { font-size: 1.75rem !important; line-height: 1.3 !important; }
          .text-xl { font-size: 2.15rem !important; line-height: 1.2 !important; }
          .text-2xl { font-size: 2.55rem !important; line-height: 1.2 !important; }
          .text-3xl { font-size: 3.15rem !important; line-height: 1.1 !important; }
          .text-4xl { font-size: 3.65rem !important; line-height: 1.1 !important; }
          .text-5xl { font-size: 4.25rem !important; line-height: 1.05 !important; }
          .text-[10px] { font-size: 1.05rem !important; }
          .text-[9px] { font-size: 0.95rem !important; }
          
          button, input, select, textarea {
            font-size: 1.25rem !important;
          }
        }
      `}</style>
      <div className="w-full mx-auto max-w-[1920px] px-8 md:px-16 space-y-16 pb-32 mt-8 relative min-h-[calc(100vh-80px)] font-sans">
        {/* Innovative Search Header - Amplified by 10% */}
        <div className="w-full mx-auto mb-12">
          <div className="relative w-full rounded-[2.5rem] bg-surface border border-border overflow-hidden shadow-[0_10px_35px_-10px_rgba(0,0,0,0.03)] p-10 md:p-14">
            <div className="absolute inset-0 bg-gradient-to-br from-[#635BFF]/8 to-transparent z-0 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-[450px] h-[450px] bg-[#635BFF]/8 blur-[120px] rounded-full z-0 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-3xl">
                <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={language === 'fr' ? "Rechercher des concepts, livres, auteurs..." : "Search concepts, books, authors..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-800 border border-slate-700/80 rounded-2xl text-lg text-white placeholder-slate-400 outline-none focus:border-[#635BFF] focus:shadow-[0_0_25px_rgba(99,91,255,0.3)] transition-all shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Books grid container - stretched wide to fill viewport */}
        <div className="w-full mx-auto">
          <BooksSection search={search} language={language} />
        </div>
      </div>
    </MobileZoomWrapper>
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
    <section className="space-y-14">
      <div className="flex items-center gap-3.5 border-b border-border pb-4">
        <BookOpen size={28} className="text-[#635BFF]" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === 'fr' ? 'La Bibliothèque de Référence' : 'The Reference Library'}
        </h2>
        <span className="text-sm font-semibold bg-[#635BFF]/10 text-[#635BFF] px-3 py-1 rounded-full font-mono ml-auto">
          {filtered.length} {language === 'fr' ? 'Livres' : 'Books'}
        </span>
      </div>
      
      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-24 bg-white rounded-[2.5rem] border border-border shadow-sm font-medium text-lg">
          {language === 'fr' ? 'Aucun ouvrage trouvé.' : 'No books found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filtered.map((b, i) => (
            <BookCard key={i} book={b} language={language} />
          ))}
        </div>
      )}
    </section>
  );
}

function BookCard({ book, language }: { book: Book, language: string }) {
  const searchLink = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
  const finalLink = book.link === "#" || book.link.includes('amazon.') ? searchLink : book.link;
  const [imageError, setImageError] = useState(false);
  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : null;

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group flex flex-col h-full bg-white border border-border rounded-[2.5rem] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_-15px_rgba(99,91,255,0.15)] transition-all duration-500 hover:border-[#635BFF]/75"
    >
      {/* cover image - real image if available, else consistent color cards */}
      <div className="relative flex flex-col items-center justify-center h-[380px] p-6 bg-slate-50/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-[#635BFF]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        {coverUrl && !imageError ? (
          <img 
            src={coverUrl} 
            alt={book.title}
            className="w-48 h-64 rounded-lg shadow-2xl object-cover transition-all duration-500 group-hover:scale-[1.05] relative z-10"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-48 h-64 rounded-lg p-5 flex flex-col justify-between text-left relative overflow-hidden text-white transition-all duration-500 group-hover:scale-[1.05] shadow-xl"
            style={{ 
              backgroundColor: book.coverColor || '#3B82F6',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
            
            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                {language === 'fr' ? book.tagFr : book.tag}
              </span>
              <h4 className="font-bold text-base tracking-tight leading-snug mt-4 line-clamp-4">
                {book.title}
              </h4>
            </div>
            <div className="relative z-10 text-xs font-semibold opacity-95 border-t border-white/20 pt-2 flex justify-between items-center">
              <span>{book.author}</span>
              <span className="text-[9px] font-mono bg-black/10 px-1.5 py-0.5 rounded">{book.year}</span>
            </div>
          </div>
        )}
      </div>

      {/* Book Core Information & Summary at the bottom */}
      <div className="p-8 flex flex-col flex-grow bg-white">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="text-[10px] font-black text-[#635BFF] bg-[#635BFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'fr' ? book.tagFr : book.tag}
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            {book.year}
          </span>
        </div>

        <h4 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-[#635BFF] transition-colors line-clamp-2">
          {book.title}
        </h4>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          {language === 'fr' ? 'Par' : 'By'} {book.author}
        </p>

        {/* beautiful, simplified description summary at the bottom */}
        <p className="text-sm text-slate-600 leading-relaxed mt-5 line-clamp-4 italic text-justify">
          "{language === 'fr' ? book.summaryFr : book.summary}"
        </p>

        {/* Link Out to explore */}
        <a 
          href={finalLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-[#635BFF] hover:text-[#4B45D6] transition-colors cursor-pointer group/link"
        >
          <span className="flex items-center gap-2">
            {language === 'fr' ? 'Consulter l\'ouvrage' : 'Consult Publication'}
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
          <MoveRight size={14} className="group-hover/link:translate-x-1.5 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}
