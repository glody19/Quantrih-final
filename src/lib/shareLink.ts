/**
 * Shareable links for the allocation tools.
 * Each tool keeps its settings in localStorage under its own prefix (aa_, ta_, mc_, po_).
 * A link carries those keys in ?cfg=..., so opening it restores exactly the same simulation.
 */
const ALLOWED_PREFIXES = ["aa_", "ta_", "mc_", "po_"];
const PARAM = "cfg";
const FLAG = "quantrih_shared_cfg";
const MAX_LEN = 30000;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Link to the current page that carries every saved setting of the tool. */
export function buildShareUrl(prefix: string): string {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) data[k] = localStorage.getItem(k) ?? "";
    }
  } catch {
    // storage blocked: the link still opens the tool, with its defaults
  }
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set(PARAM, toBase64Url(JSON.stringify({ p: prefix, d: data })));
  return url.toString();
}

/**
 * Called once before the app renders: if the address holds shared settings, they replace the
 * visitor's saved settings for that tool, and the parameter is removed from the address bar.
 */
export function applySharedConfigFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get(PARAM);
    if (!raw || raw.length > MAX_LEN) return;
    const parsed = JSON.parse(fromBase64Url(raw));
    const prefix = parsed?.p;
    const data = parsed?.d;
    if (typeof prefix !== "string" || !ALLOWED_PREFIXES.includes(prefix) || !data || typeof data !== "object") return;
    const entries = Object.entries(data).filter(
      ([k, v]) => k.startsWith(prefix) && typeof v === "string",
    ) as [string, string][];
    entries.forEach(([, v]) => JSON.parse(v)); // only valid JSON values, as written by useLocalStorage
    const old: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) old.push(k);
    }
    old.forEach((k) => localStorage.removeItem(k));
    entries.forEach(([k, v]) => localStorage.setItem(k, v));
    sessionStorage.setItem(FLAG, prefix);
    url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, "", url.pathname + (url.search || "") + url.hash);
  } catch {
    // a broken link just opens the tool normally
  }
}

/** True once, right after a shared link for this tool was opened (used to run it straight away). */
export function consumeSharedFlag(prefix: string): boolean {
  try {
    if (sessionStorage.getItem(FLAG) === prefix) {
      sessionStorage.removeItem(FLAG);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}
