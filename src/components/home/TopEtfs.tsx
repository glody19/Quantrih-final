import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { cn } from "../../lib/utils";

// About 90 liquid US-listed ETFs: world, countries, sectors, themes, commodities and bonds. The table keeps the 10 best.
const TOP_N = 10;
const UNIVERSE: { s: string; n: string; tag: { en: string; fr: string } }[] = [
  { s: "SPY", n: "SPDR S&P 500", tag: { en: "US large caps", fr: "Grandes caps US" } },
  { s: "QQQ", n: "Invesco QQQ (Nasdaq 100)", tag: { en: "US tech", fr: "Tech US" } },
  { s: "IWM", n: "iShares Russell 2000", tag: { en: "US small caps", fr: "Petites caps US" } },
  { s: "DIA", n: "SPDR Dow Jones", tag: { en: "US blue chips", fr: "Valeurs US" } },
  { s: "ACWI", n: "iShares MSCI ACWI", tag: { en: "World", fr: "Monde" } },
  { s: "VEA", n: "Vanguard FTSE Developed", tag: { en: "Developed ex-US", fr: "Développés hors US" } },
  { s: "VWO", n: "Vanguard FTSE Emerging", tag: { en: "Emerging", fr: "Émergents" } },
  { s: "VGK", n: "Vanguard FTSE Europe", tag: { en: "Europe", fr: "Europe" } },
  { s: "EWJ", n: "iShares MSCI Japan", tag: { en: "Japan", fr: "Japon" } },
  { s: "EWZ", n: "iShares MSCI Brazil", tag: { en: "Brazil", fr: "Brésil" } },
  { s: "INDA", n: "iShares MSCI India", tag: { en: "India", fr: "Inde" } },
  { s: "MCHI", n: "iShares MSCI China", tag: { en: "China", fr: "Chine" } },
  { s: "FXI", n: "iShares China Large-Cap", tag: { en: "China", fr: "Chine" } },
  { s: "EWG", n: "iShares MSCI Germany", tag: { en: "Germany", fr: "Allemagne" } },
  { s: "EWU", n: "iShares MSCI United Kingdom", tag: { en: "United Kingdom", fr: "Royaume-Uni" } },
  { s: "EWQ", n: "iShares MSCI France", tag: { en: "France", fr: "France" } },
  { s: "EWI", n: "iShares MSCI Italy", tag: { en: "Italy", fr: "Italie" } },
  { s: "EWP", n: "iShares MSCI Spain", tag: { en: "Spain", fr: "Espagne" } },
  { s: "EWL", n: "iShares MSCI Switzerland", tag: { en: "Switzerland", fr: "Suisse" } },
  { s: "EWN", n: "iShares MSCI Netherlands", tag: { en: "Netherlands", fr: "Pays-Bas" } },
  { s: "EWD", n: "iShares MSCI Sweden", tag: { en: "Sweden", fr: "Suède" } },
  { s: "EWY", n: "iShares MSCI South Korea", tag: { en: "South Korea", fr: "Corée du Sud" } },
  { s: "EWT", n: "iShares MSCI Taiwan", tag: { en: "Taiwan", fr: "Taïwan" } },
  { s: "EWA", n: "iShares MSCI Australia", tag: { en: "Australia", fr: "Australie" } },
  { s: "EWC", n: "iShares MSCI Canada", tag: { en: "Canada", fr: "Canada" } },
  { s: "EWW", n: "iShares MSCI Mexico", tag: { en: "Mexico", fr: "Mexique" } },
  { s: "EZA", n: "iShares MSCI South Africa", tag: { en: "South Africa", fr: "Afrique du Sud" } },
  { s: "TUR", n: "iShares MSCI Turkey", tag: { en: "Turkey", fr: "Turquie" } },
  { s: "ARGT", n: "Global X MSCI Argentina", tag: { en: "Argentina", fr: "Argentine" } },
  { s: "VNM", n: "VanEck Vietnam", tag: { en: "Vietnam", fr: "Vietnam" } },
  { s: "EPOL", n: "iShares MSCI Poland", tag: { en: "Poland", fr: "Pologne" } },
  { s: "GREK", n: "Global X MSCI Greece", tag: { en: "Greece", fr: "Grèce" } },
  { s: "KSA", n: "iShares MSCI Saudi Arabia", tag: { en: "Saudi Arabia", fr: "Arabie saoudite" } },
  { s: "XLK", n: "Technology Select SPDR", tag: { en: "Technology", fr: "Technologie" } },
  { s: "XLF", n: "Financial Select SPDR", tag: { en: "Financials", fr: "Finance" } },
  { s: "XLE", n: "Energy Select SPDR", tag: { en: "Energy", fr: "Énergie" } },
  { s: "XLV", n: "Health Care Select SPDR", tag: { en: "Health care", fr: "Santé" } },
  { s: "XLI", n: "Industrial Select SPDR", tag: { en: "Industrials", fr: "Industrie" } },
  { s: "XLU", n: "Utilities Select SPDR", tag: { en: "Utilities", fr: "Services publics" } },
  { s: "XLY", n: "Consumer Discretionary SPDR", tag: { en: "Consumer discretionary", fr: "Consommation discrétionnaire" } },
  { s: "XLP", n: "Consumer Staples SPDR", tag: { en: "Consumer staples", fr: "Consommation de base" } },
  { s: "XLB", n: "Materials Select SPDR", tag: { en: "Materials", fr: "Matériaux" } },
  { s: "XLRE", n: "Real Estate Select SPDR", tag: { en: "Real estate", fr: "Immobilier" } },
  { s: "XLC", n: "Communication Services SPDR", tag: { en: "Communication", fr: "Communication" } },
  { s: "SMH", n: "VanEck Semiconductor", tag: { en: "Semiconductors", fr: "Semi-conducteurs" } },
  { s: "SOXX", n: "iShares Semiconductor", tag: { en: "Semiconductors", fr: "Semi-conducteurs" } },
  { s: "IGV", n: "iShares Expanded Tech-Software", tag: { en: "Software", fr: "Logiciels" } },
  { s: "ARKK", n: "ARK Innovation", tag: { en: "Innovation", fr: "Innovation" } },
  { s: "ARKG", n: "ARK Genomic Revolution", tag: { en: "Genomics", fr: "Génomique" } },
  { s: "ICLN", n: "iShares Global Clean Energy", tag: { en: "Clean energy", fr: "Énergie propre" } },
  { s: "TAN", n: "Invesco Solar", tag: { en: "Solar", fr: "Solaire" } },
  { s: "LIT", n: "Global X Lithium & Battery Tech", tag: { en: "Lithium and batteries", fr: "Lithium et batteries" } },
  { s: "URA", n: "Global X Uranium", tag: { en: "Uranium", fr: "Uranium" } },
  { s: "URNM", n: "Sprott Uranium Miners", tag: { en: "Uranium miners", fr: "Mines d'uranium" } },
  { s: "NLR", n: "VanEck Uranium & Nuclear", tag: { en: "Nuclear", fr: "Nucléaire" } },
  { s: "COPX", n: "Global X Copper Miners", tag: { en: "Copper miners", fr: "Mines de cuivre" } },
  { s: "GDX", n: "VanEck Gold Miners", tag: { en: "Gold miners", fr: "Mines d'or" } },
  { s: "GDXJ", n: "VanEck Junior Gold Miners", tag: { en: "Junior gold miners", fr: "Petites mines d'or" } },
  { s: "SIL", n: "Global X Silver Miners", tag: { en: "Silver miners", fr: "Mines d'argent" } },
  { s: "XME", n: "SPDR S&P Metals & Mining", tag: { en: "Metals and mining", fr: "Métaux et mines" } },
  { s: "ITA", n: "iShares US Aerospace & Defense", tag: { en: "Defence", fr: "Défense" } },
  { s: "PPA", n: "Invesco Aerospace & Defense", tag: { en: "Defence", fr: "Défense" } },
  { s: "CIBR", n: "First Trust Cybersecurity", tag: { en: "Cybersecurity", fr: "Cybersécurité" } },
  { s: "HACK", n: "Amplify Cybersecurity", tag: { en: "Cybersecurity", fr: "Cybersécurité" } },
  { s: "SKYY", n: "First Trust Cloud Computing", tag: { en: "Cloud", fr: "Cloud" } },
  { s: "BOTZ", n: "Global X Robotics & AI", tag: { en: "Robotics and AI", fr: "Robotique et IA" } },
  { s: "ROBO", n: "ROBO Global Robotics", tag: { en: "Robotics", fr: "Robotique" } },
  { s: "AIQ", n: "Global X AI & Technology", tag: { en: "Artificial intelligence", fr: "Intelligence artificielle" } },
  { s: "KWEB", n: "KraneShares China Internet", tag: { en: "China internet", fr: "Internet chinois" } },
  { s: "BLOK", n: "Amplify Transformational Data Sharing", tag: { en: "Blockchain", fr: "Blockchain" } },
  { s: "IBIT", n: "iShares Bitcoin Trust", tag: { en: "Bitcoin", fr: "Bitcoin" } },
  { s: "FINX", n: "Global X FinTech", tag: { en: "Fintech", fr: "Fintech" } },
  { s: "XBI", n: "SPDR S&P Biotech", tag: { en: "Biotech", fr: "Biotechnologies" } },
  { s: "IBB", n: "iShares Biotechnology", tag: { en: "Biotech", fr: "Biotechnologies" } },
  { s: "PAVE", n: "Global X US Infrastructure", tag: { en: "Infrastructure", fr: "Infrastructures" } },
  { s: "JETS", n: "US Global Jets", tag: { en: "Airlines", fr: "Compagnies aériennes" } },
  { s: "ITB", n: "iShares US Home Construction", tag: { en: "Home builders", fr: "Construction résidentielle" } },
  { s: "KRE", n: "SPDR S&P Regional Banking", tag: { en: "Regional banks", fr: "Banques régionales" } },
  { s: "KBE", n: "SPDR S&P Bank", tag: { en: "Banks", fr: "Banques" } },
  { s: "MOO", n: "VanEck Agribusiness", tag: { en: "Agribusiness", fr: "Agro-industrie" } },
  { s: "PHO", n: "Invesco Water Resources", tag: { en: "Water", fr: "Eau" } },
  { s: "VNQ", n: "Vanguard Real Estate", tag: { en: "Real estate", fr: "Immobilier" } },
  { s: "GLD", n: "SPDR Gold Shares", tag: { en: "Gold", fr: "Or" } },
  { s: "SLV", n: "iShares Silver Trust", tag: { en: "Silver", fr: "Argent" } },
  { s: "PPLT", n: "abrdn Platinum", tag: { en: "Platinum", fr: "Platine" } },
  { s: "CPER", n: "US Copper Index", tag: { en: "Copper", fr: "Cuivre" } },
  { s: "USO", n: "US Oil Fund", tag: { en: "Oil", fr: "Pétrole" } },
  { s: "UNG", n: "US Natural Gas Fund", tag: { en: "Natural gas", fr: "Gaz naturel" } },
  { s: "DBA", n: "Invesco DB Agriculture", tag: { en: "Agriculture", fr: "Agriculture" } },
  { s: "DBC", n: "Invesco DB Commodity Index", tag: { en: "Commodities", fr: "Matières premières" } },
  { s: "TLT", n: "iShares 20+ Year Treasury", tag: { en: "Long bonds", fr: "Obligations longues" } },
  { s: "HYG", n: "iShares High Yield Corporate", tag: { en: "High yield bonds", fr: "Obligations haut rendement" } },
];

