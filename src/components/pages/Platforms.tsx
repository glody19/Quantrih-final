import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, ExternalLink, Minus, Star, ShieldCheck, Receipt, Landmark, Megaphone, LayoutGrid, Table2, Search, ArrowRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { HeroBand, HeroStats, NetworkArt, SectionHead, PALETTE } from "../education/Viz";
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
  kraken: { domain: "kraken.com", color: "#1F4F8F" },
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

// Most widely used first; Interactive Brokers leads as our own pick. Anything not listed keeps its place after these.
const POPULAR = [
  "interactive_brokers", "charles_schwab", "fidelity", "robinhood", "etoro", "webull", "vanguard", "tastytrade",
  "trading212", "degiro", "trade_republic", "saxo_bank", "xtb", "scalable_capital", "ig", "revolut", "n26", "lightyear",
  "boursorama", "fortuneo", "wealthsimple", "questrade", "plus500",
  "binance", "coinbase", "kraken", "bybit", "okx", "crypto_com", "kucoin", "bitstamp", "gemini", "htx",
];
const rankOf = (id: string) => { const i = POPULAR.indexOf(id); return i === -1 ? 999 : i; };

// Logos checked by eye and saved with the site
const LOCAL_LOGO: Record<string, string> = {
  interactive_brokers: "/logos/interactive_brokers.png", charles_schwab: "/logos/charles_schwab.png", fidelity: "/logos/fidelity.png",
  robinhood: "/logos/robinhood.png", etoro: "/logos/etoro.png", webull: "/logos/webull.png", tastytrade: "/logos/tastytrade.png",
  trading212: "/logos/trading212.png", xtb: "/logos/xtb.png", scalable_capital: "/logos/scalable_capital.png", ig: "/logos/ig.png",
  revolut: "/logos/revolut.png", n26: "/logos/n26.png", lightyear: "/logos/lightyear.png", wealthsimple: "/logos/wealthsimple.png",
  saxo_bank: "/logos/saxo.png", saxo: "/logos/saxo.png", trade_republic: "/logos/trade_republic.png", fortuneo: "/logos/fortuneo.png",
  ing: "/logos/ing.png", bnp_paribas: "/logos/bnp_paribas.jpg", bnp_fortis: "/logos/bnp_fortis.png", credit_agricole: "/logos/credit_agricole.png",
  keytrade: "/logos/keytrade.png", mexem: "/logos/mexem.png", beobank: "/logos/beobank.png", bourse_direct: "/logos/bourse_direct.jpg",
};

const L = {
  fr: {
    title: "Plateformes d'investissement",
    subtitle: "Courtiers en ligne, banques et néobanques pour investir : frais, fiscalité, régulateur et points d'attention, avec un lien vers chaque site officiel.",
    tabBE: "Belgique", tabFR: "France", tabINTL: "Les plus populaires", crypto: "Crypto", pick: "Notre choix", strengths: "Points forts", limits: "Limites", visit: "Site officiel",
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
    compareTitle: "Comparer côte à côte", compareHint: "Choisissez jusqu'à 3 plateformes pour les comparer.", clear: "Effacer",
    products: "Produits", highlights: "Points forts", watchouts: "Points d'attention",
    guideTitle: "Comment choisir sa plateforme",
    guide: [
      ["Coût total", "Regardez au-delà du courtage : frais de change, de garde, d'inactivité et de sortie s'additionnent avec le temps."],
      ["Fiscalité", "Un courtier belge retient la TOB et le précompte pour vous ; un courtier étranger vous laisse déclarer vous-même (compte étranger, TOB)."],
      ["Enveloppes", "En France, PEA et assurance-vie offrent un avantage fiscal ; vérifiez que la plateforme les propose."],
      ["Régulation & protection", "Vérifiez le régulateur (FSMA, AMF, BaFin…) et la garantie qui couvre vos espèces et vos titres."],
      ["Produits disponibles", "Assurez-vous que les ETF, bourses, obligations ou options dont vous avez besoin sont accessibles."],
      ["Outils", "Graphiques, données et ordres avancés comptent pour un investisseur actif, moins pour un plan ETF mensuel."],
    ],
  },
  en: {
    title: "Investment platforms",
    subtitle: "Online brokers, banks and neobanks to invest with: fees, taxes, regulator and caveats, with a link to each official website.",
    tabBE: "Belgium", tabFR: "France", tabINTL: "Most popular", crypto: "Crypto", pick: "Our pick", strengths: "Strengths", limits: "Limits", visit: "Official website",
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
    compareTitle: "Compare side by side", compareHint: "Pick up to 3 platforms to compare them.", clear: "Clear",
    products: "Products", highlights: "Strengths", watchouts: "Watch-outs",
    guideTitle: "How to choose your platform",
    guide: [
      ["Total cost", "Look beyond commissions: FX, custody, inactivity and exit fees add up over time."],
      ["Taxes", "A Belgian broker withholds the stock exchange tax (TOB) and withholding tax for you; a foreign broker leaves the declaration to you."],
      ["Tax wrappers", "In France, the PEA and assurance-vie offer tax advantages: check that the platform offers them."],
      ["Regulation & protection", "Check the regulator (FSMA, AMF, BaFin…) and the scheme protecting your cash and securities."],
      ["Available products", "Make sure the ETFs, exchanges, bonds or options you need are available."],
      ["Tools", "Charts, data and advanced orders matter for active investors, less for a monthly ETF plan."],
    ],
  },
};

