import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import yahooFinance from "yahoo-finance2";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { cacheService } from "./src/services/cacheService.js";
import db, { initDb, getLazyPortfolios, getPortfolioPerfs } from "./src/backend/db.js";

const yfClass = (yahooFinance as any).default || yahooFinance;
const yf = new yfClass({
  validation: { logErrors: false }
});
if (typeof yf.suppressNotices === 'function') {
  yf.suppressNotices(['yahooFinance.schemaValidation']);
}


// === CACHE HELPERS ===
function getCached(ns: string, key: string, maxAgeMs: number): any {
  try {
    const row = db.prepare('SELECT data, fetched_at FROM api_cache WHERE ns = ? AND key = ?').get(ns, key) as any;
    if (!row || Date.now() - row.fetched_at > maxAgeMs) return null;
    return JSON.parse(row.data);
  } catch (e) {
    console.error(`Cache read error for ${ns}:${key}`, e);
    return null;
  }
}

function setCached(ns: string, key: string, data: any) {
  try {
    db.prepare('INSERT OR REPLACE INTO api_cache (ns, key, data, fetched_at) VALUES (?, ?, ?, ?)').run(ns, key, JSON.stringify(data), Date.now());
  } catch (e) {
    console.error(`Cache write error for ${ns}:${key}`, e);
  }
}

// === ALLOWLISTS ===
const FRED_SERIES_ALLOWED = new Set([
  'VIXCLS', 'DGS10', 'DGS2', 'DGS3MO', 'DGS30',
  'CPIAUCSL', 'CPILFESL',
  'UNRATE', 'PAYEMS',
  'DCOILWTICO', 'GOLDAMGBD228NLBM',
  'DEXUSEU', 'DEXJPUS',
  'NASDAQCOM', 'SP500',
  'M2SL', 'WALCL',
  'FEDFUNDS',
  'T10Y2Y',
  'BAMLH0A0HYM2',
]);

const ECB_FLOWS_ALLOWED = new Set([
  'EXR/D.USD.EUR.SP00.A',
  'FM/B.U2.EUR.4F.KR.MRR_FR.LEV',
  'ICP/M.U2.N.000000.4.ANR',
]);

async function fetchJson(url: string, options: RequestInit = {}) {
  const r = await fetch(url, options);
  if (!r.ok) {
    const text = await r.text().catch(() => "No body");
    throw new Error(`HTTP ${r.status}: ${text.slice(0, 500)}`);
  }
  const contentType = r.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    const text = await r.text().catch(() => "No body");
    throw new Error(`Expected JSON but got ${contentType}: ${text.slice(0, 500)}`);
  }
  return await r.json();
}

export { yf };

/**
 * Builds the Express app with every /api route. Shared by the local server (server.ts)
 * and the Vercel serverless function (api/index.ts).
 */
