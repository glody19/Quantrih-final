// Detailed French presentation of each book, shown on its own page (/education/<slug>).
// about: what the author writes about, in two or three sentences. ideas: the key ideas, three or four short lines.
// English visitors see the shorter English summary from the book list.

export interface BookDetail {
  about: string;
  ideas: string[];
}

export const BOOK_DETAILS: Record<string, BookDetail> = {
  // ── Thami Kabbaj ──
  "L'art du trading": {
    about: "Thami Kabbaj, ancien trader à Londres et agrégé d'économie, réunit dans ce livre de près de 600 pages tout ce qu'un trader discrétionnaire doit maîtriser : analyse graphique, indicateurs, gestion du capital et psychologie. Il s'appuie sur la finance comportementale et sur de nombreux cas réels pour montrer que le trading est un métier de méthode, pas de prédiction.",
    ideas: [
      "La tendance, les supports et les résistances priment sur les signaux isolés.",
      "La taille de position et le stop de protection décident du résultat à long terme.",
      "Les biais cognitifs (excès de confiance, aversion aux pertes) sont la première cause d'échec.",
      "Un plan de trading écrit, suivi et évalué vaut mieux qu'une intuition.",
    ],
  },
  "Psychologie des grands traders": {
    about: "Kabbaj étudie ce qui sépare les traders durablement gagnants des autres : non pas la méthode, mais la manière de se comporter face au gain, à la perte et à l'incertitude. Il relie les travaux de finance comportementale (Kahneman, Tversky) aux routines concrètes des professionnels en salle de marché.",
    ideas: [
      "L'aversion aux pertes pousse à couper les gains trop tôt et à garder les pertes trop longtemps.",
      "Les grands traders pensent en probabilités, jamais en certitudes.",
      "La discipline se construit par des règles écrites et un journal de trading.",
      "Le stress se gère en limitant le risque par position, pas en le niant.",
    ],
  },
  "Investir sans criser": {
    about: "Écrit après la crise financière, ce livre défend qu'on peut continuer à investir en bourse quand le climat est pessimiste. Kabbaj combine analyse fondamentale, lecture des cycles, psychologie des foules et analyse technique pour repérer les grands retournements, avec un regard sur les actions, le pétrole et l'or.",
    ideas: [
      "Les périodes de pessimisme général créent les meilleures opportunités d'achat.",
      "Stagflation, dette et crises : identifier le régime de marché avant de choisir ses actifs.",
      "La psychologie des foules explique les excès dans les deux sens.",
      "L'analyse graphique aide à dater les points d'entrée et de sortie.",
    ],
  },
  "Maîtriser l'analyse technique avec Thami Kabbaj": {
    about: "Un manuel court et très illustré en dix leçons, publié dans la collection Bourse d'Eyrolles. Kabbaj y présente les principes essentiels de l'analyse technique, des figures chartistes aux indicateurs, jusqu'à la construction d'une stratégie de trading complète.",
    ideas: [
      "Lire la tendance et ses phases avant tout autre signal.",
      "Figures de retournement et de continuation : têtes-épaules, triangles, drapeaux.",
      "Moyennes mobiles, RSI et MACD : confirmer, pas prédire.",
      "Une stratégie se définit par ses règles d'entrée, de sortie et de taille de position.",
    ],
  },
  "Gagner en bourse avec Thami Kabbaj": {
    about: "Douze conseils pratiques pour comprendre comment fonctionnent les marchés financiers et appliquer les stratégies des professionnels. Le livre s'adresse à l'investisseur particulier qui veut une méthode simple et structurée plutôt que des paris.",
    ideas: [
      "Comprendre les acteurs du marché et ce qui fait bouger les cours.",
      "Choisir un horizon et un style d'investissement, puis s'y tenir.",
      "Diversifier et limiter le risque par ligne.",
      "Se protéger des décisions émotionnelles par des règles fixées à l'avance.",
    ],
  },
  "Gérer vos émotions en bourse avec Thami Kabbaj": {
    about: "Treize leçons consacrées à la dimension psychologique de l'investissement : peur, avidité, regret et excès de confiance. Kabbaj montre comment ces émotions déforment les décisions et donne des exercices pour investir avec la discipline d'un professionnel.",
    ideas: [
      "Identifier ses biais : ancrage, confirmation, aversion aux pertes.",
      "Accepter la perte comme un coût normal de l'activité.",
      "Un journal de décisions révèle les erreurs qui se répètent.",
      "La routine et la préparation réduisent les décisions impulsives.",
    ],
  },
  "Agir": {
    about: "Dans ce livre publié chez Eyrolles en 2019, Kabbaj sort du trading pour parler de liberté financière. Il la présente comme une décision personnelle et propose un parcours sur cinq ans pour ne plus dépendre uniquement d'un salaire ni des conseils de son banquier.",
    ideas: [
      "La liberté financière commence par une décision et un objectif chiffré.",
      "Épargner une part fixe de ses revenus et la faire travailler.",
      "Remettre en cause ses croyances sur l'argent et le risque.",
      "Construire des revenus qui ne dépendent pas de son temps de travail.",
    ],
  },

  // ── Classics: value and fundamentals ──
  "The Intelligent Investor": {
    about: "Benjamin Graham, professeur et mentor de Warren Buffett, distingue l'investisseur du spéculateur. Il propose deux méthodes, défensive et entreprenante, et introduit Mr. Market, l'associé lunatique qui offre chaque jour un prix qu'on peut ignorer ou exploiter.",
    ideas: [
      "La marge de sécurité : acheter nettement sous la valeur estimée.",
      "Mr. Market est au service de l'investisseur, pas son guide.",
      "L'investisseur défensif répartit entre actions et obligations et rééquilibre.",
      "Le plus grand risque vient de son propre comportement.",
    ],
  },
  "Security Analysis": {
    about: "Le manuel fondateur de l'analyse financière, écrit par Graham et Dodd après le krach de 1929. Il apprend à évaluer actions et obligations à partir des bilans et des comptes de résultat, en séparant valeur intrinsèque et prix de marché.",
    ideas: [
      "La valeur intrinsèque se déduit des actifs, des bénéfices et des dividendes.",
      "Les comptes doivent être retraités avant toute comparaison.",
      "Les obligations s'analysent d'abord par la capacité de remboursement.",
      "Le marché finit par rapprocher le prix de la valeur, sans date garantie.",
    ],
  },
  "Common Stocks and Uncommon Profits": {
    about: "Philip Fisher décrit comment trouver les entreprises de croissance exceptionnelles et les garder longtemps. Sa méthode du « scuttlebutt » consiste à interroger clients, fournisseurs et concurrents pour juger la qualité d'une société.",
    ideas: [
      "Quinze points pour juger une entreprise : ventes, marges, R&D, management.",
      "L'enquête de terrain révèle ce que les comptes ne montrent pas.",
      "Vendre rarement : une grande entreprise se garde des années.",
      "Peu de lignes, bien connues, plutôt qu'une diversification excessive.",
    ],
  },
  "The Essays of Warren Buffett": {
    about: "Lawrence Cunningham a classé par thème les lettres annuelles de Warren Buffett aux actionnaires de Berkshire Hathaway. On y lit sa pensée sur la gouvernance, l'allocation du capital, les acquisitions, la comptabilité et l'évaluation.",
    ideas: [
      "Acheter de bonnes entreprises à un prix raisonnable plutôt que l'inverse.",
      "Le cercle de compétence : investir seulement dans ce qu'on comprend.",
      "Les dirigeants doivent allouer le capital comme des propriétaires.",
      "Le bénéfice comptable ne remplace pas le flux de trésorerie disponible.",
    ],
  },
  "Margin of Safety": {
    about: "Seth Klarman, fondateur du fonds Baupost, explique la discipline value appliquée à la gestion professionnelle. Le livre, épuisé et très recherché, insiste sur l'aversion au risque et sur les pièges de l'industrie de la gestion.",
    ideas: [
      "Éviter les pertes compte plus que maximiser les gains.",
      "La valeur est une fourchette, pas un chiffre précis.",
      "Les contraintes des gérants institutionnels créent des opportunités.",
      "Garder des liquidités en attendant les bonnes occasions.",
    ],
  },
  "Poor Charlie's Almanack": {
    about: "Les discours et la pensée de Charlie Munger, associé de Warren Buffett. Il y présente son treillis de modèles mentaux, empruntés à la psychologie, à la physique ou à la biologie, pour mieux décider en investissement comme dans la vie.",
    ideas: [
      "Utiliser plusieurs disciplines pour juger une situation.",
      "Les 25 tendances psychologiques qui faussent le jugement humain.",
      "Inverser le problème : chercher ce qui ferait échouer.",
      "Rester patient et frapper fort quand l'occasion est claire.",
    ],
  },
  "The Most Important Thing": {
    about: "Howard Marks, fondateur d'Oaktree, rassemble les idées de ses mémos aux clients. Il montre que la réussite dépend d'une pensée de second niveau : non pas savoir ce qui est bon, mais ce qui est déjà dans le prix.",
    ideas: [
      "La pensée de second niveau : se demander ce que le consensus a déjà intégré.",
      "Le risque est la probabilité de perte permanente, pas la volatilité.",
      "Les cycles reviennent toujours ; savoir où l'on se trouve.",
      "Acheter quand les autres vendent par peur demande une vraie discipline.",
    ],
  },
  "Mastering the Market Cycle": {
    about: "Howard Marks détaille les cycles économiques, du crédit, des bénéfices et de la psychologie des investisseurs. Il explique comment positionner un portefeuille selon la phase du cycle sans prétendre prévoir l'avenir.",
    ideas: [
      "Les cycles naissent des excès de comportement, pas du hasard.",
      "Le cycle du crédit amplifie tous les autres.",
      "Mesurer la température du marché plutôt que prédire.",
      "Être plus défensif quand l'optimisme est généralisé.",
    ],
  },
  "One Up On Wall Street": {
    about: "Peter Lynch, gérant du fonds Magellan de Fidelity, explique que l'investisseur particulier peut repérer les gagnants avant les professionnels en observant son quotidien. Il classe les entreprises en six catégories, de la croissance lente au retournement.",
    ideas: [
      "Investir dans ce que l'on connaît et comprend.",
      "Six catégories d'actions, chacune avec ses règles.",
      "Le ratio PEG pour juger la croissance au bon prix.",
      "Connaître l'histoire de l'entreprise en deux minutes avant d'acheter.",
    ],
  },
  "Beating the Street": {
    about: "Lynch revient sur ses années à la tête de Magellan et détaille la sélection de 21 actions pour le magazine Barron's. Il montre son processus de recherche, entreprise par entreprise, et les 25 règles d'or qu'il en tire.",
    ideas: [
      "Faire ses devoirs : visites, rapports, entretiens.",
      "Les secteurs mal aimés cachent souvent des perles.",
      "Suivre régulièrement la thèse de départ.",
      "Les corrections sont normales et ne justifient pas de vendre.",
    ],
  },
  "The Little Book That Still Beats the Market": {
    about: "Joel Greenblatt présente sa formule magique : classer les entreprises par rentabilité du capital et par rendement des bénéfices, puis acheter celles qui combinent les deux. Une méthode simple, systématique et testée.",
    ideas: [
      "Acheter de bonnes entreprises (forte rentabilité) bon marché (rendement élevé).",
      "La méthode peut sous-performer plusieurs années d'affilée.",
      "La discipline compte plus que le choix des titres.",
      "Un panier de 20 à 30 titres renouvelé chaque année.",
    ],
  },
  "You Can Be a Stock Market Genius": {
    about: "Greenblatt décrit les situations spéciales : scissions, sorties de faillite, restructurations, fusions et droits. Ces événements créent des prix décalés que les grands investisseurs ignorent.",
    ideas: [
      "Les scissions d'entreprises sont souvent vendues à tort.",
      "Les situations spéciales dépendent peu du marché global.",
      "Lire les documents juridiques donne un avantage.",
      "Concentrer sur peu d'idées bien comprises.",
    ],
  },
  "The Little Book of Value Investing": {
    about: "Christopher Browne, de Tweedy, Browne, résume l'approche value de Graham en règles pratiques : acheter des actions décotées par rapport aux actifs ou aux bénéfices, avec une marge de sécurité.",
    ideas: [
      "Acheter des entreprises comme on achète des articles en solde.",
      "Regarder les achats des dirigeants.",
      "Diversifier internationalement pour trouver plus d'aubaines.",
      "La patience est le principal avantage du particulier.",
    ],
  },
  "Value Investing: From Graham to Buffett and Beyond": {
    about: "Bruce Greenwald, professeur à Columbia, propose une méthode d'évaluation en trois étapes : valeur des actifs, valeur de la capacité bénéficiaire, puis valeur de la croissance protégée par un avantage concurrentiel.",
    ideas: [
      "Commencer par la valeur de reconstitution des actifs.",
      "La capacité bénéficiaire actuelle, sans croissance, sert de référence.",
      "La croissance n'a de valeur que derrière une barrière à l'entrée.",
      "Études de cas de gérants value reconnus.",
    ],
  },
  "The Dhandho Investor": {
    about: "Mohnish Pabrai décrit la méthode des entrepreneurs Patel, venus d'Inde, appliquée à la bourse : parier peu, sur des situations où la perte est faible et le gain potentiel élevé.",
    ideas: [
      "Pile je gagne, face je ne perds pas grand-chose.",
      "Copier les bonnes idées plutôt qu'innover.",
      "Concentrer sur quelques paris à forte probabilité.",
      "Investir dans des entreprises simples, en difficulté passagère.",
    ],
  },
  "Investment Valuation": {
    about: "Le traité d'évaluation d'Aswath Damodaran, professeur à NYU. Il couvre l'actualisation des flux de trésorerie, les multiples, l'évaluation relative et les options réelles, pour toutes sortes d'actifs.",
    ideas: [
      "La valeur d'un actif est la valeur actuelle de ses flux futurs.",
      "Le coût du capital doit refléter le risque réel.",
      "Les multiples doivent être cohérents avec les fondamentaux.",
      "Chaque entreprise demande des hypothèses adaptées à son stade de vie.",
    ],
  },
  "The Little Book of Valuation": {
    about: "La version courte de Damodaran pour l'investisseur particulier : comment estimer la valeur d'une entreprise avec les flux de trésorerie actualisés et les multiples, de la jeune pousse à la société mature.",
    ideas: [
      "Trois valeurs : intrinsèque, relative et contingente.",
      "Croissance, risque et flux de trésorerie sont les trois leviers.",
      "Valoriser les entreprises jeunes, cycliques ou financières demande des ajustements.",
      "Une valeur imprécise vaut mieux qu'aucune valeur.",
    ],
  },
  "Narrative and Numbers": {
    about: "Damodaran relie l'histoire qu'on raconte sur une entreprise aux chiffres de son évaluation. Il montre comment tester un récit, le traduire en hypothèses et l'ajuster quand les faits changent.",
    ideas: [
      "Toute évaluation repose sur une histoire, explicite ou non.",
      "Un bon récit doit être possible, plausible et probable.",
      "Les chiffres disciplinent les récits trop optimistes.",
      "Exemples : Uber, Amazon, Ferrari, Alibaba.",
    ],
  },
  "The Corporate Life Cycle": {
    about: "Damodaran suit l'entreprise de sa création à son déclin et montre que la finance d'entreprise, l'évaluation et la gestion doivent changer à chaque étape.",
    ideas: [
      "Six phases : création, croissance, maturité, déclin.",
      "Les décisions de dividende et de dette dépendent de la phase.",
      "Les dirigeants doivent accepter le vieillissement de leur société.",
      "Les investisseurs choisissent leur phase préférée.",
    ],
  },
  "Corporate Finance": {
    about: "Le manuel de référence de finance d'entreprise de Ross, Westerfield et Jaffe. Il couvre la valeur actuelle nette, la structure financière, le coût du capital, la politique de dividende et les fusions.",
    ideas: [
      "La VAN est le critère central de décision d'investissement.",
      "La structure de capital influence la valeur via la fiscalité et le risque de faillite.",
      "Le MEDAF sert à estimer le coût des fonds propres.",
      "Les options réelles enrichissent l'analyse des projets.",
    ],
  },
  "Finance d'entreprise": {
    about: "Le « Vernimmen », manuel de référence en France depuis 1974, mis à jour chaque année. Il traite de l'analyse financière, de l'évaluation, de la structure de capital et des opérations de haut de bilan.",
    ideas: [
      "Lire un bilan et un compte de résultat avec un œil d'investisseur.",
      "La création de valeur exige une rentabilité supérieure au coût du capital.",
      "Évaluer par actualisation et par comparables.",
      "Fusions, LBO, introductions en bourse : mécanismes et enjeux.",
    ],
  },

  // ── Index investing and allocation ──
  "A Random Walk Down Wall Street": {
    about: "Burton Malkiel, professeur à Princeton, défend que les cours suivent une marche aléatoire et qu'il est presque impossible de battre le marché durablement. Il passe en revue bulles, analyse technique et fondamentale, puis recommande les fonds indiciels.",
    ideas: [
      "Les marchés intègrent vite l'information disponible.",
      "La plupart des gérants actifs font moins bien que leur indice.",
      "Les bulles se répètent, des tulipes à Internet.",
      "Un portefeuille indiciel diversifié et peu coûteux suffit à la plupart des épargnants.",
    ],
  },
  "The Little Book of Common Sense Investing": {
    about: "John Bogle, fondateur de Vanguard, explique pourquoi un fonds indiciel à bas coût bat la plupart des fonds actifs : les frais réduisent mécaniquement le rendement de l'investisseur moyen.",
    ideas: [
      "Les investisseurs, en moyenne, obtiennent le marché moins les frais.",
      "Les frais composés détruisent une part énorme du capital.",
      "Acheter le marché entier et le garder.",
      "Le rendement de l'investisseur est souvent inférieur à celui du fonds, à cause du timing.",
    ],
  },
  "Common Sense on Mutual Funds": {
    about: "Bogle analyse l'industrie des fonds communs : frais, rotation, conflits d'intérêts et performances. Il construit l'argument complet en faveur de la gestion indicielle.",
    ideas: [
      "La performance passée des fonds ne prédit pas la performance future.",
      "Les frais sont le seul facteur prévisible de la performance.",
      "La rotation élevée coûte en courtage et en fiscalité.",
      "Une allocation simple entre actions et obligations suffit.",
    ],
  },
  "The Bogleheads' Guide to Investing": {
    about: "Taylor Larimore et la communauté des Bogleheads appliquent la philosophie de Bogle : épargner tôt, diversifier, réduire les coûts et ne pas chercher à battre le marché.",
    ideas: [
      "Commencer tôt et épargner régulièrement.",
      "Une allocation adaptée à son horizon et à sa tolérance au risque.",
      "Des fonds indiciels à bas coût, peu de lignes.",
      "Rééquilibrer et ignorer le bruit médiatique.",
    ],
  },
  "The Four Pillars of Investing": {
    about: "William Bernstein, neurologue devenu gérant, présente quatre piliers : théorie, histoire, psychologie et fonctionnement de l'industrie financière. Il conclut sur des portefeuilles simples et diversifiés.",
    ideas: [
      "Risque et rendement sont indissociables.",
      "L'histoire des marchés montre les excès récurrents.",
      "La psychologie de l'investisseur est son pire ennemi.",
      "L'industrie financière vit de frais que l'on peut éviter.",
    ],
  },
  "The Intelligent Asset Allocator": {
    about: "Bernstein détaille la construction d'un portefeuille à partir de la corrélation entre classes d'actifs. Il montre l'intérêt du rééquilibrage et de la diversification entre actions, obligations et petites capitalisations.",
    ideas: [
      "Des actifs peu corrélés réduisent la volatilité globale.",
      "Le rééquilibrage force à acheter bas et vendre haut.",
      "Les petites capitalisations et la value ajoutent une prime de risque.",
      "Le choix de l'allocation compte plus que le choix des titres.",
    ],
  },
  "Stocks for the Long Run": {
    about: "Jeremy Siegel, professeur à Wharton, étudie deux siècles de données américaines et montre que les actions ont battu obligations, or et liquidités sur toutes les longues périodes, après inflation.",
    ideas: [
      "Environ 6,5 % à 7 % de rendement réel annuel pour les actions sur deux siècles.",
      "Sur vingt ans ou plus, les actions ont été moins risquées que les obligations en termes réels.",
      "Les dividendes réinvestis forment une grande part du rendement.",
      "Les valorisations de départ influencent les rendements futurs.",
    ],
  },
  "The Simple Path to Wealth": {
    about: "JL Collins a écrit à sa fille une série de lettres sur l'argent, devenues un livre : éviter les dettes, épargner une forte part de ses revenus et investir dans un fonds indiciel total du marché.",
    ideas: [
      "Dépenser moins que ce qu'on gagne et investir la différence.",
      "Un seul fonds indiciel actions pendant la phase d'accumulation.",
      "Les krachs sont normaux ; il faut rester investi.",
      "La règle des 4 % pour fixer son indépendance financière.",
    ],
  },
  "Unconventional Success": {
    about: "David Swensen, gestionnaire du fonds de Yale, explique aux particuliers que les fonds actifs servent surtout les intérêts de l'industrie. Il recommande un portefeuille indiciel diversifié en six classes d'actifs.",
    ideas: [
      "Les conflits d'intérêts minent la gestion de fonds.",
      "Six classes d'actifs : actions domestiques, étrangères, émergentes, immobilier, obligations d'État et indexées.",
      "Rééquilibrer avec discipline.",
      "Les frais et les impôts dominent la performance nette.",
    ],
  },
  "Pioneering Portfolio Management": {
    about: "Le modèle de Yale de David Swensen pour les institutions : une large part en actifs non cotés et alternatifs, une gouvernance solide et un horizon très long.",
    ideas: [
      "L'horizon perpétuel permet d'accepter l'illiquidité.",
      "Diversifier entre actions, immobilier, capital-investissement, actifs réels.",
      "Choisir des gérants alignés sur les intérêts du fonds.",
      "Le rééquilibrage est un outil de contrôle du risque.",
    ],
  },
  "Global Asset Allocation": {
    about: "Mebane Faber compare les grands portefeuilles d'allocation (60/40, All Weather, Permanent, Ivy, Swensen) sur plusieurs décennies. Il montre que leurs rendements sont proches et que les frais font la différence.",
    ideas: [
      "Les allocations célèbres donnent des résultats voisins sur le long terme.",
      "Les frais pèsent plus que le choix entre ces portefeuilles.",
      "La diversification mondiale protège contre le risque d'un seul pays.",
      "Choisir une allocation qu'on peut tenir dans les pires années.",
    ],
  },
  "The Ivy Portfolio": {
    about: "Faber et Richardson montrent comment reproduire l'allocation des fonds de Yale et Harvard avec des ETF, et ajoutent une règle de suivi de tendance (moyenne mobile 10 mois) pour réduire les pertes.",
    ideas: [
      "Cinq classes d'actifs équipondérées comme base.",
      "Sortir d'un actif sous sa moyenne mobile 10 mois.",
      "Le suivi de tendance réduit fortement les pertes maximales.",
      "Des ETF suffisent pour imiter les grands fonds universitaires.",
    ],
  },
  "Épargnant 3.0": {
    about: "Edouard Petit applique la gestion indicielle aux enveloppes françaises : comment choisir ses ETF, utiliser le PEA et l'assurance-vie, construire une allocation et la rééquilibrer.",
    ideas: [
      "Les ETF à bas coût éligibles au PEA permettent une exposition mondiale.",
      "L'assurance-vie et le PEA ont chacun leurs avantages fiscaux.",
      "Une allocation simple entre actions et fonds en euros ou obligations.",
      "Investir régulièrement et rééquilibrer une fois par an.",
    ],
  },
  "Trillions": {
    about: "Robin Wigglesworth, journaliste au Financial Times, raconte l'histoire des fonds indiciels, des chercheurs de Chicago à Vanguard, BlackRock et State Street, et les questions qu'elle pose aujourd'hui.",
    ideas: [
      "L'idée vient de la recherche académique sur l'efficience des marchés.",
      "Bogle et Vanguard ont rendu l'indexation accessible à tous.",
      "Les ETF ont accéléré le mouvement.",
      "Le poids de trois géants pose des questions de gouvernance.",
    ],
  },
  "In Pursuit of the Perfect Portfolio": {
    about: "Andrew Lo et Stephen Foerster présentent les idées de dix grands noms de la finance (Markowitz, Sharpe, Fama, Bogle, Samuelson, Scholes, Merton, Shiller, Siegel, Leibowitz) et leur vision du portefeuille idéal.",
    ideas: [
      "La diversification moyenne-variance de Markowitz reste la base.",
      "Le MEDAF et l'efficience des marchés ont fondé l'indexation.",
      "La finance comportementale nuance l'efficience.",
      "Il n'existe pas de portefeuille parfait universel.",
    ],
  },
  "Rich Dad Poor Dad": {
    about: "Robert Kiyosaki oppose les conseils de son père biologique, salarié, à ceux d'un « père riche », entrepreneur. Le livre défend l'éducation financière et la constitution d'actifs qui produisent des revenus.",
    ideas: [
      "Un actif met de l'argent dans votre poche, un passif en retire.",
      "Les riches font travailler l'argent pour eux.",
      "L'éducation financière n'est pas enseignée à l'école.",
      "Prendre des risques mesurés plutôt que chercher la sécurité de l'emploi.",
    ],
  },
  "The Millionaire Next Door": {
    about: "Thomas Stanley et William Danko ont étudié les millionnaires américains et découvert qu'ils vivent souvent modestement. Leur fortune vient de la frugalité, de l'épargne et de l'investissement, pas d'un revenu spectaculaire.",
    ideas: [
      "Beaucoup de riches ne ressemblent pas à des riches.",
      "Un train de vie inférieur à ses moyens est la clé.",
      "Distinguer accumulateurs et dépensiers de patrimoine.",
      "Les signes extérieurs de richesse retardent l'enrichissement.",
    ],
  },
  "La Bourse pour les Nuls": {
    about: "Gérard Horny, journaliste économique, explique pas à pas le fonctionnement de la bourse aux débutants : marchés, ordres, analyse, enveloppes fiscales et erreurs à éviter.",
    ideas: [
      "Comprendre ce qu'est une action, une obligation, un indice.",
      "Passer des ordres et choisir un courtier.",
      "Les bases de l'analyse fondamentale et technique.",
      "Diversifier et investir pour le long terme.",
    ],
  },

  // ── Momentum, trend and quant ──
  "Trend Following": {
    about: "Michael Covel présente les traders qui suivent la tendance (Dunn, Henry, Seykota, Turtles) et la logique de leurs systèmes : ne pas prédire, suivre les prix et couper les pertes.",
    ideas: [
      "Le prix est la seule information fiable.",
      "Couper les pertes et laisser courir les gains.",
      "Les meilleures années arrivent souvent pendant les crises.",
      "Un système appliqué sans exception.",
    ],
  },
  "The Complete TurtleTrader": {
    about: "En 1983, Richard Dennis et William Eckhardt ont formé des débutants à un système de suivi de tendance pour savoir si le trading s'apprend. Covel raconte l'expérience et le destin des Turtles.",
    ideas: [
      "Le trading peut s'enseigner avec des règles précises.",
      "Entrer sur les cassures de plus hauts et plus bas.",
      "Dimensionner les positions selon la volatilité.",
      "La discipline sépare ceux qui ont réussi des autres.",
    ],
  },
  "Following the Trend": {
    about: "Andreas Clenow décrit de manière complète une stratégie de suivi de tendance diversifiée sur les contrats à terme, telle qu'elle est gérée par les fonds CTA, avec ses résultats année par année.",
    ideas: [
      "Un système simple sur un large univers de marchés suffit.",
      "La diversification entre marchés est le vrai moteur.",
      "Les performances sont irrégulières : quelques grandes années.",
      "Le dimensionnement par la volatilité contrôle le risque.",
    ],
  },
  "Stocks on the Move": {
    about: "Clenow propose une stratégie momentum sur actions entièrement codifiée : classement par pente de régression ajustée, filtre de tendance du marché et rééquilibrage hebdomadaire.",
    ideas: [
      "Classer les actions par force de la tendance.",
      "N'acheter que lorsque l'indice est au-dessus de sa moyenne mobile.",
      "Taille de position selon la volatilité (ATR).",
      "Les fonds indiciels suivent mal ce que le momentum capte.",
    ],
  },
  "Dual Momentum Investing": {
    about: "Gary Antonacci combine le momentum relatif (choisir l'actif le plus fort) et le momentum absolu (sortir vers les obligations quand la tendance devient négative). Sa stratégie GEM est simple et testée sur plusieurs décennies.",
    ideas: [
      "Momentum relatif : actions américaines ou internationales.",
      "Momentum absolu : rester en actions seulement si elles battent les bons du Trésor.",
      "La combinaison réduit fortement les pertes maximales.",
      "Un seul signal mensuel, sur 12 mois.",
    ],
  },
  "Quantitative Momentum": {
    about: "Wesley Gray et Jack Vogel expliquent la prime momentum et la manière de la capter : sélection sur 12 mois, qualité de la trajectoire (« frog in the pan ») et rééquilibrage trimestriel.",
    ideas: [
      "Le momentum est l'une des anomalies les plus robustes.",
      "Une hausse régulière vaut mieux qu'un saut brutal.",
      "La saisonnalité et le rééquilibrage améliorent les résultats.",
      "La prime existe car elle est difficile à tenir psychologiquement.",
    ],
  },
  "Quantitative Value": {
    about: "Gray et Carlisle bâtissent une stratégie value systématique : éviter les fraudes et faillites, mesurer la valeur par l'EBIT sur valeur d'entreprise, puis privilégier la qualité.",
    ideas: [
      "Éliminer d'abord les risques de manipulation comptable et de faillite.",
      "L'EBIT/EV est la mesure de valeur la plus efficace testée.",
      "Combiner valeur et qualité améliore les résultats.",
      "Un modèle bat souvent le jugement d'expert.",
    ],
  },
  "Expected Returns": {
    about: "Antti Ilmanen, d'AQR, synthétise la recherche sur les sources de rendement : primes de classes d'actifs, styles (value, momentum, carry), facteurs de risque et conditions de marché.",
    ideas: [
      "Les rendements futurs dépendent des valorisations de départ.",
      "Value, momentum et carry existent dans toutes les classes d'actifs.",
      "Les primes de risque varient avec le cycle.",
      "Diversifier entre sources de rendement plutôt qu'entre actifs.",
    ],
  },
  "Investing Amid Low Expected Returns": {
    about: "Ilmanen met à jour sa recherche pour un monde de taux bas : quelles primes restent fiables, comment les combiner et quels coûts éviter quand le rendement attendu est faible.",
    ideas: [
      "Des valorisations élevées réduisent les rendements attendus.",
      "Les primes de style (value, momentum, qualité) aident à compenser.",
      "Les frais pèsent davantage quand les rendements baissent.",
      "La discipline face à de longues sous-performances est essentielle.",
    ],
  },
  "Active Portfolio Management": {
    about: "Grinold et Kahn posent le cadre quantitatif de la gestion active : ratio d'information, loi fondamentale de la gestion active, prévision des rendements et construction de portefeuille.",
    ideas: [
      "Ratio d'information = qualité de la prévision × racine du nombre de paris.",
      "Le risque actif se mesure par rapport à un indice.",
      "Les prévisions doivent être ajustées pour leur fiabilité.",
      "Les coûts de transaction limitent la gestion active.",
    ],
  },
  "Efficiently Inefficient": {
    about: "Lasse Pedersen explique comment les hedge funds gagnent de l'argent sur des marchés presque efficients : choix d'actions, macro globale, arbitrage et stratégies quantitatives, avec des entretiens de grands gérants.",
    ideas: [
      "Les marchés sont assez efficients pour décourager, assez inefficients pour récompenser.",
      "Les primes viennent de la liquidité et des contraintes des investisseurs.",
      "Value, momentum et carry sont des stratégies transversales.",
      "Entretiens avec Asness, Griffin, Paulson et d'autres.",
    ],
  },
  "Advances in Financial Machine Learning": {
    about: "Marcos López de Prado montre pourquoi les méthodes classiques de machine learning échouent en finance et propose des outils adaptés : barres d'information, étiquetage triple barrière, validation croisée purgée.",
    ideas: [
      "Les données financières ne sont pas indépendantes ni stationnaires.",
      "Le surajustement des backtests est le principal danger.",
      "La validation croisée doit être purgée pour éviter les fuites.",
      "La différenciation fractionnaire préserve la mémoire des séries.",
    ],
  },
  "Machine Learning for Asset Managers": {
    about: "Un livre court de López de Prado sur l'usage du machine learning en gestion : débruiter les matrices de covariance, regrouper les actifs, mesurer l'importance des variables et construire des portefeuilles robustes.",
    ideas: [
      "Les matrices de covariance estimées sont très bruitées.",
      "Le clustering améliore l'allocation (HRP, NCO).",
      "L'importance des variables remplace la seule régression.",
      "Le machine learning sert à comprendre, pas seulement à prédire.",
    ],
  },
  "Causal Factor Investing": {
    about: "López de Prado critique la recherche factorielle actuelle, fondée sur des corrélations, et appelle à des modèles causaux pour expliquer pourquoi un facteur devrait rapporter.",
    ideas: [
      "La plupart des facteurs publiés échouent hors échantillon.",
      "Une corrélation sans mécanisme causal est fragile.",
      "Les variables oubliées faussent les résultats.",
      "La recherche doit tester des hypothèses causales explicites.",
    ],
  },
  "Inside the Black Box": {
    about: "Rishi Narang ouvre la boîte noire des fonds quantitatifs : modèles d'alpha, de risque, de coûts de transaction, construction de portefeuille et exécution.",
    ideas: [
      "Une stratégie quant se décompose en modules distincts.",
      "Tendance, retour à la moyenne, value, qualité : les grandes familles d'alpha.",
      "Les coûts de transaction tuent beaucoup de stratégies.",
      "Le risque de modèle et de données doit être géré.",
    ],
  },
  "The Man Who Solved the Market": {
    about: "Gregory Zuckerman raconte Jim Simons, mathématicien devenu fondateur de Renaissance Technologies, et le fonds Medallion, le plus performant de l'histoire grâce aux modèles statistiques.",
    ideas: [
      "Des scientifiques, pas des financiers, ont construit Renaissance.",
      "Beaucoup de petits signaux faibles combinés.",
      "Les données propres et nombreuses sont un avantage décisif.",
      "Le secret et la culture interne protègent l'avance.",
    ],
  },
  "The Quants": {
    about: "Scott Patterson suit les grands gérants quantitatifs (Asness, Griffin, Weinstein, Muller) jusqu'au krach des stratégies quantitatives d'août 2007, signe avant-coureur de la crise.",
    ideas: [
      "Beaucoup de fonds suivaient les mêmes modèles.",
      "Le levier a amplifié les pertes en août 2007.",
      "Les modèles sous-estiment les événements extrêmes.",
      "La liquidité disparaît quand tout le monde vend en même temps.",
    ],
  },

  // ── Trading and technical analysis ──
  "Market Wizards": {
    about: "Jack Schwager interroge les meilleurs traders des années 1980 (Paul Tudor Jones, Ed Seykota, Bruce Kovner, Michael Marcus) sur leurs méthodes, leurs échecs et leur discipline.",
    ideas: [
      "Il n'existe pas une seule méthode gagnante.",
      "Tous ont une gestion du risque très stricte.",
      "Les grands traders ont souvent tout perdu au moins une fois.",
      "Adapter la méthode à sa personnalité.",
    ],
  },
  "The New Market Wizards": {
    about: "La deuxième série d'entretiens de Schwager, avec Bill Lipschutz, Monroe Trout, Victor Sperandeo et d'autres, sur les devises, les contrats à terme et les options.",
    ideas: [
      "La confiance vient de la préparation, pas de l'ego.",
      "Le contrôle des pertes est commun à tous.",
      "Les meilleures opportunités sont rares : patience.",
      "Analyser ses erreurs pour progresser.",
    ],
  },
  "Hedge Fund Market Wizards": {
    about: "Schwager interroge quinze gérants de hedge funds, dont Ray Dalio, Joel Greenblatt et Edward Thorp, et dégage une quarantaine de leçons sur le risque, la flexibilité et le processus.",
    ideas: [
      "Réduire la taille quand on doute.",
      "Le processus compte plus que le résultat d'une seule décision.",
      "Les meilleurs gérants changent d'avis vite.",
      "La diversification des stratégies stabilise les résultats.",
    ],
  },
  "Reminiscences of a Stock Operator": {
    about: "La biographie romancée de Jesse Livermore par Edwin Lefèvre. Le spéculateur raconte ses débuts dans les bucket shops, ses fortunes et ses ruines, et les lois de la spéculation qui restent vraies un siècle plus tard.",
    ideas: [
      "Le marché a toujours raison, l'opinion a souvent tort.",
      "Les gros gains viennent d'attendre, pas de trader souvent.",
      "Ne jamais moyenner à la baisse une position perdante.",
      "La nature humaine ne change pas, donc les marchés non plus.",
    ],
  },
  "Trading in the Zone": {
    about: "Mark Douglas explique que la réussite en trading dépend de l'état d'esprit : penser en probabilités, accepter le risque et appliquer son avantage sans émotion.",
    ideas: [
      "Chaque trade a un résultat incertain.",
      "Un avantage ne se révèle que sur une série de trades.",
      "Accepter le risque avant d'entrer en position.",
      "Cinq vérités fondamentales sur le marché.",
    ],
  },
  "The Disciplined Trader": {
    about: "Le premier livre de Mark Douglas analyse les croyances et habitudes mentales qui font perdre la plupart des traders, et la manière de les reconstruire pour s'adapter au marché.",
    ideas: [
      "Le marché n'a pas de structure imposée : la discipline doit venir de soi.",
      "La peur de se tromper bloque la perception.",
      "Les croyances sur l'argent influencent les décisions.",
      "Se fixer des règles et en mesurer le respect.",
    ],
  },
  "Technical Analysis of the Financial Markets": {
    about: "La bible de l'analyse technique de John Murphy : théorie de Dow, tendances, figures, volumes, moyennes mobiles, oscillateurs, chandeliers, vagues d'Elliott et analyse intermarchés.",
    ideas: [
      "Les prix intègrent toute l'information.",
      "Les prix évoluent en tendances.",
      "L'histoire se répète, car les comportements se répètent.",
      "Confirmer les signaux par le volume et plusieurs indicateurs.",
    ],
  },
  "Intermarket Analysis": {
    about: "Murphy montre comment obligations, actions, matières premières et devises s'influencent, et comment utiliser ces liens pour comprendre le cycle et la rotation sectorielle.",
    ideas: [
      "Les taux mènent souvent les actions.",
      "Le dollar et les matières premières évoluent souvent à l'inverse.",
      "Les secteurs tournent selon la phase du cycle.",
      "La déflation change les corrélations habituelles.",
    ],
  },
  "Japanese Candlestick Charting Techniques": {
    about: "Steve Nison a fait connaître en Occident les chandeliers japonais. Il décrit les figures (marteau, avalement, étoile du soir) et leur combinaison avec l'analyse technique classique.",
    ideas: [
      "Un chandelier montre ouverture, haut, bas et clôture.",
      "Les figures de retournement signalent un changement de sentiment.",
      "Le contexte de tendance donne leur sens aux figures.",
      "Combiner chandeliers et supports ou résistances.",
    ],
  },
  "Trading for a Living": {
    about: "Alexander Elder, psychiatre et trader, présente ses trois M : Mind (psychologie), Method (méthode) et Money (gestion du capital), avec son système de triple écran.",
    ideas: [
      "Psychologie, méthode et gestion du capital sont inséparables.",
      "Le triple écran combine plusieurs horizons de temps.",
      "Règle des 2 % : ne pas risquer plus par trade.",
      "Tenir un journal de trading.",
    ],
  },
  "Come Into My Trading Room": {
    about: "La suite de Trading for a Living : Elder approfondit la psychologie, les systèmes, la gestion du capital avec les règles des 2 % et 6 %, et l'organisation du trader.",
    ideas: [
      "Règle des 6 % : arrêter de trader après une perte mensuelle de 6 %.",
      "Les indicateurs se classent en suiveurs de tendance et oscillateurs.",
      "Un bon système est simple et testé.",
      "La tenue de registres fait progresser.",
    ],
  },
  "Analyse technique : pratiques et méthodes": {
    about: "Le manuel français de Béchu, Bertrand et Nebenzahl, utilisé en université et en salle de marché. Il couvre la théorie de Dow, les figures, les indicateurs et les systèmes de trading.",
    ideas: [
      "Les fondements théoriques de l'analyse technique.",
      "Figures chartistes et leurs objectifs de cours.",
      "Indicateurs et oscillateurs : construction et usage.",
      "Tester et évaluer un système de trading.",
    ],
  },
  "Volatility Trading": {
    about: "Euan Sinclair, trader d'options, explique comment mesurer, prévoir et trader la volatilité : écart entre volatilité implicite et réalisée, couverture delta et gestion du risque.",
    ideas: [
      "L'avantage vient de l'écart entre volatilité implicite et future.",
      "Plusieurs estimateurs de volatilité réalisée.",
      "La couverture delta transforme une option en pari sur la volatilité.",
      "Taille de position par le critère de Kelly.",
    ],
  },
  "Option Volatility and Pricing": {
    about: "Sheldon Natenberg, référence des teneurs de marché, explique les modèles d'évaluation, les grecques et les stratégies d'options du point de vue d'un trader professionnel.",
    ideas: [
      "La volatilité est le paramètre central du prix d'une option.",
      "Delta, gamma, vega et thêta mesurent les risques.",
      "Les spreads permettent d'isoler un risque précis.",
      "Les modèles ont des limites à connaître.",
    ],
  },
  "Dynamic Hedging": {
    about: "Le livre technique de Nassim Taleb sur la gestion des options exotiques et vanilles du point de vue du trader : risques de second ordre, queues de distribution et limites des modèles.",
    ideas: [
      "Les modèles sous-estiment les mouvements extrêmes.",
      "Le gamma et le vega se gèrent dynamiquement.",
      "Les options exotiques cachent des risques non linéaires.",
      "La pratique prime sur la théorie.",
    ],
  },

  // ── Risk and behaviour ──
  "The Psychology of Money": {
    about: "Morgan Housel montre en vingt courts chapitres que réussir avec l'argent dépend davantage du comportement que de l'intelligence. Il parle de chance, de risque, d'épargne et de la notion d'assez.",
    ideas: [
      "Chacun juge l'argent à travers sa propre expérience.",
      "Les intérêts composés demandent du temps et de la patience.",
      "Savoir ce qui est assez évite les risques inutiles.",
      "Garder une marge de sécurité pour survivre aux mauvaises surprises.",
    ],
  },
  "Same as Ever": {
    about: "Housel recense les comportements humains qui ne changent pas d'un siècle à l'autre : peur, cupidité, récits, attentes. Comprendre ce qui reste stable aide à mieux décider dans l'incertitude.",
    ideas: [
      "Le risque est ce qu'on ne voit pas venir.",
      "Les attentes comptent autant que la réalité.",
      "Les bonnes nouvelles prennent du temps, les mauvaises arrivent vite.",
      "Les histoires l'emportent sur les statistiques.",
    ],
  },
  "The Art of Spending Money": {
    about: "La suite de The Psychology of Money : Housel s'intéresse à l'usage de la richesse une fois constituée, et à la façon de dépenser en accord avec ses valeurs.",
    ideas: [
      "L'argent sert à acheter du temps et de l'indépendance.",
      "La comparaison sociale fausse les dépenses.",
      "Dépenser selon ses valeurs plutôt que selon les attentes des autres.",
      "Le contentement compte plus que le montant.",
    ],
  },
  "Thinking, Fast and Slow": {
    about: "Daniel Kahneman, prix Nobel d'économie, décrit deux systèmes de pensée : rapide et intuitif, lent et réfléchi. Il explique les biais qui en découlent et la théorie des perspectives.",
    ideas: [
      "Le système 1 décide vite mais se trompe souvent.",
      "Une perte pèse environ deux fois plus qu'un gain équivalent.",
      "Ancrage, disponibilité et excès de confiance faussent les jugements.",
      "Les experts sont souvent moins fiables que de simples formules.",
    ],
  },
  "Noise": {
    about: "Kahneman, Sibony et Sunstein montrent que les jugements professionnels (juges, médecins, assureurs, analystes) varient fortement d'une personne à l'autre et d'un moment à l'autre. Ce bruit coûte autant que les biais.",
    ideas: [
      "Le bruit est la dispersion des jugements sur un même cas.",
      "Il se mesure par des audits de bruit.",
      "Des règles et des grilles réduisent le bruit.",
      "Agréger des jugements indépendants améliore la précision.",
    ],
  },
  "Misbehaving": {
    about: "Richard Thaler, prix Nobel, raconte la naissance de la finance comportementale, face à l'économie classique qui suppose des agents rationnels.",
    ideas: [
      "Les gens ne se comportent pas comme l'Homo economicus.",
      "La comptabilité mentale fausse les décisions financières.",
      "L'effet de dotation : on surestime ce qu'on possède.",
      "Les marchés aussi peuvent mal valoriser.",
    ],
  },
  "Nudge": {
    about: "Thaler et Sunstein montrent comment l'architecture des choix (options par défaut, présentation) influence les décisions, par exemple l'épargne retraite, sans contraindre.",
    ideas: [
      "L'option par défaut détermine souvent le choix.",
      "Le paternalisme libéral : orienter sans interdire.",
      "L'inscription automatique augmente fortement l'épargne.",
      "Simplifier les choix aide les gens.",
    ],
  },
  "The Black Swan": {
    about: "Nassim Taleb décrit les cygnes noirs : des événements rares, imprévisibles et à fort impact, que l'on explique après coup. Il critique les modèles fondés sur la loi normale.",
    ideas: [
      "Les événements extrêmes dominent l'histoire.",
      "Médiocristan et Extrêmistan : deux types de hasard.",
      "On surestime notre capacité à prévoir.",
      "Se protéger des chocs négatifs, s'exposer aux chocs positifs.",
    ],
  },
  "Fooled by Randomness": {
    about: "Taleb montre comment le hasard est confondu avec le talent, en particulier chez les traders. Il parle de biais du survivant, d'histoires alternatives et d'asymétrie des résultats.",
    ideas: [
      "Un bon résultat ne prouve pas une bonne décision.",
      "Le biais du survivant cache les perdants.",
      "Il faut juger une stratégie sur toutes les histoires possibles.",
      "Éviter les risques de ruine.",
    ],
  },
  "Antifragile": {
    about: "Taleb va au-delà de la robustesse : certaines choses gagnent au désordre et au stress. Il applique l'idée à l'économie, à la santé, à la politique et aux portefeuilles.",
    ideas: [
      "Fragile, robuste, antifragile : trois réactions au choc.",
      "La stratégie des haltères : très sûr et très risqué, rien au milieu.",
      "L'optionnalité permet de profiter de l'incertitude.",
      "L'intervention excessive fragilise les systèmes.",
    ],
  },
  "Skin in the Game": {
    about: "Taleb défend que ceux qui prennent des décisions doivent en subir les conséquences. Sans cet engagement personnel, les risques sont transférés à d'autres.",
    ideas: [
      "Ne jamais faire confiance à qui ne risque rien.",
      "L'asymétrie des conséquences crée des abus.",
      "Une minorité intransigeante peut imposer ses règles.",
      "La survie passe avant la performance.",
    ],
  },
  "Against the Gods": {
    about: "Peter Bernstein raconte l'histoire de la notion de risque, des probabilités de Pascal et Fermat à la théorie du portefeuille, et montre comment l'humanité a appris à mesurer l'incertain.",
    ideas: [
      "La maîtrise du risque a rendu possible le monde moderne.",
      "Probabilités, loi des grands nombres et régression vers la moyenne.",
      "La théorie des jeux et le portefeuille de Markowitz.",
      "Les limites de la mesure face à l'imprévisible.",
    ],
  },
  "Capital Ideas": {
    about: "Peter Bernstein raconte comment les chercheurs (Markowitz, Sharpe, Fama, Black, Scholes, Merton) ont transformé Wall Street avec la théorie moderne de la finance.",
    ideas: [
      "La diversification optimise le couple rendement-risque.",
      "Le MEDAF relie rendement et bêta.",
      "L'efficience des marchés a donné naissance aux fonds indiciels.",
      "Le modèle Black-Scholes a ouvert le marché des options.",
    ],
  },
  "Thinking in Bets": {
    about: "Annie Duke, ancienne championne de poker, explique comment décider sous incertitude : séparer la qualité d'une décision de son résultat et penser en probabilités.",
    ideas: [
      "Ne pas juger une décision à son seul résultat.",
      "Exprimer ses croyances en probabilités.",
      "Chercher des avis contradictoires.",
      "Imaginer les scénarios futurs avant de décider.",
    ],
  },
  "Superforecasting": {
    about: "Philip Tetlock et Dan Gardner présentent le projet de prévision qui a montré que certaines personnes prévoient beaucoup mieux que les experts, grâce à une méthode précise.",
    ideas: [
      "Décomposer les grandes questions en petites.",
      "Partir d'un taux de base avant d'ajuster.",
      "Mettre à jour souvent, par petites touches.",
      "Mesurer ses prévisions pour s'améliorer.",
    ],
  },
  "On the Edge": {
    about: "Nate Silver explore le monde des preneurs de risque (poker, paris sportifs, hedge funds, capital-risque, cryptomonnaies) et leur manière de raisonner en espérance de gain.",
    ideas: [
      "Penser en valeur espérée, pas en certitude.",
      "Les preneurs de risque partagent des traits communs.",
      "Le capital-risque vit de quelques succès énormes.",
      "L'excès de confiance mène à la chute (exemple FTX).",
    ],
  },
  "The Missing Billionaires": {
    about: "Victor Haghani et James White se demandent pourquoi tant de grandes fortunes ont disparu. Leur réponse : une mauvaise taille de position. Ils appliquent l'utilité espérée et le critère de Kelly au patrimoine privé.",
    ideas: [
      "La taille de position compte autant que le choix de l'actif.",
      "Le critère de Kelly évite la ruine.",
      "Dépenser et investir selon une utilité cohérente.",
      "Les paris trop gros détruisent les fortunes.",
    ],
  },
  "Chaos Kings": {
    about: "Scott Patterson suit Nassim Taleb, Mark Spitznagel et le fonds Universa, qui gagnent pendant les krachs, et d'autres investisseurs qui se préparent aux catastrophes.",
    ideas: [
      "La couverture du risque extrême coûte peu en temps normal.",
      "Universa a gagné énormément en mars 2020.",
      "Les risques climatiques et pandémiques sont sous-estimés.",
      "Préparer un portefeuille à l'imprévisible.",
    ],
  },
  "Value at Risk": {
    about: "Philippe Jorion présente la valeur à risque (VaR), mesure standard du risque de marché dans les banques : méthodes de calcul, limites, tests a posteriori et réglementation.",
    ideas: [
      "La VaR estime la perte maximale à un niveau de confiance donné.",
      "Méthodes historique, paramétrique et Monte-Carlo.",
      "La VaR ne dit rien de l'ampleur des pertes au-delà du seuil.",
      "Les tests de résistance complètent la VaR.",
    ],
  },
  "Risk Management and Financial Institutions": {
    about: "John Hull explique la gestion des risques dans les banques et compagnies d'assurance : risque de marché, de crédit, de liquidité, opérationnel, et la réglementation de Bâle.",
    ideas: [
      "Les institutions financières font face à plusieurs familles de risques.",
      "Bâle impose des fonds propres selon les risques.",
      "VaR et expected shortfall comme mesures de risque.",
      "Les crises révèlent les risques de liquidité.",
    ],
  },
  "The Misbehavior of Markets": {
    about: "Benoît Mandelbrot, inventeur des fractales, montre que les cours ne suivent pas la loi normale : les mouvements extrêmes sont beaucoup plus fréquents que prévu.",
    ideas: [
      "Les variations de prix ont des queues épaisses.",
      "La volatilité se regroupe dans le temps.",
      "Les modèles financiers classiques sous-estiment le risque.",
      "Les fractales décrivent mieux les marchés.",
    ],
  },
  "Psychologie de l'investisseur et des marchés financiers": {
    about: "Mickaël Mangot, docteur en économie, présente la finance comportementale en français : biais individuels, émotions, comportements de groupe et anomalies de marché.",
    ideas: [
      "Excès de confiance et trading excessif.",
      "Effet de disposition : vendre les gagnants, garder les perdants.",
      "Mimétisme et bulles spéculatives.",
      "Des règles simples pour limiter les erreurs.",
    ],
  },

  // ── Macro and market history ──
  "Principles": {
    about: "Ray Dalio, fondateur de Bridgewater, partage les principes de vie et de management qui ont guidé son fonds : transparence radicale, méritocratie des idées et apprentissage par l'erreur.",
    ideas: [
      "Douleur + réflexion = progrès.",
      "La transparence radicale améliore les décisions collectives.",
      "Systématiser ses décisions sous forme de principes.",
      "Pondérer les avis selon la crédibilité de chacun.",
    ],
  },
  "Big Debt Crises": {
    about: "Dalio décrit le modèle des cycles de dette, avec des études détaillées de la crise de 2008, de l'Allemagne de Weimar et des États-Unis des années 1930.",
    ideas: [
      "Les crises de dette suivent un schéma répétitif.",
      "Déflation et inflation : deux types de désendettement.",
      "Le désendettement harmonieux combine plusieurs leviers.",
      "Les banques centrales jouent un rôle décisif.",
    ],
  },
  "The Changing World Order": {
    about: "Dalio étudie cinq siècles d'histoire des empires (Pays-Bas, Royaume-Uni, États-Unis, Chine) pour comprendre les cycles de puissance, de dette et de monnaie.",
    ideas: [
      "Les empires suivent un cycle d'ascension et de déclin.",
      "La dette et la création monétaire marquent la fin des cycles.",
      "Le conflit interne et externe accompagne les transitions.",
      "La Chine monte, les États-Unis sont en fin de cycle.",
    ],
  },
  "How Countries Go Broke": {
    about: "Dalio applique son modèle du grand cycle de la dette aux États-Unis et aux grands pays endettés, et explique comment les États peuvent faire faillite ou dévaluer leur monnaie.",
    ideas: [
      "La dette publique suit un cycle long.",
      "Les banques centrales finissent par monétiser.",
      "Les créanciers perdent via l'inflation ou la dévaluation.",
      "Les signaux d'alerte se mesurent.",
    ],
  },
  "Irrational Exuberance": {
    about: "Robert Shiller, prix Nobel, analyse les bulles boursières et immobilières. Il présente le ratio CAPE et les facteurs culturels et psychologiques qui gonflent les prix.",
    ideas: [
      "Le CAPE mesure la cherté du marché sur dix ans de bénéfices.",
      "Les bulles s'appuient sur des récits.",
      "Les médias amplifient l'euphorie.",
      "Des valorisations élevées annoncent des rendements faibles.",
    ],
  },
  "Narrative Economics": {
    about: "Shiller montre que les récits populaires se propagent comme des épidémies et influencent les décisions économiques, les crises et les marchés.",
    ideas: [
      "Les histoires se diffusent et s'éteignent comme des virus.",
      "Les récits influencent la consommation et l'investissement.",
      "Exemples : bitcoin, krach de 1929, peur de l'automatisation.",
      "Les économistes doivent étudier les récits.",
    ],
  },
  "Manias, Panics, and Crashes": {
    about: "Charles Kindleberger décrit le schéma des crises financières sur plusieurs siècles : choc, euphorie, crédit, détresse, panique et rôle du prêteur en dernier ressort.",
    ideas: [
      "Les crises suivent un schéma récurrent.",
      "Le crédit alimente l'euphorie.",
      "La fraude augmente en fin de bulle.",
      "Le prêteur en dernier ressort arrête la panique.",
    ],
  },
  "The Ascent of Money": {
    about: "Niall Ferguson raconte l'histoire financière du monde : crédit, obligations, actions, assurance, immobilier et mondialisation, de la Mésopotamie à la crise de 2008.",
    ideas: [
      "La finance est à l'origine de l'essor des civilisations.",
      "Les obligations ont financé les États et les guerres.",
      "Les bulles accompagnent chaque innovation financière.",
      "La mondialisation financière crée des liens fragiles.",
    ],
  },
  "This Time Is Different": {
    about: "Carmen Reinhart et Kenneth Rogoff étudient huit siècles de crises financières dans soixante-six pays : défauts souverains, crises bancaires, inflation et crises de change.",
    ideas: [
      "« Cette fois, c'est différent » précède chaque crise.",
      "Les crises bancaires suivent souvent un boom du crédit.",
      "La dette publique grimpe après les crises.",
      "Les défauts souverains sont fréquents dans l'histoire.",
    ],
  },
  "Lords of Finance": {
    about: "Liaquat Ahamed raconte les quatre banquiers centraux (Norman, Strong, Moreau, Schacht) dont les décisions, liées à l'étalon-or, ont contribué à la Grande Dépression.",
    ideas: [
      "L'étalon-or a transmis la crise d'un pays à l'autre.",
      "Les dettes de guerre ont fragilisé l'Europe.",
      "Les erreurs de politique monétaire ont aggravé la crise.",
      "La personnalité des dirigeants a compté.",
    ],
  },
  "The Great Crash 1929": {
    about: "John Kenneth Galbraith raconte le krach de 1929 : la spéculation à crédit, les fonds d'investissement, les jours de panique et les erreurs des dirigeants.",
    ideas: [
      "La spéculation à crédit a nourri la bulle.",
      "Les sociétés d'investissement à levier ont amplifié les pertes.",
      "Les déclarations rassurantes n'ont pas arrêté la panique.",
      "Le krach a révélé les faiblesses de l'économie.",
    ],
  },
  "The Price of Time": {
    about: "Edward Chancellor retrace l'histoire des taux d'intérêt et montre ce qui se passe quand l'argent reste trop bon marché : bulles, mauvaise allocation du capital, inégalités.",
    ideas: [
      "Le taux d'intérêt est le prix du temps.",
      "Des taux trop bas favorisent les bulles et les zombies.",
      "La finance devient plus spéculative.",
      "Les épargnants sont pénalisés.",
    ],
  },
  "The Big Short": {
    about: "Michael Lewis raconte les quelques investisseurs (Michael Burry, Steve Eisman, Greg Lippmann) qui ont parié contre les crédits immobiliers subprimes avant la crise de 2008.",
    ideas: [
      "Les produits complexes cachaient des crédits de mauvaise qualité.",
      "Les agences de notation ont failli.",
      "Avoir raison trop tôt est très inconfortable.",
      "Le système récompensait la prise de risque cachée.",
    ],
  },
  "Liar's Poker": {
    about: "Michael Lewis raconte ses années de vendeur d'obligations chez Salomon Brothers dans les années 1980, au moment de l'essor des obligations hypothécaires.",
    ideas: [
      "La culture de Wall Street pousse à la prise de risque.",
      "La titrisation des crédits immobiliers est née à cette époque.",
      "Les clients sont parfois des victimes.",
      "L'appât du gain domine les salles de marché.",
    ],
  },
  "Flash Boys": {
    about: "Michael Lewis enquête sur le trading à haute fréquence et la manière dont certains acteurs profitent de la vitesse pour passer devant les ordres des investisseurs.",
    ideas: [
      "La vitesse donne un avantage sur l'information.",
      "La fragmentation des marchés crée des failles.",
      "IEX a été créé pour neutraliser cet avantage.",
      "Les investisseurs paient un coût caché.",
    ],
  },
  "Going Infinite": {
    about: "Michael Lewis raconte l'ascension et la chute de Sam Bankman-Fried et de FTX, la plateforme de cryptomonnaies qui s'est effondrée en 2022.",
    ideas: [
      "Une croissance rapide sans contrôle interne.",
      "Les fonds des clients ont été mélangés avec ceux d'Alameda.",
      "Le culte du génie a masqué les risques.",
      "La confiance disparaît en quelques jours.",
    ],
  },
  "When Genius Failed": {
    about: "Roger Lowenstein raconte la chute de Long-Term Capital Management en 1998, un fonds dirigé par des prix Nobel, qui a dû être secouru par Wall Street.",
    ideas: [
      "Le levier extrême rend fragile les meilleurs modèles.",
      "Les corrélations montent en crise.",
      "La liquidité disparaît quand on en a besoin.",
      "Le risque systémique a forcé un sauvetage.",
    ],
  },
  "Buffett: The Making of an American Capitalist": {
    about: "La biographie de référence de Warren Buffett par Roger Lowenstein, de son enfance à Omaha à la construction de Berkshire Hathaway.",
    ideas: [
      "L'influence de Graham sur la méthode de Buffett.",
      "Les partenariats des années 1950-1960.",
      "La transformation de Berkshire en conglomérat.",
      "La discipline et l'indépendance d'esprit.",
    ],
  },
  "The Greatest Trade Ever": {
    about: "Gregory Zuckerman raconte comment John Paulson a parié contre le marché immobilier américain et gagné près de 20 milliards de dollars pour son fonds en 2007.",
    ideas: [
      "L'analyse détaillée des prêts a révélé la bulle.",
      "Les CDS ont permis de parier à faible coût.",
      "Les sceptiques ont longtemps douté.",
      "Un pari asymétrique bien construit.",
    ],
  },
  "Dark Pools": {
    about: "Scott Patterson, journaliste au Wall Street Journal, raconte comment les marchés américains sont passés des criées aux machines : plateformes électroniques, trading à haute fréquence et dark pools, ces lieux d'échange où les ordres ne sont pas affichés.",
    ideas: [
      "Island et les plateformes électroniques ont cassé le monopole des bourses.",
      "Les algorithmes ont pris le contrôle de l'exécution.",
      "Les dark pools cachent les ordres des grands investisseurs.",
      "Le flash crash de 2010 a montré la fragilité du système.",
    ],
  },
  "Broken Markets": {
    about: "Sal Arnuk et Joseph Saluzzi, courtiers, dénoncent les effets du trading à haute fréquence, des paiements pour flux d'ordres et de la fragmentation sur les investisseurs.",
    ideas: [
      "La structure de marché favorise les acteurs rapides.",
      "Les rabais et paiements pour flux créent des conflits d'intérêts.",
      "Les investisseurs de long terme paient le prix.",
      "Propositions de réforme de la réglementation.",
    ],
  },
  "Trading and Exchanges: Market Microstructure for Practitioners": {
    about: "Larry Harris, ancien économiste en chef de la SEC, décrit le fonctionnement des marchés : types d'ordres, teneurs de marché, liquidité, coûts de transaction et réglementation.",
    ideas: [
      "Qui fournit et qui consomme la liquidité.",
      "Les types d'ordres et leurs coûts.",
      "Le spread rémunère le risque du teneur de marché.",
      "La conception d'un marché influence son efficacité.",
    ],
  },
  "Le Capital au XXIe siècle": {
    about: "Thomas Piketty étudie deux siècles de données sur les revenus et les patrimoines. Il montre que lorsque le rendement du capital dépasse la croissance, les inégalités de patrimoine augmentent.",
    ideas: [
      "r > g : le capital croît plus vite que l'économie.",
      "Les inégalités de patrimoine ont reculé au XXe siècle puis remonté.",
      "L'héritage reprend un rôle central.",
      "Proposition d'un impôt mondial sur le capital.",
    ],
  },
  "Si la Bourse m'était contée": {
    about: "André Kostolany, spéculateur et conteur, partage ses anecdotes et sa philosophie boursière : les cycles, la psychologie des foules et la différence entre joueurs et investisseurs.",
    ideas: [
      "Les « tremblants » et les « têtus » expliquent les mouvements.",
      "Argent + psychologie = tendance.",
      "Acheter des actions et prendre des somnifères.",
      "La patience est la qualité du spéculateur.",
    ],
  },
  "Des lions menés par des ânes": {
    about: "Charles Gave, économiste et gérant, critique les politiques monétaires et économiques européennes et l'intervention de l'État dans l'économie.",
    ideas: [
      "Les dirigeants prennent de mauvaises décisions économiques.",
      "Les taux d'intérêt fixés artificiellement faussent l'économie.",
      "L'euro a aggravé les déséquilibres.",
      "Plaidoyer pour une économie plus libérale.",
    ],
  },
  "La crise, et après ?": {
    about: "Jacques Attali analyse la crise financière de 2008, ses causes (dette, dérégulation) et propose des pistes de régulation mondiale.",
    ideas: [
      "La crise vient d'un excès de dette privée.",
      "La dérégulation a permis les abus.",
      "Les déséquilibres mondiaux ont nourri la bulle.",
      "Il faut une régulation financière mondiale.",
    ],
  },
  "Jusqu'à quand ? Pour en finir avec les crises financières": {
    about: "Frédéric Lordon, économiste, analyse la crise des subprimes et propose des réformes radicales pour limiter la finance spéculative.",
    ideas: [
      "La finance libéralisée produit des crises à répétition.",
      "Le levier et la titrisation ont amplifié la crise.",
      "Limiter la rentabilité actionnariale.",
      "Réformer en profondeur le système bancaire.",
    ],
  },
  "Le Commerce des promesses": {
    about: "Pierre-Noël Giraud, économiste, décrit la finance comme un commerce de promesses de revenus futurs et analyse ses excès, ses crises et son utilité.",
    ideas: [
      "Un titre financier est une promesse sur l'avenir.",
      "La finance alloue le capital mais crée des bulles.",
      "Les crises arrivent quand les promesses ne sont pas tenues.",
      "La régulation doit encadrer ces promesses.",
    ],
  },
  "Richer, Wiser, Happier": {
    about: "William Green a interrogé pendant des années de grands investisseurs (Munger, Marks, Templeton, Pabrai, Spier) sur leur méthode et leur façon de vivre.",
    ideas: [
      "Les grands investisseurs pensent de manière indépendante.",
      "La patience et la simplicité sont des avantages.",
      "Éviter les erreurs plutôt que chercher l'exploit.",
      "La richesse doit servir une vie bien menée.",
    ],
  },

  // ── Derivatives and pricing ──
  "Options, Futures, and Other Derivatives": {
    about: "Le manuel de John Hull, référence mondiale sur les dérivés : contrats à terme, swaps, options, modèle de Black-Scholes, arbres binomiaux, grecques et risque de crédit.",
    ideas: [
      "L'absence d'arbitrage fixe le prix des dérivés.",
      "Black-Scholes-Merton évalue les options européennes.",
      "Les grecques mesurent la sensibilité aux paramètres.",
      "Les dérivés servent à couvrir autant qu'à spéculer.",
    ],
  },
  "Fixed Income Securities": {
    about: "Bruce Tuckman et Angel Serrat expliquent l'évaluation et la gestion du risque des obligations et des dérivés de taux : courbe des taux, duration, convexité, swaps.",
    ideas: [
      "La courbe des taux est la base de toute évaluation.",
      "Duration et convexité mesurent le risque de taux.",
      "Les modèles de taux reproduisent la courbe.",
      "Swaps, futures et options sur taux.",
    ],
  },
  "Continuous-Time Finance": {
    about: "Robert Merton, prix Nobel, rassemble ses travaux en temps continu : choix de portefeuille optimal, évaluation des options et de la dette d'entreprise.",
    ideas: [
      "Le calcul stochastique décrit les prix des actifs.",
      "Le choix de portefeuille dans le temps (modèle de Merton).",
      "La dette d'entreprise peut s'évaluer comme une option.",
      "Fondements de la finance mathématique moderne.",
    ],
  },
  "Asset Pricing": {
    about: "John Cochrane unifie la théorie de l'évaluation des actifs autour d'une équation : le prix est l'espérance du flux futur multiplié par un facteur d'actualisation stochastique.",
    ideas: [
      "p = E(mx) : une équation pour tous les actifs.",
      "Le facteur d'actualisation stochastique relie risque et prix.",
      "Les modèles factoriels en sont des cas particuliers.",
      "Tester empiriquement les modèles.",
    ],
  },
  "Marchés financiers : gestion de portefeuille et des risques": {
    about: "Le manuel français de Jacquillat, Solnik et Pérignon sur les marchés financiers : efficience, théorie du portefeuille, MEDAF, obligations, dérivés et gestion des risques.",
    ideas: [
      "La diversification et la frontière efficiente.",
      "Les modèles d'évaluation des actifs financiers.",
      "La gestion obligataire et le risque de taux.",
      "La mesure et la gestion des risques.",
    ],
  },
};

/** Detail for one book, if it was written. */
export const detailOf = (title: string): BookDetail | undefined => {
  const d = BOOK_DETAILS[title];
  return d && d.about ? d : undefined;
};
