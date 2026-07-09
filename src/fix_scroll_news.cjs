const fs = require('fs');

// Fix scrolling
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('scroll-behavior: smooth')) {
  css += `\nhtml {\n  scroll-behavior: smooth;\n}\n\n::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n::-webkit-scrollbar-track {\n  background: transparent;\n}\n::-webkit-scrollbar-thumb {\n  background-color: var(--color-border-2);\n  border-radius: 20px;\n  border: 2px solid transparent;\n  background-clip: content-box;\n}\n::-webkit-scrollbar-thumb:hover {\n  background-color: var(--color-text-4);\n}\n`;
  fs.writeFileSync('src/index.css', css, 'utf8');
}

let fm = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');
const updatedNews = `const PRESTIGE_NEWS = [
  {
    title: "Global Markets Rally as Fed Signals Potential Rate Cuts",
    source: "Bloomberg",
    date: "2 Hours Ago",
    summary: "Equities surged across major indices today as the Federal Reserve hinted at easing monetary policy in the upcoming quarter, providing relief to global macro sectors.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
    url: "https://www.bloomberg.com/markets"
  },
  {
    title: "BlackRock's iShares ETF Triggers New Institutional Wave",
    source: "BlackRock",
    date: "4 Hours Ago",
    summary: "A massive influx of institutional capital into BlackRock's flagship ETF suggests a structural shift in how pension funds approach digital asset allocations.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    url: "https://www.blackrock.com/us/individual/insights"
  },
  {
    title: "European Sovereign Debt Faces Unprecedented Pressure",
    source: "Financial Times",
    date: "5 Hours Ago",
    summary: "Bond yields hit historic highs in several Eurozone nations amid concerns over sovereign balance sheets and persistent core inflation metrics.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    url: "https://www.ft.com/markets"
  },
  {
    title: "Tech Giants Propel Nasdaq to Historic Valuations",
    source: "Nasdaq",
    date: "6 Hours Ago",
    summary: "Driven by advancements in artificial intelligence hardware, major tech components of the Nasdaq-100 lifted the index past critical psychological resistance levels.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
    url: "https://www.nasdaq.com/news-and-insights"
  },
  {
    title: "Commodities Supercycle: Oil and Gold Hit Multi-Year Highs",
    source: "Wall Street Journal",
    date: "8 Hours Ago",
    summary: "Energy and precious metals are riding a wave of supply chain disruptions and geopolitical premiums, establishing what analysts term a new supercycle.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    url: "https://www.wsj.com/finance"
  },
  {
    title: "Vanguard Shifts Focus Towards Emerging Market Value",
    source: "Vanguard",
    date: "12 Hours Ago",
    summary: "The passive investing giant is quietly revamping its core emerging markets strategy, placing heavier emphasis on undervalued equities in Latin America.",
    image: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800",
    url: "https://investor.vanguard.com/investor-resources-education/news"
  }
];`;
fm = fm.replace(/const PRESTIGE_NEWS = \[[\s\S]*?\];/, updatedNews);
fm = fm.replace(/<a key=\{idx\} href="\#"/g, '<a key={idx} href={news.url} target="_blank" rel="noopener noreferrer"');
fs.writeFileSync('src/components/pages/FinancialModeling.tsx', fm, 'utf8');