const TYPE_LABEL = (t: PlatformType, l: typeof L.fr) => (t === "broker" ? l.typeBroker : t === "bank" ? l.typeBank : l.typeNeobank);

function Logo({ id, domain, name, color, fallbackSrc, size = 48 }: { id?: string; domain?: string; name: string; color: string; fallbackSrc?: string; size?: number }) {
  const sources = [id && LOCAL_LOGO[id] ? LOCAL_LOGO[id] : "", domain ? `/api/logo?domain=${domain}&sz=128` : "", fallbackSrc || ""].filter(Boolean);
  const [i, setI] = useState(0);
  const initials = name.replace(/\(.*\)/, "").split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-2xl bg-white shadow-[0_6px_16px_-8px_rgba(6,18,27,0.35)] flex items-center justify-center overflow-hidden shrink-0" style={{ width: size, height: size }}>
      {i < sources.length ? (
        <img src={sources[i]} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setI((n) => n + 1)} style={{ width: size * 0.66, height: size * 0.66 }} className="object-contain" />
      ) : (
        <span className="text-[16px] font-bold text-white w-full h-full flex items-center justify-center" style={{ backgroundColor: color }}>{initials}</span>
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
      <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-[#8A6A1F] bg-gold/15 px-2.5 py-1 rounded-full">
        <Megaphone size={11} /> {l.partner}
      </span>
      <Logo domain={p.domain} name={p.name} color={p.color} size={52} />
      <div>
        <h3 className="text-[20px] font-bold text-text">{p.name}</h3>
        <p className="text-[16px] text-text-2 mt-1 leading-relaxed">{p.tagline[lang]}</p>
      </div>
      {p.highlight && <p className="text-[16px] font-semibold text-[#8A6A1F] bg-gold/10 rounded-xl px-3 py-2">{p.highlight[lang]}</p>}
      <span className="mt-auto inline-flex items-center gap-1.5 text-[16px] font-bold text-text group-hover:gap-2.5 transition-all">
        {l.official} <ArrowRight size={14} />
      </span>
    </a>
  );
}

function PlatformCard({ p, l, lang, index }: { p: InvestmentPlatform; l: typeof L.fr; lang: "fr" | "en"; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 34, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_18px_44px_-30px_rgba(6,18,27,0.45)] hover:shadow-[0_22px_48px_-26px_rgba(6,18,27,0.5)] transition-shadow"
    >
      <div className="h-14 relative" style={{ background: `linear-gradient(135deg, ${p.color} 0%, ${p.color}CC 55%, ${p.color}80 100%)` }}>
        <span className="absolute top-3 right-3 text-[12px] font-bold uppercase tracking-wide text-white bg-black/25 px-2 py-0.5 rounded-full">{TYPE_LABEL(p.type, l)}</span>
      </div>
      <div className="relative z-10 px-5 pb-5 -mt-6 flex flex-col gap-3 flex-grow">
        <Logo id={p.id} domain={p.domain} name={p.name} color={p.color} />
        <div className="min-w-0 -mt-1">
          <h3 className="text-[18px] font-bold text-text leading-tight truncate">{p.name}</h3>
          {p.group && <p className="text-[15px] text-text-4 truncate">{p.group}</p>}
        </div>

        <p className="text-[14px] text-text-2 leading-relaxed"><span className="font-semibold text-text">{l.bestFor} : </span>{p.bestFor[lang]}</p>

        <div className="rounded-2xl bg-surface-3/60 p-3 flex flex-col gap-2 text-[14px]">
          <div className="flex gap-2"><Receipt size={14} className="text-pv-blue shrink-0 mt-0.5" /><span className="text-text-2 leading-snug"><span className="font-semibold text-text">{l.fees} : </span>{p.fees[lang]}</span></div>
          <div className="flex gap-2"><Landmark size={14} className="text-gold shrink-0 mt-0.5" /><span className="text-text-2 leading-snug"><span className="font-semibold text-text">{l.tax} : </span>{p.tax[lang]}</span></div>
          <div className="flex gap-2"><ShieldCheck size={14} className="text-green shrink-0 mt-0.5" /><span className="text-text-2 leading-snug"><span className="font-semibold text-text">{l.regulator} : </span>{p.regulator}</span></div>
        </div>

        <div className="flex flex-wrap gap-1">
          {p.products.map((x) => (
            <span key={x} className="text-[12px] font-medium text-text-3 border border-border rounded-full px-2 py-0.5">{x}</span>
          ))}
        </div>

        <ul className="flex flex-col gap-1.5 text-[14px] text-text-2">
          {p.highlights[lang].map((x) => (
            <li key={x} className="flex gap-1.5"><Check size={13} className="text-green shrink-0 mt-0.5" /><span className="leading-snug">{x}</span></li>
          ))}
          {p.watchouts[lang].map((x) => (
            <li key={x} className="flex gap-1.5 text-text-3"><Minus size={13} className="text-red shrink-0 mt-0.5" /><span className="leading-snug">{x}</span></li>
          ))}
        </ul>

        <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-border flex items-center justify-between text-[14px] font-semibold text-text-2 hover:text-pv-blue transition-colors">
          {l.official} <ExternalLink size={12} />
        </a>
      </div>
    </motion.article>
  );
}

