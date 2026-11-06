import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, ExternalLink, Minus, Star, ShieldCheck, Receipt, Landmark, Megaphone, LayoutGrid, Table2, Search, ArrowRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { cn } from "../../lib/utils";
import { PLATFORMS } from "./platformsData";
import { INVESTMENT_PLATFORMS, PLATFORM_SOURCES, type InvestmentPlatform, type Market, type PlatformType } from "../../data/investmentPlatforms";
import { PARTNERS, type Partner } from "../../data/partners";

type LegacyPlatform = (typeof PLATFORMS)[number];
type Tab = Market | "INTL";
type TypeFilter = "all" | PlatformType;

// Platforms already covered in detail for Belgium/France are not repeated in the international tab.
const COVERED_LEGACY_IDS = new Set([
  "bolero", "keytrade", "degiro", "saxo_bank", "trade_republic", "mexem", "ing", "kbc", "belfius",
  "credit_agricole", "bnp_paribas", "fortuneo", "boursorama",
]);

const BRAND: Record<string, { domain: string; color: string }> = {
  interactive_brokers: { domain: "interactivebrokers.com", color: "#D81222" },
  degiro: { domain: "degiro.com", color: "#00A3E0" },
  trade_republic: { domain: "traderepublic.com", color: "#111111" },
  scalable_capital: { domain: "scalable.capital", color: "#2E3B4E" },
  bloomberg: { domain: "bloomberg.com", color: "#000000" },
  trading212: { domain: "trading212.com", color: "#2B9BE7" },
  etoro: { domain: "etoro.com", color: "#13C636" },
  charles_schwab: { domain: "schwab.com", color: "#00A0DF" },
  fidelity: { domain: "fidelity.com", color: "#368727" },
  vanguard: { domain: "vanguard.com", color: "#96151D" },
  robinhood: { domain: "robinhood.com", color: "#00C805" },
  webull: { domain: "webull.com", color: "#0D6EFD" },
  xtb: { domain: "xtb.com", color: "#E2001A" },
  saxo_bank: { domain: "home.saxo", color: "#1E2A78" },
  boursorama: { domain: "boursobank.com", color: "#D6006D" },
  fortuneo: { domain: "fortuneo.fr", color: "#6CB33F" },
  tastytrade: { domain: "tastytrade.com", color: "#E31937" },
  wealthsimple: { domain: "wealthsimple.com", color: "#333333" },
  questrade: { domain: "questrade.com", color: "#3E8E41" },
  binance: { domain: "binance.com", color: "#F0B90B" },
  coinbase: { domain: "coinbase.com", color: "#0052FF" },
  kraken: { domain: "kraken.com", color: "#5741D9" },
  kucoin: { domain: "kucoin.com", color: "#23AF91" },
  bitstamp: { domain: "bitstamp.net", color: "#1A9A4B" },
  gemini: { domain: "gemini.com", color: "#00B8D9" },
  crypto_com: { domain: "crypto.com", color: "#103F68" },
  bybit: { domain: "bybit.com", color: "#F7A600" },
  okx: { domain: "okx.com", color: "#111111" },
  htx: { domain: "htx.com", color: "#1B5FFF" },
  plus500: { domain: "plus500.com", color: "#0A2A4A" },
  ig: { domain: "ig.com", color: "#E30613" },
  revolut: { domain: "revolut.com", color: "#191C1F" },
  n26: { domain: "n26.com", color: "#36A18B" },
  credit_agricole: { domain: "credit-agricole.fr", color: "#007461" },
  bnp_paribas: { domain: "bnpparibas.com", color: "#00915A" },
  bolero: { domain: "bolero.be", color: "#00AEEF" },
  keytrade: { domain: "keytradebank.be", color: "#E3007E" },
  mexem: { domain: "mexem.com", color: "#0B3D91" },
  lightyear: { domain: "lightyear.com", color: "#1F1F1F" },
  ing: { domain: "ing.be", color: "#FF6200" },
  kbc: { domain: "kbc.be", color: "#00AEEF" },
  belfius: { domain: "belfius.be", color: "#C30045" },
};

