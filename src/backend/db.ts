import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const defaultDbPath = path.join(process.cwd(), 'quantrih.db');
const fallbackDbPath = '/tmp/quantrih.db';

let db: InstanceType<typeof Database>;

try {
  db = new Database(defaultDbPath);
  db.pragma("journal_mode = WAL");
  db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
} catch (e) {
  console.error("Failed to load quantrih.db in cwd, Trying fallback...", e);
  try {
    db = new Database(fallbackDbPath);
    db.pragma("journal_mode = WAL");
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  } catch (err) {
    console.error("Failed to load fallback db. Using in-memory db.", err);
    db = new Database(':memory:');
  }
}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lazy_portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      composition TEXT NOT NULL -- JSON
    );

    CREATE TABLE IF NOT EXISTS portfolio_perf_cache (
      portfolio_type TEXT NOT NULL, -- 'lazy' or 'client'
      portfolio_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      perf_1d REAL,
      perf_3m REAL,
      perf_6m REAL,
      perf_1y REAL,
      perf_2y REAL,
      perf_3y REAL,
      PRIMARY KEY (portfolio_type, portfolio_id)
    );

    CREATE TABLE IF NOT EXISTS api_cache (
      ns TEXT NOT NULL,
      key TEXT NOT NULL,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      PRIMARY KEY (ns, key)
    );

    CREATE TABLE IF NOT EXISTS dividend_cache (
      symbol TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS edgar_cache (
      cik TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_api_cache_fetched ON api_cache(fetched_at);
  `);

  // Seed default lazy portfolios if empty
  const count = db.prepare("SELECT COUNT(*) AS c FROM lazy_portfolios").get() as any;
  if (count.c === 0) {
    const defaultLazy = [
      { name: "Permanent Portfolio", composition: JSON.stringify({ "SPY": 25, "TLT": 25, "BIL": 25, "GLD": 25 }) },
      { name: "All Weather (Ray Dalio)", composition: JSON.stringify({ "SPY": 30, "TLT": 40, "IEF": 15, "GLD": 7.5, "DBC": 7.5 }) },
      { name: "Bogleheads 3-Fund", composition: JSON.stringify({ "VTI": 50, "VXUS": 30, "BND": 20 }) },
      { name: "60/40 Portfolio", composition: JSON.stringify({ "SPY": 60, "BND": 40 }) },
      { name: "Golden Butterfly", composition: JSON.stringify({ "SPY": 20, "IWN": 20, "TLT": 20, "SHY": 20, "GLD": 20 }) }
    ];
    
    const insert = db.prepare("INSERT INTO lazy_portfolios (name, composition) VALUES (?, ?)");
    const insertMany = db.transaction((portfolios) => {
      for (const p of portfolios) {
        insert.run(p.name, p.composition);
      }
    });
    insertMany(defaultLazy);
  }
}

export function getLazyPortfolios() {
  const rows = db.prepare("SELECT * FROM lazy_portfolios").all() as any[];
  return rows.map(r => ({ ...r, composition: JSON.parse(r.composition) }));
}



export function getPortfolioPerfs() {
  return db.prepare("SELECT * FROM portfolio_perf_cache").all();
}

export function savePortfolioPerf(type: string, id: number, date: string, perfs: any) {
  db.prepare(`
    INSERT INTO portfolio_perf_cache (portfolio_type, portfolio_id, date, perf_1d, perf_3m, perf_6m, perf_1y, perf_2y, perf_3y)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(portfolio_type, portfolio_id) DO UPDATE SET
      date=excluded.date,
      perf_1d=excluded.perf_1d,
      perf_3m=excluded.perf_3m,
      perf_6m=excluded.perf_6m,
      perf_1y=excluded.perf_1y,
      perf_2y=excluded.perf_2y,
      perf_3y=excluded.perf_3y;
  `).run(type, id, date, perfs.perf_1d, perfs.perf_3m, perfs.perf_6m, perfs.perf_1y, perfs.perf_2y, perfs.perf_3y);
}

export default db;
