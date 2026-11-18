import { jsPDF } from "jspdf";
import type { SavedPortfolioSummary } from "./savedSummary";

/** Firm details printed on client reports. */
export interface Branding {
  companyName: string;
  advisorName: string;
  advisorTitle: string;
  email: string;
  phone: string;
  website: string;
  /** Data URL (PNG or JPEG), resized in the browser. */
  logo: string;
  accent: string;
  clientName: string;
  reportTitle: string;
  intro: string;
  disclaimer: string;
}

export const DEFAULT_BRANDING: Branding = {
  companyName: "",
  advisorName: "",
  advisorTitle: "",
  email: "",
  phone: "",
  website: "",
  logo: "",
  accent: "#1B3F72",
  clientName: "",
  reportTitle: "",
  intro: "",
  disclaimer: "",
};

export interface ReportItem {
  /** Saved analysis name. */
  analysis: string;
  period: string;
  portfolio: SavedPortfolioSummary;
}

export interface ReportOptions {
  items: ReportItem[];
  branding: Branding;
  /** Free plan: Quantrih header, no firm details. */
  useBranding: boolean;
  /** Pro plan: no Quantrih mention at all. */
  whiteLabel: boolean;
  currency: string;
  language: "fr" | "en";
}

const SERIES = ["#1B3F72", "#0EA5E9", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#64748B", "#84CC16"];

const T = {
  fr: {
    title: "Rapport d'analyse de portefeuille", preparedFor: "Préparé pour", preparedBy: "Préparé par", date: "Date", summary: "Synthèse des performances",
    growth: "Évolution de la valeur du portefeuille", cagr: "Rendement annualisé (TCAC)", maxdd: "Perte maximale", annual: "Rendements annuels", alloc: "Composition des portefeuilles",
    portfolio: "Portefeuille", period: "Période", initial: "Capital initial", final: "Valeur finale", vol: "Volatilité", sharpe: "Sharpe", sortino: "Sortino", best: "Meilleure année", worst: "Pire année",
    year: "Année", page: "Page", of: "sur", generated: "Généré avec Quantrih", noCurve: "Courbe non enregistrée pour cette analyse. Relancez-la puis enregistrez-la pour l'inclure.",
    disclaimer: "Les performances passées ne préjugent pas des performances futures. Ce document est fourni à titre d'information et ne constitue ni un conseil en investissement ni une offre. Les résultats sont simulés à partir de données historiques, frais et fiscalité inclus selon les paramètres choisis.",
    free: "Version gratuite Quantrih",
  },
  en: {
    title: "Portfolio analysis report", preparedFor: "Prepared for", preparedBy: "Prepared by", date: "Date", summary: "Performance summary",
    growth: "Portfolio growth", cagr: "Annualised return (CAGR)", maxdd: "Maximum drawdown", annual: "Annual returns", alloc: "Portfolio composition",
    portfolio: "Portfolio", period: "Period", initial: "Initial capital", final: "Final value", vol: "Volatility", sharpe: "Sharpe", sortino: "Sortino", best: "Best year", worst: "Worst year",
    year: "Year", page: "Page", of: "of", generated: "Generated with Quantrih", noCurve: "No curve was saved with this analysis. Run it again and save it to include it.",
    disclaimer: "Past performance does not guarantee future results. This document is for information only and is neither investment advice nor an offer. Results are simulated on historical data, with fees and taxes as set in the parameters.",
    free: "Quantrih free version",
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [27, 63, 114];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);

export function buildReportPdf(o: ReportOptions): jsPDF {
  const t = T[o.language];
  const b = o.useBranding ? o.branding : { ...DEFAULT_BRANDING, reportTitle: o.branding.reportTitle, clientName: o.branding.clientName };
  const accent = hexToRgb(o.whiteLabel && b.accent ? b.accent : o.useBranding && b.accent ? b.accent : "#1B3F72");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 16;
  const locale = o.language === "fr" ? "fr-BE" : "en-GB";
  // Helvetica has no narrow no-break space: use plain spaces
  const plain = (x: string) => x.replace(/[\u202f\u00a0]/g, " ");
  const money = (v: any) => (isNum(v) ? plain(new Intl.NumberFormat(locale, { style: "currency", currency: o.currency || "EUR", maximumFractionDigits: 0 }).format(v)) : "-");
  const pct = (v: any) => (isNum(v) ? `${v.toFixed(2)} %` : "-");
  const num = (v: any) => (isNum(v) ? v.toFixed(2) : "-");
  const today = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const firm = b.companyName || (o.whiteLabel ? "" : "Quantrih");
  const items = o.items;

  const logoFormat = (src: string) => (src.startsWith("data:image/png") ? "PNG" : "JPEG");
  const drawLogo = (x: number, y: number, maxW: number, maxH: number) => {
    if (!o.useBranding || !b.logo) return 0;
    try {
      const props = pdf.getImageProperties(b.logo);
      const r = Math.min(maxW / props.width, maxH / props.height);
      pdf.addImage(b.logo, logoFormat(b.logo), x, y, props.width * r, props.height * r);
      return props.width * r;
    } catch {
      return 0;
    }
  };

  /* ── Cover ─────────────────────────────────────────────── */
  pdf.setFillColor(...accent);
  pdf.rect(0, 0, W, 92, "F");
  // light grid, as on the site's header bands
  // grid a shade lighter than the band
  pdf.setDrawColor(...(accent.map((c) => Math.round(c + (255 - c) * 0.1)) as [number, number, number]));
  pdf.setLineWidth(0.12);
  for (let x = 0; x < W; x += 12) pdf.line(x, 0, x, 92);
  for (let y = 0; y < 92; y += 12) pdf.line(0, y, W, y);
  if (o.useBranding && b.logo) {
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(M, 18, 58, 24, 3, 3, "F");
    drawLogo(M + 4, 21, 50, 18);
  }
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text((firm || "").toUpperCase(), M, o.useBranding && b.logo ? 52 : 30, { charSpace: 0.6 });
  pdf.setFontSize(26);
  const title = b.reportTitle || t.title;
  pdf.text(pdf.splitTextToSize(title, W - 2 * M), M, o.useBranding && b.logo ? 66 : 48);

  let y = 112;
  pdf.setTextColor(15, 23, 42);
  const field = (label: string, value: string) => {
    if (!value) return;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(label.toUpperCase(), M, y, { charSpace: 0.4 });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(15, 23, 42);
    pdf.text(value, M, y + 6.5);
    y += 18;
  };
  field(t.preparedFor, b.clientName);
  field(t.preparedBy, [b.advisorName, b.advisorTitle].filter(Boolean).join(", ") + (b.companyName && b.advisorName ? ` (${b.companyName})` : b.companyName && !b.advisorName ? b.companyName : ""));
  field(t.date, today);

  if (b.intro) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(51, 65, 85);
    const lines = pdf.splitTextToSize(b.intro, W - 2 * M);
    pdf.text(lines, M, y + 2);
    y += lines.length * 5 + 6;
  }

  // Key figures of the first portfolios
  const top = items.slice(0, 3);
  if (top.length) {
    const cardW = (W - 2 * M - (top.length - 1) * 5) / top.length;
    const cy = Math.max(y + 4, 196);
    top.forEach((it, i) => {
      const x = M + i * (cardW + 5);
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(x, cy, cardW, 40, 3, 3, "FD");
      pdf.setFillColor(...hexToRgb(SERIES[i % SERIES.length]));
      pdf.rect(x, cy, 1.6, 40, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text(pdf.splitTextToSize(it.portfolio.name || it.analysis, cardW - 8)[0], x + 5, cy + 8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(it.period, x + 5, cy + 13);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);
      pdf.setTextColor(...accent);
      pdf.text(pct(it.portfolio.cagr), x + 5, cy + 25);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${t.cagr}`, x + 5, cy + 30);
      pdf.text(`${t.maxdd} ${pct(isNum(it.portfolio.maxDrawdown) ? -Math.abs(it.portfolio.maxDrawdown) : undefined)}`, x + 5, cy + 35);
    });
  }

  /* ── Helpers for inner pages ───────────────────────────── */
  const newPage = () => {
    pdf.addPage();
    pdf.setFillColor(...accent);
    pdf.rect(0, 0, W, 3, "F");
    const lw = drawLogo(M, 8, 30, 9);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(firm, lw ? M + lw + 3 : M, 14);
    pdf.setFont("helvetica", "normal");
    pdf.text(b.clientName ? `${t.preparedFor} ${b.clientName}` : title, W - M, 14, { align: "right" });
    pdf.setDrawColor(226, 232, 240);
    pdf.line(M, 19, W - M, 19);
    return 30;
  };
  const heading = (text: string, yy: number) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(15, 23, 42);
    pdf.text(text, M, yy);
    pdf.setFillColor(...accent);
    pdf.rect(M, yy + 2.5, 14, 0.9, "F");
    return yy + 10;
  };
  const ensure = (yy: number, need: number) => (yy + need > H - 22 ? newPage() : yy);

  /* ── Summary table ─────────────────────────────────────── */
  y = newPage();
  y = heading(t.summary, y);
  const cols = [
    { k: t.portfolio, w: 40, a: "left" as const },
    { k: t.period, w: 31, a: "left" as const },
    { k: t.final, w: 24, a: "right" as const },
    { k: "TCAC", w: 15, a: "right" as const },
    { k: t.vol, w: 17, a: "right" as const },
    { k: o.language === "fr" ? "Perte max." : "Max DD", w: 18, a: "right" as const },
    { k: t.sharpe, w: 14, a: "right" as const },
    { k: t.sortino, w: 14, a: "right" as const },
  ];
  if (o.language === "en") cols[3].k = "CAGR";
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  const scale = (W - 2 * M) / tableW;
  const drawRow = (vals: string[], yy: number, head = false, zebra = false, colorIdx = -1) => {
    if (head) { pdf.setFillColor(...accent); pdf.rect(M, yy - 5, W - 2 * M, 8, "F"); }
    else if (zebra) { pdf.setFillColor(248, 250, 252); pdf.rect(M, yy - 5, W - 2 * M, 8, "F"); }
    let x = M;
    vals.forEach((v, i) => {
      const w = cols[i].w * scale;
      pdf.setFont("helvetica", head || i === 0 ? "bold" : "normal");
      pdf.setFontSize(head ? 7.5 : 8.5);
      pdf.setTextColor(head ? 255 : 15, head ? 255 : 23, head ? 255 : 42);
      if (i === 0 && colorIdx >= 0) {
        pdf.setFillColor(...hexToRgb(SERIES[colorIdx % SERIES.length]));
        pdf.circle(x + 2.5, yy - 1.2, 1.2, "F");
      }
      const txt = pdf.splitTextToSize(v, w - (i === 0 ? 7 : 3))[0] || "";
      if (cols[i].a === "right") pdf.text(txt, x + w - 2, yy, { align: "right" });
      else pdf.text(txt, x + (i === 0 && colorIdx >= 0 ? 5.5 : 2), yy);
      x += w;
    });
  };
  drawRow(cols.map((c) => c.k), y, true);
  y += 8;
  items.forEach((it, i) => {
    y = ensure(y, 8);
    const p = it.portfolio;
    drawRow([p.name || it.analysis, it.period, money(p.endBalance), pct(p.cagr), pct(p.stdev), pct(isNum(p.maxDrawdown) ? -Math.abs(p.maxDrawdown) : undefined), num(p.sharpe), num(p.sortino)], y, false, i % 2 === 1, i);
    y += 8;
  });
  y += 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${t.best} / ${t.worst} : ` + items.map((it) => `${it.portfolio.name || it.analysis} ${pct(it.portfolio.bestYear)} / ${pct(it.portfolio.worstYear)}`).join("  ·  "), M, y + 3, { maxWidth: W - 2 * M });
  y += 14;

  /* ── Growth chart ──────────────────────────────────────── */
  const withCurve = items.filter((it) => it.portfolio.curve && it.portfolio.curve.length > 1);
  y = ensure(y, 95);
  y = heading(t.growth, y);
  if (withCurve.length) {
    const cx = M + 16, cw = W - 2 * M - 18, ch = 70, cy = y;
    const all = withCurve.flatMap((it) => it.portfolio.curve!);
    const min = Math.min(...all), max = Math.max(...all);
    const lo = min * 0.95, hi = max * 1.03;
    const times = withCurve.flatMap((it) => (it.portfolio.curveDates || []).map((d) => new Date(d).getTime())).filter(Number.isFinite);
    const t0 = Math.min(...times), t1 = Math.max(...times);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.15);
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    for (let k = 0; k <= 4; k++) {
      const v = lo + ((hi - lo) * k) / 4;
      const yy = cy + ch - (ch * k) / 4;
      pdf.line(cx, yy, cx + cw, yy);
      pdf.text(plain(new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(v)), cx - 2, yy + 1, { align: "right" });
    }
    const y0 = new Date(t0).getFullYear(), y1 = new Date(t1).getFullYear();
    const stepY = Math.max(1, Math.ceil((y1 - y0) / 8));
    for (let yr = y0; yr <= y1; yr += stepY) {
      const tx = cx + ((new Date(yr, 0, 1).getTime() - t0) / (t1 - t0 || 1)) * cw;
      if (tx >= cx && tx <= cx + cw) pdf.text(String(yr), tx, cy + ch + 5, { align: "center" });
    }
    withCurve.forEach((it) => {
      const idx = items.indexOf(it);
      const c = it.portfolio.curve!, d = it.portfolio.curveDates || [];
      pdf.setDrawColor(...hexToRgb(SERIES[idx % SERIES.length]));
      pdf.setLineWidth(0.55);
      for (let k = 1; k < c.length; k++) {
        const xa = cx + ((new Date(d[k - 1]).getTime() - t0) / (t1 - t0 || 1)) * cw;
        const xb = cx + ((new Date(d[k]).getTime() - t0) / (t1 - t0 || 1)) * cw;
        const ya = cy + ch - ((c[k - 1] - lo) / (hi - lo || 1)) * ch;
        const yb = cy + ch - ((c[k] - lo) / (hi - lo || 1)) * ch;
        pdf.line(xa, ya, xb, yb);
      }
    });
    y = cy + ch + 10;
    // legend
    let lx = M;
    pdf.setFontSize(8);
    withCurve.forEach((it) => {
      const idx = items.indexOf(it);
      const label = it.portfolio.name || it.analysis;
      const w = pdf.getTextWidth(label) + 9;
      if (lx + w > W - M) { lx = M; y += 5; }
      pdf.setFillColor(...hexToRgb(SERIES[idx % SERIES.length]));
      pdf.rect(lx, y - 2.2, 4, 1.4, "F");
      pdf.setTextColor(51, 65, 85);
      pdf.text(label, lx + 5.5, y);
      lx += w + 4;
    });
    y += 10;
  } else {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(t.noCurve, M, y + 2, { maxWidth: W - 2 * M });
    y += 12;
  }

  /* ── Bar charts: CAGR and max drawdown ─────────────────── */
  const bars = (label: string, vals: (number | undefined)[], yy: number, negative = false) => {
    yy = ensure(yy, 14 + items.length * 7);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(label, M, yy);
    yy += 5;
    const maxAbs = Math.max(1, ...vals.map((v) => (isNum(v) ? Math.abs(v) : 0)));
    const nameW = 52, bw = W - 2 * M - nameW - 22;
    items.forEach((it, i) => {
      const v = vals[i];
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      pdf.text(pdf.splitTextToSize(it.portfolio.name || it.analysis, nameW - 3)[0], M, yy + 3);
      pdf.setFillColor(241, 245, 249);
      pdf.rect(M + nameW, yy, bw, 4, "F");
      if (isNum(v)) {
        const col = negative ? [239, 68, 68] as [number, number, number] : hexToRgb(SERIES[i % SERIES.length]);
        pdf.setFillColor(...col);
        pdf.rect(M + nameW, yy, (Math.abs(v) / maxAbs) * bw, 4, "F");
      }
      pdf.text(pct(negative && isNum(v) ? -Math.abs(v) : v), W - M, yy + 3, { align: "right" });
      yy += 7;
    });
    return yy + 4;
  };
  y = bars(t.cagr, items.map((it) => it.portfolio.cagr), y + 2);
  y = bars(t.maxdd, items.map((it) => it.portfolio.maxDrawdown), y, true);

  /* ── Annual returns ────────────────────────────────────── */
  const withAnnual = items.filter((it) => it.portfolio.annualYears && it.portfolio.annualYears.length);
  if (withAnnual.length) {
    const years = Array.from(new Set(withAnnual.flatMap((it) => it.portfolio.annualYears!))).sort((a, b) => a - b);
    const shown = withAnnual.slice(0, 6);
    y = ensure(y, 30);
    y = heading(t.annual, y + 4);
    const colW = Math.min(30, (W - 2 * M - 18) / shown.length);
    const head = () => {
      pdf.setFillColor(...accent);
      pdf.rect(M, y - 5, 18 + colW * shown.length, 7, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text(t.year, M + 2, y - 0.5);
      shown.forEach((it, i) => pdf.text(pdf.splitTextToSize(it.portfolio.name || it.analysis, colW - 3)[0], M + 18 + colW * (i + 1) - 2, y - 0.5, { align: "right" }));
      y += 6;
    };
    head();
    years.forEach((yr, r) => {
      if (y + 6 > H - 22) { y = newPage(); head(); }
      if (r % 2) { pdf.setFillColor(248, 250, 252); pdf.rect(M, y - 4, 18 + colW * shown.length, 5.5, "F"); }
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);
      pdf.text(String(yr), M + 2, y);
      shown.forEach((it, i) => {
        const k = it.portfolio.annualYears!.indexOf(yr);
        const v = k >= 0 ? it.portfolio.annualReturns?.[k] : undefined;
        if (isNum(v)) pdf.setTextColor(v < 0 ? 220 : 4, v < 0 ? 38 : 120, v < 0 ? 38 : 87);
        else pdf.setTextColor(148, 163, 184);
        pdf.text(isNum(v) ? `${v.toFixed(1)} %` : "-", M + 18 + colW * (i + 1) - 2, y, { align: "right" });
      });
      y += 5.5;
    });
    y += 6;
  }

  /* ── Allocations ───────────────────────────────────────── */
  const withAlloc = items.filter((it) => it.portfolio.alloc && Object.keys(it.portfolio.alloc).length);
  if (withAlloc.length) {
    y = ensure(y, 40);
    y = heading(t.alloc, y + 4);
    const colW = (W - 2 * M - 6) / 2;
    let col = 0, rowTop = y, rowBottom = y;
    withAlloc.forEach((it) => {
      const entries = Object.entries(it.portfolio.alloc!).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
      const need = 10 + entries.length * 5.5;
      if (col === 0 && rowTop + need > H - 22) { rowTop = newPage(); rowBottom = rowTop; }
      const x = M + col * (colW + 6);
      let yy = rowTop;
      const idx = items.indexOf(it);
      pdf.setFillColor(...hexToRgb(SERIES[idx % SERIES.length]));
      pdf.circle(x + 1.5, yy - 1.2, 1.3, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text(pdf.splitTextToSize(it.portfolio.name || it.analysis, colW - 6)[0], x + 5, yy);
      yy += 5;
      entries.forEach(([sym, w]) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(51, 65, 85);
        pdf.text(sym, x, yy + 2.6);
        pdf.setFillColor(241, 245, 249);
        pdf.rect(x + 22, yy, colW - 42, 3.4, "F");
        pdf.setFillColor(...hexToRgb(SERIES[idx % SERIES.length]));
        pdf.rect(x + 22, yy, ((colW - 42) * Math.min(100, w)) / 100, 3.4, "F");
        pdf.text(`${w.toFixed(1)} %`, x + colW, yy + 2.6, { align: "right" });
        yy += 5.5;
      });
      rowBottom = Math.max(rowBottom, yy);
      col = 1 - col;
      if (col === 0) rowTop = rowBottom + 6;
    });
    y = rowBottom + 6;
  }

  /* ── Disclaimer ────────────────────────────────────────── */
  const disc = b.disclaimer || t.disclaimer;
  const discLines = pdf.splitTextToSize(disc, W - 2 * M);
  y = ensure(y, discLines.length * 4 + 12);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(M, y, W - M, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(discLines, M, y + 6);
  if (o.useBranding) {
    const contact = [b.companyName, b.email, b.phone, b.website].filter(Boolean).join("  ·  ");
    if (contact) pdf.text(contact, M, y + 8 + discLines.length * 3.6);
  }

  /* ── Footers ───────────────────────────────────────────── */
  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`${t.page} ${p} ${t.of} ${total}`, W - M, H - 9, { align: "right" });
    if (!o.whiteLabel) pdf.text(o.useBranding ? t.generated : `${t.generated} · quantrih.com`, M, H - 9);
    if (!o.useBranding) {
      // free plan watermark
      pdf.setTextColor(226, 232, 240);
      pdf.setFontSize(9);
      pdf.text(t.free, W / 2, H - 9, { align: "center" });
    }
  }
  return pdf;
}

export function reportFileName(b: Branding, language: "fr" | "en") {
  const base = [b.companyName, b.clientName, language === "fr" ? "rapport" : "report", new Date().toISOString().slice(0, 10)].filter(Boolean).join("_");
  return base.replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/-+/g, "-") + ".pdf";
}
