import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, X, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { ETF_UNIVERSE, type Etf, type EtfClass, type EtfStrategy } from "../../data/etfUniverse";

const COLS = [["m6", "6M", "6 mois"], ["y1", "1Y", "1 an"], ["y3", "3Y", "3 ans"], ["y5", "5Y", "5 ans"]] as const;
type Key = (typeof COLS)[number][0];
type Perf = Partial<Record<Key, number | null>> & { asOf?: string };
type SortKey = Key | "ter" | "n";
const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const CARD = "rounded-[1.5rem] bg-white shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)]";
const PAGE = 25;

const T = {
  en: {
    title: "ETF overview",
    sub: "Structure, costs and performance of exchange-traded funds across asset classes, in the UCITS and US ranges.",
    funds: "funds", issuers: "issuers", classes: "asset classes",
    primerTitle: "What an ETF is, and what decides its result",
    primer: [
      "An ETF is an open-ended fund whose shares trade on an exchange. Authorised participants create and redeem shares against the underlying basket, and that arbitrage keeps the market price close to net asset value.",
      "For the same index, results differ through four things: the total cost of holding (charges, tracking difference, spread), the replication method, the treatment of income, and the tax position of the fund's domicile.",
    ],
    faqTitle: "Points a selection should settle",
    faq: [
      ["Physical or synthetic replication?", "Physical funds hold the index securities, in full or by sampling. Synthetic funds hold a collateral basket and receive the index return through a swap. On US equities a swap can track better, because the index return is received without the dividend withholding a physical Irish fund bears (15%). The price is counterparty exposure, limited to 10% of assets under UCITS rules and usually collateralised."],
      ["TER or tracking difference?", "The TER is the announced cost. Tracking difference is the realised gap between fund and index over a period, after charges, securities lending income, withholding tax and sampling effects. It is the number to compare between two funds on the same index. Tracking error is the volatility of that gap, not its level."],
      ["Accumulating or distributing?", "Accumulating share classes reinvest income inside the fund; distributing ones pay it out. The pre-tax return is the same. The choice is a tax and cash flow question that depends on how the investor's country taxes dividends, capital gains and fund income."],
      ["UCITS or US-domiciled?", "US-domiciled ETFs do not publish the PRIIPs key information document, so retail investors in the EU generally cannot buy them; professional clients can. UCITS funds domiciled in Ireland benefit from the US treaty rate of 15% on US dividends, against 30% for Luxembourg funds holding the shares physically. US situs assets can also raise estate tax questions for non-residents."],
      ["How much does liquidity matter?", "The cost of trading is the bid-ask spread plus any premium or discount to net asset value. It follows the liquidity of the underlying market more than the fund's own volume. Spreads widen outside the trading hours of the underlying and in stressed markets, so limit orders are the norm."],
      ["Fund size and closure risk", "Small funds get merged or closed, which forces a taxable event and a reinvestment at a date you did not choose. Assets above roughly 100 million and a track record of several years reduce that risk."],
      ["Securities lending", "Many physical funds lend securities against collateral. The income offsets part of the costs; the share returned to the fund varies by issuer. It adds counterparty exposure, covered by collateral and often by an indemnity from the lending agent."],
      ["Currency hedged share classes", "Hedging removes most of the currency effect at the cost of the interest rate differential and of roll costs. It is common practice on bonds, where currency moves would dominate the return, and debatable on equities over long horizons."],
    ],
    explorer: "Find an ETF",
    search: "Name, ticker, issuer or exposure",
    all: "All", wrapper: "Range", ucits: "UCITS", us: "US-listed",
    cls: { equity: "Equity", bond: "Bonds", commodity: "Commodities", realestate: "Real estate", crypto: "Crypto", cash: "Money market" },
    strat: { core: "Core", region: "Regions and countries", sector: "Sectors", factor: "Factors", dividend: "Dividends", thematic: "Thematic", esg: "ESG" },
    name: "ETF", exposure: "Exposure", ter: "TER", policy: "Income", repl: "Replication", issuer: "Issuer", domicile: "Domicile", rangeCol: "Range",
    acc: "Acc.", dist: "Dist.", physical: "Physical", synthetic: "Swap", futures: "Futures",
    more: "Show more", results: "results", none: "No ETF matches these filters.",
    compare: "Compare", compareHint: "Tick up to four funds in the table to compare them side by side.", clear: "Clear",
    lowCost: "Lowest ongoing charges, equity", best: "Best 1-year return",
    note: "Total return in the listing currency, dividends reinvested; 3Y and 5Y annualised. TER, replication and income policy are indicative: the issuer's factsheet and key information document prevail. Past performance does not predict future returns.",
    updated: "Last update",
    flow: ["Securities basket", "Authorised participant", "Shares on exchange"],
  },
  fr: {
    title: "Panorama des ETF",
    sub: "Structure, coûts et performance des fonds indiciels cotés par classe d'actifs, dans les gammes UCITS et américaine.",
    funds: "fonds", issuers: "émetteurs", classes: "classes d'actifs",
    primerTitle: "Ce qu'est un ETF, et ce qui décide de son résultat",
    primer: [
      "Un ETF est un fonds ouvert dont les parts se négocient en bourse. Les participants autorisés créent et rachètent des parts contre le panier sous-jacent, et cet arbitrage maintient le cours proche de la valeur liquidative.",
      "Pour un même indice, le résultat diffère par quatre éléments : le coût total de détention (frais, écart de suivi, fourchette), la méthode de réplication, le traitement des revenus et la position fiscale du domicile du fonds.",
    ],
    faqTitle: "Les points qu'une sélection doit trancher",
    faq: [
      ["Réplication physique ou synthétique ?", "Un fonds physique détient les titres de l'indice, en totalité ou par échantillonnage. Un fonds synthétique détient un panier de collatéral et reçoit la performance de l'indice par un swap. Sur les actions américaines, un swap peut mieux suivre l'indice, car la performance est reçue sans la retenue sur dividendes que supporte un fonds irlandais physique (15 %). La contrepartie est un risque de contrepartie, limité à 10 % de l'actif par les règles UCITS et le plus souvent collatéralisé."],
      ["TER ou écart de suivi ?", "Le TER est le coût annoncé. L'écart de suivi (tracking difference) est l'écart réalisé entre le fonds et l'indice sur une période, après frais, revenus du prêt de titres, retenues à la source et effets d'échantillonnage. C'est le chiffre à comparer entre deux fonds sur le même indice. La tracking error mesure la volatilité de cet écart, pas son niveau."],
      ["Capitalisant ou distribuant ?", "Les parts capitalisantes réinvestissent les revenus dans le fonds, les parts distribuantes les versent. Le rendement avant impôt est le même. Le choix est une question de fiscalité et de flux, selon la façon dont le pays de l'investisseur taxe dividendes, plus-values et revenus de fonds."],
      ["UCITS ou domicilié aux États-Unis ?", "Les ETF domiciliés aux États-Unis ne publient pas le document d'informations clés PRIIPs : les particuliers de l'UE ne peuvent en général pas les acheter, les clients professionnels le peuvent. Les fonds UCITS domiciliés en Irlande bénéficient du taux conventionnel de 15 % sur les dividendes américains, contre 30 % pour les fonds luxembourgeois qui détiennent les titres. Les actifs situés aux États-Unis peuvent aussi poser une question de droits de succession pour les non-résidents."],
      ["Quel poids donner à la liquidité ?", "Le coût de négociation est la fourchette achat-vente, plus l'éventuelle prime ou décote sur la valeur liquidative. Il dépend de la liquidité du marché sous-jacent plus que du volume du fonds. Les fourchettes s'élargissent hors des heures de cotation du sous-jacent et en marché tendu : l'ordre à cours limité est la règle."],
      ["Taille du fonds et risque de fermeture", "Les petits fonds sont fusionnés ou fermés, ce qui impose un fait générateur d'impôt et un réinvestissement à une date non choisie. Un encours au-dessus d'environ 100 millions et plusieurs années d'historique réduisent ce risque."],
      ["Prêt de titres", "Beaucoup de fonds physiques prêtent des titres contre collatéral. Le revenu compense une partie des frais ; la part reversée au fonds varie selon l'émetteur. Cela ajoute un risque de contrepartie, couvert par le collatéral et souvent par une garantie de l'agent prêteur."],
      ["Parts couvertes contre le change", "La couverture retire l'essentiel de l'effet de change au prix du différentiel de taux et des coûts de roulement. Elle est courante sur les obligations, où le change dominerait le rendement, et discutable sur les actions à long terme."],
    ],
    explorer: "Trouver un ETF",
    search: "Nom, ticker, émetteur ou exposition",
    all: "Tous", wrapper: "Gamme", ucits: "UCITS", us: "Cotés aux États-Unis",
    cls: { equity: "Actions", bond: "Obligations", commodity: "Matières premières", realestate: "Immobilier", crypto: "Crypto", cash: "Monétaire" },
    strat: { core: "Cœur de portefeuille", region: "Régions et pays", sector: "Secteurs", factor: "Facteurs", dividend: "Dividendes", thematic: "Thématiques", esg: "ESG" },
    name: "ETF", exposure: "Exposition", ter: "TER", policy: "Revenus", repl: "Réplication", issuer: "Émetteur", domicile: "Domicile", rangeCol: "Gamme",
    acc: "Cap.", dist: "Dist.", physical: "Physique", synthetic: "Swap", futures: "Futures",
    more: "Afficher plus", results: "résultats", none: "Aucun ETF ne correspond à ces filtres.",
    compare: "Comparer", compareHint: "Cochez jusqu'à quatre fonds dans le tableau pour les comparer côte à côte.", clear: "Effacer",
    lowCost: "Frais courants les plus bas, actions", best: "Meilleur rendement sur 1 an",
    note: "Rendement total dans la devise de cotation, dividendes réinvestis ; 3 et 5 ans annualisés. TER, réplication et politique de revenus sont indicatifs : la fiche et le document d'informations clés de l'émetteur font foi. Les performances passées ne préjugent pas des performances futures.",
    updated: "Dernière mise à jour",
    flow: ["Panier de titres", "Participant autorisé", "Parts en bourse"],
  },
};
type Labels = typeof T.en;