export function createApp() {
  try {
    initDb();
  } catch (e) {
    console.error("Failed to initialize database:", e);
  }

  const app = express();

  // Tags a response whose payload is generated demonstration data (API key missing or provider failure).
  // The frontend reads this header to show a "demo data" badge instead of passing it off as real.
  console.log("NODE_ENV:", process.env.NODE_ENV);
  app.set("trust proxy", 1);

  // Hardened Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
    xFrameOptions: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));
  
  if (process.env.NODE_ENV === "production") {
    console.log("Production mode: Static assets and SPA fallback enabled");
  }
  
  const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    "https://ais-pre-cflazxyxvjulw7bdaz4ahl-2883134209.europe-west2.run.app",
    "http://ais-pre-cflazxyxvjulw7bdaz4ahl-2883134209.europe-west2.run.app",
    "https://ais-dev-cflazxyxvjulw7bdaz4ahl-2883134209.europe-west2.run.app",
    "http://ais-dev-cflazxyxvjulw7bdaz4ahl-2883134209.europe-west2.run.app",
    "https://quantrih.com",
    "http://quantrih.com",
    "https://www.quantrih.com",
    "http://www.quantrih.com",
    "https://quantrih-preview.vercel.app"
  ];
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  }));

  
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // limit each IP to 300 API requests per minute
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { 
      xForwardedForHeader: false,
      trustProxy: false
    }
  });

  // Apply rate limiter to all API routes
  app.use("/api/", apiLimiter);

  // Stripe Webhook MUST be placed BEFORE express.json() to preserve raw body
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!stripeKey || !endpointSecret) {
      return res.status(500).send("Stripe config missing");
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
      const sig = req.headers['stripe-signature'];
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`Payment successful for session ${session.id}`);
        // Optionally update database
      }
      res.json({ received: true });
    } catch (e: any) {
      console.error("Stripe Webhook error:", e);
      res.status(500).send("Internal Server Error");
    }
  });

  app.use('/api/', express.json());

  // Basic XSS Sanitization Middleware
  // Strips HTML tags from incoming strings (defence in depth: the API never renders HTML).
  // A regex is used instead of DOMPurify because jsdom cannot load in Vercel's Node runtime.
  const stripTags = (value: string) => value.replace(/<[^>]*>?/g, "");

  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return stripTags(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitizedObj: any = {};
      for (const key in value) {
        sanitizedObj[key] = sanitizeValue(value[key]);
      }
      return sanitizedObj;
    }
    return value;
  };

  app.use('/api/', (req, res, next) => {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    next();
  });

  // === NEW API ROUTES (CHANTIERS 2, 3, 4) ===

  // System Configuration Data
  app.get('/api/config/assets', (req, res) => {
    try {
      const dbRow = db.prepare('SELECT data FROM api_cache WHERE ns = ? AND key = ?').get('system', 'asset_data') as any;
      if (dbRow) {
        return res.json(JSON.parse(dbRow.data));
      }
      return res.status(202).json({ waitingForBuild: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // FRED
  app.get('/api/macro/fred/:seriesId', async (req, res) => {
    const id = req.params.seriesId;
    if (!FRED_SERIES_ALLOWED.has(id)) return res.status(400).json({ error: 'Series not allowed' });
    
    // full=1 returns the whole history (needed to deflate long backtests by real CPI)
    const full = req.query.full === '1';
    const cacheKey = full ? `${id}:full` : id;
    const cached = getCached('fred', cacheKey, 3600_000);
    if (cached) return res.json(cached);
    
    try {
      const apiKey = process.env.FRED_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing FRED API Key" });
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json&limit=${full ? 5000 : 500}&sort_order=desc`;
      const data = await fetchJson(url);
      setCached('fred', cacheKey, data);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ECB
  app.get('/api/macro/ecb/:flow', async (req, res) => {
    const flow = decodeURIComponent(req.params.flow);
    if (!ECB_FLOWS_ALLOWED.has(flow)) return res.status(400).json({ error: 'Flow not allowed' });
    
    const cached = getCached('ecb', flow, 3600_000);
    if (cached) return res.json(cached);
    
    try {
      const url = `https://data-api.ecb.europa.eu/service/data/${flow}?format=jsondata`;
      const data = await fetchJson(url, { headers: { Accept: 'application/json' } });
      setCached('ecb', flow, data);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // CoinGecko
  app.get('/api/crypto/top10', async (req, res) => {
    const cached = getCached('coingecko', 'top10', 300_000);
    if (cached) return res.json(cached);
    
    try {
      const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h,7d';
      const data = await fetchJson(url);
      setCached('coingecko', 'top10', data);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Sentiment
  app.get('/api/sentiment/crypto-fng', async (req, res) => {
    const cached = getCached('fng', 'current', 3600_000);
    if (cached) return res.json(cached);
    try {
      const url = 'https://api.alternative.me/fng/?limit=30';
      const data = await fetchJson(url);
      setCached('fng', 'current', data);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // SEC EDGAR 13F
  app.get('/api/edgar/13f/:cik', async (req, res) => {
    const cik = req.params.cik.padStart(10, '0');
    if (!/^\d{10}$/.test(cik)) return res.status(400).json({ error: 'Invalid CIK' });
    
    const cacheRow = db.prepare('SELECT data FROM edgar_cache WHERE cik = ? AND fetched_at > ?')
      .get(cik, Date.now() - 86400_000) as any;
    if (cacheRow) return res.json(JSON.parse(cacheRow.data));
    
    try {
      const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
      const data = await fetchJson(url, {
        headers: { 'User-Agent': 'Quantrih research@quantrih.com' },
      });
      
      const resData = {
        name: data.name,
        cik: data.cik,
        fund: data.entityType,
        recentFilings: data.filings?.recent || {}
      };
      
      db.prepare('INSERT OR REPLACE INTO edgar_cache (cik, data, fetched_at) VALUES (?, ?, ?)')
        .run(cik, JSON.stringify(resData), Date.now());
      res.json(resData);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Enhanced Dividends (Chantier 3)
  app.get('/api/dividends/enhanced/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const cacheRow = db.prepare('SELECT data FROM dividend_cache WHERE symbol = ? AND fetched_at > ?')
      .get(symbol, Date.now() - 86400_000) as any;
    if (cacheRow) return res.json(JSON.parse(cacheRow.data));

    try {
      let result;
      try {
        result = await yf.historical(symbol, {
          period1: '1990-01-01',
          period2: new Date(),
          events: 'dividends',
          interval: '1d',
        });
      } catch (e: any) {
        if (e.name === 'FailedYahooValidationError' || (e.message && e.message.includes('Schema validation'))) {
          result = e.result || [];
        } else {
          throw e;
        }
      }
      
      const history = result
        .filter((r: any) => r.dividends !== undefined)
        .map((r: any) => ({
          exDate: r.date.toISOString().slice(0, 10),
          amount: r.dividends
        }));

      db.prepare('INSERT OR REPLACE INTO dividend_cache (symbol, data, fetched_at)')
        .run(symbol, JSON.stringify(history), Date.now());
      res.json(history);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // FINNHUB INSIDER
  app.get('/api/finnhub/insider/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const apiKey = process.env.FINNHUB_API_KEY;
      const url = `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${symbol}&token=${apiKey}`;
      const data = await fetchJson(url);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // EX-DIVIDEND CALENDAR (STUBBED FOR NOW - REQUIRES EXTERNAL SOURCE)
  app.get('/api/calendar/ex-div', async (req, res) => {
    res.json([]);
  });

  // STRIPE CHECKOUT FOR DONATIONS
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    const { amount, currency = 'eur' } = req.body;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      return res.status(500).json({ error: "Stripe key is not configured on the server." });
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'Quantrih Support Contribution',
                description: 'Thank you for supporting the development of institutional-grade backtesting tools.',
              },
              unit_amount: Math.round(amount * 100), // amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}?payment=success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}?payment=cancelled`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (e: any) {
      console.error("Stripe error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // === EXISTING ROUTES ===

  // Timeout helper for native fetch
  // Monthly Prices error details improved
  async function fetchJsonWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 7000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (!response.ok) {
        const text = await response.text().catch(() => "No body");
        throw new Error(`HTTP error! status: ${response.status} - ${text.slice(0, 200)}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        const text = await response.text().catch(() => "No body");
        throw new Error(`Expected JSON but got ${contentType}: ${text.slice(0, 200)}`);
      }
      return await response.json();
    } finally {
      clearTimeout(id);
    }
  }

  async function safeYfChart(symbol: string, options: any): Promise<any> {
    try {
      return await yf.chart(symbol, options);
    } catch (e: any) {
      if ((e.name === 'FailedYahooValidationError' || (e.message && e.message.includes('Schema validation'))) && e.result) {
        return e.result;
      } else if (e.name === 'FailedYahooValidationError' || (e.message && e.message.includes('Schema validation'))) {
        return { quotes: [], meta: {} };
      } else if (e.message && (e.message.includes('fetch failed') || e.message.toLowerCase().includes('doctype html') || e.message.includes('Exception report'))) {
        console.warn(`[safeYfChart] Network or HTML error for ${symbol}, returning empty quotes.`);
        return { quotes: [], meta: {} };
      }
      if (e.message && e.message.includes('No data found')) {
        let search: any;
        try {
          search = await yf.search(symbol);
        } catch (searchErr: any) {
          if (searchErr.name === 'FailedYahooValidationError' || (searchErr.message && searchErr.message.includes('Schema validation'))) {
            search = searchErr.result || { quotes: [] };
          } else {
            search = { quotes: [] };
          }
        }
        if (search && search.quotes && search.quotes.length > 0) {
          try {
            return await yf.chart(search.quotes[0].symbol as string, options);
          } catch (e2: any) {
            if ((e2.name === 'FailedYahooValidationError' || (e2.message && e2.message.includes('Schema validation'))) && e2.result) {
              return e2.result;
            } else if (e2.name === 'FailedYahooValidationError' || (e2.message && e2.message.includes('Schema validation'))) {
              return { quotes: [], meta: {} };
            } else if (e2.message && (e2.message.includes('fetch failed') || e2.message.toLowerCase().includes('doctype html') || e2.message.includes('Exception report'))) {
              console.warn(`[safeYfChart fallback] Network or HTML error for ${search.quotes[0].symbol}, returning empty quotes.`);
              return { quotes: [], meta: {} };
            }
            throw e2;
          }
        }
      }
      throw e;
    }
  }

  // Monthly Prices Proxy for Backtester (Yahoo Finance)
  app.get("/api/prices/monthly/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const from = (req.query.from as string) || "2000-01-01";
      const to = (req.query.to as string) || new Date().toISOString().split("T")[0];

      // 1. Check cache first
      if (cacheService.hasData(symbol, from, to)) {
        const cached = cacheService.getPrices(symbol, from, to);
        return res.json(cached);
      }

      // 2. Fetch from Yahoo if not in cache
      const period1 = new Date(from);
      const period2 = new Date(to);

      const result = await safeYfChart(symbol, { 
        period1: period1.toISOString().split("T")[0],
        period2: period2.toISOString().split("T")[0],
        interval: '1mo'
      });

      const prices = (result.quotes || []).map((item: any) => ({
        date: item.date.toISOString(),
        close: item.close,
        volume: item.volume
      }));

      // 3. Save to cache
      cacheService.savePrices(symbol, prices);

      res.json(prices);
    } catch (error: any) {
      console.warn(`Monthly prices error for ${req.params.symbol}:`, error.message);
      res.status(500).json({ error: "Failed to fetch monthly prices" });
    }
  });

  // Finnhub Proxy
  app.get("/api/finnhub/*", async (req, res) => {
    const endpoint = (req.params as any)[0];
    const apiKey = process.env.FINNHUB_API_KEY;
    const symbol = (req.query.symbol as string || req.query.q as string || "AAPL").toUpperCase();

    if (!apiKey) {
      return res.status(503).json({ error: "Finnhub data unavailable (API key not configured)" });
    }

    try {
      const cacheKey = `${endpoint}?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
      const cached = getCached('finnhub', cacheKey, 3600_000);
      if (cached) return res.json(cached);

      const queryParams = new URLSearchParams(req.query as Record<string, string>);
      queryParams.set("token", apiKey);
      
      const data = await fetchJsonWithTimeout(`https://finnhub.io/api/v1/${endpoint}?${queryParams.toString()}`);
      
      setCached('finnhub', cacheKey, data);
      return res.json(data);
    } catch (e: any) {
      return res.status(502).json({ error: "Finnhub data unavailable" });
    }
  });

  // FMP Proxy
  app.get("/api/fmp/:resource/:symbol", async (req, res) => {
    const { resource, symbol } = req.params;
    const cleanSym = (symbol || "").toUpperCase();
    const apiKey = process.env.FMP_API_KEY;

    const allowedResources = ['profile', 'etf-holder', 'etf-sector-weightings'];
    if (!allowedResources.includes(resource)) {
      return res.status(403).json({ error: "Resource not allowed" });
    }

    if (!/^[A-Za-z0-9\.\-\^]+$/.test(cleanSym)) {
      return res.status(400).json({ error: "Invalid symbol format" });
    }

    if (!apiKey) {
      return res.status(503).json({ error: "FMP data unavailable (API key not configured)" });
    }

    try {
      const cacheKey = `${resource}/${cleanSym}`;
      const cached = getCached('fmp', cacheKey, 86400_000);
      if (cached) return res.json(cached);

      const data = await fetchJsonWithTimeout(`https://financialmodelingprep.com/api/v3/${resource}/${cleanSym}?apikey=${apiKey}`);
      
      setCached('fmp', cacheKey, data);
      return res.json(data);
    } catch (e: any) {
      return res.status(502).json({ error: "FMP data unavailable" });
    }
  });

  // API Route: Market News
  app.get("/api/market-news", async (req, res) => {
    try {
      const q = (req.query.q as string) || "markets bloomberg reuters wsj";
      const cached = getCached('news', q, 300_000); // 5 mins cache
      if (cached) return res.json(cached);

      let newsList: any[] = [];
      try {
        const searchRes = await yf.search(q, { newsCount: 25 });
        newsList = searchRes.news || [];
      } catch (e: any) {
        if (e.name === 'FailedYahooValidationError' || (e.message && e.message.includes('Schema validation')) || e.result) {
          newsList = e.result?.news || [];
        } else {
          console.warn("Error fetching news:", e.message);
        }
      }

      const formatted = newsList.filter(n => n.title && n.link).map((n: any) => {
        const d = new Date(n.providerPublishTime);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
        const dateStr = d.toLocaleDateString('en-US', options);
        return {
          id: n.uuid || String(Math.random()),
          headline: n.title,
          summary: n.title,
          source: n.publisher || 'Yahoo Finance',
          url: n.link,
          datetime: d.getTime() / 1000,
          date: dateStr,
        };
      });

      // Filter out duplicate headlines to keep it clean
      const uniqueNews = [];
      const seen = new Set();
      for (const item of formatted) {
        if (!seen.has(item.headline)) {
          seen.add(item.headline);
          uniqueNews.push(item);
        }
      }

      setCached('news', q, uniqueNews);
      res.json(uniqueNews);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // API Route: Search
  app.get("/api/stock/search", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) return res.json({ result: [] });
      let quotes: any[] = [];
      try {
        const searchRes = await yf.search(q);
        quotes = searchRes.quotes || [];
      } catch (e: any) {
        if (e.name === 'FailedYahooValidationError' || (e.message && e.message.includes('Schema validation')) || e.result) {
          quotes = e.result?.quotes || [];
        } else {
          throw e;
        }
      }
      const results = quotes.map((r: any) => {
        const isCrypto = r.quoteType === 'CRYPTOCURRENCY' || 
                        (r.dispSecIndFlag && String(r.dispSecIndFlag).includes('cryptocurrency')) ||
                        (r.symbol && r.symbol.toUpperCase().endsWith('USDT'));
        return {
          symbol: r.symbol,
          label: r.shortname || r.longname || r.symbol,
          exchange: r.exchDisp || r.exchange || null,
          type: isCrypto ? 'Crypto' : (r.quoteType === 'EQUITY' ? 'Equity' : r.quoteType || 'Equity')
        };
      });
      res.json({ result: results });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // API Route: Quote & Profile
  app.get("/api/stock/quote/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      let quote;
      
      // Try FMP first
      try {
        const fmpApiKey = process.env.FMP_API_KEY;
        if (fmpApiKey) {
          const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${fmpApiKey}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const q = data[0];
              quote = {
                symbol: q.symbol,
                shortName: q.name,
                regularMarketPrice: q.price,
                regularMarketChange: q.change,
                regularMarketChangePercent: q.changesPercentage,
                regularMarketDayLow: q.dayLow,
                regularMarketDayHigh: q.dayHigh,
                marketCap: q.marketCap,
                previousClose: q.previousClose,
                open: q.open
              };
            }
          }
        }
      } catch (e) { console.warn("FMP quote fetch failed", e); }

      // Fallback to YF
      if (!quote) {
        try {
          quote = await yf.quote(symbol);
        } catch (error: any) {
          if (error.name === 'FailedYahooValidationError' || (error.message && error.message.includes('Schema validation'))) {
            quote = error.result || {};
          } else {
            console.warn(`Could not fetch quote for ${symbol}:`, error.message);
            return res.status(502).json({ error: `Market data unavailable for ${symbol}` });
          }
        }
      }
      
      if (Array.isArray(quote) && quote.length > 0) {
        quote = quote[0];
      }

      if (!quote || !quote.symbol) {
        return res.status(404).json({ error: `No data found, symbol may be delisted: ${symbol}` });
      }

      let profile: any = { assetProfile: null, financialData: null };
      
      // Try FMP for profile first if we have an API key
      const fmpApiKey = process.env.FMP_API_KEY;
      if (fmpApiKey) {
        try {
          const fmpRes = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${fmpApiKey}`);
          if (fmpRes.ok) {
            const fmpData = await fmpRes.json();
            if (Array.isArray(fmpData) && fmpData.length > 0) {
              const p = fmpData[0];
              profile = {
                assetProfile: {
                  longBusinessSummary: p.description,
                  sector: p.sector,
                  industry: p.industry,
                  website: p.website,
                  companyOfficers: [{ name: p.ceo }],
                  fullTimeEmployees: parseInt(p.fullTimeEmployees) || undefined,
                  beta: p.beta,
                  country: p.country
                },
                financialData: {
                  financialCurrency: p.currency
                }
              };
            }
          }
        } catch (e) { console.warn("FMP profile fetch failed", e); }
      }

      // If FMP failed or didn't provide assetProfile, try YF
      if (!profile.assetProfile) {
        try {
          profile = await yf.quoteSummary(symbol, { modules: ["assetProfile", "financialData"] });
        } catch (error: any) {
          if (error.name === 'FailedYahooValidationError' || (error.message && error.message.includes('Schema validation'))) {
            profile = error.result || { assetProfile: null, financialData: null };
          } else if (
            !error.message?.includes("No fundamentals data found") && 
            !error.message?.includes("INKApi Error") && 
            !error.message?.includes("fetch failed") && 
            !error.message?.includes("upstream connect error") &&
            !error.message?.includes("Request Failed") &&
            !error.message?.includes("Too Many Requests") &&
            !error.message?.includes("Server caught an exception")
          ) {
            console.warn(`Profile error for ${symbol}:`, error.message);
          }
        }
      }
      
      res.json({
        quote: {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changesPercentage: quote.regularMarketChangePercent,
          dayLow: quote.regularMarketDayLow,
          dayHigh: quote.regularMarketDayHigh,
          yearHigh: quote.fiftyTwoWeekHigh,
          yearLow: quote.fiftyTwoWeekLow,
          marketCap: quote.marketCap,
          volume: quote.regularMarketVolume,
          avgVolume: quote.averageDailyVolume10Day || quote.averageDailyVolume3Month,
          exchange: quote.exchange,
          pe: quote.trailingPE,
          eps: quote.epsTrailingTwelveMonths,
          currency: quote.currency || null,
          quoteType: quote.quoteType || null,
          fullExchangeName: quote.fullExchangeName || quote.exchange || null,
        },
        profile: profile.assetProfile ? {
          description: profile.assetProfile.longBusinessSummary,
          sector: profile.assetProfile.sector,
          industry: profile.assetProfile.industry,
          website: profile.assetProfile.website,
          ceo: profile.assetProfile.companyOfficers?.[0]?.name,
          employeeTotal: profile.assetProfile.fullTimeEmployees,
          country: profile.assetProfile.country || null,
          currency: profile.financialData?.financialCurrency || "USD",
          beta: profile.assetProfile.beta || profile.financialData?.targetMeanPrice ? quote.beta : undefined,
          lastDiv: quote.trailingAnnualDividendYield ? (quote.trailingAnnualDividendYield * 100).toFixed(2) + '%' : null
        } : null
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch quote data" });
    }
  });

  // API Route: Financial Statements (Income, Balance, Cash Flow)
  app.get("/api/stock/financials/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const type = (req.query.type as 'annual' | 'quarterly') || 'annual';
      const today = new Date();
      const past = new Date();
      if (type === 'quarterly') {
        past.setFullYear(today.getFullYear() - 10);
      } else {
        past.setFullYear(today.getFullYear() - 10);
      }
      
      const options = { 
        period1: past.toISOString().split("T")[0],
        period2: today.toISOString().split("T")[0],
        type: type, 
        module: 'all' as 'all'
      };
      
      let statements: any[] = [];
      try {
        statements = await yf.fundamentalsTimeSeries(symbol, options);
      } catch (error: any) {
        if (error.name === 'FailedYahooValidationError' || (error.message && error.message.includes('Schema validation'))) {
          statements = error.result || [];
        } else {
          statements = [];
        }
      }

      // No real data available: return empty statements (never invent figures)
      if (!statements || !Array.isArray(statements) || statements.length < 1) {
         return res.json({ income: [], balance: [], cashFlow: [] });
      }

      // Keep the most recent periods only: 5 fiscal years or 8 quarters (real reported data)
      statements = statements
        .filter((s: any) => s && s.date)
        .sort((x: any, y: any) => new Date(x.date).getTime() - new Date(y.date).getTime())
        .slice(type === 'annual' ? -5 : -8);

      const formatDate = (dateValue: string) => {
         if (type === 'annual') return new Date(dateValue).getFullYear().toString();
         const d = new Date(dateValue);
         const q = Math.floor(d.getMonth() / 3) + 1;
         return `Q${q} ${d.getFullYear()}`;
      };
      const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

      const income = statements.map((s: any) => ({
        calendarYear: formatDate(s.date),
        date: s.date,
        revenue: num(s.totalRevenue ?? s.operatingRevenue),
        costOfRevenue: num(s.costOfRevenue),
        grossProfit: num(s.grossProfit),
        researchAndDevelopment: num(s.researchAndDevelopment),
        sellingGeneralAndAdministration: num(s.sellingGeneralAndAdministration),
        operatingExpense: num(s.operatingExpense),
        operatingIncome: num(s.operatingIncome ?? s.EBIT),
        ebitda: num(s.EBITDA ?? s.normalizedEBITDA),
        interestExpense: num(s.interestExpense),
        pretaxIncome: num(s.pretaxIncome),
        taxProvision: num(s.taxProvision),
        netIncome: num(s.netIncome ?? s.netIncomeCommonStockholders),
        eps: num(s.dilutedEPS ?? s.basicEPS),
        dilutedShares: num(s.dilutedAverageShares),
      }));

      const balance = statements.map((s: any) => ({
        calendarYear: formatDate(s.date),
        date: s.date,
        totalAssets: num(s.totalAssets),
        currentAssets: num(s.currentAssets),
        cashAndCashEquivalents: num(s.cashAndCashEquivalents ?? s.cashCashEquivalentsAndShortTermInvestments),
        accountsReceivable: num(s.accountsReceivable),
        inventory: num(s.inventory),
        netPPE: num(s.netPPE),
        goodwill: num(s.goodwill),
        totalLiabilities: num(s.totalLiabilitiesNetMinorityInterest),
        currentLiabilities: num(s.currentLiabilities),
        longTermDebt: num(s.longTermDebt),
        totalDebt: num(s.totalDebt),
        netDebt: num(s.netDebt),
        totalStockholdersEquity: num(s.stockholdersEquity ?? s.commonStockEquity),
        retainedEarnings: num(s.retainedEarnings),
        workingCapital: num(s.workingCapital),
      }));

      const cashFlow = statements.map((s: any) => ({
        calendarYear: formatDate(s.date),
        date: s.date,
        operatingCashFlow: num(s.operatingCashFlow ?? s.cashFlowFromContinuingOperatingActivities),
        depreciationAndAmortization: num(s.depreciationAndAmortization ?? s.depreciationAmortizationDepletion),
        stockBasedCompensation: num(s.stockBasedCompensation),
        capitalExpenditure: num(s.capitalExpenditure),
        investingCashFlow: num(s.investingCashFlow ?? s.cashFlowFromContinuingInvestingActivities),
        financingCashFlow: num(s.financingCashFlow ?? s.cashFlowFromContinuingFinancingActivities),
        repurchaseOfCapitalStock: num(s.repurchaseOfCapitalStock),
        dividendsPaid: num(s.cashDividendsPaid ?? s.commonStockDividendPaid),
        freeCashFlow: num(s.freeCashFlow),
        netChangeInCash: num(s.changesInCash),
      }));

      res.json({ income: income.reverse(), balance: balance.reverse(), cashFlow: cashFlow.reverse() });
    } catch (error: any) {
      if (!error.message?.includes("No fundamentals data found") && !error.message?.includes("INKApi Error")) {
        console.error("Financials error for", req.params.symbol, ":", error.message);
      }
      res.status(500).json({ error: "Failed to fetch financial data" });
    }
  });

  // API Route: Historical Price
  app.get("/api/stock/history/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const range = (req.query.range as string) || "1mo";
      const interval = (req.query.interval as string) || "1d";
      
      let period1 = new Date();
      if (range === '1d') period1.setDate(period1.getDate() - 1);
      else if (range === '5d') period1.setDate(period1.getDate() - 5);
      else if (range === '1mo') period1.setMonth(period1.getMonth() - 1);
      else if (range === '3mo') period1.setMonth(period1.getMonth() - 3);
      else if (range === '6mo') period1.setMonth(period1.getMonth() - 6);
      else if (range === '1y') period1.setFullYear(period1.getFullYear() - 1);
      else if (range === '5y') period1.setFullYear(period1.getFullYear() - 5);
      else if (range === 'max') period1.setFullYear(1970);
      else period1.setMonth(period1.getMonth() - 1);
      
      let targetInterval = interval;
      let downsampleCount = 1;
      if (interval === '5h') {
        targetInterval = '1h';
        downsampleCount = 5;
      }

      const result = await safeYfChart(symbol, { 
        period1: period1.toISOString().split("T")[0], 
        interval: targetInterval as any 
      });

      let quotes = (result.quotes || []) as any[];
      if (downsampleCount > 1) {
        quotes = quotes.filter((_, idx) => idx % downsampleCount === 0);
      }

      res.json(quotes.map((item: any) => ({
        date: item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString(),
        open: item.open !== null && item.open !== undefined ? item.open : item.close,
        high: item.high !== null && item.high !== undefined ? item.high : item.close,
        low: item.low !== null && item.low !== undefined ? item.low : item.close,
        close: item.close,
        volume: item.volume
      })));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch historical data", details: error.message, stack: error.stack });
    }
  });

  // Dividend History Proxy
  app.get("/api/prices/divs/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const result = await safeYfChart(symbol, { period1: "2000-01-01" });
      const dividends: any[] = result?.events?.dividends || [];
      res.json(dividends.map((d: any) => ({
        date: typeof d.date === 'string' ? d.date : d.date.toISOString(),
        dividend: d.amount
      })));
    } catch (error: any) {
      console.error(`Dividend error for ${req.params.symbol}:`, error.message);
      res.json([]); // Return empty array on error
    }
  });

  app.get("/api/stock/bulk-quotes", async (req, res) => {
    try {
      if (!req.query.symbols) return res.json([]);
      const symbols = (req.query.symbols as string).split(',').map(s => s.trim()).filter(Boolean);
      if (symbols.length === 0) return res.json([]);
      
      let quotes: any[] = [];
      
      // Try FMP first
      try {
        const fmpApiKey = process.env.FMP_API_KEY;
        if (fmpApiKey) {
          const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbols.join(',')}?apikey=${fmpApiKey}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              quotes = data.map(q => ({
                symbol: q.symbol,
                regularMarketPrice: q.price,
                regularMarketChange: q.change,
                regularMarketChangePercent: q.changesPercentage,
                marketCap: q.marketCap
              }));
            }
          }
        }
      } catch (e) { console.warn("FMP bulk fetch failed", e); }

      // Fallback to YF
      if (quotes.length === 0) {
        try {
          const rawQuotes = await yf.quote(symbols);
          quotes = Array.isArray(rawQuotes) ? rawQuotes : [rawQuotes];
        } catch (error: any) {
          if (error.name === 'FailedYahooValidationError' || (error.message && error.message.includes('Schema validation'))) {
            quotes = error.result || [];
          } else {
            console.warn("Bulk quotes unavailable:", error.message);
            quotes = [];
          }
        }
      }
      
      const finalQuotes = symbols.map(sym => {
        const found = quotes.find((q: any) => q.symbol === sym || q.symbol === sym.toUpperCase() || q.symbol === sym.toLowerCase());
        if (found && found.regularMarketPrice != null) return found;
        return { symbol: sym, regularMarketPrice: null, regularMarketChangePercent: null, regularMarketChange: null };
      });

      res.json(finalQuotes);
    } catch (error: any) {
      console.error("Bulk quotes error:", error.message);
      res.status(500).json({ error: "Failed to fetch bulk quotes" });
    }
  });

  // API Route: Additional Ratios & Stats
  app.get("/api/stock/ratios/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      let summary: any;
      try {
        summary = await yf.quoteSummary(symbol, { 
          modules: ["defaultKeyStatistics", "financialData", "summaryDetail", "price"] 
        });
      } catch (error: any) {
        if (error.name === 'FailedYahooValidationError' || (error.message && error.message.includes('Schema validation'))) {
          summary = error.result || {};
        } else {
          console.warn(`Network error fetching ratios for ${symbol}.`);
          summary = { financialData: {}, defaultKeyStatistics: {}, summaryDetail: {} };
        }
        }

      const fd = summary.financialData || {};
      const ks = summary.defaultKeyStatistics || {};
      const sd = summary.summaryDetail || {};

      // Map Yahoo Finance data to FMP keys for seamless integration on the frontend
      const ratios = {
        priceEarningsRatioTTM: sd.trailingPE || null,
        priceToEarningsRatioForward: sd.forwardPE || null,
        pegRatioTTM: ks.pegRatio || null,
        priceToSalesRatioTTM: sd.trailingPE ? (sd.trailingPE * (fd.profitMargins || 0)) : null, // Approx if P/S not direct, or price / revenuePerShare
        priceToBookRatioTTM: ks.priceToBook || null,
        enterpriseValueMultipleTTM: ks.enterpriseToEbitda || null,
        evToSalesTTM: ks.enterpriseToRevenue || null,
        dividendYieldTTM: sd.trailingAnnualDividendYield ? sd.trailingAnnualDividendYield * 100 : null,
        earningsYieldTTM: sd.trailingPE ? (1 / sd.trailingPE) * 100 : null,
        marketCapTTM: sd.marketCap || null,
        
        // Quality
        grossProfitMarginTTM: fd.grossMargins ? fd.grossMargins * 100 : null,
        operatingProfitMarginTTM: fd.operatingMargins ? fd.operatingMargins * 100 : null,
        netProfitMarginTTM: fd.profitMargins ? fd.profitMargins * 100 : null,
        ebitdaMarginTTM: fd.ebitdaMargins ? fd.ebitdaMargins * 100 : null,
        returnOnAssetsTTM: fd.returnOnAssets ? fd.returnOnAssets * 100 : null,
        returnOnEquityTTM: fd.returnOnEquity ? fd.returnOnEquity * 100 : null,
        revenuePerShareTTM: fd.revenuePerShare || null,
        cashPerShareTTM: fd.totalCashPerShare || null,

        // Financial Strength
        currentRatioTTM: fd.currentRatio || null,
        quickRatioTTM: fd.quickRatio || null,
        debtEquityRatioTTM: fd.debtToEquity || null,

        // Extra real metrics (Yahoo quoteSummary)
        beta: sd.beta ?? ks.beta ?? null,
        forwardEps: ks.forwardEps ?? null,
        trailingEps: ks.trailingEps ?? null,
        payoutRatio: sd.payoutRatio != null ? sd.payoutRatio * 100 : null,
        dividendRate: sd.dividendRate ?? null,
        revenueGrowth: fd.revenueGrowth != null ? fd.revenueGrowth * 100 : null,
        earningsGrowth: fd.earningsGrowth != null ? fd.earningsGrowth * 100 : null,
        totalCash: fd.totalCash ?? null,
        totalDebt: fd.totalDebt ?? null,
        totalRevenue: fd.totalRevenue ?? null,
        freeCashflow: fd.freeCashflow ?? null,
        operatingCashflow: fd.operatingCashflow ?? null,
        ebitda: fd.ebitda ?? null,
        targetMeanPrice: fd.targetMeanPrice ?? null,
        targetHighPrice: fd.targetHighPrice ?? null,
        targetLowPrice: fd.targetLowPrice ?? null,
        recommendationKey: fd.recommendationKey ?? null,
        recommendationMean: fd.recommendationMean ?? null,
        numberOfAnalystOpinions: fd.numberOfAnalystOpinions ?? null,
        sharesOutstanding: ks.sharesOutstanding ?? null,
        floatShares: ks.floatShares ?? null,
        heldPercentInsiders: ks.heldPercentInsiders != null ? ks.heldPercentInsiders * 100 : null,
        heldPercentInstitutions: ks.heldPercentInstitutions != null ? ks.heldPercentInstitutions * 100 : null,
        shortPercentOfFloat: ks.shortPercentOfFloat != null ? ks.shortPercentOfFloat * 100 : null,
        week52Change: ks['52WeekChange'] != null ? ks['52WeekChange'] * 100 : null,
        fiftyTwoWeekHigh: sd.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: sd.fiftyTwoWeekLow ?? null,
        fiftyDayAverage: sd.fiftyDayAverage ?? null,
        twoHundredDayAverage: sd.twoHundredDayAverage ?? null,
        averageVolume: sd.averageVolume ?? null,
        currency: summary.price?.currency || fd.financialCurrency || null,
      };

      res.json(ratios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch ratio data" });
    }
  });

  // API Route: Fund / ETF Data
  app.get("/api/fund/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }

      try {
        const quote = await yf.quote(symbol);
        if (!quote) throw new Error("Symbol not found");
      } catch (error: any) {
        if (error.name !== 'FailedYahooValidationError' && !(error.message && error.message.includes('Schema validation'))) {
           return res.status(404).json({ error: `Symbol '${symbol}' not found on Yahoo Finance.` });
        }
      }

      let fund;
      try {
        fund = await yf.quoteSummary(symbol, {
          modules: [
            "fundProfile",
            "topHoldings",
            "summaryDetail",
            "fundPerformance",
            "defaultKeyStatistics",
            "price"
          ]
        });
      } catch (error: any) {
        if (error.name === 'FailedYahooValidationError' || (error.message && error.message.includes('Schema validation'))) {
          fund = error.result || {};
        } else {
          throw error;
        }
      }
      res.json(fund);
    } catch (error: any) {
      console.error(`Fund error for ${req.params.symbol}:`, error.message);
      res.status(500).json({ error: "Failed to fetch fund data", details: error.message });
    }
  });


  app.get("/api/youtube/videos", async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "YOUTUBE_API_KEY environment variable is required" });
      }
      // You can customize the search query or channelId here
      const query = (req.query.q as string) || "quantitative finance";
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=6&order=relevance&type=video&videoEmbeddable=true&key=${apiKey}`);
      const data = await response.json();
      
      if (data.error) {
        return res.status(500).json({ error: data.error.message });
      }

      res.json(data.items || []);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch YouTube videos" });
    }
  });

  // Portfolios
  app.get("/api/portfolios", (req, res) => {
    try {
      const lazy = getLazyPortfolios();
      const perfs = getPortfolioPerfs();

      // Attach perfs
      const attachPerf = (p: any, type: string) => {
        const perfEntry = perfs.find((pf: any) => pf.portfolio_type === type && pf.portfolio_id === p.id);
        if (perfEntry) p.perf = perfEntry;
        return p;
      };

      res.json({
        lazy: lazy.map(p => attachPerf(p, 'lazy')),
        client: []
      });
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

// Vite middleware setup

  // SEO Routes
  return app;
}
