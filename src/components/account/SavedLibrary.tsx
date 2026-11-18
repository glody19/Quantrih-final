import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, ExternalLink, GitCompare, FileDown, Pencil, Check, X, Tag, Lock, FileSpreadsheet } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PlanLimits } from "../../lib/plans";
import { CARD, SERIES, toolOf, periodOf, pct, num, isNum, downloadCsv, type SavedAnalysis } from "./shared";
import { requestLoad } from "../../lib/pendingLoad";

const L = {
  fr: {
    search: "Rechercher une analyse, un portefeuille, un ticker", all: "Tous les outils", sortRecent: "Plus récentes", sortCagr: "Meilleur rendement", sortName: "Nom",
    empty: "Aucune analyse enregistrée. Lancez un backtest puis utilisez « Enregistrer cette analyse » en bas de la page.", noMatch: "Aucune analyse ne correspond à la recherche.",
    open: "Ouvrir", compare: "Comparer", pdf: "PDF", rename: "Renommer", del: "Supprimer", confirmDel: "Supprimer définitivement ?", yes: "Oui", no: "Non",
    quota: "analyses enregistrées", unlimited: "illimité", notResults: "Résultats non enregistrés : rouvrez l'analyse, relancez-la puis enregistrez-la.",
    note: "Note", notePh: "Ajouter une note pour vous ou votre client", tags: "Étiquettes", tagsPh: "client-dupont, prudent", save: "Enregistrer", premiumNotes: "Notes et étiquettes avec Premium",
    csv: "Exporter en CSV", portfolios: "portefeuilles", history: "Historique",
  },
  en: {
    search: "Search an analysis, a portfolio, a ticker", all: "All tools", sortRecent: "Most recent", sortCagr: "Best return", sortName: "Name",
    empty: "No saved analysis yet. Run a backtest, then use \"Save this analysis\" at the bottom of the page.", noMatch: "No analysis matches the search.",
    open: "Open", compare: "Compare", pdf: "PDF", rename: "Rename", del: "Delete", confirmDel: "Delete permanently?", yes: "Yes", no: "No",
    quota: "saved analyses", unlimited: "unlimited", notResults: "Results were not saved: open the analysis, run it again and save it.",
    note: "Note", notePh: "Add a note for yourself or your client", tags: "Tags", tagsPh: "client-smith, cautious", save: "Save", premiumNotes: "Notes and tags with Premium",
    csv: "Export as CSV", portfolios: "portfolios", history: "History",
  },
};

