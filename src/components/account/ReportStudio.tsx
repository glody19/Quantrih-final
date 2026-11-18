import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, FileDown, ImagePlus, Lock, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { addPdfUsage, readPdfUsage, type PlanId, type PlanLimits } from "../../lib/plans";
import { buildReportPdf, reportFileName, type Branding } from "../../lib/reportPdf";
import { CARD, SERIES, pct, resizeImage, type PortfolioRow } from "./shared";

const L = {
  fr: {
    firm: "Votre cabinet", firmLead: "Ces informations apparaissent sur la couverture et en tête de chaque page.", client: "Ce rapport", clientLead: "À adapter pour chaque client.",
    logo: "Logo", logoHint: "PNG ou JPEG, fond transparent conseillé.", upload: "Importer un logo", removeLogo: "Retirer",
    company: "Nom de l'entreprise", advisor: "Nom du conseiller", advisorTitle: "Fonction", email: "E-mail", phone: "Téléphone", website: "Site web", accent: "Couleur du rapport",
    clientName: "Nom du client", reportTitle: "Titre du rapport", reportTitlePh: "Rapport d'analyse de portefeuille", intro: "Introduction", introPh: "Quelques lignes pour présenter l'objectif de l'analyse à votre client.",
    disclaimer: "Mentions légales", disclaimerPh: "Laissez vide pour utiliser l'avertissement standard.",
    saveBrand: "Enregistrer mes informations", saved: "Enregistré",
    content: "Contenu du rapport", contentLead: "Portefeuilles inclus, dans l'ordre de sélection.", none: "Aucun portefeuille sélectionné.",
    preview: "Aperçu", refresh: "Actualiser l'aperçu", download: "Télécharger le PDF",
    quota: "rapports PDF ce mois-ci", unlimited: "illimités", quotaReached: "Vous avez atteint la limite de rapports PDF de ce mois.",
    lockedBrand: "Logo, nom d'entreprise et conseiller avec Premium", lockedWhite: "Couleur personnalisée et rapport sans mention Quantrih avec Pro", see: "Voir les formules",
    empty: "Enregistrez une analyse avec ses résultats pour créer un rapport.",
  },
  en: {
    firm: "Your firm", firmLead: "Shown on the cover and at the top of every page.", client: "This report", clientLead: "Adjust for each client.",
    logo: "Logo", logoHint: "PNG or JPEG, transparent background recommended.", upload: "Upload a logo", removeLogo: "Remove",
    company: "Company name", advisor: "Advisor name", advisorTitle: "Job title", email: "Email", phone: "Phone", website: "Website", accent: "Report colour",
    clientName: "Client name", reportTitle: "Report title", reportTitlePh: "Portfolio analysis report", intro: "Introduction", introPh: "A few lines presenting the purpose of the analysis to your client.",
    disclaimer: "Disclaimer", disclaimerPh: "Leave empty to use the standard disclaimer.",
    saveBrand: "Save my details", saved: "Saved",
    content: "Report content", contentLead: "Portfolios included, in selection order.", none: "No portfolio selected.",
    preview: "Preview", refresh: "Refresh preview", download: "Download PDF",
    quota: "PDF reports this month", unlimited: "unlimited", quotaReached: "You have reached this month's PDF report limit.",
    lockedBrand: "Logo, company and advisor name with Premium", lockedWhite: "Custom colour and report without Quantrih mention with Pro", see: "See plans",
    empty: "Save an analysis with its results to create a report.",
  },
};

const field = "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-[15px] text-slate-900 outline-none focus:border-[#1B3F72] focus:ring-4 focus:ring-[#1B3F72]/10 disabled:bg-slate-50 disabled:text-slate-400";
const lab = "block text-sm font-medium text-slate-600 mb-1.5";

