import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../contexts/LanguageContext';

interface NewsItem {
 id: number;
 headline: string;
 image: string;
 source: string;
 summary: string;
 url: string;
 datetime: number;
}

const newsLabels: Record<string, Record<string, string>> = {
  en: {
    noNews: "No recent news found.",
    marketNews: "Market News",
    newsFor: "News:"
  },
  fr: {
    noNews: "Aucune actualité récente trouvée.",
    marketNews: "Actualités du Marché",
    newsFor: "Actualités :"
  },
  de: {
    noNews: "Keine aktuellen Nachrichten gefunden.",
    marketNews: "Marktnachrichten",
    newsFor: "Nachrichten:"
  },
  nl: {
    noNews: "Geen recent nieuws gevonden.",
    marketNews: "Marktnieuws",
    newsFor: "Nieuws:"
  },
  es: {
    noNews: "No se encontraron noticias recientes.",
    marketNews: "Noticias del Mercado",
    newsFor: "Noticias:"
  }
};

export const FinancialNews = ({ symbol }: { symbol?: string }) => {
 const { language } = useTranslation();
 const t = newsLabels[language] || newsLabels.en;

 const [news, setNews] = useState<NewsItem[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchNews = async () => {
 setLoading(true);
 try {
 let endpoint = `/api/finnhub/news?category=general`;
 if (symbol) {
 const to = new Date().toISOString().split('T')[0];
 const fromDate = new Date();
 fromDate.setDate(fromDate.getDate() - 7);
 const from = fromDate.toISOString().split('T')[0];
 endpoint = `/api/finnhub/company-news?symbol=${symbol}&from=${from}&to=${to}`;
 }
 
 const res = await fetch(endpoint);
 if (res.ok) {
 const data = await res.json();
 const withImages = (Array.isArray(data) ? data : [])
 .filter(item => item.image && item.headline && item.url && !item.source?.toLowerCase().includes('yahoo'));
 setNews(withImages.slice(0, 10));
 }
 } catch (e) {
 console.warn("Error fetching news:", e);
 } finally {
 setLoading(false);
 }
 };

 fetchNews();
 }, [symbol]);

 if (loading) {
 return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
 {[1, 2, 3].map(i => (
 <div key={i} className="bg-surface-2 h-64 rounded-[1.5rem]"></div>
 ))}
 </div>;
 }

 if (news.length === 0) {
 return <div className="text-text text-center py-8">{t.noNews}</div>;
 }

 const heroNews = news[0];
 const gridNews = news.slice(1);

 const formatTime = (unixTs: number) => {
 const date = new Date(unixTs * 1000);
 const localeMap: Record<string, string> = { fr: 'fr-FR', de: 'de-DE', nl: 'nl-NL', es: 'es-ES', en: 'en-US' };
 return date.toLocaleDateString(localeMap[language] || 'en-US', { day: 'numeric', month: 'short' });
 };

 return (
 <div className="space-y-8 w-full mt-12 mb-8">
 <h3 className="text-2xl font-semibold flex items-center gap-3 relative inline-flex pb-2 mb-6">
 <span className="bg-gradient-to-r from-text to-text-3 bg-clip-text text-transparent">
 {symbol ? `${t.newsFor} ${symbol}` : t.marketNews}
 </span>
 <div className="absolute bottom-0 left-0 h-[3px] w-24 bg-gradient-to-r from-pv-blue to-transparent"></div>
 </h3>
 
 <a href={heroNews.url} target="_blank" rel="noopener noreferrer" 
 className="group block w-full relative h-[400px] md:h-[500px] rounded-[1.5rem] overflow-hidden shadow-lg border border-border/50 bg-surface">
 <img src={heroNews.image} alt={heroNews.headline} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
 <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4">
 <span className="inline-block px-3 py-1 bg-pv-blue text-white text-xs font-semibold rounded mb-4">
 {heroNews.source}
 </span>
 <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-4 group-hover:text-amber-400 transition-colors">
 {heroNews.headline}
 </h2>
 <p className="text-gray-300 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-4 max-w-2xl">
 {heroNews.summary}
 </p>
 <div className="flex items-center gap-2 text-gray-400 text-xs font-bold ">
 <Clock size={14} />
 {formatTime(heroNews.datetime)}
 </div>
 </div>
 </a>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {gridNews.map((item) => (
 <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" 
 className="group flex flex-col bg-white border border-border/60 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
 <div className="h-48 overflow-hidden relative">
 <img src={item.image} alt={item.headline} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
 <div className="absolute top-4 left-4">
 <span className="px-2 py-1 bg-black/80 backdrop-blur text-white text-xs font-semibold rounded">
 {item.source}
 </span>
 </div>
 </div>
 <div className="p-5 flex flex-col flex-1">
 <h4 className="text-lg font-bold text-text mb-3 leading-snug group-hover:text-pv-blue transition-colors line-clamp-3">
 {item.headline}
 </h4>
 <div className="mt-auto flex items-center justify-between text-text text-xs font-bold pt-4 border-t border-border/50">
 <span className="flex items-center gap-1.5"><Clock size={12}/>{formatTime(item.datetime)}</span>
 <ExternalLink size={14} className="group-hover:text-pv-blue transition-colors" />
 </div>
 </div>
 </a>
 ))}
 </div>
 </div>
 );
};
