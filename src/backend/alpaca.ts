import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

export const AlpacaEvent = new EventEmitter();

const ALPACA_API_KEY = process.env.ALPACA_API_KEY || ''; // Usually key ID
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY || '';
// Using IEX since it's free.
const ALPACA_WS_URL = 'wss://stream.data.alpaca.markets/v2/iex';

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const WATCHED_SYMBOLS = [
  "SPY", "QQQ", "VOO", "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", 
  "GOOGL", "META", "AMD", "AVGO", "COST", "NFLX", "JPM", "V", 
  "UNH", "MA", "PG", "XOM"
];

// In-memory cache of latest daily bars, prices
export const marketCache: Record<string, any> = {};

export function connectAlpaca() {
  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    console.log("Alpaca keys missing, skipping live market feed.");
    return;
  }

  console.log("Connecting to Alpaca WS...");
  ws = new WebSocket(ALPACA_WS_URL);

  ws.on('open', () => {
    console.log("Alpaca WS connected.");
    // Authenticate
    ws!.send(JSON.stringify({
      action: 'auth',
      key: ALPACA_API_KEY,
      secret: ALPACA_SECRET_KEY
    }));
  });

  ws.on('message', (data: Buffer) => {
    const msgs = JSON.parse(data.toString());
    msgs.forEach((msg: any) => {
      if (msg.T === 'success' && msg.msg === 'authenticated') {
        // Subscribe
        ws!.send(JSON.stringify({
          action: 'subscribe',
          trades: WATCHED_SYMBOLS,
          dailyBars: WATCHED_SYMBOLS
        }));
      } else if (msg.T === 't') {
        const symbol = msg.S;
        const price = msg.p;
        if (!marketCache[symbol]) marketCache[symbol] = {};
        marketCache[symbol].price = price;
        
        // Calculate daily % change if we have prev close
        if (marketCache[symbol].prevClose) {
          const change = ((price - marketCache[symbol].prevClose) / marketCache[symbol].prevClose) * 100;
          marketCache[symbol].changePct = change;
        }

        AlpacaEvent.emit('trade', { symbol, price, changePct: marketCache[symbol].changePct });
      } else if (msg.T === 'd') {
        const symbol = msg.S;
        if (!marketCache[symbol]) marketCache[symbol] = {};
        // Msg d represents the daily bar.
        // It has open, close, high, low.
        marketCache[symbol].prevClose = msg.c; 
      }
    });
  });

  ws.on('close', () => {
    console.log("Alpaca WS closed. Reconnecting in 5s...");
    clearTimeout(reconnectTimeout!);
    reconnectTimeout = setTimeout(connectAlpaca, 5000);
  });

  ws.on('error', (err) => {
    console.error("Alpaca WS Error:", err);
    ws?.close();
  });
}
