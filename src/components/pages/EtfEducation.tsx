import React from "react";
import { Globe, MapPin, Briefcase, Sparkles, Leaf, Shield, PiggyBank, Search, AlertCircle } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";

const eduLabels: Record<string, Record<string, any>> = {
  en: {
    introTitle: "Introduction to ETFs",
    introP1: "An ETF (Exchange Traded Fund) is a basket of securities (stocks, bonds, etc.) that replicates the performance of a benchmark index. In practical terms, when you buy an ETF, you are simultaneously investing in all the companies that make up that index, in a single transaction.",
    bullet1Title: "Simple Diversification:",
    bullet1Text: "Immediate access to hundreds or thousands of companies.",
    bullet2Title: "Low Costs:",
    bullet2Text: "Management fees are generally much lower than traditional investment funds.",
    bullet3Title: "Transparency:",
    bullet3Text: "You know exactly what the tracked index contains.",
    bullet4Title: "Traded on Exchange:",
    bullet4Text: "They are bought and sold easily like a traditional stock, throughout the trading day.",
    universeTitle: "Understanding the ETF Universe by Category",
    examplesLabel: "ETF Examples (Market Selected)",
    
    cat1Title: "Equities by Geographic Area",
    cat1Desc: "This category groups together major global markets (North America, Europe, Asia-Pacific, Emerging Markets, World). It allows for macro-economic investing by betting on the growth of entire geographic blocks. The investor finds maximum diversification but is exposed to global market risk and currency risk if the index includes foreign currencies.",
    
    cat2Title: "Equities by Country",
    cat2Desc: "Here, the objective is to target the economic performance of a specific country (USA, France, Japan, Germany, etc.). This allows for overweighting a dynamic or familiar economy. The main risk is concentration (country risk): if the targeted country suffers a political or economic crisis, the ETF will be heavily impacted.",
    
    cat3Title: "Equities by Sector",
    cat3Desc: "These ETFs target a particular field of activity (Technology, Health, Energy, Financial Services, Automobile...). The investor can thus expose themselves to sectors they judge promising for the future. The inherent risk is sector risk: any regulatory change or technological crisis specifically affecting this industry will lower the ETF, regardless of other markets.",
    
    cat4Title: "Equities by Management Style",
    cat4Desc: "This category segments the market according to financial criteria: Growth (companies that develop fast), Dividends (companies that redistribute cash), Large Cap (big capitalizations), Small Cap (small companies), or Low Volatility. The investor can adapt the ETF to their horizon and risk tolerance.",
    
    cat5Title: "ESG / Social & Sustainable Equities",
    cat5Desc: "ESG ETFs filter components of a traditional index to only retain companies respecting Environmental, Social, and Governance criteria. It is ideal for investing ethically or aligned with climate targets.",
    
    cat6Title: "Thematic Equities",
    cat6Desc: "They isolate long-term structural trends (Innovation, Aging, Robotics, Cybersecurity, Transition Metals...). These are targeted bets on the future. Yield potential is high, but so is volatility.",
    
    cat7Title: "Renewable Energy & Climate Themes",
    cat7Desc: "A specific branch for global ecological issues (green economy, solar, wind, climate change). These ETFs are for those betting on the energy transition.",
    
    cat8Title: "Bond ETFs",
    cat8Desc: "These ETFs do not invest in stocks but in debts (government bonds from safe or emerging countries, Corporate bonds). Bonds generally serve as a classic buffer in a stock portfolio.",
    
    cat9Title: "Commodities & Precious Metals",
    cat9Desc: "These funds allow for replicating the physical price of a commodity (such as Gold, Silver, or an agricultural/oil basket). They offer protection against inflation.",

    mechanicsTitle: "Understanding ETF Mechanics",
    mech1Title: "Replication: Physical vs. Synthetic",
    mech1Desc: "Physical replication means the ETF actually buys all of the index's shares. Synthetic replication uses swap contracts with a bank to exchange index performance, often giving access to difficult markets or lowering costs.",
    mech2Title: "Distribution vs. Accumulation",
    mech2Desc: "A Distributing (Dist) ETF regularly pays out received dividends to your account. An Accumulating (Acc) ETF automatically reinvests these dividends within the fund, increasing your share price.",
    mech3Title: "TER, Size, and Liquidity",
    mech3Desc: "The TER (Total Expense Ratio) represents annual management fees (0.05% to 0.60%). Fund Size (> €100M) and daily volume ensure high liquidity.",
    mech4Title: "Currency and Exchange Risk",
    mech4Desc: "The currency of the underlying stocks matters most. If investing internationally, you can choose 'Hedged' ETFs to eliminate currency fluctuation risks.",

    checklistTitle: "Checklist: How to Choose Your ETF?",
    chk1Title: "Category / Targeted Area: ",
    chk1Desc: "Does the index correspond well to the geography or sector you wish to target?",
    chk2Title: "Fees (TER): ",
    chk2Desc: "Look for the lowest fees possible (ideally under 0.30% for a core portfolio ETF).",
    chk3Title: "Replication Mode: ",
    chk3Desc: "Do you prefer physically owning the securities or do you accept a synthetic contract?",
    chk4Title: "Dividend Policy: ",
    chk4Desc: "Accumulating (Acc) to grow capital long-term, or Distributing (Dist) for regular income.",
    chk5Title: "Fund Size: ",
    chk5Desc: "Prioritize ETFs with over €100M AUM to ensure high liquidity and lower closure risk.",
    chk6Title: "Exchange Risk: ",
    chk6Desc: "Check if the ETF is hedged if you invest outside your local currency zone.",

    conclusion: "ETFs are simple, low-cost, and transparent tools that democratize investment to build balanced wealth. By mastering their specificities (geography, fees, accumulation), investors can effectively expose themselves in a single transaction to global stock markets."
  },
  fr: {
    introTitle: "Introduction aux ETF",
    introP1: "Un ETF (Exchange Traded Fund ou fonds coté en bourse) est un panier de valeurs mobilières (actions, obligations, etc.) qui réplique la performance d'un indice boursier de référence. Concrètement, lorsque vous achetez un ETF, vous investissez simultanément dans toutes les entreprises composant cet indice en une seule transaction.",
    bullet1Title: "Diversification simple :",
    bullet1Text: "Accès immédiat à des centaines ou des milliers d'entreprises.",
    bullet2Title: "Frais réduits :",
    bullet2Text: "Les frais de gestion sont généralement bien plus bas que ceux des fonds traditionnels.",
    bullet3Title: "Transparence :",
    bullet3Text: "Vous savez exactement ce que contient l'indice répliqué.",
    bullet4Title: "Coté en bourse :",
    bullet4Text: "Il s'achète et se vend aussi facilement qu'une action classique tout au long de la journée.",
    universeTitle: "Comprendre l'univers des ETF par catégorie",
    examplesLabel: "Exemples d'ETF (Tirés du marché)",

    cat1Title: "Actions par zone géographique",
    cat1Desc: "Cette catégorie regroupe les grands marchés mondiaux (Amérique du Nord, Europe, Asie-Pacifique, Marchés Émergents, Monde). Elle permet d'investir de façon macro-économique en pariant sur la croissance de blocs géographiques. L'investisseur bénéficie d'une diversification maximale.",
    
    cat2Title: "Actions par pays",
    cat2Desc: "L'objectif est ici de cibler la performance économique d'un pays spécifique (USA, France, Japon, Allemagne...). Cela permet de surpondérer une économie dynamique ou familière.",
    
    cat3Title: "Actions par secteur",
    cat3Desc: "Ces ETF ciblent un domaine d'activité particulier (Technologie, Santé, Énergie, Services Financiers, Automobile...). L'investisseur s'expose aux secteurs qu'il juge prometteurs pour l'avenir.",
    
    cat4Title: "Actions par style de gestion",
    cat4Desc: "Cette catégorie segmente le marché selon des critères financiers : Croissance (Growth), Dividendes, Grandes Capitalisations (Large Cap), Petites Capitalisations (Small Cap) ou Faible Volatilité.",
    
    cat5Title: "Actions ESG / Sociales & Durables",
    cat5Desc: "Les ETF ESG filtrent les composantes d'un indice traditionnel pour ne conserver que les entreprises respectant des critères Environnementaux, Sociaux et de Gouvernance.",
    
    cat6Title: "Actions thématiques",
    cat6Desc: "Elles isolent des tendances structurelles à long terme (Innovation, Vieillissement, Robotique, Cybersécurité...). Ce sont des paris ciblés sur l'avenir.",
    
    cat7Title: "Thématiques Énergies Renouvelables & Climat",
    cat7Desc: "Branche spécifique axée sur les enjeux écologiques mondiaux (économie verte, solaire, éolien, transition climatique).",
    
    cat8Title: "ETF Obligataires",
    cat8Desc: "Ces ETF n'investissent pas dans des actions mais dans des créances (dettes d'États sûrs ou émergents, obligations d'entreprises). Les obligations servent de coussin amortisseur.",
    
    cat9Title: "Matières Premières & Métaux Précieux",
    cat9Desc: "Ces fonds permettent de répliquer le cours d'une matière première (Or, Argent, pétrole). Ils offrent une protection contre l'inflation.",

    mechanicsTitle: "Comprendre la mécanique d'un ETF",
    mech1Title: "Réplication : Physique vs Synthétique",
    mech1Desc: "La réplication physique signifie que l'ETF achète réellement les actions de l'indice. La réplication synthétique utilise des contrats de swap avec une banque pour échanger la performance.",
    mech2Title: "Distribution vs Accumulation",
    mech2Desc: "Un ETF Distribuant (Dist) vous verse régulièrement les dividendes perçus. Un ETF Capitalisant (Acc) réinvestit automatiquement les dividendes dans le fonds.",
    mech3Title: "TER, Taille et Liquidité",
    mech3Desc: "Le TER (frais de gestion annuels) se situe généralement entre 0,05% et 0,60%. Une taille de fonds (> 100M€) garantit une excellente liquidité.",
    mech4Title: "Risque de change",
    mech4Desc: "La devise des actions sous-jacentes est primordiale. En cas d'investissement international, des ETF 'Hedged' (couverts contre le risque de change) existent.",

    checklistTitle: "Check-list : Comment choisir son ETF ?",
    chk1Title: "Catégorie / Zone ciblée : ",
    chk1Desc: "L'indice correspond-il bien à la géographie ou au secteur souhaité ?",
    chk2Title: "Frais (TER) : ",
    chk2Desc: "Recherchez les frais les plus bas possibles (idéalement sous 0,30% pour un fonds de portefeuille cœur).",
    chk3Title: "Mode de réplication : ",
    chk3Desc: "Préférez-vous détenir physiquement les titres ou acceptez-vous une réplication synthétique ?",
    chk4Title: "Politique de dividendes : ",
    chk4Desc: "Capitalisant (Acc) pour faire fructifier son capital ou Distribuant (Dist) pour percevoir des revenus.",
    chk5Title: "Taille du fonds : ",
    chk5Desc: "Privilégiez les ETF dépassant 100 millions d'euros sous gestion pour garantir la liquidité.",
    chk6Title: "Risque de change : ",
    chk6Desc: "Vérifiez si l'ETF est couvert (hedged) si vous investissez hors de la zone euro.",

    conclusion: "Les ETF sont des outils simples, peu coûteux et transparents qui démocratisent l'investissement pour bâtir un patrimoine équilibré. En maîtrisant leurs spécificités, l'investisseur s'expose efficacement à l'ensemble du marché mondial."
  },
  de: {
    introTitle: "Einführung in ETFs",
    introP1: "Ein ETF (Exchange Traded Fund) ist ein Korb von Wertpapieren (Aktien, Anleihen etc.), der die Wertentwicklung eines Benchmark-Index nachbildet. Wenn Sie einen ETF kaufen, investieren Sie gleichzeitig in alle im Index enthaltenen Unternehmen.",
    bullet1Title: "Einfache Diversifikation:",
    bullet1Text: "Sofortiger Zugang zu Hunderten oder Tausenden von Unternehmen.",
    bullet2Title: "Niedrige Kosten:",
    bullet2Text: "Verwaltungsgebühren sind meist deutlich geringer als bei traditionellen Fonds.",
    bullet3Title: "Transparenz:",
    bullet3Text: "Sie wissen genau, was im abgebildeten Index enthalten ist.",
    bullet4Title: "Börsengehandelt:",
    bullet4Text: "Kauf und Verkauf erfolgen einfach wie bei einer einzelnen Aktie über den Handelstag.",
    universeTitle: "Das ETF-Universum nach Kategorien verstehen",
    examplesLabel: "ETF-Beispiele (Marktauswahl)",

    cat1Title: "Aktien nach Regionen",
    cat1Desc: "Fasst große globale Märkte zusammen (Nordamerika, Europa, Asien-Pazifik, Schwellenländer, Welt) für makroökonomische Diversifikation.",
    cat2Title: "Aktien nach Ländern",
    cat2Desc: "Zielt gezielt auf die Wirtschaftsleistung einzelner Länder (USA, Deutschland, Japan etc.) ab.",
    cat3Title: "Aktien nach Sektoren",
    cat3Desc: "Investition in spezifische Branchen wie Technologie, Gesundheit, Energie oder Finanzdienstleistungen.",
    cat4Title: "Aktien nach Anlagestil",
    cat4Desc: "Segmentierung nach Finanzkriterien: Growth, Dividende, Large Cap, Small Cap oder Low Volatility.",
    cat5Title: "ESG / Nachhaltige Aktien",
    cat5Desc: "Filtert Indizes nach Umwelt-, Sozial- und Unternehmensführungskriterien (ESG).",
    cat6Title: "Themen-Aktien",
    cat6Desc: "Fokus auf langfristige Trends wie Innovation, Robotik, Cybersicherheit oder Energiewende.",
    cat7Title: "Erneuerbare Energien & Klima",
    cat7Desc: "Spezifischer Zweig für grüne Wirtschaft, Solar, Windenergie und Klimaschutz.",
    cat8Title: "Anleihen-ETFs",
    cat8Desc: "Investition in Staats- oder Unternehmensanleihen als Stabilitätsanker im Portfolio.",
    cat9Title: "Rohstoffe & Edelmetalle",
    cat9Desc: "Abbildung von Gold, Silber oder Rohstoffkörben zum Schutz vor Inflation.",

    mechanicsTitle: "ETF-Funktionsweise verstehen",
    mech1Title: "Replizierung: Physisch vs. Synthetisch",
    mech1Desc: "Physische Replizierung kauft die echten Aktien des Index. Synthetische Replizierung nutzt Swaps mit Banken.",
    mech2Title: "Ausschüttend vs. Thesaurierend",
    mech2Desc: "Ausschüttende ETFs zahlen Dividenden aus. Thesaurierende ETFs reinvestieren Dividenden automatisch.",
    mech3Title: "TER, Größe und Liquidität",
    mech3Desc: "Die Gesamtkostenquote (TER) liegt meist zwischen 0,05% und 0,60%. Fondsgröße > 100 Mio. € sichert hohe Liquidität.",
    mech4Title: "Währungsrisiko",
    mech4Desc: "Wichtig ist die Währung der enthaltenen Aktien. Währungsgesicherte (Hedged) ETFs verhindern Wechselkursschwankungen.",

    checklistTitle: "Checkliste: Wie wählt man den passenden ETF?",
    chk1Title: "Kategorie / Zielregion: ",
    chk1Desc: "Passt der Index zu Ihrer gewünschten Geografie oder Branche?",
    chk2Title: "Gebühren (TER): ",
    chk2Desc: "Suchen Sie möglichst niedrige Gebühren (ideal unter 0,30% p.a.).",
    chk3Title: "Replizierungsmethode: ",
    chk3Desc: "Bevorzugen Sie physischen Wertpapierbesitz oder akzeptieren Sie Swaps?",
    chk4Title: "Ertragsverwendung: ",
    chk4Desc: "Thesaurierend (Acc) für langfristigen Vermögensaufbau oder Ausschüttend (Dist) für laufendes Einkommen.",
    chk5Title: "Fondsgröße: ",
    chk5Desc: "Bevorzugen Sie ETFs mit über 100 Mio. € Fondsvolumen.",
    chk6Title: "Währungsrisiko: ",
    chk6Desc: "Prüfen Sie Währungssicherungen bei Investitionen außerhalb Ihrer Heimatwährung.",

    conclusion: "ETFs sind einfache, kostengünstige und transparente Instrumente zum weltweiten Vermögensaufbau."
  },
  nl: {
    introTitle: "Inleiding tot ETF's",
    introP1: "Een ETF (Exchange Traded Fund of indextracker) is een mandje van effecten (aandelen, obligaties, enz.) dat de prestaties van een benchmarkindex volgt. Wanneer je een ETF koopt, investeer je in één transactie tegelijk in alle bedrijven uit die index.",
    bullet1Title: "Eenvoudige Diversificatie:",
    bullet1Text: "Directe toegang tot honderden of duizenden bedrijven.",
    bullet2Title: "Lage Kosten:",
    bullet2Text: "Beheerskosten zijn over het algemeen veel lager dan bij traditionele beleggingsfondsen.",
    bullet3Title: "Transparantie:",
    bullet3Text: "Je weet precies wat er in de gevolgde index zit.",
    bullet4Title: "Beursgenoteerd:",
    bullet4Text: "Eenvoudig te kopen en verkopen op de beurs gedurende de handelsdag.",
    universeTitle: "Het ETF-universum begrijpen per categorie",
    examplesLabel: "ETF-voorbeelden (Uit de markt)",

    cat1Title: "Aandelen per geografische regio",
    cat1Desc: "Groepeert grote wereldwijde markten (Noord-Amerika, Europa, Azië-Pacific, Opkomende Markten, Wereld) voor maximale diversificatie.",
    cat2Title: "Aandelen per land",
    cat2Desc: "Richt zich op de economische prestaties van specifieke landen (VS, Nederland, Japan, Duitsland).",
    cat3Title: "Aandelen per sector",
    cat3Desc: "Doelgericht beleggen in specifieke sectoren zoals Technologie, Gezondheidszorg of Energie.",
    cat4Title: "Aandelen per beheerstijl",
    cat4Desc: "Segmentatie op financiële criteria: Groei (Growth), Dividend, Large Cap, Small Cap of Lage Volatiliteit.",
    cat5Title: "ESG / Duurzame Aandelen",
    cat5Desc: "Filtert indices op basis van Milieu-, Sociale en Bestuurscriteria (ESG).",
    cat6Title: "Thematische Aandelen",
    cat6Desc: "Focus op langetermijntrends zoals Innovatie, Robotica, Cybersecurity en Energietransitie.",
    cat7Title: "Hernieuwbare Energie & Klimaat",
    cat7Desc: "Specifieke tak voor de groene economie, zonne-energie, windenergie en klimaatoplossingen.",
    cat8Title: "Obligatie-ETF's",
    cat8Desc: "Beleggen in staatsobligaties of bedrijfsobligaties als stabiele pijler in de portefeuille.",
    cat9Title: "Grondstoffen & Edelmetallen",
    cat9Desc: "Fysieke volgers van goud, zilver of grondstoffenmandjes ter bescherming tegen inflatie.",

    mechanicsTitle: "Werking van een ETF begrijpen",
    mech1Title: "Replicatie: Fysiek vs. Synthetisch",
    mech1Desc: "Fysieke replicatie koopt de daadwerkelijke aandelen. Synthetische replicatie gebruikt swapcontracten met een bank.",
    mech2Title: "Distributie vs. Accumulatie",
    mech2Desc: "Een Distribuerende (Dist) ETF keert dividend uit. Een Accumulerende (Acc) ETF herbelegt dividenden automatisch.",
    mech3Title: "TER, Omvang en Liquiditeit",
    mech3Desc: "De TER (jaarlijkse kosten) ligt meestal tussen 0,05% en 0,60%. Fondsomvang > €100M garandeert hoge liquiditeit.",
    mech4Title: "Valutarisico",
    mech4Desc: "De valuta van de onderliggende aandelen is doorslaggevend. Hedged ETF's elimineren valutaschommelingen.",

    checklistTitle: "Checklist: Hoe kies je de juiste ETF?",
    chk1Title: "Categorie / Doelregio: ",
    chk1Desc: "Sluit de index goed aan bij de gewenste geografie of sector?",
    chk2Title: "Kosten (TER): ",
    chk2Desc: "Zoek naar de laagst mogelijke kosten (idealiter onder 0,30% p.j.).",
    chk3Title: "Replicatiemethode: ",
    chk3Desc: "Verkies je fysiek eigendom van effecten of accepteer je een synthetisch contract?",
    chk4Title: "Dividendbeleid: ",
    chk4Desc: "Accumulerend (Acc) voor kapitaalgroei op lange termijn of Distribuerend (Dist) voor inkomen.",
    chk5Title: "Fondsomvang: ",
    chk5Desc: "Kies bij voorkeur ETF's met meer dan €100 miljoen aan beheerd vermogen.",
    chk6Title: "Valutarisico: ",
    chk6Desc: "Controleer of de ETF is afgedekt (hedged) bij beleggingen buiten je eigen valutazone.",

    conclusion: "ETF's zijn eenvoudige, voordelige en transparante instrumenten die beleggen democratiseren om een gebalanceerd vermogen op te bouwen."
  },
  es: {
    introTitle: "Introducción a los ETFs",
    introP1: "Un ETF (Exchange Traded Fund o fondo cotizado) es una cesta de valores (acciones, bonos, etc.) que replica el rendimiento de un índice de referencia. Al comprar un ETF, inviertes simultáneamente en todas las empresas que componen dicho índice.",
    bullet1Title: "Diversificación Sencilla:",
    bullet1Text: "Acceso inmediato a cientos o miles de empresas.",
    bullet2Title: "Bajos Costes:",
    bullet2Text: "Las comisiones de gestión son sensiblemente inferiores a las de los fondos tradicionales.",
    bullet3Title: "Transparencia:",
    bullet3Text: "Sabes exactamente qué valores componen el índice replicado.",
    bullet4Title: "Cotización en Bolsa:",
    bullet4Text: "Se compra y vende fácilmente como una acción ordinaria a lo largo de la jornada bursátil.",
    universeTitle: "Comprender el universo ETF por categorías",
    examplesLabel: "Ejemplos de ETFs (Selección de mercado)",

    cat1Title: "Renta Variable por Área Geográfica",
    cat1Desc: "Agrupa grandes mercados mundiales (Norteamérica, Europa, Asia-Pacífico, Mercados Emergentes, Global) para una máxima diversificación.",
    cat2Title: "Renta Variable por País",
    cat2Desc: "Se enfoca en el rendimiento económico de países específicos (EE. UU., España, Japón, Alemania).",
    cat3Title: "Renta Variable por Sector",
    cat3Desc: "Inversión temática en sectores concretos como Tecnología, Salud, Energía o Servicios Financieros.",
    cat4Title: "Renta Variable por Estilo",
    cat4Desc: "Segmentación según criterios financieros: Crecimiento (Growth), Dividendos, Alta/Baja Capitalización o Baja Volatilidad.",
    cat5Title: "Renta Variable ESG / Sostenible",
    cat5Desc: "Filtra componentes basándose en criterios Ambientales, Sociales y de Gobernanza (ESG).",
    cat6Title: "Acciones Temáticas",
    cat6Desc: "Aísla tendencias estructurales a largo plazo (Innovación, Robótica, Ciberseguridad, Transición Energética).",
    cat7Title: "Energías Renovables y Clima",
    cat7Desc: "Rama específica centrada en la economía verde, solar, eólica y mitigación del cambio climático.",
    cat8Title: "ETFs de Renta Fija (Bonos)",
    cat8Desc: "Invierten en deuda pública o corporativa para aportar estabilidad a la cartera.",
    cat9Title: "Materias Primas y Metales Preciosos",
    cat9Desc: "Réplica física de oro, plata o cestas de materias primas como protección frente a la inflación.",

    mechanicsTitle: "Comprender la mecánica de un ETF",
    mech1Title: "Replicación: Física vs Sintética",
    mech1Desc: "La replicación física compra las acciones reales del índice. La sintética utiliza contratos de swap con entidades bancarias.",
    mech2Title: "Distribución vs Acumulación",
    mech2Desc: "Un ETF de Distribución (Dist) reparte dividendos periódicos. Uno de Acumulación (Acc) los reinvierte automáticamente.",
    mech3Title: "TER, Tamaño y Liquidez",
    mech3Desc: "El TER (gastos anuales) oscila habitualmente entre el 0,05% y el 0,60%. Un volumen > 100M€ asegura alta liquidez.",
    mech4Title: "Riesgo de Divisa",
    mech4Desc: "La divisa subyacente de las acciones es clave. Los ETFs 'Hedged' eliminan el riesgo de cambio de divisas.",

    checklistTitle: "Checklist: ¿Cómo elegir tu ETF?",
    chk1Title: "Categoría / Área objetivo: ",
    chk1Desc: "¿El índice responde bien a la geografía o sector deseado?",
    chk2Title: "Comisiones (TER): ",
    chk2Desc: "Busca las comisiones más bajas posibles (idealmente por debajo del 0,30% anual).",
    chk3Title: "Modo de Replicación: ",
    chk3Desc: "¿Prefieres la propiedad física de los títulos o aceptas un contrato sintético?",
    chk4Title: "Política de Dividendos: ",
    chk4Desc: "Acumulación (Acc) para crecimiento a largo plazo o Distribución (Dist) para obtener rentas.",
    chk5Title: "Tamaño del Fondo: ",
    chk5Desc: "Prioriza ETFs con más de 100 millones de euros gestionados para asegurar la liquidez.",
    chk6Title: "Riesgo de Divisa: ",
    chk6Desc: "Comprueba si el ETF cuenta con cobertura de divisa (hedged) si inviertes fuera de tu zona monetaria.",

    conclusion: "Los ETFs son herramientas sencillas, de bajo coste y transparentes que democratizan la inversión para construir un patrimonio equilibrado."
  }
};

