const fs = require('fs');

let edu = fs.readFileSync('src/components/pages/Education.tsx', 'utf8');

const newVideos = `const VIDEOS: VideoData[] = [
  {
    title: "CFA Level 1: Quantitative Methods",
    titleFr: "CFA Niveau 1 : Méthodes Quantitatives",
    speaker: "Mark Meldrum",
    tag: "CFA Prep",
    tagFr: "Prépa CFA",
    lang: "EN",
    videoId: "y4pYhK681Lw",
    summary: "Comprehensive introduction to quantitative methods required for the CFA Level 1 examination, covering time value of money and statistics.",
    summaryFr: "Introduction complète aux méthodes quantitatives requises pour l'examen CFA Niveau 1.",
    featured: true
  },
  {
    title: "FRM Part 1: Foundations of Risk Management",
    titleFr: "FRM Partie 1 : Fondements de la Gestion des Risques",
    speaker: "Bionic Turtle",
    tag: "FRM Prep",
    tagFr: "Prépa FRM",
    lang: "EN",
    videoId: "BvLw1_J_95U",
    summary: "Deep dive into risk management concepts, essential for passing the FRM Part 1 exam.",
    summaryFr: "Plongée approfondie dans les concepts de gestion des risques, indispensable pour réussir l'examen FRM Partie 1.",
  },
  {
    title: "Financial Modeling building a 3 Statement Model",
    titleFr: "Modélisation Financière : Construire un Modèle à 3 États",
    speaker: "Corporate Finance Institute",
    tag: "Modeling",
    tagFr: "Modélisation",
    lang: "EN",
    videoId: "q-p1fF5lC-0",
    summary: "Learn how to build a complete 3 statement financial model from scratch in Excel.",
    summaryFr: "Découvrez comment construire un modèle financier complet à 3 états à partir de zéro sous Excel.",
    featured: true
  },
  {
    title: "Google Sheets for Finance",
    titleFr: "Google Sheets pour la Finance",
    speaker: "G-Sheets Mastery",
    tag: "Tech",
    tagFr: "Tech",
    lang: "EN",
    videoId: "gJzYv1rMBHw",
    summary: "Mastering built-in GOOGLEFINANCE functions and advanced formulas to track stock metrics and build personal portfolio dashboards.",
    summaryFr: "Maîtriser les fonctions GOOGLEFINANCE intégrées et les formules avancées pour créer des tableaux de bord de suivi de portefeuille.",
  },
  {
    title: "Understanding ETFs and Market Liquidity",
    titleFr: "Comprendre les ETF et la Liquidité du Marché",
    speaker: "Bloomberg Markets",
    tag: "ETFs",
    tagFr: "ETFs",
    lang: "EN",
    videoId: "kOlyuD-oWNE",
    summary: "Detailed look at how ETFs are constructed, authorized participants, and decoding ETF liquidity.",
    summaryFr: "Regard détaillé sur la construction des ETF, les participants autorisés et le décodage de la liquidité des ETF.",
  }
];`;

edu = edu.replace(/const VIDEOS: VideoData\[\] = \[[\s\S]*?\];/, newVideos);

// Add Database icon import
if (!edu.includes('Database')) {
  edu = edu.replace(/import \{ ([^}]+) \} from "lucide-react";/, 'import { $1, Database } from "lucide-react";');
}

edu = edu.replace(/useState\<'books' \| 'videos' \| 'research' \| 'courses'\>/, "useState<'books' | 'videos' | 'research' | 'courses' | 'etfs'>");

const oldTabs = `<TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<GraduationCap size={16}/>} label={language === 'fr' ? 'Cursus' : 'Curriculum'} />`;
const newTabs = oldTabs + `\n            <TabButton active={activeTab === 'etfs'} onClick={() => setActiveTab('etfs')} icon={<Database size={16}/>} label={language === 'fr' ? 'Lexique ETF' : 'ETF Lexicon'} />`;
if (edu.includes(oldTabs) && !edu.includes('Lexique ETF')) {
  edu = edu.replace(oldTabs, newTabs);
}

const oldRouter = `{activeTab === 'courses' && <CoursesSection language={language} />}`;
const newRouter = oldRouter + `\n            {activeTab === 'etfs' && <EtfLexicon language={language} search={search} />}`;
if (edu.includes(oldRouter) && !edu.includes('<EtfLexicon')) {
  edu = edu.replace(oldRouter, newRouter);
}

// Ensure react-player import
if (!edu.includes('ReactPlayer')) {
  edu = `import ReactPlayer from 'react-player/youtube';\n` + edu;
}

// Replace VideoCard render to use react player
const oldVideoCard = `function VideoCard({ video, language }: { video: VideoData, language: string }) {
  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300 hover:border-pv-blue/50">
      <div className="relative aspect-video w-full bg-black">
        <iframe 
          className="w-full h-full"
          src={\`https://www.youtube.com/embed/\${video.videoId}?rel=0\`} 
          title={video.title}
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>`;

const newVideoCard = `function VideoCard({ video, language }: { video: VideoData, language: string }) {
  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300 hover:border-pv-blue/50">
      <div className="relative aspect-video w-full bg-black">
        <ReactPlayer 
           url={\`https://www.youtube.com/watch?v=\${video.videoId}\`} 
           width="100%" 
           height="100%" 
           controls={true} 
           light={true}
           playing={true} 
        />
      </div>`;
edu = edu.replace(oldVideoCard, newVideoCard);


fs.writeFileSync('src/components/pages/Education.tsx', edu, 'utf8');
