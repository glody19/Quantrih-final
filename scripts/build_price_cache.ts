import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';
import { ASSET_DATA } from '../src/constants.js';

const yfClass = (YahooFinance as any).default || YahooFinance;
const yf = new yfClass({
  validation: { logErrors: false }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DIST_PUBLIC_DIR = path.resolve(__dirname, '../dist/data/prices');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'data', 'prices');

async function buildCache() {
  console.log("Starting price cache build...");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest: Record<string, string> = {};
  const tickers = Object.keys(ASSET_DATA).map(k => ASSET_DATA[k].short);
  
  // Add some other standard tickers we may want
  const extraTickers = ['^GSPC', '^IXIC', 'BND', 'GLD', 'QQQ', 'SPY'];
  const allTickers = Array.from(new Set([...tickers, ...extraTickers]));

  const period1 = "1990-01-01";
  const period2 = new Date().toISOString().split("T")[0];

  for (const symbol of allTickers) {
    try {
      console.log(`Fetching 1mo data for ${symbol}...`);
      const result = await yf.chart(symbol, {
        period1: period1,
        period2: period2,
        interval: '1mo'
      });

      const prices = result.quotes.map((item: any) => ({
        date: item.date.toISOString(),
        close: item.close,
        volume: item.volume
      }));

      const filePath = path.join(OUTPUT_DIR, `${symbol}.json`);
      fs.writeFileSync(filePath, JSON.stringify(prices, null, 2));
      
      manifest[symbol] = `${symbol}.json`;
    } catch (e: any) {
      console.error(`Failed to fetch ${symbol}: ${e.message}`);
    }
    
    // Slight delay to avoid hammering the API
    await new Promise(r => setTimeout(r, 1000));
  }

  // Write manifest
  fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log("Cache build complete.");
}

buildCache().catch(console.error);
