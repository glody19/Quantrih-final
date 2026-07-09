import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export function AssetLogo({ ticker, name, isCrypto, className }: { ticker: string, name: string, isCrypto?: boolean, className?: string }) {
 const [imgSrc, setImgSrc] = useState<string | null>(null);
 const [errorCount, setErrorCount] = useState(0);
 
 const cleanName = (name || '').split(' ')[0].toLowerCase().replace(',', '').replace('.', '');
 
 const WATCHLIST_DOMAINS: Record<string, string> = { 
 AAPL: 'apple.com', 
 NVDA: 'nvidia.com', 
 GOOG: 'google.com', 
 GOOGL: 'google.com',
 META: 'meta.com', 
 TSLA: 'tesla.com', 
 MSFT: 'microsoft.com', 
 AMZN: 'amazon.com',
 NFLX: 'netflix.com',
 AMD: 'amd.com',
 INTC: 'intel.com',
 ORCL: 'oracle.com',
 PYPL: 'paypal.com',
 ADBE: 'adobe.com',
 COIN: 'coinbase.com',
 BTCUSDT: 'bitcoin.com', 
 ETHUSDT: 'ethereum.org' 
 };
 
 const getInitial = () => {
 const cleanTicker = (ticker || '').split('-')[0].split('.')[0].toUpperCase();
 
 if (isCrypto || (ticker || '').includes('USDT') || (ticker || '').includes('-USD')) {
 const coin = (ticker || '').replace('USDT','').replace('-USD','').toLowerCase();
 return `https://assets.coincap.io/assets/icons/${coin}@2x.png`;
 }
 
 // Attempt FinancialModelingPrep's public logo CDN first
 return `https://financialmodelingprep.com/image-stock/${cleanTicker}.png`;
 };

 const handleImageError = () => {
 const cleanTicker = (ticker || '').split('-')[0].split('.')[0].toUpperCase();
 
 if (errorCount === 0) {
 // Fallback 1: Clearbit
 const domain = WATCHLIST_DOMAINS[cleanTicker] || (cleanName + '.com');
 setImgSrc(`https://logo.clearbit.com/${domain}?size=80`);
 } else if (errorCount === 1) {
 // Fallback 2: EODHD
 setImgSrc(`https://eodhd.com/img/logos/US/${cleanTicker}.png`);
 } else if (errorCount === 2) {
 // Fallback 3: Text initial
 setImgSrc(''); 
 }
 setErrorCount(prev => prev + 1);
 };

 const src = imgSrc === null ? getInitial() : imgSrc;

 if (src === '') {
 return (
 <div className={cn("flex flex-shrink-0 items-center justify-center font-bold text-xs bg-surface-3 text-text border border-border/50", className)}>
 {(ticker || '').substring(0, 2)}
 </div>
 );
 }

 return (
 <div className={cn("flex-shrink-0 flex items-center justify-center overflow-hidden bg-white border border-border/50", className)}>
 <img 
 src={src} 
 alt={ticker} 
 className="w-full h-full object-contain" 
 onError={handleImageError} 
 />
 </div>
 );
}