export function EtfEducation({ language: propLanguage }: { language: string }) {
  const { language } = useTranslation();
  const activeLang = language || propLanguage || 'en';
  const t = eduLabels[activeLang] || eduLabels.en;

  return (
    <section className="animate-fade-in space-y-16 max-w-4xl mx-auto pb-20">
      
      {/* 1. Introduction */}
      <div className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text">
          {t.introTitle}
        </h2>
        <div className="bg-surface border border-border/80 rounded-3xl p-8 shadow-sm">
          <p className="text-text leading-relaxed mb-4">
            {t.introP1}
          </p>
          <ul className="space-y-3 text-text">
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>{t.bullet1Title}</strong> {t.bullet1Text}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>{t.bullet2Title}</strong> {t.bullet2Text}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>{t.bullet3Title}</strong> {t.bullet3Text}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>{t.bullet4Title}</strong> {t.bullet4Text}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. & 3. Structure pédagogique */}
      <div className="space-y-10">
        <h2 className="text-2xl font-semibold tracking-tight text-text border-b border-border pb-4">
          {t.universeTitle}
        </h2>
        
        <CategoryCard 
          icon={<Globe className="text-blue-500" />}
          title={t.cat1Title}
          description={t.cat1Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "iShares Core S&P 500 UCITS ETF (IE0031442068)",
            "Vanguard FTSE All-World UCITS ETF (IE00BK5BQT80)",
            "Amundi Core MSCI Emerging Markets UCITS ETF (LU1737652583)"
          ]}
        />

        <CategoryCard 
          icon={<MapPin className="text-emerald-500" />}
          title={t.cat2Title}
          description={t.cat2Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "Amundi CAC 40 UCITS ETF (FR0007052782)",
            "Vanguard FTSE Japan UCITS ETF (IE00BFMXYX26)",
            "iShares MSCI Brazil UCITS ETF (IE00B0M63516)"
          ]}
        />

        <CategoryCard 
          icon={<Briefcase className="text-rose-500" />}
          title={t.cat3Title}
          description={t.cat3Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "iShares STOXX Europe 600 Technology UCITS ETF (DE000A0H08Q4)",
            "iShares STOXX Europe 600 Health Care UCITS ETF (DE000A0Q4R36)",
            "iShares MSCI World Energy Sector UCITS ETF (IE00BJ5JP105)"
          ]}
        />

        <CategoryCard 
          icon={<Sparkles className="text-amber-500" />}
          title={t.cat4Title}
          description={t.cat4Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "VanEck Morningstar Developed Markets Dividend Leaders UCITS ETF (NL0011683594)",
            "iShares EURO STOXX Small UCITS ETF (IE00B02KXM00)",
            "Amundi MSCI Europe Growth UCITS ETF (LU1598688189)"
          ]}
        />

        <CategoryCard 
          icon={<Leaf className="text-green-500" />}
          title={t.cat5Title}
          description={t.cat5Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "iShares MSCI World ESG Enhanced CTB UCITS ETF (IE00BG11HV38)",
            "Amundi CAC 40 ESG UCITS ETF (LU1681047079)",
            "iShares MSCI USA SRI UCITS ETF (IE00BZ173T46)"
          ]}
        />

        <CategoryCard 
          icon={<Search className="text-violet-500" />}
          title={t.cat6Title}
          description={t.cat6Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "iShares Automation & Robotics UCITS ETF (IE00BYWZ0333)",
            "Amundi MSCI Disruptive Technology UCITS ETF (LU2023678282)",
            "iShares Global Water UCITS ETF (IE00B1TXK627)"
          ]}
        />

        <CategoryCard 
          icon={<Leaf className="text-cyan-500" />}
          title={t.cat7Title}
          description={t.cat7Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "iShares Global Clean Energy Transition UCITS ETF (IE00B1XNHC34)",
            "Amundi MSCI EMU ESG Broad Transition UCITS ETF (LU0908501132)"
          ]}
        />

        <CategoryCard 
          icon={<Shield className="text-text" />}
          title={t.cat8Title}
          description={t.cat8Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "Amundi Core Euro Government Bond UCITS ETF (LU1737653714)",
            "iShares Core EUR Corporate Bond UCITS ETF (IE00B3F81R35)",
            "Vanguard USD Treasury Bond UCITS ETF (IE00BGYWFS63)"
          ]}
        />

        <CategoryCard 
          icon={<PiggyBank className="text-amber-600" />}
          title={t.cat9Title}
          description={t.cat9Desc}
          examplesLabel={t.examplesLabel}
          examples={[
            "Invesco Physical Gold ETC (IE00B579F325)",
            "WisdomTree Bloomberg WTI Crude Oil (IE00BVFZGC04)",
            "WisdomTree Broad Commodities (GB00B15KY989)"
          ]}
        />
      </div>

      {/* 4. Spécificités des ETF */}
      <div className="bg-surface-2 border border-border rounded-3xl p-8 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-text">
          {t.mechanicsTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">{t.mech1Title}</h3>
            <p className="text-sm text-text leading-relaxed mb-4">{t.mech1Desc}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">{t.mech2Title}</h3>
            <p className="text-sm text-text leading-relaxed mb-4">{t.mech2Desc}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">{t.mech3Title}</h3>
            <p className="text-sm text-text leading-relaxed mb-4">{t.mech3Desc}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">{t.mech4Title}</h3>
            <p className="text-sm text-text leading-relaxed mb-4">{t.mech4Desc}</p>
          </div>
        </div>
      </div>

      {/* 5. Comment choisir un ETF */}
      <div className="bg-surface border border-border/80 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-text mb-6">
          {t.checklistTitle}
        </h2>
        <ul className="space-y-4">
          <ChecklistItem title={t.chk1Title} description={t.chk1Desc} />
          <ChecklistItem title={t.chk2Title} description={t.chk2Desc} />
          <ChecklistItem title={t.chk3Title} description={t.chk3Desc} />
          <ChecklistItem title={t.chk4Title} description={t.chk4Desc} />
          <ChecklistItem title={t.chk5Title} description={t.chk5Desc} />
          <ChecklistItem title={t.chk6Title} description={t.chk6Desc} />
        </ul>
      </div>

      {/* 6. Conclusion */}
      <div className="border border-pv-blue/20 bg-pv-blue/5 rounded-[2rem] p-6 text-center">
        <p className="font-medium text-text leading-relaxed">
          {t.conclusion}
        </p>
      </div>

    </section>
  );
}