const COLS = [["m6", "6M", "6 mois"], ["y1", "1Y", "1 an"], ["y3", "3Y", "3 ans"], ["y5", "5Y", "5 ans"]] as const;
type Key = (typeof COLS)[number][0];
type Perf = Partial<Record<Key, number | null>> & { asOf?: string };
const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const FROM = [{ x: -40, y: 0 }, { x: 0, y: -26 }, { x: 40, y: 0 }, { x: 0, y: 26 }];

function Count({ value, start, delay }: { value: number; start: boolean; delay: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const c = animate(0, value, { duration: 2.4, delay, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [value, start, delay]);
  return <>{v > 0 ? "+" : ""}{v.toFixed(1)}%</>;
}

/**
 * The seven best performing ETFs among ~30 liquid US-listed funds, ranked on the chosen period.
 * Total return (dividends reinvested), 3Y and 5Y annualised. Real data from /api/stock/performance.
 */
export function TopEtfs({ fr }: { fr: boolean }) {
  const [perf, setPerf] = useState<Record<string, Perf | null>>({});
  const [sort, setSort] = useState<Key>("y1");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    let alive = true;
    const chunks = [UNIVERSE.slice(0, 50), UNIVERSE.slice(50)];
    Promise.all(chunks.map((c) => fetch(`/api/stock/performance?symbols=${c.map((x) => x.s).join(",")}`).then((r) => (r.ok ? r.json() : {})).catch(() => ({}))))
      .then((parts: any[]) => { if (alive) setPerf(Object.assign({}, ...parts)); });
    return () => { alive = false; };
  }, []);

  const rows = useMemo(
    () => UNIVERSE.filter((x) => isNum(perf[x.s]?.[sort])).sort((a, b) => (perf[b.s]![sort] as number) - (perf[a.s]![sort] as number)).slice(0, TOP_N),
    [perf, sort]
  );
  const maxAbs = useMemo(() => {
    const m: Record<string, number> = {};
    COLS.forEach(([k]) => { m[k] = Math.max(1, ...rows.map((r) => Math.abs((perf[r.s]?.[k] as number) ?? 0))); });
    return m;
  }, [rows, perf]);
  const loading = Object.keys(perf).length === 0;

  return (
    <div ref={ref} className="h-full rounded-[1.5rem] bg-white shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)] p-3 sm:p-5">
      <div className="sm:overflow-x-auto">
        <table className="w-full w-full sm:min-w-[640px] text-[13px] sm:text-[15px] border-separate border-spacing-y-[3px]">
          <thead>
            <tr className="text-[13px] text-slate-500">
              <th className="hidden sm:table-cell text-left font-medium pl-2 pb-2 w-10">#</th>
              <th className="text-left font-medium pb-2">ETF</th>
              {COLS.map(([k, en, frl]) => (
                <th key={k} className="pb-2 w-[14%] text-center">
                  <button onClick={() => setSort(k)} className={cn("px-1.5 sm:px-2 py-0.5 rounded-full font-semibold transition-colors text-[11px] sm:text-[13px]", sort === k ? "bg-[#0C2233] text-white" : "hover:text-slate-800")}>{fr ? frl : en}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="h-[44px] rounded-lg bg-slate-50 animate-pulse" /></td></tr>)
              : rows.map((r, i) => (
                  <motion.tr key={r.s + sort} className="h-[50px]" layout initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: Math.min(i, 12) * 0.05 }}>
                    <td className="hidden sm:table-cell pl-2"><span className={cn("inline-flex w-7 h-7 rounded-full items-center justify-center text-[13px] font-bold", i === 0 ? "bg-[#E0B341] text-white" : i < 3 ? "bg-[#1B3F72]/10 text-[#1B3F72]" : "bg-slate-100 text-slate-500")}>{i + 1}</span></td>
                    <td className="py-1.5 pr-1 sm:pr-3 leading-tight">
                      <b className="font-mono sm:font-sans font-semibold text-slate-900"><span className="sm:hidden">{i + 1}. </span><span className="hidden sm:inline">{r.n}</span><span className="sm:hidden">{r.s}</span></b>
                      <span className="hidden sm:inline ml-2 font-mono text-xs text-slate-500">{r.s}</span>
                      <span className="block text-[11px] sm:text-xs text-[#1B3F72]">{fr ? r.tag.fr : r.tag.en}</span>
                    </td>
                    {COLS.map(([k], col) => {
                      const v = perf[r.s]?.[k];
                      const delay = col * 0.6 + Math.min(i, 12) * 0.05;
                      return (
                        <td key={k} className="px-0.5 sm:px-1.5">
                          <div className={cn("relative mx-auto max-w-[118px] h-7 sm:h-8 rounded-md overflow-hidden", sort === k ? "bg-[#1B3F72]/[0.06]" : "bg-slate-50")}>
                            {isNum(v) && (
                              <motion.span
                                className="absolute inset-y-0 rounded-md"
                                style={{ [v >= 0 ? "left" : "right"]: 0, background: v >= 0 ? "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(16,185,129,0.32))" : "linear-gradient(270deg, rgba(159,18,57,0.08), rgba(159,18,57,0.26))" } as React.CSSProperties}
                                initial={{ width: 0 }} animate={inView ? { width: `${Math.max(6, Math.min(1, Math.abs(v) / maxAbs[k]) * 100)}%` } : {}}
                                transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
                              />
                            )}
                            <motion.span
                              className={cn("relative z-10 flex h-full items-center justify-center tabular-nums text-[12px] sm:text-[13px] font-semibold", !isNum(v) ? "text-slate-300" : v >= 0 ? "text-emerald-700" : "text-[#9F1239]")}
                              initial={{ opacity: 0, scale: 0.3, ...FROM[(i + col) % 4] }}
                              animate={inView ? { opacity: [0, 1, 1, 0.35, 1], scale: [0.3, 1.25, 1, 1, 1], x: 0, y: 0 } : {}}
                              transition={{ duration: 2.6, delay, times: [0, 0.3, 0.45, 0.8, 1], ease: "easeOut" }}
                            >
                              {isNum(v) ? <Count value={v} start={inView} delay={delay} /> : "-"}
                            </motion.span>
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-slate-500">
        {fr
          ? `Classement parmi ${UNIVERSE.length} ETF cotés aux États-Unis. Rendement total en USD, dividendes réinvestis ; 3 et 5 ans annualisés. Les performances passées ne préjugent pas des performances futures.`
          : `Ranked among ${UNIVERSE.length} US-listed ETFs. Total return in USD, dividends reinvested; 3Y and 5Y annualised. Past performance does not predict future returns.`}
      </p>
    </div>
  );
}
