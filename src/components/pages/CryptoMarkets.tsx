import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { CryptoData } from "../crypto/CryptoData";

const CARD = "rounded-[1.5rem] bg-white shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)]";
const NAVY = { backgroundColor: "#0A1E2D", backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg,#0A1E2D 0%,#14466B 60%,#0A1E2D 100%)", backgroundSize: "56px 56px, 56px 56px, 100% 100%" };

const T = {
  en: {
    kicker: "Digital assets",
    title: "Blockchain, crypto assets and stablecoins",
    lead: "How settlement works on a public ledger, what backs a stablecoin, how the asset class is regulated and accessed, and where the market stands today.",
    nav: ["Settlement", "Market", "Consensus", "Stablecoins", "Access", "Rules", "Myths", "Reading"],
    flowTitle: "How a transaction settles",
    flowLead: "No clearing house and no central book: the network itself orders transactions and makes them final.",
    flow: [
      ["Signed transaction", "The holder signs with a private key; the key is the asset."],
      ["Mempool", "Pending transactions wait; fees decide priority."],
      ["Block producer", "A miner or validator selects and orders transactions."],
      ["Block", "Each block references the previous one by its hash."],
      ["Finality", "After enough confirmations, reversal becomes impractical."],
    ],
    marketTitle: "Where the market stands",
    consTitle: "Proof of work and proof of stake",
    cons: [
      ["Proof of work", "Bitcoin", "Miners spend energy to find a valid block hash. Security comes from the cost of computing power: rewriting history means outspending the honest network. Settlement is probabilistic; six confirmations, about an hour, is a common threshold."],
      ["Proof of stake", "Ethereum since September 2022", "Validators lock capital as collateral and are selected to propose and attest blocks. Misbehaviour is punished by slashing part of the stake. Ethereum reaches economic finality after two epochs, roughly 13 minutes. Energy use dropped by more than 99% at the switch."],
    ],
    stTitle: "Stablecoins",
    stLead: "A token designed to hold a fixed value, usually one US dollar. The peg is only as good as what stands behind it and the right to redeem.",
    stTypes: [
      ["Fiat-backed", "Reserves in cash and short-term government bills held by the issuer. Redemption at par for eligible clients. Risk: the quality, custody and transparency of the reserves.", "USDT, USDC"],
      ["Crypto-collateralised", "Over-collateralised positions in other crypto assets, liquidated automatically when collateral falls. Risk: collateral crashes and liquidation spirals.", "DAI, USDS"],
      ["Algorithmic", "Supply expands and contracts through incentives, often against a sister token, without full reserves. Risk: a loss of confidence becomes self-reinforcing.", "UST (collapsed)"],
    ],
    depegTitle: "Two depegs worth knowing",
    depegs: [
      ["May 2022", "TerraUSD (UST)", "The algorithmic stablecoin lost its peg and fell close to zero within days, taking its sister token LUNA with it. Around 40 billion dollars of value disappeared across the two tokens."],
      ["March 2023", "USD Coin (USDC)", "Circle disclosed 3.3 billion dollars of reserves held at Silicon Valley Bank when the bank failed. USDC traded well below one dollar over a weekend, then recovered once US authorities guaranteed the bank's deposits."],
    ],
    accessTitle: "Access, custody and tokenisation",
    access: [
      ["Spot ETFs in the United States", "The SEC approved eleven spot bitcoin ETFs on 10 January 2024, after Grayscale won its court case against the regulator; spot ether ETFs followed, trading from 23 July 2024. Each fund holds the coins with a custodian, mostly Coinbase Custody, and issues shares on the stock exchange. Fees run from about 0.15% to 0.25% a year for most funds, against 1.5% for Grayscale's converted GBTC. In-kind creations and redemptions were allowed from July 2025, and generic listing standards adopted in September 2025 opened the way to funds on other assets such as Solana or XRP, some of them staking part of their holdings."],
      ["ETPs in Europe", "UCITS funds cannot hold crypto directly, so European exposure comes through exchange-traded notes or ETCs listed on Xetra, Euronext, SIX or the LSE (21Shares, CoinShares, WisdomTree, Bitwise, iShares). Legally they are debt securities issued by a special-purpose vehicle, fully backed by coins held with a custodian and pledged to a trustee: check the issuer, the custodian, the fees and whether physical redemption is possible. In the United Kingdom, retail investors may buy crypto ETNs again since 8 October 2025."],
      ["Other ways in, other risks", "Futures ETFs, such as BITO in October 2021, hold CME contracts and lose part of the return to the cost of rolling them. Closed-end trusts can trade far from their net asset value: GBTC stood at a discount of almost 50% at the end of 2022. Shares of miners or companies that hoard bitcoin add operating, leverage and dilution risk on top of the coin itself. None of them is equivalent to owning the asset."],
      ["Custody", "Self-custody means keeping the private key, ideally offline on a hardware wallet, with the recovery phrase stored safely; multisignature or MPC set-ups split control so that one lost or stolen key is not fatal. Holding at a platform replaces that operational risk with counterparty risk: client assets often sit in omnibus wallets, and proof of reserves only shows a snapshot of assets, not the liabilities. FTX in November 2022 mixed client funds with its own trading. Under MiCA, providers must segregate client crypto from their own and are liable for losses they cause."],
      ["DeFi and staking", "Lending, exchange and derivatives run as smart contracts on public blockchains: liquidity is open and composable, with no intermediary holding the funds. The risks are code exploits, faulty price oracles, governance capture and liquidation cascades. Staking locks coins to secure a proof of stake network in exchange for a yield, about 3% a year on Ethereum, at the cost of lock-up periods, slashing and, through liquid staking tokens, a further layer of smart contract risk."],
      ["Tokenisation of real assets", "Funds and securities issued or recorded as tokens on a blockchain. Franklin Templeton launched the first US registered fund using a public blockchain in 2021; BlackRock's BUIDL money market fund, launched in March 2024, became the largest tokenised treasury fund. Tokenised treasuries reached several billion dollars in 2025 and serve as collateral and on-chain cash. Tokenised shares sold to European investors since 2025 usually track a stock without giving voting rights. The EU's DLT Pilot Regime has allowed trading and settlement infrastructures on blockchains since March 2023."],
    ],
    rulesTitle: "Rules",
    rules: [
      ["European Union: MiCA", "The Markets in Crypto-Assets Regulation applies to stablecoins since June 2024 and to service providers since December 2024. Issuers of e-money tokens need a licence and full reserves; providers need authorisation, with a passport across the EU and transitional periods by country."],
      ["United States", "Spot crypto trading falls mostly outside securities law; the SEC and CFTC share oversight depending on the asset. In July 2025 the GENIUS Act created a federal framework for payment stablecoins, with reserve and redemption requirements."],
      ["Tax", "Treatment differs by country: capital gains, income for staking rewards, or professional income for frequent traders. Records of cost basis per transaction are essential."],
    ],
    mythsTitle: "Myths and facts",
    myths: [
      ["\"Crypto is anonymous.\"", "Public blockchains are pseudonymous: every transaction is visible forever. Analytics firms link addresses to identities, and regulated platforms apply KYC and the travel rule."],
      ["\"A stablecoin cannot lose value.\"", "UST went to near zero and USDC lost its peg for days. The peg depends on reserves, redemption rights and confidence."],
      ["\"Bitcoin is a hedge against equities.\"", "Its correlation with growth stocks has been positive in several stress periods, notably 2022. Its behaviour as a diversifier is unstable."],
      ["\"An ETF and holding the coin are the same.\"", "The ETF removes key management and adds fees, market hours and the issuer's custody chain. You hold a claim on the fund, not the coin."],
    ],
    readTitle: "Further reading",
    reading: [
      ["Bitcoin: A Peer-to-Peer Electronic Cash System", "Satoshi Nakamoto, 2008", "https://bitcoin.org/bitcoin.pdf"],
      ["Ethereum white paper", "Vitalik Buterin, 2014", "https://ethereum.org/en/whitepaper/"],
      ["Regulation (EU) 2023/1114 on markets in crypto-assets (MiCA)", "Official Journal of the EU, 2023", "https://eur-lex.europa.eu/eli/reg/2023/1114/oj"],
      ["The Bitcoin Standard", "Saifedean Ammous, 2018", "https://www.google.com/search?tbm=bks&q=The+Bitcoin+Standard+Ammous"],
      ["Mastering Bitcoin", "Andreas M. Antonopoulos, 2014", "https://www.google.com/search?tbm=bks&q=Mastering+Bitcoin+Antonopoulos"],
      ["The Infinite Machine", "Camila Russo, 2020", "https://www.google.com/search?tbm=bks&q=The+Infinite+Machine+Camila+Russo"],
    ],
  },
  fr: {
    kicker: "Actifs numériques",
    title: "Blockchain, crypto-actifs et stablecoins",
    lead: "Comment se règle une transaction sur un registre public, ce qui garantit un stablecoin, comment la classe d'actifs est régulée et accessible, et où en est le marché.",
    nav: ["Règlement", "Marché", "Consensus", "Stablecoins", "Accès", "Règles", "Idées reçues", "Lectures"],
    flowTitle: "Le règlement d'une transaction",
    flowLead: "Pas de chambre de compensation ni de registre central : le réseau ordonne lui-même les transactions et les rend définitives.",
    flow: [
      ["Transaction signée", "Le détenteur signe avec sa clé privée ; la clé est l'actif."],
      ["Mempool", "Les transactions en attente patientent ; les frais fixent la priorité."],
      ["Producteur de bloc", "Un mineur ou un validateur choisit et ordonne les transactions."],
      ["Bloc", "Chaque bloc référence le précédent par son empreinte."],
      ["Finalité", "Après assez de confirmations, revenir en arrière devient impraticable."],
    ],
    marketTitle: "Où en est le marché",
    consTitle: "Preuve de travail et preuve d'enjeu",
    cons: [
      ["Preuve de travail", "Bitcoin", "Les mineurs dépensent de l'énergie pour trouver une empreinte de bloc valide. La sécurité vient du coût de la puissance de calcul : réécrire l'historique impose de dépasser le réseau honnête. Le règlement est probabiliste ; six confirmations, environ une heure, sont un seuil courant."],
      ["Preuve d'enjeu", "Ethereum depuis septembre 2022", "Les validateurs immobilisent du capital en garantie et sont tirés au sort pour proposer et attester les blocs. Une faute est sanctionnée par la perte d'une partie de l'enjeu. Ethereum atteint la finalité économique après deux époques, environ 13 minutes. La consommation d'énergie a baissé de plus de 99 % au passage."],
    ],
    stTitle: "Stablecoins",
    stLead: "Un jeton conçu pour garder une valeur fixe, le plus souvent un dollar. L'ancrage ne vaut que ce qui le garantit et le droit au remboursement.",
    stTypes: [
      ["Adossés à de la monnaie", "Réserves en liquidités et bons du Trésor courts détenues par l'émetteur. Remboursement au pair pour les clients éligibles. Risque : qualité, garde et transparence des réserves.", "USDT, USDC"],
      ["Garantis par des crypto", "Positions surcollatéralisées en autres crypto-actifs, liquidées automatiquement quand la garantie baisse. Risque : krach du collatéral et liquidations en cascade.", "DAI, USDS"],
      ["Algorithmiques", "L'offre s'ajuste par des incitations, souvent contre un jeton jumeau, sans réserves complètes. Risque : une perte de confiance s'auto-entretient.", "UST (effondré)"],
    ],
    depegTitle: "Deux décrochages à connaître",
    depegs: [
      ["Mai 2022", "TerraUSD (UST)", "Le stablecoin algorithmique a perdu son ancrage et est tombé près de zéro en quelques jours, entraînant son jeton jumeau LUNA. Environ 40 milliards de dollars de valeur ont disparu sur les deux jetons."],
      ["Mars 2023", "USD Coin (USDC)", "Circle a révélé 3,3 milliards de dollars de réserves déposées chez Silicon Valley Bank au moment de sa faillite. L'USDC s'est échangé nettement sous un dollar pendant un week-end, puis s'est rétabli quand les autorités américaines ont garanti les dépôts de la banque."],
    ],
    accessTitle: "Accès, garde et tokenisation",
    access: [
      ["ETF au comptant aux États-Unis", "La SEC a autorisé onze ETF bitcoin au comptant le 10 janvier 2024, après la victoire judiciaire de Grayscale contre le régulateur ; les ETF ether au comptant ont suivi, cotés depuis le 23 juillet 2024. Chaque fonds détient les crypto chez un dépositaire, le plus souvent Coinbase Custody, et émet des parts en bourse. Les frais vont d'environ 0,15 % à 0,25 % par an pour la plupart des fonds, contre 1,5 % pour le GBTC converti de Grayscale. Les créations et rachats en nature sont autorisés depuis juillet 2025, et des normes de cotation génériques adoptées en septembre 2025 ont ouvert la voie à des fonds sur d'autres actifs comme Solana ou XRP, dont certains placent une partie de leurs avoirs en staking."],
      ["ETP en Europe", "Les fonds UCITS ne peuvent pas détenir de crypto directement : l'exposition européenne passe par des ETN ou ETC cotés sur Xetra, Euronext, SIX ou la Bourse de Londres (21Shares, CoinShares, WisdomTree, Bitwise, iShares). Juridiquement, ce sont des titres de créance émis par une entité ad hoc, adossés intégralement à des crypto conservées chez un dépositaire et nanties au profit d'un trustee : vérifier l'émetteur, le dépositaire, les frais et la possibilité de rachat physique. Au Royaume-Uni, les particuliers peuvent de nouveau acheter des ETN crypto depuis le 8 octobre 2025."],
      ["Autres accès, autres risques", "Les ETF sur contrats à terme, comme BITO en octobre 2021, détiennent des contrats du CME et perdent une partie du rendement dans le coût de leur renouvellement. Les fonds fermés peuvent s'écarter fortement de leur valeur liquidative : le GBTC affichait une décote proche de 50 % fin 2022. Les actions de mineurs ou de sociétés qui accumulent du bitcoin ajoutent un risque d'exploitation, de levier et de dilution à celui de l'actif. Aucun de ces véhicules n'équivaut à détenir la crypto."],
      ["Garde", "L'auto-garde consiste à conserver soi-même la clé privée, idéalement hors ligne sur un portefeuille matériel, avec la phrase de récupération rangée en lieu sûr ; les montages multisignature ou MPC répartissent le contrôle pour qu'une clé perdue ou volée ne soit pas fatale. Confier ses avoirs à une plateforme remplace ce risque opérationnel par un risque de contrepartie : les avoirs des clients sont souvent regroupés dans des portefeuilles communs, et la preuve de réserves ne montre qu'une photo des actifs, pas des dettes. FTX, en novembre 2022, mélangeait les fonds de ses clients avec son propre négoce. Sous MiCA, les prestataires doivent séparer les crypto des clients des leurs et répondent des pertes qu'ils causent."],
      ["DeFi et staking", "Prêt, échange et dérivés fonctionnent sous forme de contrats intelligents sur des blockchains publiques : la liquidité est ouverte et combinable, sans intermédiaire qui détient les fonds. Les risques sont les failles de code, les oracles de prix défaillants, la capture de la gouvernance et les liquidations en cascade. Le staking immobilise des jetons pour sécuriser un réseau en preuve d'enjeu contre un rendement, environ 3 % par an sur Ethereum, au prix de périodes de blocage, de sanctions possibles et, avec les jetons de staking liquide, d'une couche supplémentaire de risque de contrat."],
      ["Tokenisation d'actifs réels", "Des fonds et des titres émis ou inscrits sous forme de jetons sur une blockchain. Franklin Templeton a lancé en 2021 le premier fonds enregistré aux États-Unis utilisant une blockchain publique ; le fonds monétaire BUIDL de BlackRock, lancé en mars 2024, est devenu le plus grand fonds de bons du Trésor tokenisés. Ces bons tokenisés ont atteint plusieurs milliards de dollars en 2025 et servent de garantie et de liquidités sur la chaîne. Les actions tokenisées proposées aux investisseurs européens depuis 2025 répliquent le plus souvent un cours sans donner de droit de vote. Le régime pilote européen DLT autorise depuis mars 2023 des infrastructures de négociation et de règlement sur blockchain."],
    ],
    rulesTitle: "Règles",
    rules: [
      ["Union européenne : MiCA", "Le règlement sur les marchés de crypto-actifs s'applique aux stablecoins depuis juin 2024 et aux prestataires depuis décembre 2024. Les émetteurs de jetons de monnaie électronique doivent être agréés et détenir des réserves complètes ; les prestataires doivent être autorisés, avec un passeport européen et des périodes transitoires selon les pays."],
      ["États-Unis", "Le négoce de crypto au comptant échappe en grande partie au droit des valeurs mobilières ; la SEC et la CFTC se partagent la surveillance selon l'actif. En juillet 2025, le GENIUS Act a créé un cadre fédéral pour les stablecoins de paiement, avec des exigences de réserves et de remboursement."],
      ["Fiscalité", "Le traitement diffère selon les pays : plus-values, revenus pour les récompenses de staking, revenus professionnels pour les opérations fréquentes. Un historique du prix de revient par transaction est indispensable."],
    ],
    mythsTitle: "Idées reçues",
    myths: [
      ["« Les crypto sont anonymes. »", "Les blockchains publiques sont pseudonymes : chaque transaction reste visible pour toujours. Des sociétés d'analyse relient les adresses à des identités, et les plateformes régulées appliquent le KYC et la règle du voyage."],
      ["« Un stablecoin ne peut pas perdre de valeur. »", "L'UST est tombé près de zéro et l'USDC a perdu son ancrage pendant plusieurs jours. L'ancrage dépend des réserves, du droit au remboursement et de la confiance."],
      ["« Le bitcoin protège contre la baisse des actions. »", "Sa corrélation avec les valeurs de croissance a été positive dans plusieurs périodes de stress, notamment en 2022. Son rôle de diversifiant est instable."],
      ["« Un ETF et détenir la crypto, c'est pareil. »", "L'ETF supprime la gestion des clés et ajoute des frais, des heures de cotation et la chaîne de garde de l'émetteur. Vous détenez une part du fonds, pas la crypto."],
    ],
    readTitle: "Pour aller plus loin",
    reading: [
      ["Bitcoin: A Peer-to-Peer Electronic Cash System", "Satoshi Nakamoto, 2008", "https://bitcoin.org/bitcoin.pdf"],
      ["Livre blanc d'Ethereum", "Vitalik Buterin, 2014", "https://ethereum.org/fr/whitepaper/"],
      ["Règlement (UE) 2023/1114 sur les marchés de crypto-actifs (MiCA)", "Journal officiel de l'UE, 2023", "https://eur-lex.europa.eu/eli/reg/2023/1114/oj?locale=fr"],
      ["The Bitcoin Standard", "Saifedean Ammous, 2018", "https://www.google.com/search?tbm=bks&q=The+Bitcoin+Standard+Ammous"],
      ["Mastering Bitcoin", "Andreas M. Antonopoulos, 2014", "https://www.google.com/search?tbm=bks&q=Mastering+Bitcoin+Antonopoulos"],
      ["The Infinite Machine", "Camila Russo, 2020", "https://www.google.com/search?tbm=bks&q=The+Infinite+Machine+Camila+Russo"],
    ],
  },
};
type Labels = typeof T.en;

/** Section heading with the site's underline. */
function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28">
      <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="text-[24px] md:text-[30px] font-semibold tracking-tight text-slate-900">{children}</motion.h2>
      <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} style={{ transformOrigin: "left" }}
        className="block mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]" />
    </div>
  );
}

