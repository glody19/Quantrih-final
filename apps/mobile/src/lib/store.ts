import { useSyncExternalStore } from "react";
import type { BacktestSettings, DraftPortfolio, RunOutput } from "./backtest";

/**
 * Small shared state for the backtest flow: the builder writes the draft, the results screen
 * reads the last run. Kept in memory; saved analyses live in Firestore.
 */
interface State {
  portfolios: DraftPortfolio[];
  active: number;
  settings: BacktestSettings;
  lastRun: RunOutput | null;
}

const thisYear = new Date().getFullYear();

let state: State = {
  portfolios: [
    {
      name: "Mon 60/40",
      holdings: [
        { symbol: "VT", label: "Actions monde", weight: 60 },
        { symbol: "BNDW", label: "Obligations monde", weight: 40 },
      ],
    },
  ],
  active: 0,
  settings: { startYear: thisYear - 15, endYear: thisYear, initial: 10000, monthly: 0, rebalance: "annually", currency: "EUR", benchmark: "URTH" },
  lastRun: null,
};

const listeners = new Set<() => void>();

export function getState() {
  return state;
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
}