const pct = (v: any) => (isNum(v) ? `${v > 0 ? "+" : ""}${v.toFixed(1)}%` : "-");
const tone = (v: any) => (!isNum(v) ? "text-slate-300" : v >= 0 ? "text-emerald-700" : "text-[#9F1239]");

/** Pill used for every filter row. */
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode; key?: React.Key }) {
  return (
    <button onClick={onClick} className={cn("px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap", on ? "bg-[#0C2233] text-white" : "bg-white text-slate-600 shadow-sm hover:text-slate-900")}>
      {children}
    </button>
  );
}

/** Abstract header graphic: stacked allocation bars, drawn in CSS so it stays sharp at any size. */
function Bars() {
  const cols = [[38, 26, 14], [46, 20, 18], [30, 34, 12], [52, 22, 10], [42, 28, 16], [58, 18, 12], [48, 30, 10]];
  return (
    <div className="hidden lg:flex items-end gap-2 h-[150px]" aria-hidden>
      {cols.map((c, i) => (
        <div key={i} className="w-7 flex flex-col-reverse gap-[3px]">
          {c.map((h, k) => (
            <motion.span key={k} initial={{ height: 0, opacity: 0 }} animate={{ height: h * 1.35, opacity: 1 }} transition={{ duration: 0.8, delay: 0.15 + i * 0.07 + k * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="block rounded-[5px]" style={{ background: ["#38BDF8", "#1D6FA8", "#E2B84F"][k] }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Small ranking table, used in pairs. */
function Mini({ title, list, value }: { title: string; list: Etf[]; value: (e: Etf) => React.ReactNode }) {
  return (
    <div className={cn(CARD, "p-4 sm:p-5")}>
      <h3 className="text-[17px] font-semibold tracking-tight text-slate-900 mb-2">{title}</h3>
      <table className="w-full text-[13px] sm:text-[14px]">
        <tbody>
          {list.length === 0
            ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td className="py-1"><div className="h-7 rounded-md bg-slate-50" /></td></tr>)
            : list.map((e, i) => (
                <tr key={e.s} className="h-9">
                  <td className="w-7 text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="pr-2 leading-tight"><span className="font-semibold text-slate-900">{e.n}</span> <span className="text-xs text-slate-500">{e.s}</span></td>
                  <td className="text-right tabular-nums font-semibold whitespace-nowrap">{value(e)}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

export function EtfScreener() {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const t: Labels = T[lang];
  const [perf, setPerf] = useState<Record<string, Perf | null>>({});
  const [cls, setCls] = useState<EtfClass | "all">("all");
  const [strategy, setStrategy] = useState<EtfStrategy | "all">("all");
  const [wrapper, setWrapper] = useState<"all" | "UCITS" | "US">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("y1");
  const [shown, setShown] = useState(PAGE);
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    let alive = true;
    for (let i = 0; i < ETF_UNIVERSE.length; i += 45) {
      const c = ETF_UNIVERSE.slice(i, i + 45);
      fetch(`/api/stock/performance?symbols=${encodeURIComponent(c.map((x) => x.s).join(","))}`)
        .then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
        .then((part) => { if (alive && part && typeof part === "object") setPerf((p) => ({ ...p, ...part })); });
    }
    return () => { alive = false; };
  }, []);

  const classes = useMemo(() => Array.from(new Set(ETF_UNIVERSE.map((e) => e.cls))), []);
  const strategies = useMemo(() => Array.from(new Set(ETF_UNIVERSE.filter((e) => cls === "all" || e.cls === cls).map((e) => e.strategy))), [cls]);
  const issuers = useMemo(() => new Set(ETF_UNIVERSE.map((e) => e.issuer)).size, []);
  const asOf = (Object.values(perf) as (Perf | null)[]).find((p) => p?.asOf)?.asOf;

  const rows = useMemo(() => {
    const k = q.trim().toLowerCase();
    const list = ETF_UNIVERSE
      .filter((e) => cls === "all" || e.cls === cls)
      .filter((e) => strategy === "all" || e.strategy === strategy)
      .filter((e) => wrapper === "all" || e.wrapper === wrapper)
      .filter((e) => !k || `${e.n} ${e.s} ${e.issuer} ${e.focus.en} ${e.focus.fr}`.toLowerCase().includes(k));
    if (sort === "n") return [...list].sort((a, b) => a.n.localeCompare(b.n));
    // TER: cheapest first; performance: best first; missing values last
    const val = (e: Etf) => (sort === "ter" ? (isNum(e.ter) ? -e.ter : -999) : ((perf[e.s]?.[sort] as number) ?? -999));
    return [...list].sort((a, b) => val(b) - val(a));
  }, [cls, strategy, wrapper, q, sort, perf]);

  useEffect(() => { setShown(PAGE); }, [cls, strategy, wrapper, q]);
  useEffect(() => { if (strategy !== "all" && !strategies.includes(strategy)) setStrategy("all"); }, [strategies, strategy]);

  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : p.length >= 4 ? p : [...p, s]));
  const compared = picked.map((s) => ETF_UNIVERSE.find((e) => e.s === s)).filter(Boolean) as Etf[];
  const lowCost = useMemo(() => ETF_UNIVERSE.filter((e) => isNum(e.ter) && e.cls === "equity").sort((a, b) => a.ter! - b.ter!).slice(0, 8), []);
  const best = useMemo(() => ETF_UNIVERSE.filter((e) => isNum(perf[e.s]?.y1)).sort((a, b) => (perf[b.s]!.y1 as number) - (perf[a.s]!.y1 as number)).slice(0, 8), [perf]);
  const repl = (e: Etf) => (e.replication === "Physical" ? t.physical : e.replication === "Synthetic" ? t.synthetic : e.replication === "Futures" ? t.futures : "-");
  const policy = (e: Etf) => (e.policy === "Acc" ? t.acc : e.policy === "Dist" ? t.dist : "-");
  const sortBtn = (k: SortKey, label: string) => (
    <button onClick={() => setSort(k)} className={cn("px-1.5 sm:px-2 py-0.5 rounded-full font-semibold transition-colors text-[11px] sm:text-[13px]", sort === k ? "bg-[#0C2233] text-white" : "hover:text-slate-800")}>{label}</button>
  );

  const compareRows: [string, (e: Etf) => React.ReactNode][] = [
    [t.exposure, (e) => e.focus[lang]],
    [t.issuer, (e) => e.issuer],
    [t.rangeCol, (e) => e.wrapper],
    [t.domicile, (e) => e.domicile || "-"],
    [t.ter, (e) => (isNum(e.ter) ? `${e.ter.toFixed(2)}%` : "-")],
    [t.policy, policy],
    [t.repl, repl],
    ...COLS.map(([k, en, fr]): [string, (e: Etf) => React.ReactNode] => [lang === "fr" ? fr : en, (e) => <span className={cn("font-semibold tabular-nums", tone(perf[e.s]?.[k]))}>{pct(perf[e.s]?.[k])}</span>]),
  ];

  return (
    <div className="w-full font-sans pb-24 -mt-4 lg:-mt-6">
      {/* ── Header band ── */}
      <div className="w-full" style={{ backgroundColor: "#0A1E2D", backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg,#0A1E2D 0%,#14466B 60%,#0A1E2D 100%)", backgroundSize: "56px 56px, 56px 56px, 100% 100%" }}>
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-14 flex items-end justify-between gap-10">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-[26px] md:text-[34px] font-semibold tracking-tight !text-white">{t.title}</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.35 }} className="mt-3 max-w-2xl text-[15px] md:text-[17px] leading-relaxed text-white/75">{t.sub}</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-7 flex flex-wrap gap-x-10 gap-y-3 text-white">
              {([[ETF_UNIVERSE.length, t.funds], [issuers, t.issuers], [classes.length, t.classes]] as [number, string][]).map(([n, l]) => (
                <div key={l}><span className="block text-[28px] font-semibold tabular-nums leading-none">{n}</span><span className="mt-1 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#A9C8EA]">{l}</span></div>
              ))}
            </motion.div>
          </div>
          <Bars />
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* ── Primer and questions, two columns ── */}
        <section className="mt-12 grid lg:grid-cols-[1fr_1.35fr] gap-8 items-start">
          <div>
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-slate-900">{t.primerTitle}</h2>
            <span className="block mt-4 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]" />
            {t.primer.map((p) => <p key={p.slice(0, 24)} className="mt-5 text-[15px] leading-relaxed text-slate-600">{p}</p>)}
            {/* creation and redemption, as a small diagram */}
            <div className="mt-7 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center text-[12px] font-semibold text-[#1B3F72]">
              {t.flow.map((x, i) => (
                <React.Fragment key={x}>
                  {i > 0 && <span className="text-slate-400 text-base">⇄</span>}
                  <span className="rounded-2xl bg-[#1B3F72]/[0.07] px-2 py-3 leading-tight">{x}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className={cn(CARD, "p-2 sm:p-3")}>
            <h3 className="px-3 pt-3 pb-2 text-[17px] font-semibold tracking-tight text-slate-900">{t.faqTitle}</h3>
            {t.faq.map(([qq, a], i) => (
              <div key={qq} className={cn("rounded-2xl transition-colors", open === i && "bg-[#F3F7FC]")}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-3 py-3 text-left text-[15px] font-semibold text-slate-900">
                  {qq} <ChevronDown size={16} className={cn("shrink-0 text-slate-400 transition-transform", open === i && "rotate-180 text-[#1B3F72]")} />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-3 pb-4 text-[14px] leading-relaxed text-slate-600">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ── Two rankings side by side ── */}
        <section className="mt-12 grid lg:grid-cols-2 gap-8">
          <Mini title={t.lowCost} list={lowCost} value={(e) => <span className="text-slate-900">{e.ter!.toFixed(2)}%</span>} />
          <Mini title={t.best} list={best} value={(e) => <span className={tone(perf[e.s]?.y1)}>{pct(perf[e.s]?.y1)}</span>} />
        </section>

        {/* ── Explorer ── */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-slate-900">{t.explorer}</h2>
              <span className="block mt-4 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]" />
            </div>
            <div className="relative w-full sm:w-[340px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="w-full pl-10 pr-3 py-2.5 rounded-full bg-white shadow-sm text-[14px] outline-none focus:ring-2 focus:ring-[#1B3F72]/25" />
            </div>
          </div>

          <div className="mt-6 grid gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              <Chip on={cls === "all"} onClick={() => setCls("all")}>{t.all}</Chip>
              {classes.map((c) => <Chip key={c} on={cls === c} onClick={() => setCls(c)}>{t.cls[c]}</Chip>)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip on={strategy === "all"} onClick={() => setStrategy("all")}>{t.all}</Chip>
              {strategies.map((s) => <Chip key={s} on={strategy === s} onClick={() => setStrategy(s)}>{t.strat[s]}</Chip>)}
              <span className="mx-2 w-px bg-slate-200" />
              {(["all", "UCITS", "US"] as const).map((w) => <Chip key={w} on={wrapper === w} onClick={() => setWrapper(w)}>{w === "all" ? `${t.wrapper}: ${t.all.toLowerCase()}` : w === "UCITS" ? t.ucits : t.us}</Chip>)}
            </div>
          </div>

          <div className={cn(CARD, "mt-5 p-3 sm:p-5 overflow-x-auto")}>
            <p className="mb-3 flex justify-between text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500 min-h-[18px]">
              <span>{rows.length} {t.results}</span>
              <span>{asOf ? `${t.updated}: ${new Date(asOf).toLocaleDateString(lang === "fr" ? "fr-BE" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}</span>
            </p>
            <table className="w-full min-w-[900px] text-[13px] sm:text-[14px] border-separate border-spacing-y-[3px]">
              <thead>
                <tr className="text-[13px] text-slate-500">
                  <th className="w-8 pb-2" />
                  <th className="text-left font-medium pb-2">{sortBtn("n", t.name)}</th>
                  <th className="text-left font-medium pb-2 px-2">{t.exposure}</th>
                  <th className="pb-2 w-[6%] text-center">{sortBtn("ter", t.ter)}</th>
                  <th className="text-center font-medium pb-2 w-[6%]">{t.policy}</th>
                  <th className="text-center font-medium pb-2 w-[8%]">{t.repl}</th>
                  {COLS.map(([k, en, fr]) => <th key={k} className="pb-2 w-[7%] text-center">{sortBtn(k, lang === "fr" ? fr : en)}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, shown).map((e) => {
                  const on = picked.includes(e.s);
                  return (
                    <tr key={e.s} className={cn("h-[46px] cursor-pointer transition-colors hover:bg-slate-50", on && "bg-[#1B3F72]/[0.06]")} onClick={() => toggle(e.s)}>
                      <td className="pl-1"><span className={cn("flex w-[18px] h-[18px] rounded-md items-center justify-center", on ? "bg-[#1B3F72] text-white" : "bg-slate-100")}>{on && <Check size={12} />}</span></td>
                      <td className="py-1 pr-2 leading-tight">
                        <span className="font-semibold text-slate-900">{e.n}</span>
                        <span className="block text-[11px] sm:text-xs text-slate-500">{e.s} · {e.issuer} · {e.wrapper}</span>
                      </td>
                      <td className="px-2 text-[#1B3F72] leading-tight">{e.focus[lang]}</td>
                      <td className="text-center tabular-nums text-slate-700">{isNum(e.ter) ? `${e.ter.toFixed(2)}%` : "-"}</td>
                      <td className="text-center text-slate-600">{policy(e)}</td>
                      <td className="text-center text-slate-600">{repl(e)}</td>
                      {COLS.map(([k]) => {
                        const v = perf[e.s]?.[k];
                        return <td key={k} className="px-0.5"><span className={cn("mx-auto flex max-w-[92px] h-7 items-center justify-center rounded-md tabular-nums text-[12px] sm:text-[13px] font-semibold", sort === k ? "bg-[#1B3F72]/[0.06]" : "bg-slate-50", tone(v))}>{pct(v)}</span></td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <p className="py-10 text-center text-[14px] text-slate-500">{t.none}</p>}
            {rows.length > shown && (
              <div className="mt-4 flex justify-center">
                <button onClick={() => setShown((n) => n + PAGE)} className="px-5 py-2 rounded-full bg-[#0C2233] text-white text-[13px] font-semibold">{t.more} ({rows.length - shown})</button>
              </div>
            )}
            <p className="mt-4 text-[12px] text-slate-500">{t.note}</p>
          </div>
        </section>

        {/* ── Comparison ── */}
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-slate-900">{t.compare} <span className="text-slate-400 tabular-nums text-[18px]">{picked.length}/4</span></h2>
            {picked.length > 0 && <button onClick={() => setPicked([])} className="text-[13px] font-semibold text-slate-500 hover:text-slate-900">{t.clear}</button>}
          </div>
          {compared.length < 2 ? (
            <p className="mt-3 text-[14px] text-slate-500">{t.compareHint}</p>
          ) : (
            <div className={cn(CARD, "mt-5 p-3 sm:p-5 overflow-x-auto")}>
              <table className="w-full min-w-[640px] text-[13px] sm:text-[14px]">
                <thead>
                  <tr>
                    <th className="w-36" />
                    {compared.map((e) => (
                      <th key={e.s} className="text-left align-top px-3 pb-3">
                        <span className="flex items-start justify-between gap-2">
                          <span><span className="block font-semibold text-slate-900 leading-tight">{e.n}</span><span className="text-xs font-normal text-slate-500">{e.s}</span></span>
                          <button onClick={() => toggle(e.s)} className="text-slate-400 hover:text-slate-700" aria-label="Remove"><X size={14} /></button>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map(([label, f], i) => (
                    <tr key={label} className={cn("h-10", i % 2 === 0 && "bg-slate-50/70")}>
                      <td className="px-3 font-medium text-slate-500">{label}</td>
                      {compared.map((e) => <td key={e.s} className="px-3 text-slate-800">{f(e)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