export function ReportStudio({
  rows, preselect, limits, plan, language, currency, uid, branding, onSaveBranding, onUpgrade,
}: {
  rows: PortfolioRow[];
  preselect: string[];
  limits: PlanLimits;
  plan: PlanId;
  language: "fr" | "en";
  currency: string;
  uid?: string;
  branding: Branding;
  onSaveBranding: (b: Branding) => Promise<void>;
  onUpgrade: () => void;
}) {
  const l = L[language];
  const [b, setB] = useState<Branding>(branding);
  useEffect(() => setB(branding), [branding]);
  const [sel, setSel] = useState<string[]>([]);
  useEffect(() => { setSel(preselect.length ? preselect : rows.slice(0, 3).map((r) => r.key)); }, [preselect.join("|"), rows.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const [used, setUsed] = useState(0);
  useEffect(() => { readPdfUsage(uid).then(setUsed); }, [uid]);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => sel.map((k) => rows.find((r) => r.key === k)).filter(Boolean).map((r) => ({ analysis: r!.analysis, period: r!.period, portfolio: r!.portfolio })), [sel, rows]);
  const opts = () => ({ items, branding: b, useBranding: limits.branding, whiteLabel: limits.whiteLabel, currency, language });

  const makePreview = () => {
    if (!items.length) { setPreview(null); return; }
    try {
      const pdf = buildReportPdf(opts());
      const url = URL.createObjectURL(pdf.output("blob"));
      setPreview((old) => { if (old) URL.revokeObjectURL(old); return url; });
    } catch (e) {
      console.error(e);
    }
  };
  // Refresh the preview shortly after each change
  useEffect(() => { const t = setTimeout(makePreview, 450); return () => clearTimeout(t); }, [items, b, limits.branding, limits.whiteLabel, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const cap = limits.pdfPerMonth;
  const left = Number.isFinite(cap) ? Math.max(0, cap - used) : Infinity;

  const download = async () => {
    setErr(null);
    if (!items.length) return;
    const n = await readPdfUsage(uid);
    if (Number.isFinite(cap) && n >= cap) { setUsed(n); setErr(l.quotaReached); return; }
    const pdf = buildReportPdf(opts());
    pdf.save(reportFileName(b, language));
    setUsed(await addPdfUsage(uid));
  };

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try { setB({ ...b, logo: await resizeImage(f, 480, "image/png") }); } catch { setErr("Image"); }
  };

  const toggle = (k: string) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k].slice(0, 10)));
  const set = (k: keyof Branding) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setB({ ...b, [k]: e.target.value });

  if (!rows.length) return <p className={cn(CARD, "px-6 py-12 text-center text-slate-500")}>{l.empty}</p>;

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      <div className="space-y-6 min-w-0">
        {/* Quota */}
        <div className={cn(CARD, "p-5 flex items-center gap-4")}>
          <div className="flex-1">
            <p className="text-[15px] text-slate-700"><b className="text-lg text-slate-900">{used}</b> / {Number.isFinite(cap) ? cap : l.unlimited} {l.quota}</p>
            {Number.isFinite(cap) && <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-sm"><div className={cn("h-full rounded-full", left === 0 ? "bg-rose-500" : "bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]")} style={{ width: `${Math.min(100, (used / cap) * 100)}%` }} /></div>}
          </div>
          <button type="button" onClick={download} disabled={!items.length || left === 0} className="h-11 px-5 rounded-full bg-[#0A1E2D] text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#14466B] disabled:opacity-40"><FileDown className="w-4 h-4" />{l.download}</button>
        </div>
        {err && <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">{err} {left === 0 && <button type="button" onClick={onUpgrade} className="underline font-semibold ml-1">{l.see}</button>}</p>}

        {/* Content */}
        <section className={cn(CARD, "p-5 md:p-6")}>
          <h3 className="text-lg font-semibold text-slate-900">{l.content}</h3>
          <p className="text-sm text-slate-500 mt-1">{l.contentLead}</p>
          <div className="mt-4 max-h-[240px] overflow-y-auto space-y-1.5 pr-1">
            {rows.map((r) => {
              const on = sel.includes(r.key);
              const i = sel.indexOf(r.key);
              return (
                <button key={r.key} type="button" onClick={() => toggle(r.key)} className={cn("w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border", on ? "border-[#1B3F72] bg-[#1B3F72]/[0.05]" : "border-slate-200 hover:border-slate-400")}>
                  <span className={cn("w-5 h-5 rounded-md border flex items-center justify-center shrink-0 text-white text-[11px] font-bold", !on && "border-slate-300")} style={on ? { background: SERIES[i % SERIES.length], borderColor: "transparent" } : undefined}>{on ? i + 1 : ""}</span>
                  <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-slate-800 truncate">{r.portfolio.name || r.analysis}</span><span className="block text-xs text-slate-500 truncate">{r.analysis} · {r.period}</span></span>
                  <span className="text-sm font-mono text-slate-600">{pct(r.portfolio.cagr)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Client */}
        <section className={cn(CARD, "p-5 md:p-6")}>
          <h3 className="text-lg font-semibold text-slate-900">{l.client}</h3>
          <p className="text-sm text-slate-500 mt-1">{l.clientLead}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label><span className={lab}>{l.clientName}</span><input value={b.clientName} onChange={set("clientName")} maxLength={80} className={field} /></label>
            <label><span className={lab}>{l.reportTitle}</span><input value={b.reportTitle} onChange={set("reportTitle")} maxLength={90} placeholder={l.reportTitlePh} className={field} /></label>
            <label className="md:col-span-2"><span className={lab}>{l.intro}</span><textarea value={b.intro} onChange={set("intro")} maxLength={900} rows={3} placeholder={l.introPh} className={cn(field, "h-auto py-2.5")} /></label>
          </div>
        </section>

        {/* Firm */}
        <section className={cn(CARD, "p-5 md:p-6 relative")}>
          <h3 className="text-lg font-semibold text-slate-900">{l.firm}</h3>
          <p className="text-sm text-slate-500 mt-1">{l.firmLead}</p>
          {!limits.branding && (
            <button type="button" onClick={onUpgrade} className="mt-4 w-full text-left rounded-xl border border-[#1B3F72]/20 bg-[#1B3F72]/[0.04] px-4 py-3 text-sm text-[#1B3F72] font-semibold inline-flex items-center gap-2"><Lock className="w-4 h-4" />{l.lockedBrand}</button>
          )}
          <fieldset disabled={!limits.branding} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-4">
              <div className="w-40 h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                {b.logo ? <img src={b.logo} alt="" className="max-w-[90%] max-h-[80%] object-contain" /> : <ImagePlus className="w-6 h-6 text-slate-300" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{l.logo}</p>
                <p className="text-xs text-slate-500">{l.logoHint}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="h-9 px-3.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1B3F72] disabled:opacity-40">{l.upload}</button>
                  {b.logo && <button type="button" onClick={() => setB({ ...b, logo: "" })} className="h-9 px-3 rounded-full text-sm text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />{l.removeLogo}</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={onLogo} />
              </div>
            </div>
            <label><span className={lab}>{l.company}</span><input value={b.companyName} onChange={set("companyName")} maxLength={80} className={field} /></label>
            <label><span className={lab}>{l.advisor}</span><input value={b.advisorName} onChange={set("advisorName")} maxLength={80} className={field} /></label>
            <label><span className={lab}>{l.advisorTitle}</span><input value={b.advisorTitle} onChange={set("advisorTitle")} maxLength={80} className={field} /></label>
            <label><span className={lab}>{l.email}</span><input value={b.email} onChange={set("email")} maxLength={120} className={field} /></label>
            <label><span className={lab}>{l.phone}</span><input value={b.phone} onChange={set("phone")} maxLength={40} className={field} /></label>
            <label><span className={lab}>{l.website}</span><input value={b.website} onChange={set("website")} maxLength={120} className={field} /></label>
            <label className="md:col-span-2"><span className={lab}>{l.disclaimer}</span><textarea value={b.disclaimer} onChange={set("disclaimer")} maxLength={1500} rows={3} placeholder={l.disclaimerPh} className={cn(field, "h-auto py-2.5")} /></label>
          </fieldset>
          <div className="mt-4">
            <span className={lab}>{l.accent}</span>
            {limits.whiteLabel ? (
              <div className="flex items-center gap-2 flex-wrap">
                {["#1B3F72", "#0A1E2D", "#0F766E", "#7C2D12", "#6D28D9", "#B45309", "#BE123C"].map((c) => (
                  <button key={c} type="button" onClick={() => setB({ ...b, accent: c })} className={cn("w-9 h-9 rounded-full border-2", b.accent === c ? "border-slate-900" : "border-white shadow")} style={{ background: c }} aria-label={c} />
                ))}
                <input type="color" value={b.accent || "#1B3F72"} onChange={set("accent")} className="w-9 h-9 rounded-full border border-slate-200 cursor-pointer" />
              </div>
            ) : (
              <button type="button" onClick={onUpgrade} className="text-sm text-[#1D6FA8] font-medium inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{l.lockedWhite}</button>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={async () => { await onSaveBranding(b); setSaved(true); setTimeout(() => setSaved(false), 2200); }} className="h-10 px-5 rounded-full bg-[#1B3F72] text-white text-sm font-semibold inline-flex items-center gap-2">
              {saved && <Check className="w-4 h-4" />}{saved ? l.saved : l.saveBrand}
            </button>
          </div>
        </section>
      </div>

      {/* Preview */}
      <div className="min-w-0 2xl:sticky 2xl:top-24 2xl:self-start">
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">{l.preview} {plan === "free" && <span className="ml-2 text-xs font-normal text-slate-400">Freemium</span>}</p>
            <button type="button" onClick={makePreview} className="text-sm text-slate-500 hover:text-[#1B3F72] inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />{l.refresh}</button>
          </div>
          {preview ? (
            <iframe title={l.preview} src={`${preview}#toolbar=0&view=FitH`} className="w-full h-[78vh] bg-slate-100" />
          ) : (
            <p className="px-6 py-16 text-center text-slate-500">{l.none}</p>
          )}
        </div>
      </div>
    </div>
  );
}
