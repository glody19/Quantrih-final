import React from "react";
import { motion } from "motion/react";
import { BookOpen, Globe, MapPin, Briefcase, Sparkles, Leaf, Shield, Database, PiggyBank, Search, BarChart3, AlertCircle } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";

export function EtfEducation({ language }: { language: string }) {
 if (language !== "fr") {
 // We only provide French as requested, but we can fallback or show a message.
 return (
 <div className="text-center py-20">
 <p className="text-text">This content is currently only available in French.</p>
 </div>
 );
 }

 return (
 <section className="animate-fade-in space-y-16 max-w-4xl mx-auto pb-20">
 
 {/* 1. Introduction */}
 <div className="space-y-6">
 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text">
 Introduction aux ETF
 </h2>
 <div className="bg-surface border border-border/80 rounded-3xl p-8 shadow-sm">
 <p className="text-text leading-relaxed mb-4">
 Un <strong>ETF (Exchange Traded Fund)</strong>, ou fonds négocié en bourse, est un panier de titres (actions, obligations, etc.) qui réplique la performance d'un indice de référence. Concrètement, lorsque vous achetez un ETF, vous investissez simultanément dans toutes les entreprises qui composent cet indice, et ce, en une seule transaction.
 </p>
 <ul className="space-y-3 text-text">
 <li className="flex items-start gap-3">
 <span className="text-pv-blue mt-1">•</span>
 <span><strong>Diversification simple :</strong> Accès immédiat à des centaines ou milliers d'entreprises.</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="text-pv-blue mt-1">•</span>
 <span><strong>Coûts faibles :</strong> Les frais de gestion sont généralement très bas par rapport aux fonds d'investissement classiques.</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="text-pv-blue mt-1">•</span>
 <span><strong>Transparence :</strong> Vous savez exactement ce que contient l'indice suivi.</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="text-pv-blue mt-1">•</span>
 <span><strong>Négociation en bourse :</strong> Ils s'achètent et se vendent facilement comme une action classique, tout au long de la journée de trading.</span>
 </li>
 </ul>
 </div>
 </div>

 {/* 2. & 3. Structure pédagogique */}
 <div className="space-y-10">
 <h2 className="text-2xl font-semibold tracking-tight text-text border-b border-border pb-4">
 Comprendre l'univers des ETF par catégorie
 </h2>
 
 {/* Actions par zone géographique */}
 <CategoryCard 
 icon={<Globe className="text-blue-500" />}
 title="Actions par zone géographique"
 description="Cette catégorie regroupe les grands marchés mondiaux (Amérique du Nord, Europe, Asie-Pacifique, Marchés émergents, Monde). Elle permet d'investir de manière macro-économique en pariant sur la croissance de blocs géographiques entiers. L'investisseur y trouve une diversification maximale, mais s'expose au risque de marché global et au risque de change si l'indice inclut des devises étrangères."
 examples={[
 "iShares Core S&P 500 UCITS ETF (IE0031442068)",
 "Vanguard FTSE All-World UCITS ETF (IE00BK5BQT80)",
 "Amundi Core MSCI Emerging Markets UCITS ETF (LU1737652583)"
 ]}
 />

 {/* Actions par pays */}
 <CategoryCard 
 icon={<MapPin className="text-emerald-500" />}
 title="Actions par pays"
 description="Ici, l'objectif est de cibler la performance économique d'un pays spécifique (États-Unis, France, Japon, Allemagne, etc.). Cela permet de surpondérer une économie dynamique ou familière. Le risque principal est la concentration (risque pays) : si le pays ciblé subit une crise politique ou économique, l'ETF sera fortement impacté."
 examples={[
 "Amundi CAC 40 UCITS ETF (FR0007052782)",
 "Vanguard FTSE Japan UCITS ETF (IE00BFMXYX26)",
 "iShares MSCI Brazil UCITS ETF (IE00B0M63516)"
 ]}
 />

 {/* Actions par secteur */}
 <CategoryCard 
 icon={<Briefcase className="text-rose-500" />}
 title="Actions par secteur"
 description="Ces ETF ciblent un domaine d'activité particulier (Technologie, Santé, Énergie, Services financiers, Automobile...). L'investisseur peut ainsi s'exposer aux secteurs qu'il juge porteurs pour l'avenir. Le risque inhérent est le risque sectoriel : toute modification réglementaire ou crise technologique touchant spécifiquement cette industrie fera baisser l'ETF, indépendamment des autres marchés."
 examples={[
 "iShares STOXX Europe 600 Technology UCITS ETF (DE000A0H08Q4)",
 "iShares STOXX Europe 600 Health Care UCITS ETF (DE000A0Q4R36)",
 "iShares MSCI World Energy Sector UCITS ETF (IE00BJ5JP105)"
 ]}
 />

 {/* Actions par style */}
 <CategoryCard 
 icon={<Sparkles className="text-amber-500" />}
 title="Actions par style de gestion"
 description="Cette catégorie segmente le marché selon des critères financiers : Croissance (entreprises qui se développent vite), Dividendes (entreprises qui redistribuent du cash), Large Cap (grosses capitalisations), Small Cap (petites entreprises), ou Faible volatilité. L'investisseur peut adapter l'ETF à son horizon et sa tolérance au risque. Le risque réside dans la sous-performance d'un style sur une période donnée (ex: la Croissance peut chuter lors d'une hausse des taux)."
 examples={[
 "VanEck Morningstar Developed Markets Dividend Leaders UCITS ETF (NL0011683594)",
 "iShares EURO STOXX Small UCITS ETF (IE00B02KXM00)",
 "Amundi MSCI Europe Growth UCITS ETF (LU1598688189)"
 ]}
 />

 {/* Actions ESG / Social/durable */}
 <CategoryCard 
 icon={<Leaf className="text-green-500" />}
 title="Actions ESG / Social & Durable"
 description="Les ETF ESG filtrent les composants d'un indice traditionnel (Amérique du Nord, Europe, Monde...) pour ne retenir que les entreprises respectant des critères Environnementaux, Sociaux et de Gouvernance. C'est idéal pour investir de manière éthique ou alignée avec l'Accord de Paris. Le risque est l'écart de performance potentiel (tracking error) par rapport à l'indice classique si les entreprises exclues (pétrole, armement) surperforment."
 examples={[
 "iShares MSCI World ESG Enhanced CTB UCITS ETF (IE00BG11HV38)",
 "Amundi CAC 40 ESG UCITS ETF (LU1681047079)",
 "iShares MSCI USA SRI UCITS ETF (IE00BZ173T46)"
 ]}
 />

 {/* Actions thématiques */}
 <CategoryCard 
 icon={<Search className="text-violet-500" />}
 title="Actions thématiques"
 description="Elles isolent des tendances structurelles de long terme (Innovation, Vieillissement, Robotique, Cybersécurité, Métaux de transition...). Ce sont des paris ciblés sur le futur. Bien que le potentiel de rendement soit souvent important, le risque de volatilité est élevé car ces thématiques peuvent très vite gonfler (effet de bulle) puis se dégonfler si la tendance ralentit."
 examples={[
 "iShares Automation & Robotics UCITS ETF (IE00BYWZ0333)",
 "Amundi MSCI Disruptive Technology UCITS ETF (LU2023678282)",
 "iShares Global Water UCITS ETF (IE00B1TXK627)"
 ]}
 />

 {/* Énergies renouvelables et climatiques */}
 <CategoryCard 
 icon={<Leaf className="text-cyan-500" />}
 title="Énergies renouvelables & Thèmes climatiques"
 description="Une sous-branche spécifique aux enjeux écologiques mondiaux (économie verte, solaire, éolien, changement climatique). Ces ETF s'adressent à ceux qui misent sur la transition énergétique. Outre un risque de concentration, ces secteurs sont très sensibles aux réglementations gouvernementales, aux subventions et aux taux d'intérêt."
 examples={[
 "iShares Global Clean Energy Transition UCITS ETF (IE00B1XNHC34)",
 "Amundi MSCI EMU ESG Broad Transition UCITS ETF (LU0908501132)"
 ]}
 />

 {/* Obligations */}
 <CategoryCard 
 icon={<Shield className="text-text" />}
 title="ETF Obligataires"
 description="Ces ETF n'investissent pas en actions mais en dettes (emprunts d'État de pays sûrs ou émergents, obligations d'entreprises 'Corporate'). Les obligations servent généralement d'amortisseur classique dans un portefeuille boursier. Le principal risque est le risque de taux : quand les banques centrales montent les taux d'intérêt, la valeur des obligations existantes baisse. Il existe aussi un risque de défaut sur les dettes d'entreprises à haut rendement (High Yield)."
 examples={[
 "Amundi Core Euro Government Bond UCITS ETF (LU1737653714)",
 "iShares Core EUR Corporate Bond UCITS ETF (IE00B3F81R35)",
 "Vanguard USD Treasury Bond UCITS ETF (IE00BGYWFS63)"
 ]}
 />

 {/* Matières premières / Métaux précieux */}
 <CategoryCard 
 icon={<PiggyBank className="text-amber-600" />}
 title="Matières premières & Métaux précieux"
 description="Ces fonds permettent de répliquer le cours physique d'une matière (comme l'Or, l'Argent, ou un panier agricole/pétrolier). Ils offrent une protection contre l'inflation et sont décorrélés des marchés d'actions traditionnels. Leurs risques : ces actifs ne versent ni dividendes ni intérêts, et leur prix ne dépend que de l'offre et de la demande mondiale (risques géopolitiques forts)."
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
 Comprendre la mécanique d'un ETF
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div>
 <h3 className="text-sm font-bold text-pv-blue mb-2">Réplication : Physique ou Synthétique</h3>
 <p className="text-sm text-text leading-relaxed mb-4">
 La réplication <strong>physique</strong> signifie que l'ETF achète réellement toutes (ou un échantillon optimisé) les actions de l'indice. La réplication <strong>synthétique</strong> utilise des contrats (swaps) avec une banque pour échanger la performance de l'indice, ce qui permet souvent d'accéder à des marchés difficiles ou de réduire certains coûts, moyennant un léger risque de contrepartie. L'<strong>échantillonnage optimisé</strong> est utilisé pour les indices massifs : l'ETF n'achète que les actions les plus représentatives pour éviter trop de frais de transaction.
 </p>
 </div>
 <div>
 <h3 className="text-sm font-bold text-pv-blue mb-2">Distribution vs Capitalisation</h3>
 <p className="text-sm text-text leading-relaxed mb-4">
 Un ETF <strong>Distibuant (Dist / 1D)</strong> reverse régulièrement les dividendes perçus sur votre compte. Un ETF <strong>Capitalisant (Acc / C)</strong> réinvestit automatiquement ces dividendes au sein du fonds, augmentant le prix de votre part (ce qui est souvent fiscalement avantageux selon le pays de résidence).
 </p>
 </div>
 <div>
 <h3 className="text-sm font-bold text-pv-blue mb-2">TER, Taille et Liquidité</h3>
 <p className="text-sm text-text leading-relaxed mb-4">
 Le <strong>TER (Total Expense Ratio)</strong> représente les frais annuels prélevés par le gérant. Il est généralement compris entre 0,05% et 0,60%. La <strong>Taille du fonds</strong> (idéalement &gt; 100M€) et sa <strong>liquidité</strong> (volume d'échanges quotidien) sont cruciales pour s'assurer que vous pourrez vendre vos parts facilement sans écart de prix important entre l'offre et la demande.
 </p>
 </div>
 <div>
 <h3 className="text-sm font-bold text-pv-blue mb-2">Devise et Risque de change</h3>
 <p className="text-sm text-text leading-relaxed mb-4">
 La devise dans laquelle l'ETF cote (Euro, USD) importe peu. Ce qui compte, c'est la devise des actions contenues dans l'ETF. Si vous achetez un ETF S&P 500 (États-Unis) non-couvert, la hausse de l'Euro face au Dollar diminuera votre performance. Pour éviter cela, on peut choisir un ETF dit <strong>« Hedged »</strong> (qui annule l'impact de la fluctuation des devises au prix de frais légèrement supérieurs).
 </p>
 </div>
 </div>
 </div>

 {/* 5. Comment choisir un ETF */}
 <div className="bg-surface border border-border/80 rounded-[2rem] p-8 shadow-sm">
 <h2 className="text-2xl font-semibold tracking-tight text-text mb-6">
 Check-list : Comment choisir son ETF ?
 </h2>
 <ul className="space-y-4">
 <ChecklistItem title="La Catégorie / Zone ciblée : " description="L'indice correspond-il bien à la géographie ou au secteur que vous souhaitez cibler ?" />
 <ChecklistItem title="Les Frais (TER) : " description="Recherchez les frais les plus bas possibles (idéalement sous 0.30% pour un ETF Monde ou cœur de portefeuille)." />
 <ChecklistItem title="Le mode de Réplication : " description="Préférez-vous détenir physiquement les titres ou acceptez-vous un contrat synthétique ?" />
 <ChecklistItem title="La politique de dividendes : " description="Capitalisant (Acc) pour faire fructifier son capital à long terme, ou Distribuant (Dist) pour recevoir des rentes." />
 <ChecklistItem title="La taille du fonds : " description="Privilégiez les ETF de plus de 100 millions d'euros sous gestion, garantissant la liquidité et réduisant le risque de fermeture du fonds." />
 <ChecklistItem title="Le risque de change : " description="Vérifiez si l'ETF est couvert (hedged) si vous investissez hors de la zone Euro et que les variations de monnaies vous inquiètent." />
 </ul>
 </div>

 {/* 6. Conclusion */}
 <div className="border border-pv-blue/20 bg-pv-blue/5 rounded-[2rem] p-6 text-center">
 <p className="font-medium text-text">
 Les ETF sont des outils simples, peu coûteux et transparents qui démocratisent l'investissement pour construire un patrimoine équilibré. En maîtrisant leurs spécificités (géographie, frais, capitalisation), l'investisseur est capable de s'exposer efficacement, en une seule transaction, à l'ensemble du marché boursier mondial.
 </p>
 </div>

 </section>
 );
}

function CategoryCard({ icon, title, description, examples }: { icon: React.ReactNode, title: string, description: string, examples: string[] }) {
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
 <div className="text-xs font-bold text-text mb-3">Exemples d'ETF (Tirés du marché)</div>
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
