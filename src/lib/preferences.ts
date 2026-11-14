// User preferences kept in the browser (and copied to the account in Firestore by the settings page).
export interface Preferences {
  baseCcy: "EUR" | "USD" | "GBP" | "CHF";
  motion: "system" | "reduced" | "full";
  vpTheme: "dark" | "light";
  notify: { monthlyReport: boolean; productNews: boolean; priceAlerts: boolean };
}

const KEY = "quantrih_prefs";
export const DEFAULT_PREFS: Preferences = {
  baseCcy: "EUR",
  motion: "system",
  vpTheme: "dark",
  notify: { monthlyReport: false, productNews: false, priceAlerts: false },
};

export function loadPrefs(): Preferences {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object") return { ...DEFAULT_PREFS, ...raw, notify: { ...DEFAULT_PREFS.notify, ...(raw.notify || {}) } };
  } catch { /* storage unavailable */ }
  return DEFAULT_PREFS;
}

export function savePrefs(p: Preferences) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    localStorage.setItem("quantrih_vp_theme", p.vpTheme);
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent("quantrih-prefs", { detail: p }));
}