function CategoryCard({ icon, title, description, examplesLabel, examples }: { icon: React.ReactNode, title: string, description: string, examplesLabel: string, examples: string[] }) {
  return (
    <div className="bg-surface border border-border/80 rounded-[2rem] p-6 md:p-8 hover:border-border transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-[1.5rem] bg-surface-2 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-text">{title}</h3>
      </div>
      <p className="text-sm font-medium text-text leading-relaxed mb-6">
        {description}
      </p>
      <div className="bg-surface-2 rounded-[1.5rem] p-4">
        <div className="text-xs font-bold text-text mb-3">{examplesLabel}</div>
        <ul className="space-y-2">
          {examples.map((ex, i) => (
            <li key={i} className="text-xs md:text-sm font-medium text-text flex items-start gap-2">
              <span className="text-pv-blue mt-0.5 opacity-50">#</span>
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChecklistItem({ title, description }: { title: string, description: string }) {
  return (
    <li className="flex items-start gap-4 bg-surface-2 rounded-[1.5rem] p-4">
      <AlertCircle className="w-5 h-5 text-pv-blue shrink-0 mt-0.5" />
      <div>
        <span className="font-bold text-text">{title}</span>
        <span className="text-sm text-text font-medium">{description}</span>
      </div>
    </li>
  );
}