const L = {
  fr: {
    title: "Plateformes d'investissement",
    subtitle: "Courtiers en ligne, banques et néobanques pour investir depuis la Belgique et la France : frais, fiscalité, régulateur et points d'attention, avec un lien vers chaque site officiel.",
    tabBE: "Belgique", tabFR: "France", tabINTL: "Europe et international",
    all: "Tous", broker: "Courtiers", bank: "Banques", neobank: "Néobanques",
    typeBroker: "Courtier", typeBank: "Banque", typeNeobank: "Néobanque",
    search: "Rechercher une plateforme",
    fees: "Frais", tax: "Fiscalité", regulator: "Régulateur", bestFor: "Idéal pour",
    official: "Site officiel et tarifs", cards: "Fiches", table: "Tableau",
    colName: "Plateforme", colType: "Type", colFees: "Frais indicatifs", colTax: "Fiscalité", colReg: "Régulateur",
    partner: "Partenaire",
    sources: "Sources et méthode",
    disclaimer: "Tarifs indicatifs relevés en novembre 2026 à partir des grilles publiques et des comparatifs ci-dessous. Les frais évoluent régulièrement : seule la grille tarifaire officielle de chaque établissement fait foi. Quantrih ne fournit pas de conseil en investissement. Les emplacements partenaires sont toujours signalés comme tels.",
    countryCount: "plateformes",
  },
  en: {
    title: "Investment platforms",
    subtitle: "Online brokers, banks and neobanks for investing from Belgium and France: fees, taxes, regulator and caveats, with a link to each official website.",
    tabBE: "Belgium", tabFR: "France", tabINTL: "Europe and international",
    all: "All", broker: "Brokers", bank: "Banks", neobank: "Neobanks",
    typeBroker: "Broker", typeBank: "Bank", typeNeobank: "Neobank",
    search: "Search a platform",
    fees: "Fees", tax: "Taxes", regulator: "Regulator", bestFor: "Best for",
    official: "Official website and prices", cards: "Cards", table: "Table",
    colName: "Platform", colType: "Type", colFees: "Indicative fees", colTax: "Taxes", colReg: "Regulator",
    partner: "Partner",
    sources: "Sources and method",
    disclaimer: "Indicative fees collected in November 2026 from public price lists and the comparisons below. Fees change regularly: only each provider's official price list prevails. Quantrih does not provide investment advice. Partner placements are always labelled as such.",
    countryCount: "platforms",
  },
};

const TYPE_LABEL = (t: PlatformType, l: typeof L.fr) => (t === "broker" ? l.typeBroker : t === "bank" ? l.typeBank : l.typeNeobank);

function Logo({ domain, name, color, fallbackSrc, size = 48 }: { domain?: string; name: string; color: string; fallbackSrc?: string; size?: number }) {
  const sources = [domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "", fallbackSrc || ""].filter(Boolean);
  const [i, setI] = useState(0);
  const initials = name.replace(/\(.*\)/, "").split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden shrink-0" style={{ width: size, height: size }}>
      {i < sources.length ? (
        <img src={sources[i]} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setI((n) => n + 1)} style={{ width: size * 0.66, height: size * 0.66 }} className="object-contain" />
      ) : (
        <span className="text-sm font-bold text-white w-full h-full flex items-center justify-center" style={{ backgroundColor: color }}>{initials}</span>
      )}
    </div>
  );
}

function PartnerCard({ p, l, lang }: { p: Partner; l: typeof L.fr; lang: "fr" | "en" }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener sponsored"
      className="group relative flex flex-col gap-4 rounded-3xl border-2 border-gold/50 bg-gradient-to-br from-[#FBF3E2] via-surface to-surface p-6 shadow-[0_14px_36px_rgba(201,162,74,0.15)] hover:border-gold transition-colors"
    >
      <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8A6A1F] bg-gold/15 px-2.5 py-1 rounded-full">
        <Megaphone size={11} /> {l.partner}
      </span>
      <Logo domain={p.domain} name={p.name} color={p.color} size={52} />
      <div>
        <h3 className="text-lg font-bold text-text">{p.name}</h3>
        <p className="text-sm text-text-2 mt-1 leading-relaxed">{p.tagline[lang]}</p>
      </div>
      {p.highlight && <p className="text-sm font-semibold text-[#8A6A1F] bg-gold/10 rounded-xl px-3 py-2">{p.highlight[lang]}</p>}
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-text group-hover:gap-2.5 transition-all">
        {l.official} <ArrowRight size={14} />
      </span>
    </a>
  );
}

