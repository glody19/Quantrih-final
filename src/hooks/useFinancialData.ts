import { useState, useEffect, useCallback } from 'react';

// Global cache to persist data across component remounts
const cache: Record<string, any> = {};

export function useFinancialData(initialSymbol: string) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [income, setIncome] = useState<any[]>([]);
  const [balance, setBalance] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [ratios, setRatios] = useState<any>(null);

  // Finnhub Data
  const [finnhubNews, setFinnhubNews] = useState<any[]>([]);
  const [finnhubPeers, setFinnhubPeers] = useState<string[]>([]);
  const [finnhubRecommendation, setFinnhubRecommendation] = useState<any[]>([]);
  const [finnhubInsiderSentiment, setFinnhubInsiderSentiment] = useState<any[]>([]);
  const [finnhubNewsSentiment, setFinnhubNewsSentiment] = useState<any>(null);
  const [finnhubMarketNews, setFinnhubMarketNews] = useState<any[]>([]);

  const fetchGlobalMarketNews = useCallback(async () => {
    try {
      const res = await fetch(`/api/finnhub/news?category=general`);
      if (res.ok) {
        const data = await res.json();
        setFinnhubMarketNews(Array.isArray(data) ? data.slice(0, 10) : []);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchGlobalMarketNews();
  }, [fetchGlobalMarketNews]);

  const fetchChartHistory = useCallback(async (targetSymbol: string, range: string, interval: string) => {
    try {
      const res = await fetch(`/api/stock/history/${encodeURIComponent(targetSymbol)}?range=${range}&interval=${interval}`);
      if (res.ok) {
        const data = await res.json();
        const formattedHistory = (Array.isArray(data) ? data : []).map((d: any) => ({
          date: d.date,
          price: d.close,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume
        }));
        setHistory(formattedHistory);
        // update cache history
        if (cache[targetSymbol]) {
          cache[targetSymbol].history = formattedHistory;
        }
      }
    } catch(e) {
      console.warn("Failed to fetch chart history", e);
    }
  }, []);

  const fetchFinancials = useCallback(async (targetSymbol: string, type: 'annual' | 'quarterly' = 'annual') => {
    try {
      const res = await fetch(`/api/stock/financials/${encodeURIComponent(targetSymbol)}?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setIncome(data.income || []);
        setBalance(data.balance || []);
        setCashFlow(data.cashFlow || []);
        if (cache[targetSymbol]) {
          cache[targetSymbol].income = data.income || [];
          cache[targetSymbol].balance = data.balance || [];
          cache[targetSymbol].cashFlow = data.cashFlow || [];
        }
      }
    } catch(e) {
      console.warn("Failed to fetch financials", e);
    }
  }, []);

  const fetchStockData = useCallback(async (targetSymbol: string, financialsType: 'annual' | 'quarterly' = 'annual') => {
    const sym = targetSymbol.toUpperCase();
    
    // Check cache first
    if (cache[sym]) {
      const data = cache[sym];
      setSymbol(sym);
      setQuote(data.quote);
      setProfile(data.profile);
      setIncome(data.income);
      setBalance(data.balance);
      setCashFlow(data.cashFlow);
      setHistory(data.history);
      setRatios(data.ratios);
      setFinnhubNews(data.finnhubNews);
      setFinnhubPeers(data.finnhubPeers);
      setFinnhubRecommendation(data.finnhubRecommendation);
      setFinnhubInsiderSentiment(data.finnhubInsiderSentiment);
      setFinnhubNewsSentiment(data.finnhubNewsSentiment);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [quoteRes, financialsRes, historyRes, ratiosRes] = await Promise.all([
        fetch(`/api/stock/quote/${encodeURIComponent(sym)}`),
        fetch(`/api/stock/financials/${encodeURIComponent(sym)}`),
        fetch(`/api/stock/history/${encodeURIComponent(sym)}?range=1d&interval=5m`),
        fetch(`/api/stock/ratios/${encodeURIComponent(sym)}`)
      ]);

      if (!quoteRes.ok) {
        let errMessage = "Failed to fetch quote data";
        try {
          const errData = await quoteRes.json();
          if (errData.error) errMessage = errData.error;
        } catch (_) {}
        throw new Error(errMessage);
      }
      
      const quoteData = await quoteRes.json();
      const financialsData = financialsRes.ok ? await financialsRes.json() : {};
      const historyData = historyRes.ok ? await historyRes.json() : [];
      let ratiosData = null;
      try {
        if (ratiosRes.ok) {
          const rData = await ratiosRes.json();
          // Our new proxy returns an object directly, but let's handle both in case we switch back
          if (Array.isArray(rData) && rData.length > 0) {
            ratiosData = rData[0];
          } else if (rData && !Array.isArray(rData)) {
            ratiosData = rData;
          }
        }
      } catch(e) {}
      
      if (!quoteData || !quoteData.quote) {
        throw new Error("Symbole introuvable ou données non disponibles.");
      }

      const formattedProfile = {
        ...quoteData.profile,
        image: `https://logo.clearbit.com/${quoteData.profile?.website?.replace(/^https?:\/\//, '') || ''}`,
      };

      const formattedHistory = (Array.isArray(historyData) ? historyData : []).map((d: any) => ({
        date: d.date,
        price: d.close, // Keep this for legacy chart usage if any
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume
      }));

      // Store initial core data in cache
      const initialCacheEntry = {
        quote: quoteData.quote,
        profile: formattedProfile,
        income: financialsData.income || [],
        balance: financialsData.balance || [],
        cashFlow: financialsData.cashFlow || [],
        history: formattedHistory,
        ratios: ratiosData,
        finnhubNews: [],
        finnhubPeers: [],
        finnhubRecommendation: [],
        finnhubInsiderSentiment: [],
        finnhubNewsSentiment: null
      };
      cache[sym] = initialCacheEntry;

      // Update state for core data immediately
      setSymbol(sym);
      setQuote(initialCacheEntry.quote);
      setProfile(initialCacheEntry.profile);
      setIncome(initialCacheEntry.income);
      setBalance(initialCacheEntry.balance);
      setCashFlow(initialCacheEntry.cashFlow);
      setHistory(initialCacheEntry.history);
      setRatios(initialCacheEntry.ratios);
      
      setLoading(false); // Make UI fast

      // Finnhub fetch (non-blocking in background)
      (async () => {
        let fNews: any[] = [];
        let fPeers: string[] = [];
        let fRec: any[] = [];
        let fIns: any[] = [];
        let fSent: any = null;

        try {
          const toDate = new Date().toISOString().split('T')[0];
          const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          const [newsR, peersR, recR, insR, sentR, profR, metricR] = await Promise.allSettled([
            fetch(`/api/finnhub/company-news?symbol=${encodeURIComponent(sym)}&from=${fromDate}&to=${toDate}`),
            fetch(`/api/finnhub/stock/peers?symbol=${encodeURIComponent(sym)}`),
            fetch(`/api/finnhub/stock/recommendation?symbol=${encodeURIComponent(sym)}`),
            fetch(`/api/finnhub/stock/insider-sentiment?symbol=${encodeURIComponent(sym)}&from=${lastYear}&to=${toDate}`),
            fetch(`/api/finnhub/news-sentiment?symbol=${encodeURIComponent(sym)}`),
            fetch(`/api/finnhub/stock/profile2?symbol=${encodeURIComponent(sym)}`),
            fetch(`/api/finnhub/stock/metric?symbol=${encodeURIComponent(sym)}&metric=all`)
          ]);

          if (newsR.status === 'fulfilled' && newsR.value.ok) {
            const d = await newsR.value.json();
            fNews = Array.isArray(d) ? d.slice(0, 5) : [];
            setFinnhubNews(fNews);
            if(cache[sym]) cache[sym].finnhubNews = fNews;
          }
          if (peersR.status === 'fulfilled' && peersR.value.ok) {
            const d = await peersR.value.json();
            fPeers = Array.isArray(d) ? d : [];
            setFinnhubPeers(fPeers);
            if(cache[sym]) cache[sym].finnhubPeers = fPeers;
          }
          if (recR.status === 'fulfilled' && recR.value.ok) {
            const d = await recR.value.json();
            fRec = Array.isArray(d) ? d.slice(0, 1) : [];
            setFinnhubRecommendation(fRec);
            if(cache[sym]) cache[sym].finnhubRecommendation = fRec;
          }
          if (insR.status === 'fulfilled' && insR.value.ok) {
            const d = await insR.value.json();
            fIns = Array.isArray(d?.data) ? d.data.slice(-3).reverse() : [];
            setFinnhubInsiderSentiment(fIns);
            if(cache[sym]) cache[sym].finnhubInsiderSentiment = fIns;
          }
          if (sentR.status === 'fulfilled' && sentR.value.ok) {
            const d = await sentR.value.json();
            fSent = d?.sentiment || null;
            setFinnhubNewsSentiment(fSent);
            if(cache[sym]) cache[sym].finnhubNewsSentiment = fSent;
          }
          if (profR.status === 'fulfilled' && profR.value.ok) {
            const d = await profR.value.json();
            if (d && d.logo) {
              setProfile(prev => {
                const updated = { ...prev, image: d.logo, description: prev?.description || `${d.name} operates in the ${d.finnhubIndustry} industry.` };
                if(cache[sym]) cache[sym].profile = updated;
                return updated;
              });
            }
          }
          if (metricR.status === 'fulfilled' && metricR.value.ok) {
            const d = await metricR.value.json();
            if (d && d.metric) {
              setRatios(prev => {
                const updated = {
                  ...prev,
                  priceEarningsRatioTTM: prev?.priceEarningsRatioTTM || d.metric.peExclExtraTTM,
                  priceToBookRatioTTM: prev?.priceToBookRatioTTM || d.metric.pbAnnual,
                  dividendYieldTTM: prev?.dividendYieldTTM || d.metric.dividendYieldIndicatedAnnual,
                  returnOnEquityTTM: prev?.returnOnEquityTTM || d.metric.roeTTM
                };
                if(cache[sym]) cache[sym].ratios = updated;
                return updated;
              });
            }
          }
        } catch(e) {
          console.warn("Finnhub fetch error:", e);
        }
      })();

    } catch (err: any) {
      console.warn(err);
      setError(err.message || "Erreur lors de la récupération des données.");
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStockData(initialSymbol);
  }, [initialSymbol, fetchStockData]);

  return {
    symbol,
    loading,
    error,
    profile,
    quote,
    income,
    balance,
    cashFlow,
    history,
    ratios,
    finnhubNews,
    finnhubPeers,
    finnhubRecommendation,
    finnhubInsiderSentiment,
    finnhubNewsSentiment,
    finnhubMarketNews,
    fetchStockData,
    fetchChartHistory,
    fetchFinancials
  };
}
