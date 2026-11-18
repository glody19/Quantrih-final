/**
 * Origin prepended to the engine's data requests. Empty on the website (same origin);
 * the mobile app sets it to https://quantrih.com before running a backtest.
 */
let base = "";

export function setApiBase(origin: string) {
  base = origin.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  return base + path;
}
