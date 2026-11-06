// Watches /api responses for the server's "X-Quantrih-Data: demo" header, which marks generated
// placeholder data (missing API key or provider failure), and lets the UI say so instead of
// presenting it as real market data.

type Listener = (active: boolean) => void;

let demoSeen = false;
const listeners = new Set<Listener>();

export function subscribeDemoData(listener: Listener): () => void {
  listeners.add(listener);
  listener(demoSeen);
  return () => listeners.delete(listener);
}

/** Called on page change so the badge only reflects data fetched by the current page. */
export function resetDemoData() {
  demoSeen = false;
  listeners.forEach((l) => l(false));
}

export function installDemoDataTracker() {
  if (typeof window === "undefined" || (window as any).__quantrihDemoTracker) return;
  (window as any).__quantrihDemoTracker = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const response = await originalFetch(...args);
    try {
      // Requests marked quiet=1 handle demo data themselves (for example by hiding the widget).
      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;
      const quiet = url.includes("quiet=1");
      if (!demoSeen && !quiet && response.headers.get("X-Quantrih-Data") === "demo") {
        demoSeen = true;
        listeners.forEach((l) => l(true));
      }
    } catch {
      // Opaque or cross-origin responses expose no headers; nothing to track.
    }
    return response;
  };
}
