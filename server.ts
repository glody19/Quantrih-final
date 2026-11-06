import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createApp, yf } from "./server-app.js";
import db from "./src/backend/db.js";
import { buildAssetDataTask } from "./src/backend/assetBuilder.js";

// Local / long-running server: API routes from server-app.ts plus the frontend,
// the daily asset build and the live WebSocket relay (not available on Vercel).
async function startServer() {
  const app = createApp();
  const PORT = 3000;

  try {
    const row = db.prepare('SELECT fetched_at FROM api_cache WHERE ns = ? AND key = ?').get('system', 'asset_data') as any;
    if (!row || Date.now() - row.fetched_at > 24 * 3600_000) {
      console.log("Stale or missing asset data. Running background build...");
      buildAssetDataTask().catch(console.error);
    }
    setInterval(() => {
      buildAssetDataTask().catch(console.error);
    }, 24 * 3600_000);
  } catch (e) {
    console.error("Asset data scheduling failed:", e);
  }

  // Static assets serving logic
  if (process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist"))) {
    const buildPath = path.join(process.cwd(), "dist");
    console.log(`Serving static assets from: ${buildPath}`);
    app.use(express.static(buildPath));
    app.get("*", (req, res, next) => {
      // Don't capture API routes
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(buildPath, "index.html"));
    });
  } else {
    console.log("Vite development mode active");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // --- Unified Live WebSocket Streaming Engine ---
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    if (pathname === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  interface ClientSub {
    ws: any;
    symbols: Set<string>;
  }
  const clients = new Set<ClientSub>();

  wss.on('connection', (ws) => {
    const sub: ClientSub = { ws, symbols: new Set() };
    clients.add(sub);

    ws.on('message', (message: string) => {
      try {
        const payload = JSON.parse(message);
        if (payload.type === 'subscribe') {
          const syms = Array.isArray(payload.symbols) ? payload.symbols : [payload.symbols];
          syms.forEach((s: string) => {
            if (s && typeof s === 'string') {
              const cleanSym = s.trim().toUpperCase();
              sub.symbols.add(cleanSym);
              finnhubSubscribe(cleanSym);
            }
          });
        } else if (payload.type === 'unsubscribe') {
          const syms = Array.isArray(payload.symbols) ? payload.symbols : [payload.symbols];
          syms.forEach((s: string) => {
            if (s && typeof s === 'string') {
              sub.symbols.delete(s.trim().toUpperCase());
            }
          });
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    });

    ws.on('close', () => {
      clients.delete(sub);
    });
  });

  // --- Finnhub WebSocket Integration ---
  let finnhubWs: WebSocket | null = null;
  const finnhubSubscribedSymbols = new Set<string>();
  let finnhubReconnectDelay = 5000;
  let finnhubReconnectTimeout: NodeJS.Timeout | null = null;

  function connectToFinnhub() {
    if (finnhubReconnectTimeout) {
      clearTimeout(finnhubReconnectTimeout);
      finnhubReconnectTimeout = null;
    }

    const token = process.env.FINNHUB_API_KEY;
    if (!token || token === 'YOUR_FINNHUB_API_KEY' || token.length < 10) {
      console.log('Finnhub API key not configured or invalid, skipping WebSocket');
      return;
    }

    try {
      if (finnhubWs) {
        finnhubWs.removeAllListeners();
        try { finnhubWs.close(); } catch (e) {}
        finnhubWs = null;
      }

      console.log('Attempting to connect to Finnhub WebSocket...');
      finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

      finnhubWs.on('open', () => {
        console.log('Connected to Finnhub WebSocket');
        finnhubReconnectDelay = 5000; // reset delay on success
        finnhubSubscribedSymbols.forEach(s => {
          finnhubWs?.send(JSON.stringify({ type: 'subscribe', symbol: s }));
        });
      });

      finnhubWs.on('message', (data: any) => {
        try {
          const payload = JSON.parse(data.toString());
          if (payload.type === 'trade' && Array.isArray(payload.data)) {
            const updates = payload.data.map((t: any) => ({
              symbol: t.s,
              price: t.p,
              volume: t.v,
              timestamp: t.t
            }));
            
            clients.forEach(client => {
              const matched = updates.filter(u => u && u.symbol && client.symbols.has(u.symbol.toUpperCase()));
              if (matched.length > 0) {
                if (client.ws.readyState === 1) {
                  client.ws.send(JSON.stringify({ type: 'price-update', data: matched }));
                }
              }
            });
          }
        } catch (e) {}
      });

      finnhubWs.on('close', (code, reason) => {
        const delay = finnhubReconnectDelay;
        console.log(`Finnhub WS closed (${code}): ${reason}. Reconnecting in ${delay}ms...`);
        if (!finnhubReconnectTimeout) {
          finnhubReconnectTimeout = setTimeout(connectToFinnhub, delay);
        }
      });

      finnhubWs.on('error', (err: any) => {
        const errMsg = err.message || err.toString();
        if (errMsg.includes('429')) {
          finnhubReconnectDelay = Math.max(finnhubReconnectDelay * 2, 300000); // Start at 5 mins for 429
          if (finnhubReconnectDelay > 1800000) finnhubReconnectDelay = 1800000;
          console.warn(`Rate limited by Finnhub (429). Increasing backoff to ${finnhubReconnectDelay}ms.`);
        } else {
          console.error("Finnhub WS error:", errMsg);
          finnhubReconnectDelay = Math.min(finnhubReconnectDelay + 5000, 60000); // Standard backoff
        }
      });
    } catch (e) {
      console.error("Finnhub WS init error", e);
      if (!finnhubReconnectTimeout) {
        finnhubReconnectTimeout = setTimeout(connectToFinnhub, 60000); // longer wait on init crash
      }
    }
  }

  function finnhubSubscribe(symbol: string) {
    if (!process.env.FINNHUB_API_KEY) return;
    const s = symbol.toUpperCase();
    if (s.includes('-') || s.startsWith('^')) return; 
    
    if (!finnhubSubscribedSymbols.has(s)) {
      finnhubSubscribedSymbols.add(s);
      if (finnhubWs && finnhubWs.readyState === 1) {
        finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol: s }));
      }
    }
  }

  connectToFinnhub();

  const broadcastPrices = async () => {
    if (clients.size === 0) return;
    
    const allSymbols = new Set<string>();
    clients.forEach(c => {
      c.symbols.forEach(s => {
        if (s) allSymbols.add(s);
      });
    });

    if (allSymbols.size === 0) return;

    try {
      const symbolsArray = Array.from(allSymbols);
      let quotes: any[] = [];
      try {
        const fmpApiKey = process.env.FMP_API_KEY;
        if (fmpApiKey) {
          const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbolsArray.join(',')}?apikey=${fmpApiKey}`);
          if (res.ok) {
            quotes = await res.json();
          }
        }
        if (quotes.length === 0) {
           const rawQuotes = await yf.quote(symbolsArray);
           quotes = Array.isArray(rawQuotes) ? rawQuotes : [rawQuotes];
        }
      } catch (error: any) {
        console.warn("FMP quote fetch failed", error);
      }

      if (quotes && quotes.length > 0) {
        clients.forEach(client => {
          const matched = quotes.filter(q => q && q.symbol && client.symbols.has(q.symbol.toUpperCase()));
          if (matched.length > 0) {
            if (client.ws.readyState === 1) { // OPEN
              client.ws.send(JSON.stringify({
                type: 'price-update',
                data: matched.map(q => ({
                  symbol: q.symbol,
                  price: q.price ?? q.regularMarketPrice,
                  change: q.change ?? q.regularMarketChange,
                  changesPercentage: q.changesPercentage ?? q.regularMarketChangePercent,
                  marketCap: q.marketCap,
                }))
              }));
            }
          }
        });
      }
    } catch (e) {
      // ignore transient broadcast errors
    }
  };

  // Polling loop (fallback and indices/crypto)
  // Use an 8-second interval for better real-time feel
  setInterval(broadcastPrices, 8000);
}

startServer().catch(err => {
  console.error("CRITICAL SERVER STARTUP ERROR:", err);
  process.exit(1);
});
