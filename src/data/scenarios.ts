export interface HistoricalScenario {
  id: string;
  name: string;
  description: string;
  startDate: string;  // ISO
  endDate: string;
  emoji?: string;
  severity: 'minor' | 'major' | 'catastrophic';
}

export const SCENARIOS: HistoricalScenario[] = [
  { id: 'gfc-2008', name: 'Great Financial Crisis', description: 'Subprime mortgage crisis & Lehman collapse', startDate: '2007-10-09', endDate: '2009-03-09', emoji: '📉', severity: 'catastrophic' },
  { id: 'covid-2020', name: 'COVID Crash', description: 'Pandemic shock, fastest bear market in history (33 days)', startDate: '2020-02-19', endDate: '2020-03-23', emoji: '🦠', severity: 'major' },
  { id: 'dotcom-2000', name: 'Dotcom Bust', description: 'Internet bubble, NASDAQ -78%', startDate: '2000-03-10', endDate: '2002-10-09', emoji: '💻', severity: 'catastrophic' },
  { id: 'stagflation-70s', name: '1970s Stagflation', description: 'High inflation + low growth + oil shocks', startDate: '1973-01-01', endDate: '1982-12-31', emoji: '⛽', severity: 'catastrophic' },
  { id: 'bonds-2022', name: '2022 Bond Crash', description: 'Worst year for bonds in 200+ years, both stocks & bonds down', startDate: '2022-01-01', endDate: '2022-12-31', emoji: '🏛️', severity: 'major' },
  { id: 'japan-lost-decade', name: 'Japan Lost Decade', description: 'Nikkei -80% over 20+ years from 1989 peak', startDate: '1990-01-01', endDate: '2000-12-31', emoji: '🇯🇵', severity: 'catastrophic' },
  { id: 'black-monday-1987', name: 'Black Monday 1987', description: 'Single-day crash -22.6% on Dow', startDate: '1987-10-01', endDate: '1987-12-31', emoji: '💥', severity: 'major' },
  { id: '2018-q4', name: '2018 Q4 Correction', description: 'Fed tightening triggers near-bear correction', startDate: '2018-10-01', endDate: '2018-12-31', emoji: '🔻', severity: 'minor' },
  { id: 'rate-hikes-2023', name: '2022-2023 Rate Hikes', description: 'Fastest Fed tightening cycle since 1980s', startDate: '2022-03-01', endDate: '2023-07-31', emoji: '📈', severity: 'major' },
  { id: 'flash-crash-2010', name: '2010 Flash Crash', description: 'Algorithmic trading triggers -9% intraday', startDate: '2010-05-06', emoji: '⚡', endDate: '2010-05-10', severity: 'minor' },
];
