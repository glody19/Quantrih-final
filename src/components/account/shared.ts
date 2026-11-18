import { useCallback, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import type { SavedPortfolioSummary } from "../../lib/savedSummary";
import { DEFAULT_BRANDING, type Branding } from "../../lib/reportPdf";

export const SERIES = ["#1B3F72", "#0EA5E9", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#64748B", "#84CC16"];

/** Style shared with the Dark Pools page: white cards with a soft navy shadow. */
export const CARD = "rounded-[1.25rem] bg-white border border-slate-200/80 shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)]";
export const NAVY: React.CSSProperties = {
  backgroundColor: "#0A1E2D",
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg,#0A1E2D 0%,#14466B 60%,#0A1E2D 100%)",
  backgroundSize: "56px 56px, 56px 56px, 100% 100%",
};

export const TOOL_ROUTES: Record<string, { path: string; en: string; fr: string }> = {
  backtest: { path: "/portfolio-backtest", en: "Portfolio backtesting", fr: "Backtest de portefeuille" },
  "asset-allocation": { path: "/asset-allocation", en: "Asset allocation", fr: "Allocation d'actifs" },
  allocations: { path: "/asset-allocation", en: "Asset allocation", fr: "Allocation d'actifs" },
  tactical: { path: "/tactical-allocation", en: "Tactical allocation", fr: "Allocation tactique" },
  "tactical-allocation": { path: "/tactical-allocation", en: "Tactical allocation", fr: "Allocation tactique" },
  montecarlo: { path: "/montecarlo", en: "Monte Carlo", fr: "Monte Carlo" },
};
export const toolOf = (pageId?: string) => TOOL_ROUTES[pageId || "backtest"] || { path: "/portfolio-backtest", en: pageId || "Backtest", fr: pageId || "Backtest" };

export interface SavedAnalysis {
  id: string;
  name: string;
  pageId?: string;
  startYear?: number;
  endYear?: number;
  startMonth?: number;
  endMonth?: number;
  initialAmount?: number;
  updatedAt?: number;
  createdAt?: number;
  note?: string;
  tags?: string[];
  resultsSummary?: SavedPortfolioSummary[] | null;
  [k: string]: any;
}

/** One portfolio of one saved analysis. */
export interface PortfolioRow {
  key: string;
  analysisId: string;
  analysis: string;
  pageId?: string;
  period: string;
  savedAt: number;
  portfolio: SavedPortfolioSummary;
}

export const periodOf = (c: SavedAnalysis) =>
  c.startYear && c.endYear
    ? `${c.startMonth ? String(c.startMonth).padStart(2, "0") + "/" : ""}${c.startYear} - ${c.endMonth ? String(c.endMonth).padStart(2, "0") + "/" : ""}${c.endYear}`
    : "-";

export function rowsOf(list: SavedAnalysis[]): PortfolioRow[] {
  const out: PortfolioRow[] = [];
  list.forEach((c) => {
    const s = Array.isArray(c.resultsSummary) ? c.resultsSummary : [];
    s.forEach((p, i) => {
      if (!p) return;
      out.push({ key: `${c.id}:${i}`, analysisId: c.id, analysis: c.name || "-", pageId: c.pageId, period: periodOf(c), savedAt: c.updatedAt || c.createdAt || 0, portfolio: p });
    });
  });
  return out;
}

export function useSavedAnalyses(uid: string | undefined) {
  const [items, setItems] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!uid) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, `users/${uid}/backtests`));
      const list: SavedAnalysis[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setItems(list);
    } catch (e) {
      console.error("Failed to load saved analyses:", e);
    } finally {
      setLoading(false);
    }
  }, [uid]);
  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/backtests`, id));
    setItems((l) => l.filter((x) => x.id !== id));
  };
  const patch = async (id: string, data: Partial<SavedAnalysis>) => {
    if (!uid) return;
    const updatedAt = Date.now();
    await setDoc(doc(db, `users/${uid}/backtests`, id), { ...data, updatedAt }, { merge: true });
    setItems((l) => l.map((x) => (x.id === id ? { ...x, ...data, updatedAt } : x)));
  };
  return { items, loading, refresh, remove, patch };
}

export function useBranding(uid: string | undefined) {
  const [branding, setBranding] = useState<Branding>(() => {
    try { return { ...DEFAULT_BRANDING, ...JSON.parse(localStorage.getItem("quantrih_branding") || "{}") }; } catch { return DEFAULT_BRANDING; }
  });
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, `users/${uid}/profiles/branding`))
      .then((d) => { if (d.exists()) setBranding((b) => ({ ...b, ...(d.data() as any) })); })
      .catch(() => { /* offline: keep local copy */ });
  }, [uid]);
  const save = async (b: Branding) => {
    setBranding(b);
    try { localStorage.setItem("quantrih_branding", JSON.stringify(b)); } catch { /* quota */ }
    if (uid) await setDoc(doc(db, `users/${uid}/profiles/branding`), b);
  };
  return { branding, setBranding, save };
}

export const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
export const pct = (v: any, d = 2) => (isNum(v) ? `${v.toFixed(d)} %` : "-");
export const num = (v: any) => (isNum(v) ? v.toFixed(2) : "-");

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const esc = (v: any) => {
    const s = String(v ?? "");
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Resizes an uploaded image to a data URL that fits in a Firestore document. */
export function resizeImage(file: File, max: number, type: "image/png" | "image/jpeg" = "image/png"): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * r);
        c.height = Math.round(img.height * r);
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        if (type === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL(type, 0.88));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