export function SavedLibrary({
  items, loading, limits, language, onRemove, onPatch, onCompare, onReport, onUpgrade,
}: {
  items: SavedAnalysis[];
  loading: boolean;
  limits: PlanLimits;
  language: "fr" | "en";
  onRemove: (id: string) => Promise<void>;
  onPatch: (id: string, data: Partial<SavedAnalysis>) => Promise<void>;
  onCompare: (analysisId: string) => void;
  onReport: (analysisId: string) => void;
  onUpgrade: () => void;
}) {
  const l = L[language];
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tool, setTool] = useState("all");
  const [sort, setSort] = useState<"recent" | "cagr" | "name">("recent");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", note: "", tags: "" });
  const [confirm, setConfirm] = useState<string | null>(null);

  const tools = useMemo(() => Array.from(new Set(items.map((i) => toolOf(i.pageId)[language]))), [items, language]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter((it) => tool === "all" || toolOf(it.pageId)[language] === tool);
    if (needle) {
      list = list.filter((it) => {
        const hay = [it.name, it.note, ...(it.tags || []), ...(it.resultsSummary || []).flatMap((p) => [p?.name, ...Object.keys(p?.alloc || {})])].join(" ").toLowerCase();
        return hay.includes(needle);
      });
    }
    const best = (it: SavedAnalysis) => Math.max(-999, ...(it.resultsSummary || []).map((p) => (isNum(p?.cagr) ? p!.cagr! : -999)));
    return [...list].sort((a, b) => (sort === "name" ? (a.name || "").localeCompare(b.name || "") : sort === "cagr" ? best(b) - best(a) : (b.updatedAt || 0) - (a.updatedAt || 0)));
  }, [items, q, tool, sort, language]);

  // History: group by month of last change
  const groups = useMemo(() => {
    const m = new Map<string, SavedAnalysis[]>();
    shown.forEach((it) => {
      const d = new Date(it.updatedAt || it.createdAt || 0);
      const k = sort === "recent" ? d.toLocaleDateString(language === "fr" ? "fr-BE" : "en-GB", { month: "long", year: "numeric" }) : "";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    });
    return Array.from(m.entries());
  }, [shown, sort, language]);

  const exportCsv = () => {
    const rows: (string | number)[][] = [["Analyse", "Outil", "Période", "Portefeuille", "TCAC %", "Volatilité %", "Perte max %", "Sharpe", "Sortino", "Valeur finale", "Allocation"]];
    items.forEach((it) => (it.resultsSummary || []).forEach((p) => p && rows.push([
      it.name, toolOf(it.pageId)[language], periodOf(it), p.name, p.cagr ?? "", p.stdev ?? "", p.maxDrawdown ?? "", p.sharpe ?? "", p.sortino ?? "", p.endBalance ?? "",
      Object.entries(p.alloc || {}).map(([k, v]) => `${k} ${v}%`).join(" | "),
    ])));
    downloadCsv(`quantrih-analyses-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const used = items.length;
  const cap = limits.maxSaved;

  return (
    <div className="space-y-6">
      {/* Quota */}
      <div className={cn(CARD, "p-5 flex flex-col md:flex-row md:items-center gap-4")}>
        <div className="flex-1">
          <p className="text-[15px] text-slate-700"><b className="text-slate-900 text-lg">{used}</b> / {Number.isFinite(cap) ? cap : l.unlimited} {l.quota}</p>
          {Number.isFinite(cap) && (
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-md">
              <div className={cn("h-full rounded-full", used >= cap ? "bg-rose-500" : "bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]")} style={{ width: `${Math.min(100, (used / cap) * 100)}%` }} />
            </div>
          )}
        </div>
        <button type="button" onClick={limits.csv ? exportCsv : onUpgrade} disabled={!items.length}
          className="h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1B3F72] hover:text-[#1B3F72] inline-flex items-center gap-2 disabled:opacity-40">
          {limits.csv ? <FileSpreadsheet className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {l.csv}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <label className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={l.search} className="w-full h-11 pl-10 pr-3 rounded-full border border-slate-200 bg-white text-[15px] outline-none focus:border-[#1B3F72] focus:ring-4 focus:ring-[#1B3F72]/10" />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["all", ...tools].map((tl) => (
            <button key={tl} type="button" onClick={() => setTool(tl)} className={cn("h-11 px-4 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors", tool === tl ? "bg-[#0A1E2D] text-white border-[#0A1E2D]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400")}>
              {tl === "all" ? l.all : tl}
            </button>
          ))}
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-11 px-3 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 outline-none">
            <option value="recent">{l.sortRecent}</option>
            <option value="cagr">{l.sortCagr}</option>
            <option value="name">{l.sortName}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><span className="w-8 h-8 rounded-full border-2 border-[#1B3F72]/20 border-t-[#1B3F72] animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className={cn(CARD, "px-6 py-12 text-center text-slate-500")}>{l.empty}</p>
      ) : shown.length === 0 ? (
        <p className="px-6 py-12 text-center text-slate-500">{l.noMatch}</p>
      ) : (
        groups.map(([month, list]) => (
          <section key={month || "all"} className="space-y-3">
            {month && <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400 pl-1">{month}</p>}
            {list.map((it) => {
              const tl = toolOf(it.pageId);
              const ps = (it.resultsSummary || []).filter(Boolean);
              const isEdit = editing === it.id;
              return (
                <article key={it.id} className={cn(CARD, "p-5 md:p-6")}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1D6FA8] bg-[#1D6FA8]/[0.08] px-2.5 py-1 rounded-full">{tl[language]}</span>
                        <span className="text-sm text-slate-500">{periodOf(it)}</span>
                        <span className="text-sm text-slate-400">· {new Date(it.updatedAt || it.createdAt || 0).toLocaleDateString(language === "fr" ? "fr-BE" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      {isEdit ? (
                        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={100} className="mt-2 w-full h-10 px-3 rounded-lg border border-slate-300 text-lg font-semibold outline-none focus:border-[#1B3F72]" />
                      ) : (
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 truncate">{it.name || "-"}</h3>
                      )}
                      {!isEdit && (it.note || (it.tags && it.tags.length > 0)) && (
                        <div className="mt-2 space-y-1.5">
                          {it.note && <p className="text-[15px] text-slate-600 leading-relaxed">{it.note}</p>}
                          {it.tags && it.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{it.tags.map((tg) => <span key={tg} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Tag className="w-3 h-3" />{tg}</span>)}</div>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:justify-end shrink-0">
                      {isEdit ? (
                        <>
                          <button type="button" onClick={async () => { await onPatch(it.id, { name: draft.name.trim() || it.name, ...(limits.notes ? { note: draft.note.trim(), tags: draft.tags.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8) } : {}) }); setEditing(null); }} className="h-9 px-3.5 rounded-full bg-[#1B3F72] text-white text-sm font-semibold inline-flex items-center gap-1.5"><Check className="w-4 h-4" />{l.save}</button>
                          <button type="button" onClick={() => setEditing(null)} className="h-9 w-9 rounded-full border border-slate-200 inline-flex items-center justify-center text-slate-500"><X className="w-4 h-4" /></button>
                        </>
                      ) : confirm === it.id ? (
                        <>
                          <span className="h-9 inline-flex items-center text-sm text-rose-700 font-medium pr-1">{l.confirmDel}</span>
                          <button type="button" onClick={async () => { await onRemove(it.id); setConfirm(null); }} className="h-9 px-3.5 rounded-full bg-rose-600 text-white text-sm font-semibold">{l.yes}</button>
                          <button type="button" onClick={() => setConfirm(null)} className="h-9 px-3.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600">{l.no}</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => { requestLoad(it.pageId || "backtest", it.id); navigate(tl.path); }} className="h-9 px-3.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1B3F72] hover:text-[#1B3F72] inline-flex items-center gap-1.5"><ExternalLink className="w-4 h-4" />{l.open}</button>
                          <button type="button" disabled={!ps.length} onClick={() => onCompare(it.id)} className="h-9 px-3.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1B3F72] hover:text-[#1B3F72] inline-flex items-center gap-1.5 disabled:opacity-40"><GitCompare className="w-4 h-4" />{l.compare}</button>
                          <button type="button" disabled={!ps.length} onClick={() => onReport(it.id)} className="h-9 px-3.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1B3F72] hover:text-[#1B3F72] inline-flex items-center gap-1.5 disabled:opacity-40"><FileDown className="w-4 h-4" />{l.pdf}</button>
                          <button type="button" title={l.rename} onClick={() => { setDraft({ name: it.name || "", note: it.note || "", tags: (it.tags || []).join(", ") }); setEditing(it.id); }} className="h-9 w-9 rounded-full border border-slate-200 inline-flex items-center justify-center text-slate-500 hover:text-[#1B3F72]"><Pencil className="w-4 h-4" /></button>
                          <button type="button" title={l.del} onClick={() => setConfirm(it.id)} className="h-9 w-9 rounded-full border border-slate-200 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-200"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEdit && (
                    limits.notes ? (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_260px] gap-3">
                        <label className="block"><span className="text-sm font-medium text-slate-600">{l.note}</span>
                          <textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} maxLength={600} rows={2} placeholder={l.notePh} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-[15px] outline-none focus:border-[#1B3F72]" />
                        </label>
                        <label className="block"><span className="text-sm font-medium text-slate-600">{l.tags}</span>
                          <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder={l.tagsPh} className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-300 text-[15px] outline-none focus:border-[#1B3F72]" />
                        </label>
                      </div>
                    ) : (
                      <button type="button" onClick={onUpgrade} className="mt-3 text-sm text-[#1D6FA8] font-medium inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{l.premiumNotes}</button>
                    )
                  )}

                  {ps.length > 0 ? (
                    <div className="mt-4 overflow-x-auto -mx-1">
                      <table className="w-full min-w-[560px] text-[14px]">
                        <thead>
                          <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-slate-400">
                            <th className="px-1 py-1.5 font-semibold">{language === "fr" ? "Portefeuille" : "Portfolio"}</th>
                            <th className="px-1 py-1.5 font-semibold text-right">{language === "fr" ? "TCAC" : "CAGR"}</th>
                            <th className="px-1 py-1.5 font-semibold text-right">{language === "fr" ? "Volatilité" : "Volatility"}</th>
                            <th className="px-1 py-1.5 font-semibold text-right">{language === "fr" ? "Perte max." : "Max DD"}</th>
                            <th className="px-1 py-1.5 font-semibold text-right">Sharpe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ps.map((p, i) => (
                            <tr key={i}>
                              <td className="px-1 py-2 font-medium text-slate-800"><span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: SERIES[i % SERIES.length] }} />{p!.name || `#${i + 1}`}</td>
                              <td className={cn("px-1 py-2 text-right font-mono", isNum(p!.cagr) && p!.cagr! < 0 ? "text-rose-600" : "text-emerald-700")}>{pct(p!.cagr)}</td>
                              <td className="px-1 py-2 text-right font-mono text-slate-600">{pct(p!.stdev)}</td>
                              <td className="px-1 py-2 text-right font-mono text-rose-600">{pct(isNum(p!.maxDrawdown) ? -Math.abs(p!.maxDrawdown!) : undefined)}</td>
                              <td className="px-1 py-2 text-right font-mono text-slate-600">{num(p!.sharpe)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">{l.notResults}</p>
                  )}
                </article>
              );
            })}
          </section>
        ))
      )}
    </div>
  );
}