function PlatformCard({ p, l, lang, index }: { p: InvestmentPlatform; l: typeof L.fr; lang: "fr" | "en"; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col bg-surface border border-border rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(20,20,26,0.04)] hover:shadow-[0_14px_36px_rgba(20,20,26,0.08)] transition-shadow"
    >
      <div className="h-14 relative" style={{ background: `linear-gradient(135deg, ${p.color} 0%, ${p.color}CC 55%, ${p.color}80 100%)` }}>
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide text-white bg-black/25 px-2 py-0.5 rounded-full">{TYPE_LABEL(p.type, l)}</span>
      </div>
      <div className="relative z-10 px-5 pb-5 -mt-6 flex flex-col gap-3 flex-grow">
        <Logo domain={p.domain} name={p.name} color={p.color} />
        <div className="min-w-0 -mt-1">
          <h3 className="text-base font-bold text-text leading-tight truncate">{p.name}</h3>
          {p.group && <p className="text-[11px] text-text-4 truncate">{p.group}</p>}
        </div>

        <p className="text-xs text-text-2 leading-relaxed"><span className="font-semibold text-text">{l.bestFor} : </span>{p.bestFor[lang]}</p>

        <div className="rounded-2xl bg-surface-3/60 p-3 flex flex-col gap-2 text-xs">
          <div className="flex gap-2"><Receipt size={14} className="text-pv-blue shrink-0 mt-0.5" /><span className="text-text-2 leading-snug"><span className="font-semibold text-text">{l.fees} : </span>{p.fees[lang]}</span></div>
          <div className="flex gap-2"><Landmark size={14} className="text-gold shrink-0 mt-0.5" /><span className="text-text-2 leading-snug"><span className="font-semibold text-text">{l.tax} : </span>{p.tax[lang]}</span></div>
          <div className="flex gap-2"><ShieldCheck size={14} className="text-green shrink-0 mt-0.5" /><span className="text-text-2 leading-snug"><span className="font-semibold text-text">{l.regulator} : </span>{p.regulator}</span></div>
        </div>

        <div className="flex flex-wrap gap-1">
          {p.products.map((x) => (
            <span key={x} className="text-[10px] font-medium text-text-3 border border-border rounded-full px-2 py-0.5">{x}</span>
          ))}
        </div>

        <ul className="flex flex-col gap-1.5 text-xs text-text-2">
          {p.highlights[lang].map((x) => (
            <li key={x} className="flex gap-1.5"><Check size={13} className="text-green shrink-0 mt-0.5" /><span className="leading-snug">{x}</span></li>
          ))}
          {p.watchouts[lang].map((x) => (
            <li key={x} className="flex gap-1.5 text-text-3"><Minus size={13} className="text-red shrink-0 mt-0.5" /><span className="leading-snug">{x}</span></li>
          ))}
        </ul>

        <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-text-2 hover:text-pv-blue transition-colors">
          {l.official} <ExternalLink size={12} />
        </a>
      </div>
    </motion.article>
  );
}

