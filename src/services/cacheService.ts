import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize DB in the project root
const defaultDbPath = path.join(process.cwd(), 'price_cache.db');
const fallbackDbPath = '/tmp/price_cache.db';
let db: InstanceType<typeof Database>;

try {
  db = new Database(defaultDbPath);
  db.pragma("journal_mode = WAL");
  db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
} catch (e) {
  console.error("Failed to load price_cache.db in cwd, Trying fallback...", e);
  try {
    db = new Database(fallbackDbPath);
    db.pragma("journal_mode = WAL");
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  } catch (err) {
    console.error("Failed to load fallback price_cache db. Using in-memory db.", err);
    db = new Database(':memory:');
  }
}

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS price_cache (
    symbol TEXT,
    date TEXT,
    close REAL,
    volume INTEGER,
    last_updated TEXT,
    PRIMARY KEY (symbol, date)
  )
`);

export interface CachedPrice {
  symbol: string;
  date: string;
  close: number;
  volume: number;
}

export const cacheService = {
  getPrices: (symbol: string, from: string, to: string): CachedPrice[] => {
    const stmt = db.prepare(`
      SELECT symbol, date, close, volume 
      FROM price_cache 
      WHERE symbol = ? AND date >= ? AND date <= ?
      ORDER BY date ASC
    `);
    return stmt.all(symbol, from, to) as CachedPrice[];
  },

  savePrices: (symbol: string, prices: any[]) => {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO price_cache (symbol, date, close, volume, last_updated)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    const transaction = db.transaction((prices) => {
      for (const price of prices) {
        insert.run(symbol, price.date, price.close, price.volume, now);
      }
    });
    
    transaction(prices);
  },

  hasData: (symbol: string, from: string, to: string): boolean => {
    const stmt = db.prepare(`
      SELECT count(*) as count 
      FROM price_cache 
      WHERE symbol = ? AND date >= ? AND date <= ?
    `);
    const result = stmt.get(symbol, from, to) as { count: number };
    // If we have at least 90% of the expected months, consider it a hit
    // (Rough check: (months difference) * 0.9)
    const startDate = new Date(from);
    const endDate = new Date(to);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    return result.count >= Math.max(1, months * 0.9);
  }
};