/** Animated chain: five settlement stages linked left to right, with a block sliding along. */
function Chain({ t }: { t: Labels }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 1000 40" className="absolute left-0 right-0 top-[34px] w-full h-10 hidden md:block" preserveAspectRatio="none" aria-hidden>
        <motion.line x1="100" y1="20" x2="900" y2="20" stroke="rgba(169,200,234,0.35)" strokeWidth="2" strokeDasharray="6 6"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6 }} />
        <motion.rect y="12" width="16" height="16" rx="3" fill="#E2B84F" initial={{ x: 92, opacity: 0 }} whileInView={{ x: [92, 892], opacity: [0, 1, 1, 0] }} viewport={{ once: true }}
          transition={{ duration: 4, delay: 1.2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }} />
      </svg>
      <div className="relative grid grid-cols-2 md:grid-cols-5 gap-4">
        {t.flow.map(([h, d], i) => (
          <motion.div key={h} initial={{ opacity: 0, y: 24, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.25 + i * 0.22 }} className="text-center">
            <span className={cn("mx-auto flex w-[68px] h-[68px] items-center justify-center rounded-2xl text-[22px] font-semibold shadow-[0_14px_30px_-18px_rgba(0,0,0,0.7)]",
              i === 4 ? "bg-[#E2B84F] text-[#06111A]" : i === 3 ? "bg-[#38BDF8] text-[#06111A]" : "bg-white text-[#0C2233]")}>{i + 1}</span>
            <span className="mt-3 block text-[15px] font-semibold text-white">{h}</span>
            <span className="mt-1 block text-[12.5px] leading-snug text-white/65">{d}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CryptoMarkets() {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const t: Labels = T[lang];
  const ids = ["settlement", "market", "consensus", "stablecoins", "access", "rules", "myths", "reading"];
  const [open, setOpen] = useState<number | null>(0);
  const [active, setActive] = useState("settlement");

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <div className="w-full font-sans pb-24 -mt-4 lg:-mt-6">
      {/* ── Header with the settlement chain ── */}
      <div className="w-full" style={NAVY}>
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-12">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#A9C8EA]">{t.kicker}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-2 text-[28px] md:text-[38px] font-semibold tracking-tight !text-white">{t.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }} className="mt-3 max-w-3xl text-[16px] md:text-[19px] leading-relaxed text-white/75">{t.lead}</motion.p>
          <div id="settlement" className="scroll-mt-28 mt-10">
            <h2 className="text-[18px] md:text-[20px] font-semibold !text-white">{t.flowTitle}</h2>
            <p className="mt-1 text-[14px] md:text-[15px] text-white/65 max-w-3xl">{t.flowLead}</p>
            <div className="mt-8"><Chain t={t} /></div>
          </div>
        </div>
      </div>

      {/* ── In-page navigation ── */}
      <nav className="sticky top-16 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 flex gap-1 overflow-x-auto no-scrollbar py-2">
          {t.nav.map((label, i) => (
            <a key={ids[i]} href={`#${ids[i]}`} className={cn("shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors", active === ids[i] ? "bg-[#0C2233] text-white" : "text-slate-600 hover:text-slate-900")}>{label}</a>
          ))}
        </div>
      </nav>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* ── Market ── */}
        <section className="mt-14">
          <H id="market">{t.marketTitle}</H>
          <CryptoData lang={lang} part="markets" />
        </section>

        {/* ── Consensus ── */}
        <section className="mt-16">
          <H id="consensus">{t.consTitle}</H>
          <div className="mt-7 grid lg:grid-cols-2 gap-5">
            {t.cons.map(([h, sub, d], i) => (
              <motion.div key={h} initial={{ opacity: 0, x: i ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }} className={cn(CARD, "p-6 relative overflow-hidden")}>
                <span className={cn("absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-[0.12]", i ? "bg-[#38BDF8]" : "bg-[#E2B84F]")} />
                <h3 className="text-[18px] font-semibold text-slate-900">{h}</h3>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#1D6FA8]">{sub}</p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Stablecoins ── */}
        <section className="mt-16">
          <H id="stablecoins">{t.stTitle}</H>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-600">{t.stLead}</p>
          <motion.div className="mt-7 grid md:grid-cols-3 gap-5" initial="h" whileInView="s" viewport={{ once: true, margin: "-60px" }} variants={{ h: {}, s: { transition: { staggerChildren: 0.18 } } }}>
            {t.stTypes.map(([h, d, ex], i) => (
              <motion.div key={h} variants={{ h: { opacity: 0, y: 26 }, s: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }} className={cn(CARD, "p-6")}>
                <span className="block h-1.5 w-12 rounded-full" style={{ background: ["#1D6FA8", "#38BDF8", "#E2B84F"][i] }} />
                <h3 className="mt-4 text-[17px] font-semibold text-slate-900">{h}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
                <p className="mt-3 text-[12.5px] font-semibold text-[#1B3F72]">{ex}</p>
              </motion.div>
            ))}
          </motion.div>
          <CryptoData lang={lang} part="stables" />
          <h3 className="mt-10 text-[18px] font-semibold text-slate-900">{t.depegTitle}</h3>
          <div className="mt-4 grid md:grid-cols-2 gap-5">
            {t.depegs.map(([when, who, d], i) => (
              <motion.div key={who} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.12 }} className={cn(CARD, "p-6")}>
                <span className="block h-1.5 w-12 rounded-full bg-[#9F1239]/70 mb-4" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9F1239]">{when}</span>
                <h4 className="mt-1 text-[17px] font-semibold text-slate-900">{who}</h4>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Access ── */}
        <section className="mt-16">
          <H id="access">{t.accessTitle}</H>
          <motion.div className="mt-7 grid md:grid-cols-2 xl:grid-cols-3 gap-5" initial="h" whileInView="s" viewport={{ once: true, margin: "-60px" }} variants={{ h: {}, s: { transition: { staggerChildren: 0.15 } } }}>
            {t.access.map(([h, d]) => (
              <motion.div key={h} variants={{ h: { opacity: 0, scale: 0.94 }, s: { opacity: 1, scale: 1, transition: { duration: 0.55 } } }} className={cn(CARD, "p-6 hover:-translate-y-1 transition-transform")}>
                <h3 className="text-[17px] font-semibold text-[#1B3F72]">{h}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Rules ── */}
        <section className="mt-16">
          <H id="rules">{t.rulesTitle}</H>
          <div className="mt-7 grid lg:grid-cols-3 gap-5">
            {t.rules.map(([h, d]) => (
              <div key={h} className={cn(CARD, "p-6")}>
                <h3 className="text-[17px] font-semibold text-slate-900">{h}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Myths ── */}
        <section className="mt-16">
          <H id="myths">{t.mythsTitle}</H>
          <div className={cn(CARD, "mt-7 p-2 sm:p-3")}>
            {t.myths.map(([q, a], i) => (
              <div key={q} className={cn("rounded-2xl transition-colors", open === i && "bg-[#F3F7FC]")}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left text-[15px] font-semibold text-slate-900">
                  {q} <ChevronDown size={16} className={cn("shrink-0 text-slate-400 transition-transform", open === i && "rotate-180 text-[#1B3F72]")} />
                </button>
                {open === i && <p className="px-4 pb-4 text-[14.5px] leading-relaxed text-slate-600">{a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ── Reading ── */}
        <section className="mt-16">
          <H id="reading">{t.readTitle}</H>
          <div className={cn(CARD, "mt-7 p-3 sm:p-4 grid md:grid-cols-2 gap-x-6")}>
            {t.reading.map(([title, by, url]) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-3 px-2 py-3 rounded-xl hover:bg-slate-50">
                <span><b className="block text-[14.5px] text-slate-900 group-hover:text-[#1B3F72]">{title}</b><span className="text-[12.5px] text-slate-500">{by}</span></span>
                <ExternalLink size={14} className="shrink-0 mt-1 text-slate-400" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-[12px] text-slate-500">{lang === "fr" ? "Contenu à vocation informative. Les crypto-actifs sont très volatils et peuvent perdre toute leur valeur." : "For information only. Crypto assets are highly volatile and can lose all of their value."}</p>
        </section>
      </div>
    </div>
  );
}