function LegacyCard({ p, t, index }: { p: LegacyPlatform; t: (k: string) => string; index: number }) {
  const brand = BRAND[p.id];
  const color = brand?.color || "#5B4BDB";
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col bg-surface border border-border rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(20,20,26,0.04)]"
    >
      <div className="h-12" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}AA 100%)` }} />
      <div className="relative z-10 px-5 pb-5 -mt-6 flex flex-col gap-3 flex-grow">
        <div className="flex items-end justify-between gap-3">
          <Logo domain={brand?.domain} name={p.name} color={color} fallbackSrc={p.logo} />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-2"><Star size={12} className="fill-gold text-gold" />{p.rating.toFixed(1)}</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-text leading-tight">{p.name}</h3>
          <p className="text-xs text-text-3 mt-1 leading-relaxed line-clamp-2">{p.bestFor}</p>
        </div>
        <div className="flex items-center gap-2 text-xs"><span className="text-text-4">{t("platforms.fees")}</span><span className="font-semibold text-text-2 px-2 py-0.5 rounded-md bg-surface-3">{p.fees}</span></div>
        <ul className="flex flex-col gap-1.5 text-xs text-text-2">
          {p.pros.slice(0, 2).map((x) => (<li key={x} className="flex gap-1.5"><Check size={13} className="text-green shrink-0 mt-0.5" /><span className="leading-snug">{x}</span></li>))}
        </ul>
        {brand && (
          <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-text-2 hover:text-pv-blue transition-colors">
            {t("platforms.visit")} <ExternalLink size={12} />
          </a>
        )}
      </div>
    </motion.article>
  );
}

export function Platforms({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t, language } = useTranslation();
  const lang: "fr" | "en" = language === "fr" ? "fr" : language === "en" ? "en" : "en";
  const l = language === "fr" ? L.fr : L.en;
  const [tab, setTab] = useState<Tab>("BE");
  const [type, setType] = useState<TypeFilter>("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [query, setQuery] = useState("");

  const marketList = useMemo(() => {
    if (tab === "INTL") return [];
    const q = query.trim().toLowerCase();
    return INVESTMENT_PLATFORMS.filter((p) => p.markets.includes(tab))
      .filter((p) => type === "all" || p.type === type)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.group || "").toLowerCase().includes(q));
  }, [tab, type, query]);

  const intlList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLATFORMS.filter((p) => !COVERED_LEGACY_IDS.has(p.id))
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .sort((a, b) => b.rating - a.rating);
  }, [query]);

  const partners = tab === "INTL" ? [] : PARTNERS.filter((p) => p.kind !== "education" && p.markets.includes(tab));
  const count = (m: Market) => INVESTMENT_PLATFORMS.filter((p) => p.markets.includes(m)).length;
  const tabs: { id: Tab; label: string; flag: string; n: number }[] = [
    { id: "BE", label: l.tabBE, flag: "🇧🇪", n: count("BE") },
    { id: "FR", label: l.tabFR, flag: "🇫🇷", n: count("FR") },
    { id: "INTL", label: l.tabINTL, flag: "🌍", n: PLATFORMS.filter((p) => !COVERED_LEGACY_IDS.has(p.id)).length },
  ];
  const typeFilters: TypeFilter[] = ["all", "broker", "bank", "neobank"];

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div className="page-container pb-24 mt-6 min-h-[calc(100vh-120px)] font-sans">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">{l.title}</h1>
          <p className="text-sm text-text-3 max-w-3xl leading-relaxed">{l.subtitle}</p>
        </div>

        {/* Market tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold border transition-colors",
                tab === tb.id ? "bg-text text-bg border-text shadow-sm" : "bg-surface text-text-2 border-border hover:border-border-2"
              )}
            >
              <span className="text-base leading-none">{tb.flag}</span>
              {tb.label}
              <span className="text-[11px] font-mono opacity-60">{tb.n}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="relative w-full md:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={l.search} className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-sm outline-none focus:border-pv-blue/60" />
          </div>
          {tab !== "INTL" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {typeFilters.map((f) => (
                  <button key={f} onClick={() => setType(f)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors", type === f ? "bg-pv-blue text-white border-pv-blue" : "bg-surface text-text-3 border-border hover:border-border-2")}>
                    {l[f]}
                  </button>
                ))}
              </div>
              <div className="md:ml-auto inline-flex rounded-xl border border-border bg-surface p-0.5">
                <button onClick={() => setView("cards")} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold", view === "cards" ? "bg-surface-3 text-text" : "text-text-3")}><LayoutGrid size={13} />{l.cards}</button>
                <button onClick={() => setView("table")} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold", view === "table" ? "bg-surface-3 text-text" : "text-text-3")}><Table2 size={13} />{l.table}</button>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        {tab === "INTL" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {intlList.map((p, i) => <LegacyCard key={p.id} p={p} t={t} index={i} />)}
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {partners.map((p) => <PartnerCard key={p.id} p={p} l={l} lang={lang} />)}
            {marketList.map((p, i) => <PlatformCard key={p.id} p={p} l={l} lang={lang} index={i} />)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="bg-surface-3/60 text-text-3 uppercase tracking-wide text-[10px]">
                <tr>
                  <th className="px-4 py-3">{l.colName}</th>
                  <th className="px-4 py-3">{l.colType}</th>
                  <th className="px-4 py-3">{l.colFees}</th>
                  <th className="px-4 py-3">{l.colTax}</th>
                  <th className="px-4 py-3">{l.colReg}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {marketList.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-3/30 align-top">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Logo domain={p.domain} name={p.name} color={p.color} size={32} /><span className="font-bold text-text text-sm">{p.name}</span></div></td>
                    <td className="px-4 py-3 text-text-2">{TYPE_LABEL(p.type, l)}</td>
                    <td className="px-4 py-3 text-text-2 max-w-[280px] leading-snug">{p.fees[lang]}</td>
                    <td className="px-4 py-3 text-text-2 max-w-[220px] leading-snug">{p.tax[lang]}</td>
                    <td className="px-4 py-3 text-text-3">{p.regulator}</td>
                    <td className="px-4 py-3"><a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-pv-blue font-semibold">{l.official} <ExternalLink size={11} /></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sources */}
        <section className="mt-14 rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-text mb-3">{l.sources}</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            {PLATFORM_SOURCES.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-pv-blue hover:underline inline-flex items-center gap-1">{s.label} <ExternalLink size={10} /></a></li>
            ))}
          </ul>
          <p className="text-[11px] text-text-4 mt-4 leading-relaxed">{l.disclaimer}</p>
        </section>
      </div>
    </MobileZoomWrapper>
  );
}