function LegacyCard({ p, l, index }: { p: LegacyPlatform; l: typeof L.fr; index: number }) {
  const brand = BRAND[p.id];
  const color = brand?.color || "#1B3F72";
  const pick = p.id === "interactive_brokers";
  return (
    <motion.article
      initial={{ opacity: 0, y: 34, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative overflow-hidden flex flex-col gap-3 bg-white rounded-3xl p-6 shadow-[0_22px_60px_-40px_rgba(6,18,27,0.45)] hover:-translate-y-1.5 transition-transform", pick && "ring-2 ring-[#1B3F72]/70")}
    >
      <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
      <div className="flex items-center gap-3">
        <Logo id={p.id} domain={brand?.domain} name={p.name} color={color} fallbackSrc={p.logo} size={52} />
        <div className="min-w-0">
          <h3 className="text-[18px] font-bold text-text leading-tight truncate">{p.name}</h3>
          <p className="mt-0.5 text-[15px] font-semibold uppercase tracking-[0.12em] text-text-4">{p.type === "crypto" ? l.crypto : p.type === "bank" ? l.typeBank : p.type === "neobank" ? l.typeNeobank : l.typeBroker} · {l.fees} {String(p.fees).toLowerCase()}</p>
        </div>
        {pick && <span className="ml-auto shrink-0 text-[12px] font-bold uppercase tracking-wider text-white bg-[#1B3F72] px-2.5 py-1 rounded-full">{l.pick}</span>}
      </div>
      <p className="text-[15px] text-text-2 leading-relaxed">{p.bestFor}</p>
      <div className="flex flex-wrap gap-1">
        {p.features.slice(0, 4).map((x) => <span key={x} className="text-[15px] font-medium text-[#1B3F72] bg-[#1B3F72]/[0.07] rounded-full px-2 py-0.5">{x}</span>)}
      </div>
      <ul className="flex flex-col gap-1.5 text-[15px] text-text-2">
        {p.pros.slice(0, 3).map((x) => (<li key={x} className="flex gap-1.5"><Check size={14} className="text-green shrink-0 mt-0.5" /><span className="leading-snug">{x}</span></li>))}
        {p.cons.slice(0, 2).map((x) => (<li key={x} className="flex gap-1.5 text-text-3"><Minus size={14} className="text-red shrink-0 mt-0.5" /><span className="leading-snug">{x}</span></li>))}
      </ul>
      {brand && (
        <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 flex items-center justify-between text-[15px] font-semibold text-[#1B3F72] hover:gap-2">
          {l.visit} <ExternalLink size={13} />
        </a>
      )}
    </motion.article>
  );
}

export function Platforms({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t, language } = useTranslation();
  const lang: "fr" | "en" = language === "fr" ? "fr" : language === "en" ? "en" : "en";
  const l = language === "fr" ? L.fr : L.en;
  const [tab, setTab] = useState<Tab>("INTL");
  const [kind, setKind] = useState<"all" | "broker" | "crypto" | "neobank" | "bank">("all");
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

  // the popular tab lists everything, most used first
  const popular = useMemo(() => PLATFORMS.filter((p) => p.type !== "screener").sort((a, b) => rankOf(a.id) - rankOf(b.id)), []);
  const intlList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return popular.filter((p) => kind === "all" || p.type === kind).filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [query, kind, popular]);

  const partners = tab === "INTL" ? [] : PARTNERS.filter((p) => p.kind !== "education" && p.markets.includes(tab));
  const count = (m: Market) => INVESTMENT_PLATFORMS.filter((p) => p.markets.includes(m)).length;
  const tabs: { id: Tab; label: string; flag: string; n: number }[] = [
    { id: "INTL", label: l.tabINTL, flag: "🌍", n: popular.length },
    { id: "BE", label: l.tabBE, flag: "🇧🇪", n: count("BE") },
    { id: "FR", label: l.tabFR, flag: "🇫🇷", n: count("FR") },
  ];
  const typeFilters: TypeFilter[] = ["all", "broker", "bank", "neobank"];

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div className="w-full pb-24 -mt-4 lg:-mt-6 font-sans">
        <HeroBand kicker={lang === "fr" ? "Où investir" : "Where to invest"} title={l.title} sub={l.subtitle} art={<NetworkArt />}>
          <HeroStats items={[
            { value: popular.length, label: lang === "fr" ? "plateformes" : "platforms", color: PALETTE.gold },
            { value: popular.filter((p) => p.type === "broker").length, label: l.broker, color: PALETTE.sky },
            { value: popular.filter((p) => p.type === "crypto").length, label: l.crypto, color: PALETTE.coral },
            { value: INVESTMENT_PLATFORMS.length, label: lang === "fr" ? "fiches détaillées" : "detailed profiles", color: PALETTE.teal },
          ]} />
        </HeroBand>
        <div className="max-w-[1720px] mx-auto px-5 sm:px-8 lg:px-14 pt-12">

        {/* Market tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[16px] font-semibold transition-colors",
                tab === tb.id ? "bg-[#0C2233] text-white shadow-sm" : "bg-white text-text-2 shadow-sm hover:text-text"
              )}
            >
              <span className="text-[18px] leading-none">{tb.flag}</span>
              {tb.label}
              <span className="text-[15px] font-mono opacity-60">{tb.n}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="relative w-full md:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={l.search} className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-[16px] outline-none focus:border-pv-blue/60" />
          </div>
          {tab === "INTL" && (
            <div className="flex flex-wrap gap-1.5">
              {(["all", "broker", "crypto", "neobank", "bank"] as const).map((f) => (
                <button key={f} onClick={() => setKind(f)} className={cn("px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors", kind === f ? "bg-pv-blue text-white" : "bg-white text-text-3 shadow-sm hover:text-text")}>
                  {f === "crypto" ? l.crypto : l[f]}
                </button>
              ))}
            </div>
          )}
          {tab !== "INTL" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {typeFilters.map((f) => (
                  <button key={f} onClick={() => setType(f)} className={cn("px-3 py-1.5 rounded-full text-[14px] font-semibold border transition-colors", type === f ? "bg-pv-blue text-white border-pv-blue" : "bg-surface text-text-3 border-border hover:border-border-2")}>
                    {l[f]}
                  </button>
                ))}
              </div>
              <div className="md:ml-auto inline-flex rounded-xl border border-border bg-surface p-0.5">
                <button onClick={() => setView("cards")} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-semibold", view === "cards" ? "bg-surface-3 text-text" : "text-text-3")}><LayoutGrid size={13} />{l.cards}</button>
                <button onClick={() => setView("table")} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-semibold", view === "table" ? "bg-surface-3 text-text" : "text-text-3")}><Table2 size={13} />{l.table}</button>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        {tab === "INTL" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {intlList.map((p, i) => <LegacyCard key={p.id} p={p} l={l} index={i} />)}
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {partners.map((p) => <PartnerCard key={p.id} p={p} l={l} lang={lang} />)}
            {marketList.map((p, i) => <PlatformCard key={p.id} p={p} l={l} lang={lang} index={i} />)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-white shadow-[0_18px_44px_-30px_rgba(6,18,27,0.45)]">
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <thead className="bg-surface-3/60 text-text-3 uppercase tracking-wide text-[12px]">
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
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Logo id={p.id} domain={p.domain} name={p.name} color={p.color} size={32} /><span className="font-bold text-text text-[16px]">{p.name}</span></div></td>
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

        {/* How to choose */}
        <section className="mt-14">
          <SectionHead kicker={lang === "fr" ? "Méthode" : "Method"} title={l.guideTitle} color={PALETTE.gold} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {l.guide.map(([title, desc], i) => {
              const c = [PALETTE.gold, PALETTE.sky, PALETTE.teal, PALETTE.coral, PALETTE.blue, PALETTE.green][i % 6];
              return (
                <motion.div key={title} initial={{ opacity: 0, y: 30, scale: 0.94 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} whileHover={{ y: -6 }}
                  className="relative overflow-hidden rounded-3xl bg-white shadow-[0_22px_60px_-40px_rgba(6,18,27,0.45)] p-6">
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${c}, ${PALETTE.navy})` }} />
                  <div className="w-11 h-11 rounded-2xl text-white text-[18px] font-bold flex items-center justify-center mb-4 shadow-md" style={{ background: `linear-gradient(140deg, ${c}, ${PALETTE.navy})` }}>{i + 1}</div>
                  <h3 className="text-[19px] font-semibold text-slate-900">{title}</h3>
                  <p className="text-[16px] text-slate-600 mt-1.5 leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Sources */}
        <section className="mt-14 rounded-3xl bg-white shadow-[0_18px_44px_-30px_rgba(6,18,27,0.45)] p-6">
          <h2 className="text-[18px] font-bold text-text mb-3">{l.sources}</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
            {PLATFORM_SOURCES.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-pv-blue hover:underline inline-flex items-center gap-1">{s.label} <ExternalLink size={10} /></a></li>
            ))}
          </ul>
          <p className="text-[15px] text-text-4 mt-4 leading-relaxed">{l.disclaimer}</p>
        </section>
        </div>
      </div>
    </MobileZoomWrapper>
  );
}
