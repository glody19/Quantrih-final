// Longer French presentations for the most read books, the French authors and the books added in November 2026.
// They replace the shorter entry of bookDetails.ts for the same title (see detailOf).
// about: four to six sentences on the author, the content and the method. ideas: four or five key ideas.
// forWho: who will get the most out of the book.

import type { BookDetail } from "./bookDetails";

export const RICH_DETAILS: Record<string, BookDetail> = {
  // ── Best-sellers ──
  "The Intelligent Investor": {
    about: "Publié en 1949 par Benjamin Graham, professeur à Columbia et gérant de fonds, ce livre pose les bases de l'investissement dans la valeur. Graham distingue l'investisseur, qui analyse une entreprise et exige une marge de sécurité, du spéculateur, qui parie sur les mouvements de prix. Il oppose l'investisseur défensif, qui cherche la simplicité et la sécurité, à l'investisseur entreprenant, prêt à consacrer du temps à l'analyse. Les éditions récentes sont commentées par Jason Zweig, qui relie chaque chapitre aux marchés d'aujourd'hui. Warren Buffett le présente comme le meilleur livre jamais écrit sur l'investissement.",
    ideas: [
      "Monsieur Marché propose chaque jour un prix : on peut l'ignorer ou en profiter, jamais le suivre.",
      "La marge de sécurité, acheter nettement sous la valeur estimée, protège des erreurs d'analyse.",
      "Une action est une part d'entreprise, pas un ticket de loterie.",
      "L'investisseur défensif répartit entre actions et obligations et rééquilibre sans chercher à prévoir.",
      "Le plus grand ennemi de l'investisseur est souvent lui-même.",
    ],
    forWho: "Tout investisseur en actions, débutant patient ou confirmé. La lecture demande de l'attention, les commentaires de Zweig la facilitent.",
  },
  "A Random Walk Down Wall Street": {
    about: "Burton Malkiel, professeur à Princeton et ancien administrateur de Vanguard, défend depuis 1973 l'idée que les cours suivent une marche au hasard à court terme. Il passe en revue les bulles de l'histoire, de la tulipe aux valeurs internet, puis les méthodes qui prétendent battre le marché : analyse technique, analyse fondamentale, gestion active. Sa conclusion est que la plupart échouent une fois les frais déduits. Le livre se termine par un guide pratique : épargne de précaution, fonds indiciels à bas coût et allocation selon l'âge. Il est réédité régulièrement et intègre les ETF, la finance comportementale et les cryptomonnaies.",
    ideas: [
      "Un portefeuille choisi au hasard fait aussi bien qu'une majorité de gérants professionnels.",
      "Les bulles se répètent parce que la psychologie des foules ne change pas.",
      "Les frais sont le seul facteur de performance que l'on contrôle vraiment.",
      "L'allocation entre actions et obligations doit suivre l'âge et la tolérance au risque.",
    ],
    forWho: "Ceux qui veulent comprendre pourquoi la gestion indicielle domine, et ceux qui hésitent à confier leur argent à un gérant actif.",
  },
  "One Up On Wall Street": {
    about: "Peter Lynch a géré le fonds Fidelity Magellan de 1977 à 1990, avec une performance annuelle moyenne d'environ 29 %. Dans ce livre de 1989, il explique qu'un particulier peut repérer de bonnes entreprises avant les professionnels en observant ce qu'il achète, utilise et voit autour de lui. Il classe les actions en six familles (croissance lente, valeurs solides, croissance rapide, cycliques, redressements, valeurs d'actifs) et donne pour chacune ce qu'il faut vérifier. Il insiste sur le fait qu'une bonne idée de départ doit toujours être suivie d'une étude des comptes. Le ton est vivant, rempli d'exemples tirés de sa carrière.",
    ideas: [
      "Investissez dans ce que vous connaissez, puis vérifiez les chiffres.",
      "Classez chaque action dans une catégorie pour savoir ce qu'il faut en attendre.",
      "Le ratio cours sur bénéfices doit être comparé à la croissance des bénéfices.",
      "Les meilleures affaires sont souvent ennuyeuses, peu suivies par les analystes.",
      "Il faut pouvoir expliquer en deux minutes pourquoi on détient une action.",
    ],
    forWho: "Les particuliers qui veulent choisir leurs actions eux-mêmes, sans formation financière poussée.",
  },
  "The Little Book of Common Sense Investing": {
    about: "John Bogle a fondé Vanguard et lancé en 1976 le premier fonds indiciel accessible aux particuliers. Ce petit livre résume son combat : les investisseurs, pris ensemble, détiennent le marché, donc obtiennent en moyenne le rendement du marché moins les frais. Les gérants actifs coûtent cher, et leurs frais se cumulent au fil des décennies. Bogle chiffre cet écart et montre qu'un fonds indiciel large, détenu longtemps, bat la grande majorité des fonds actifs. Il met aussi en garde contre les ETF utilisés pour faire des allers-retours.",
    ideas: [
      "Les frais composés détruisent une grande partie du rendement sur trente ans.",
      "Acheter tout le marché et le garder est la stratégie la plus fiable.",
      "Les fonds qui ont battu le marché le battent rarement ensuite.",
      "Le temps passé investi compte plus que le moment choisi pour entrer.",
    ],
    forWho: "Tout épargnant qui investit en ETF ou hésite à le faire. Court, clair, sans calcul compliqué.",
  },
  "Common Stocks and Uncommon Profits": {
    about: "Philip Fisher, gérant à San Francisco à partir de 1931, a publié ce livre en 1958. Il y décrit l'investissement dans des entreprises de croissance de grande qualité, à garder pendant des années. Sa méthode du bouche-à-oreille consiste à interroger clients, fournisseurs, concurrents et anciens salariés pour juger une entreprise de l'intérieur. Il propose quinze questions qui portent sur la recherche et développement, les marges, la force commerciale et l'honnêteté de la direction. Warren Buffett a dit être à 85 % Graham et à 15 % Fisher.",
    ideas: [
      "Une grande entreprise achetée au bon prix se garde presque indéfiniment.",
      "Les quinze questions de Fisher jugent la qualité de la gestion autant que les chiffres.",
      "L'enquête de terrain révèle ce que les rapports annuels ne disent pas.",
      "Mieux vaut peu d'entreprises bien connues qu'une diversification excessive.",
    ],
    forWho: "Les investisseurs orientés croissance et qualité, qui acceptent de concentrer leur portefeuille.",
  },
  "The Essays of Warren Buffett": {
    about: "Lawrence Cunningham, professeur de droit, a réorganisé par thème les lettres annuelles de Warren Buffett aux actionnaires de Berkshire Hathaway. On y trouve sa vision de la gouvernance, de l'allocation du capital, des acquisitions, de la valorisation et de la comptabilité. Buffett explique pourquoi il préfère les entreprises dotées d'un avantage concurrentiel durable, achetées à un prix raisonnable. Il critique les stock-options, les dérivés et les dirigeants qui servent leurs intérêts avant ceux des actionnaires. C'est la façon la plus directe de lire Buffett dans ses propres mots.",
    ideas: [
      "Mieux vaut une entreprise exceptionnelle à un prix correct qu'une entreprise correcte à un prix exceptionnel.",
      "La valeur intrinsèque est la somme actualisée des flux de trésorerie futurs.",
      "Un bon dirigeant alloue le capital comme un propriétaire.",
      "Il faut rester dans son cercle de compétence.",
    ],
    forWho: "Ceux qui veulent comprendre la pensée de Buffett sans passer par des résumés de seconde main.",
  },
  "Security Analysis": {
    about: "Écrit en 1934 par Benjamin Graham et David Dodd après le krach de 1929, c'est le manuel fondateur de l'analyse financière. Il apprend à lire un bilan, à évaluer les obligations et les actions privilégiées, puis les actions ordinaires, en séparant le prix de la valeur. Graham et Dodd recommandent de juger une entreprise sur ses bénéfices moyens de plusieurs années et sur ses actifs, plutôt que sur l'optimisme du moment. Le livre est long et technique, mais les éditions récentes ajoutent des commentaires de gérants actuels. The Intelligent Investor en est la version grand public.",
    ideas: [
      "Un investissement promet la sécurité du capital et un rendement suffisant après analyse approfondie.",
      "Le bilan et les bénéfices sur longue période comptent plus que les prévisions.",
      "Le marché est à court terme une machine à voter, à long terme une machine à peser.",
      "Les obligations et les actions s'analysent avec la même rigueur.",
    ],
    forWho: "Les étudiants en finance et les investisseurs qui veulent maîtriser l'analyse fondamentale en profondeur.",
  },
  "Reminiscences of a Stock Operator": {
    about: "Publié en 1923 par le journaliste Edwin Lefèvre, ce récit à peine romancé suit Larry Livingston, double de Jesse Livermore, l'un des plus célèbres spéculateurs de Wall Street. On le voit débuter dans les bucket shops, faire fortune, se ruiner plusieurs fois et se relever. Chaque épisode illustre une leçon : suivre la tendance de fond, laisser courir les gains, couper vite les pertes, se méfier des tuyaux. Cent ans plus tard, c'est encore le livre le plus cité par les traders professionnels.",
    ideas: [
      "L'argent se gagne en restant assis sur une bonne position, pas en s'agitant.",
      "Il ne faut jamais faire la moyenne à la baisse sur une position perdante.",
      "Le marché a toujours raison, l'opinion personnelle ne compte pas.",
      "Wall Street ne change jamais, car la nature humaine ne change pas.",
    ],
    forWho: "Tous les traders, et ceux qui veulent comprendre la psychologie de la spéculation par une histoire vivante.",
  },
  "Market Wizards": {
    about: "Jack Schwager a interviewé à la fin des années 1980 des traders parmi les plus performants des États-Unis : Paul Tudor Jones, Ed Seykota, Bruce Kovner, Michael Marcus, Richard Dennis, William O'Neil et d'autres. Chacun raconte son parcours, ses pertes et sa méthode, qu'il s'agisse de suivi de tendance, d'analyse fondamentale ou de lecture du carnet d'ordres. Le livre montre qu'il n'existe pas une seule bonne méthode. Les points communs sont ailleurs : discipline, gestion du risque et adéquation entre la méthode et la personnalité. Schwager a ensuite publié plusieurs suites.",
    ideas: [
      "Chaque grand trader a trouvé une méthode adaptée à son caractère.",
      "Le contrôle des pertes vient avant la recherche du gain.",
      "La plupart ont connu une ruine ou une grosse perte avant de réussir.",
      "La confiance naît d'un processus testé, pas de l'intuition.",
    ],
    forWho: "Les traders actifs et ceux qui hésitent sur leur style de trading.",
  },
  "Stocks for the Long Run": {
    about: "Jeremy Siegel, professeur à Wharton, a reconstitué plus de deux siècles de rendements des actions, obligations, bons du Trésor et de l'or aux États-Unis. Il montre qu'après inflation, les actions ont rapporté environ 6 à 7 % par an sur le très long terme, bien plus que les obligations. Surtout, sur des périodes de vingt ans et plus, les actions se sont révélées moins risquées en termes réels que les obligations. Le livre traite aussi des dividendes, des cycles économiques, de la politique monétaire et des marchés internationaux. Il est régulièrement mis à jour.",
    ideas: [
      "Sur longue période, les actions battent nettement les obligations après inflation.",
      "Le risque des actions diminue avec la durée de détention.",
      "Les dividendes réinvestis expliquent une grande part du rendement total.",
      "Essayer de prévoir les cycles coûte plus que cela ne rapporte.",
    ],
    forWho: "Les investisseurs de long terme qui doutent de la place des actions dans leur patrimoine.",
  },
  "The Most Important Thing": {
    about: "Howard Marks, cofondateur d'Oaktree Capital, a rassemblé dans ce livre les idées de ses mémos aux clients, lus attentivement par Warren Buffett. Il y défend la pensée de second niveau : se demander non pas si une entreprise est bonne, mais si le prix reflète déjà cette qualité. Il consacre plusieurs chapitres au risque, qu'il définit comme la probabilité de perte permanente plutôt que la volatilité. Il parle aussi des cycles, du balancier de la psychologie collective et de l'importance de savoir ce qu'on ne sait pas. Chaque chapitre isole une « chose la plus importante ».",
    ideas: [
      "Pour surperformer, il faut penser autrement que le consensus et avoir raison.",
      "Le risque est le plus élevé quand tout le monde le croit faible.",
      "Les cycles et le balancier de la psychologie reviennent toujours.",
      "Bien investir, c'est d'abord éviter les pertes graves.",
    ],
    forWho: "Les investisseurs expérimentés qui veulent affiner leur jugement sur le risque et les cycles.",
  },
  "Beating the Street": {
    about: "Dans ce second livre, paru en 1993, Peter Lynch revient sur ses années à la tête de Fidelity Magellan et détaille ses analyses concrètes. Il présente ses vingt-cinq règles d'or et explique comment il choisissait chaque année ses actions pour le magazine Barron's. Il parle aussi de l'expérience d'un club d'investissement de collégiens qui battait le marché. Le livre aborde les banques régionales, les restaurants, les cycliques et les entreprises en redressement. Il complète One Up On Wall Street par des cas réels.",
    ideas: [
      "L'investisseur amateur garde un avantage s'il fait ses devoirs.",
      "Il faut connaître ce que l'on possède et pourquoi on le possède.",
      "Les baisses de marché sont des occasions, pas des catastrophes.",
      "Un portefeuille se revoit régulièrement, entreprise par entreprise.",
    ],
    forWho: "Les lecteurs de One Up On Wall Street qui veulent voir la méthode appliquée cas par cas.",
  },
  "Si la Bourse m'était contée": {
    about: "André Kostolany, spéculateur d'origine hongroise installé à Paris, a vécu soixante-dix ans de marchés. Dans ce livre de 1960, il raconte avec humour les krachs, les manipulations et les fortunes qu'il a vus se faire et se défaire. Il oppose les investisseurs « tenaces », qui ont de l'argent, des idées, de la patience et de la chance, aux « tremblants », qui vendent à la première baisse. Il explique aussi son équation : l'évolution de la Bourse dépend de la liquidité et de la psychologie. C'est un classique de la littérature boursière européenne.",
    ideas: [
      "Achetez des actions, prenez des somnifères et ne regardez plus les cours.",
      "La Bourse monte avec la liquidité et la confiance, pas avec les seules nouvelles.",
      "Les tenaces gagnent ce que perdent les tremblants.",
      "La patience rapporte plus que l'intelligence en Bourse.",
    ],
    forWho: "Tous les lecteurs, débutants compris, qui veulent comprendre l'esprit de la Bourse par des récits.",
  },
  "Technical Analysis of the Financial Markets": {
    about: "John Murphy, ancien analyste technique de Merrill Lynch et de CNBC, a écrit la référence de l'analyse technique. Le livre part de la théorie de Dow et couvre les graphiques, les tendances, les supports et résistances, les figures de retournement et de continuation. Il détaille ensuite les moyennes mobiles, les oscillateurs, les volumes, les chandeliers japonais, la théorie des vagues d'Elliott et l'analyse intermarchés. Chaque outil est illustré par des graphiques réels. C'est le manuel de préparation des examens de la Market Technicians Association.",
    ideas: [
      "Le prix intègre toute l'information disponible.",
      "Les prix évoluent en tendances qui persistent plus qu'elles ne se retournent.",
      "Les indicateurs confirment la tendance, ils ne la remplacent pas.",
      "Les marchés d'actions, d'obligations, de matières premières et de devises sont liés.",
    ],
    forWho: "Ceux qui veulent apprendre l'analyse technique de façon complète et structurée.",
  },
  "Trading in the Zone": {
    about: "Mark Douglas, ancien trader devenu coach, a écrit le livre de référence sur la psychologie du trading. Sa thèse est que la plupart des traders perdent non par manque de méthode, mais parce qu'ils refusent d'accepter l'incertitude de chaque trade. Il propose de penser en probabilités : un avantage statistique ne se révèle que sur une série de trades, jamais sur un seul. Il décrit les peurs qui bloquent la décision (se tromper, rater une occasion, perdre de l'argent) et des exercices pour les dépasser. Le livre a peu de graphiques et beaucoup de réflexion.",
    ideas: [
      "N'importe quoi peut arriver sur un trade donné.",
      "Gagner ou perdre sur un trade ne dit rien de la qualité de la méthode.",
      "Accepter le risque à l'avance supprime la peur.",
      "La constance vient d'un état d'esprit, pas d'un indicateur.",
    ],
    forWho: "Les traders qui ont une méthode mais n'arrivent pas à l'appliquer avec régularité.",
  },
  "The Little Book That Still Beats the Market": {
    about: "Joel Greenblatt, gérant du fonds Gotham Capital et professeur à Columbia, résume en une formule simple l'investissement dans la valeur. Sa « formule magique » classe les entreprises selon deux critères : le rendement du capital investi, qui mesure la qualité, et le rendement des bénéfices, qui mesure le prix. On achète chaque année les entreprises les mieux classées sur les deux. Greenblatt explique avec des exemples accessibles, écrits au départ pour ses enfants, pourquoi cette approche fonctionne sur longue période et pourquoi peu de gens s'y tiennent. Elle peut décevoir plusieurs années de suite.",
    ideas: [
      "Acheter de bonnes entreprises à bon prix, c'est toute la méthode.",
      "La formule combine rendement du capital et rendement des bénéfices.",
      "La stratégie sous-performe parfois plusieurs années, c'est pour cela qu'elle marche.",
      "La discipline compte plus que l'intelligence.",
    ],
    forWho: "Les débutants qui veulent une méthode d'investissement dans la valeur simple et systématique.",
  },
  "Margin of Safety": {
    about: "Seth Klarman, fondateur du fonds Baupost Group, a publié ce livre en 1991 à un petit tirage, ce qui en a fait l'un des livres de finance les plus recherchés. Il y décrit une approche de la valeur centrée sur l'aversion au risque : acheter avec une large marge de sécurité, accepter de garder des liquidités, chercher les occasions dans les situations délaissées. Il critique la spéculation, les obligations pourries des années 1980 et les gérants qui courent après l'indice. Il détaille les méthodes d'évaluation et leurs limites. Le texte reste très actuel.",
    ideas: [
      "Éviter de perdre de l'argent passe avant le rendement.",
      "La valeur d'une entreprise est une fourchette, pas un chiffre précis.",
      "Garder des liquidités quand rien n'est bon marché est une décision active.",
      "Les meilleures affaires se trouvent là où personne ne regarde.",
    ],
    forWho: "Les investisseurs dans la valeur confirmés, et ceux qui veulent comprendre la gestion d'un grand fonds prudent.",
  },
  "Fooled by Randomness": {
    about: "Nassim Nicholas Taleb, ancien trader d'options devenu essayiste, montre dans ce livre de 2001 que nous confondons souvent chance et talent. Un trader qui gagne plusieurs années de suite peut simplement avoir eu de la chance, et le biais du survivant nous cache tous ceux qui ont échoué avec la même méthode. Taleb explique pourquoi notre cerveau voit des causes là où il n'y a que du hasard, et pourquoi les événements rares mais extrêmes sont sous-estimés. Ce livre annonce Le Cygne noir. Le ton est personnel, ironique et nourri de philosophie.",
    ideas: [
      "Un bon résultat ne prouve pas une bonne décision.",
      "Le biais du survivant fabrique de faux héros.",
      "Les événements rares pèsent plus qu'on ne le pense.",
      "Il faut juger une stratégie sur toutes les histoires possibles, pas sur celle qui s'est produite.",
    ],
    forWho: "Tout investisseur, et en particulier ceux qui tirent des conclusions de quelques années de performance.",
  },

  // ── French authors already in the library ──
  "Des lions menés par des ânes": {
    about: "Charles Gave, économiste, fondateur du cabinet de recherche Gavekal et gérant de fonds, publie en 2003 un essai sur l'euro et les choix des dirigeants européens. Il soutient qu'en fixant un taux d'intérêt unique pour des économies très différentes, la monnaie commune crée des déséquilibres et pénalise la croissance de pays comme la France. Il critique la dépense publique, la fiscalité et l'interventionnisme, qu'il juge responsables du chômage. Le titre oppose des peuples travailleurs à des élites qui les gouvernent mal. Le livre est polémique mais appuyé sur des données économiques.",
    ideas: [
      "Un taux d'intérêt unique ne peut pas convenir à des économies divergentes.",
      "Quand le prix de l'argent est faux, le capital est mal alloué.",
      "La dépense publique excessive freine la croissance et l'emploi.",
      "Les marchés finissent par sanctionner les mauvaises politiques.",
    ],
    forWho: "Les lecteurs intéressés par la macroéconomie européenne et la pensée libérale française.",
  },
  "Le Commerce des promesses": {
    about: "Pierre-Noël Giraud, professeur d'économie à Mines ParisTech, analyse dans cet essai de 2001 ce qu'est vraiment la finance : un commerce de promesses de revenus futurs. Actions, obligations et produits dérivés sont des promesses que les marchés évaluent, échangent et parfois surévaluent. Giraud explique pourquoi la finance libéralisée produit des bulles et des crises à intervalles réguliers, et pourquoi elle reste pourtant utile au financement de l'économie. Il discute la régulation et le rôle des États. Le livre a été réédité après la crise de 2008.",
    ideas: [
      "Un titre financier est une promesse sur des revenus futurs.",
      "La valeur d'une promesse dépend de la confiance, donc de la psychologie.",
      "La finance libéralisée alterne excès d'optimisme et crises.",
      "La régulation doit limiter l'effet de levier plus que les marchés eux-mêmes.",
    ],
    forWho: "Ceux qui veulent comprendre le rôle de la finance dans l'économie, au-delà de la technique.",
  },
  "La crise, et après ?": {
    about: "Écrit à chaud par Jacques Attali en 2008, ce court essai retrace l'enchaînement de la crise des subprimes : crédit immobilier facile, titrisation, perte de confiance et faillites bancaires. L'auteur montre comment l'endettement des ménages américains s'est propagé à toute la finance mondiale. Il propose ensuite des pistes pour éviter une nouvelle crise : régulation mondiale, contrôle des agences de notation et limitation de l'endettement. C'est un témoignage utile sur la façon dont la crise a été comprise sur le moment.",
    ideas: [
      "La crise est née d'un excès de dette privée.",
      "La titrisation a dispersé le risque sans le réduire.",
      "La confiance est l'actif le plus fragile du système financier.",
      "Une finance mondiale appelle une régulation mondiale.",
    ],
    forWho: "Les lecteurs qui veulent une synthèse rapide de la crise de 2008.",
  },
  "Jusqu'à quand ? Pour en finir avec les crises financières": {
    about: "L'économiste Frédéric Lordon, directeur de recherche au CNRS, analyse la crise de 2008 comme le produit de la déréglementation financière. Il explique les mécanismes de titrisation, de levier et de liquidité qui ont rendu le système instable. Selon lui, des ajustements de régulation ne suffiront pas, il faut réduire structurellement la place de la finance. Il propose notamment de plafonner la rentabilité exigée par les actionnaires (le « SLAM »). C'est un point de vue critique, très argumenté, à lire en contrepoint des auteurs libéraux.",
    ideas: [
      "Les crises financières sont structurelles, pas accidentelles.",
      "Le levier transforme de petites pertes en faillites.",
      "La liquidité des marchés disparaît quand on en a besoin.",
      "Réguler à la marge ne suffit pas à éviter la prochaine crise.",
    ],
    forWho: "Ceux qui veulent un regard critique et argumenté sur la finance de marché.",
  },
  "Psychologie de l'investisseur et des marchés financiers": {
    about: "Mickaël Mangot, docteur en finance et enseignant, a écrit l'une des premières synthèses en français de la finance comportementale. Il présente les biais qui faussent les décisions des investisseurs : excès de confiance, aversion aux pertes, ancrage, comptabilité mentale, mimétisme. Il montre leurs effets sur les marchés, comme les bulles, la sous-réaction aux nouvelles ou l'effet momentum. Chaque biais est illustré par des études et des exemples concrets. Le livre se termine par des conseils pour limiter ces erreurs dans sa propre gestion.",
    ideas: [
      "Les investisseurs vendent trop tôt leurs gagnants et gardent trop longtemps leurs perdants.",
      "L'excès de confiance pousse à trop trader.",
      "Les biais individuels s'additionnent et créent des anomalies de marché.",
      "Des règles écrites protègent mieux que la volonté.",
    ],
    forWho: "Les investisseurs particuliers et les étudiants qui veulent comprendre leurs propres erreurs.",
  },
  "La Bourse pour les Nuls": {
    about: "Gérard Horny, journaliste financier, a écrit ce guide d'initiation dans la collection Pour les Nuls. Il explique le fonctionnement de la Bourse, les différents titres, la passation d'ordres, le choix d'un intermédiaire et les enveloppes fiscales françaises comme le PEA et l'assurance-vie. Il présente les bases de l'analyse fondamentale et de l'analyse technique, ainsi que les fonds et les produits dérivés. Le ton est simple et le livre est régulièrement mis à jour. C'est une bonne première lecture avant des livres plus spécialisés.",
    ideas: [
      "Comprendre ce que l'on achète avant d'investir.",
      "Le PEA et l'assurance-vie sont les enveloppes clés en France.",
      "Diversifier et investir sur la durée limite le risque.",
      "Les frais et la fiscalité pèsent sur le rendement final.",
    ],
    forWho: "Les débutants complets qui veulent comprendre la Bourse avant d'ouvrir un compte.",
  },
  "Marchés financiers : gestion de portefeuille et des risques": {
    about: "Bertrand Jacquillat, Bruno Solnik et Christophe Pérignon, professeurs à Sciences Po et HEC, signent le manuel français de référence en gestion de portefeuille. Il couvre la théorie moderne du portefeuille de Markowitz, le MEDAF, les modèles multifacteurs, l'efficience des marchés, la gestion obligataire, les produits dérivés et la mesure du risque. Chaque chapitre allie théorie et pratique, avec des exemples tirés des marchés européens. Le livre est utilisé dans les masters de finance et pour la préparation au CFA. Il a été mis à jour à de nombreuses reprises depuis 1988.",
    ideas: [
      "La diversification réduit le risque sans réduire le rendement attendu.",
      "Seul le risque de marché est rémunéré à l'équilibre.",
      "La performance d'un gérant se mesure après ajustement du risque.",
      "Les dérivés servent à couvrir autant qu'à spéculer.",
    ],
    forWho: "Les étudiants en finance et les professionnels qui veulent une base théorique solide en français.",
  },
  "Épargnant 3.0": {
    about: "Edouard Petit, ingénieur et blogueur, adapte la gestion indicielle au contexte français. Il explique pourquoi les fonds actifs battent rarement leur indice et comment construire un portefeuille d'ETF dans un PEA, un compte-titres ou une assurance-vie. Il détaille le choix des ETF, l'allocation entre actions et obligations, le rééquilibrage et la fiscalité. Le livre est concret et donne des exemples de portefeuilles selon les profils. Il a contribué à faire connaître les ETF aux épargnants français.",
    ideas: [
      "Un portefeuille de quelques ETF suffit à investir dans le monde entier.",
      "Les frais bas sont l'avantage décisif de la gestion indicielle.",
      "L'enveloppe fiscale compte autant que le choix du support.",
      "Rééquilibrer une fois par an garde le risque sous contrôle.",
    ],
    forWho: "Les épargnants français qui veulent passer aux ETF avec une méthode simple.",
  },

  // ── Added in November 2026 ──
  "Un libéral nommé Jésus": {
    about: "Charles Gave, économiste, fondateur de Gavekal et aujourd'hui président de l'Institut des Libertés, propose en 2005 une lecture économique des Évangiles. Il relit les paraboles qui parlent d'argent, de dette, de salaire, de crédit et de talents pour soutenir que le message du Christ met au centre la liberté et la responsabilité individuelles. Il en tire une critique de l'État-providence et du socialisme sous toutes ses formes. Le livre se présente comme un pamphlet plutôt que comme un ouvrage de théologie. Il éclaire la pensée libérale de Gave, qui irrigue aussi ses analyses de marché.",
    ideas: [
      "Les paraboles des talents et des ouvriers de la onzième heure parlent d'économie.",
      "La liberté individuelle va de pair avec la responsabilité.",
      "La charité est un choix personnel, pas une contrainte imposée par l'État.",
      "La création de richesse suppose le droit de posséder et d'échanger.",
    ],
    forWho: "Les lecteurs curieux de la pensée libérale et de Charles Gave au-delà de ses analyses financières.",
  },
  "Sire, surtout ne faites rien !": {
    about: "Dans ce pamphlet de 2016, Charles Gave s'adresse au futur président de la République. Il soutient que la meilleure politique économique pour la France serait que l'État cesse d'intervenir : moins de dépenses publiques, moins de réglementation et moins d'impôts. Selon lui, la croissance française s'est arrêtée parce que le poids de l'État étouffe l'initiative privée et fausse le prix du capital. Il s'appuie sur des comparaisons internationales et sur son expérience de gérant. Le ton est direct et volontiers provocateur.",
    ideas: [
      "L'interventionnisme économique produit l'inverse de ce qu'il promet.",
      "Le poids de la dépense publique freine la croissance.",
      "Le prix de l'argent doit être fixé par le marché.",
      "Réformer, c'est souvent retirer plutôt qu'ajouter.",
    ],
    forWho: "Ceux qui suivent Charles Gave et le débat sur le rôle de l'État en France.",
  },
  "Un trader ne meurt jamais": {
    about: "Marc Fiorentino, ancien banquier d'affaires et trader, signe en 2009 un court roman au style télégraphique. Le héros est un trader obsédé par l'idée de reconstituer la fortune qu'il a perdue sur les marchés, rivé à ses écrans de pétrole, d'or, de CAC 40 et de dollar. Le récit, mené au rythme des cotations, montre l'addiction au risque et la solitude du métier. Fiorentino s'appuie sur sa connaissance des salles de marché pour donner des scènes crédibles. Le livre a été traduit dans plusieurs langues.",
    ideas: [
      "Le trading peut devenir une addiction comme le jeu.",
      "Vouloir se refaire après une perte mène à prendre plus de risques.",
      "Les marchés ne pardonnent pas l'excès de confiance.",
      "Derrière les écrans, la pression est d'abord psychologique.",
    ],
    forWho: "Les lecteurs qui veulent découvrir l'univers des salles de marché par la fiction.",
  },
  "Sauvez votre argent !": {
    about: "Marc Fiorentino propose en 2011 un « régime santé » pour les économies des ménages. Il passe en revue les erreurs courantes : produits bancaires trop chers, placements mal compris, crédits mal négociés et conseils intéressés. Pour chaque situation, il donne des règles simples pour reprendre le contrôle de son épargne. Le livre est écrit dans un langage direct, sans jargon. Il s'adresse aux particuliers qui veulent faire le tri dans leurs placements.",
    ideas: [
      "Comprendre chaque produit avant de le signer.",
      "Les frais cachés sont la première fuite de l'épargne.",
      "Le conseiller bancaire est aussi un vendeur.",
      "Une épargne simple et diversifiée vaut mieux qu'une épargne sophistiquée.",
    ],
    forWho: "Les particuliers qui veulent faire le point sur leur banque et leurs placements.",
  },
  "Faites sauter la banque !": {
    about: "Dans ce guide de 2014, Marc Fiorentino montre comment payer moins cher sa banque. Il détaille les frais de tenue de compte, de carte, d'incident, les assurances emprunteur et les produits de placement maison. Il explique comment comparer les offres, négocier avec son conseiller, changer de banque et choisir des placements moins coûteux. Les exemples chiffrés montrent ce que ces économies représentent sur plusieurs années. Le livre a été réédité en 2016.",
    ideas: [
      "Les frais bancaires se négocient.",
      "L'assurance emprunteur peut être déléguée à moindre coût.",
      "Les placements maison des banques sont souvent les plus chers.",
      "Changer de banque est devenu simple.",
    ],
    forWho: "Tous ceux qui veulent réduire leurs frais bancaires et mieux choisir leurs produits.",
  },
  "Votre argent": {
    about: "Paru en 2018, ce guide complet de Marc Fiorentino couvre toute la gestion de l'argent d'un ménage. Il traite de l'épargne de précaution, des livrets, de l'assurance-vie, de la Bourse, de l'immobilier, de la retraite et de la transmission. Pour chaque sujet, l'auteur explique les règles, les pièges et les choix qui conviennent selon l'âge et la situation. Le livre s'appuie sur son expérience de banquier puis de chroniqueur financier. Il a été réédité en poche en 2019.",
    ideas: [
      "Une stratégie patrimoniale commence par une épargne de précaution.",
      "Chaque placement a un horizon de temps qui lui correspond.",
      "L'immobilier et la Bourse se complètent.",
      "Préparer sa retraite et sa transmission se fait tôt.",
    ],
    forWho: "Les ménages qui veulent une vue d'ensemble de leurs finances en un seul livre.",
  },
  "Les meilleurs placements pour les Nuls": {
    about: "Dans la collection Pour les Nuls, Marc Fiorentino présente en 2021 l'ensemble des placements accessibles aux particuliers en France. Il décrit les livrets réglementés, l'assurance-vie, le PEA, les actions, les fonds et ETF, l'immobilier en direct et la pierre-papier, ainsi que les placements alternatifs. Il compare leurs rendements, leurs risques, leurs frais et leur fiscalité. L'ouvrage donne aussi des repères pour construire une allocation selon son profil. Il est mis à jour régulièrement.",
    ideas: [
      "Il n'existe pas de placement à la fois sûr, liquide et très rentable.",
      "La fiscalité oriente le choix de l'enveloppe.",
      "Les ETF permettent de diversifier à faible coût.",
      "L'allocation dépend de l'horizon et de la tolérance au risque.",
    ],
    forWho: "Les épargnants qui veulent comparer les placements avant de choisir.",
  },
  "Tout le monde mérite d'être riche": {
    about: "Olivier Seban, formateur et conférencier, a écrit un des livres d'éducation financière les plus vendus en France. Construit sous forme de dialogue, il explique comment s'enrichir en trois temps : accumuler grâce à un budget maîtrisé, investir pour créer des revenus, puis protéger ce que l'on a construit. L'auteur insiste sur l'état d'esprit et sur le piège du crédit à la consommation. La troisième édition, parue en 2025, ajoute des conseils sur la constitution d'un capital de sécurité. L'objectif affiché n'est pas de devenir millionnaire, mais de reprendre la main sur son argent.",
    ideas: [
      "S'enrichir, c'est d'abord dépenser moins que ce que l'on gagne.",
      "Le crédit à la consommation est l'ennemi de l'épargne.",
      "L'argent doit être mis au travail pour créer des revenus.",
      "Protéger son patrimoine compte autant que le constituer.",
    ],
    forWho: "Ceux qui débutent et cherchent un déclic sur leur rapport à l'argent.",
  },
  "Tout le monde peut réussir en Bourse": {
    about: "Matthieu Louvet, créateur de la chaîne et du site S'investir, publie son premier livre en 2024. Il y expose 21 principes pour faire fructifier son épargne en Bourse en moins de dix minutes par mois, en s'appuyant sur l'investissement fondé sur les preuves et sur des travaux de prix Nobel. La méthode repose sur les ETF, la diversification mondiale et une gestion passive. Le livre vise la croissance de l'épargne, un revenu complémentaire, la protection contre l'inflation et la préparation de la retraite. Il contient plus de cinquante graphiques et un plan d'action étape par étape.",
    ideas: [
      "La recherche académique montre qu'il est difficile de battre le marché.",
      "Quelques ETF bien choisis suffisent à investir dans le monde entier.",
      "Investir régulièrement réduit l'effet des émotions.",
      "Les frais et le temps sont les deux leviers principaux.",
    ],
    forWho: "Les débutants qui veulent investir en ETF avec une méthode simple et peu de temps.",
  },
  "Investir pour être libre": {
    about: "Mounir Laggoune, cofondateur de l'application Finary, décrit une méthode en neuf étapes pour atteindre l'indépendance financière. Il part du budget et de l'épargne de précaution, puis passe aux premiers investissements en Bourse, à l'immobilier et aux actifs alternatifs. Chaque chapitre propose des arbres de décision pour choisir selon sa situation. L'objectif est de mettre en place un système d'investissement qui fonctionne de façon presque automatique. Une édition augmentée parue en 2026 ajoute un chapitre sur les holdings et une partie sur l'or.",
    ideas: [
      "L'indépendance financière se construit par étapes.",
      "Automatiser son épargne évite de dépendre de sa motivation.",
      "Chaque classe d'actifs a sa place selon l'âge et les objectifs.",
      "Plusieurs idées reçues sur l'argent freinent l'investissement.",
    ],
    forWho: "Les jeunes actifs qui veulent un plan complet, de l'épargne à l'investissement.",
  },
  "Prenez votre argent en main": {
    about: "Matthias Baccino, entrepreneur et créateur de contenus sur l'argent, publie en 2024 chez Michel Lafon un guide sous-titré « Devenir riche, ça s'apprend ! ». Il s'adresse à ceux qui sentent que l'épargne classique ne suffit plus face à l'inflation. En une dizaine de chapitres, il mêle anecdotes personnelles, exemples, références historiques et données macroéconomiques. Il aborde les ETF, l'immobilier, l'épargne salariale, les cryptoactifs et la psychologie de l'investisseur. Son but est de changer la façon de penser l'argent plutôt que de donner des recettes toutes faites.",
    ideas: [
      "L'inflation érode l'épargne qui dort.",
      "S'enrichir est une compétence qui s'apprend.",
      "Diversifier entre plusieurs classes d'actifs limite le risque.",
      "La psychologie pèse autant que les connaissances techniques.",
    ],
    forWho: "Les jeunes épargnants qui veulent passer à l'action.",
  },
  "Bourse : seuls les meilleurs gagnent": {
    about: "Peter Seilern, fondateur et président de Seilern Investment Management, présente l'investissement en croissance de qualité. Il s'agit de choisir un petit nombre d'entreprises capables de croître fortement et régulièrement sur le long terme, puis de les garder. L'auteur soutient que ces actions peuvent être plus sûres que les dépôts bancaires ou les obligations d'État, et remet en cause la diversification excessive et la gestion indicielle. Il expose dix règles d'or, la construction du portefeuille et l'évaluation. Il insiste sur la patience et l'indépendance d'esprit.",
    ideas: [
      "Seules les meilleures entreprises méritent d'être détenues.",
      "La qualité et la régularité de la croissance réduisent le risque.",
      "Trop diversifier dilue les meilleures idées.",
      "La patience est la principale source de rendement.",
    ],
    forWho: "Les investisseurs en actions qui veulent une approche concentrée de long terme.",
  },
  "Investir en bourse et gagner": {
    about: "Serge Belinski, investisseur qui a connu des gains et des pertes, partage les leçons de son expérience. Il part des fondamentaux pour montrer comment choisir des actions offrant le meilleur rendement pour un risque limité. Le livre détaille l'analyse financière : endettement, rapports annuels, bilan, compte de résultat, flux de trésorerie et valorisation. Il s'adresse aux débutants comme aux gérants. La deuxième édition, parue en 2025, ajoute une étude de cas détaillée.",
    ideas: [
      "L'analyse du bilan évite les entreprises fragiles.",
      "Les flux de trésorerie sont plus fiables que les bénéfices comptables.",
      "La dette est le premier signal de risque.",
      "Payer un prix raisonnable reste indispensable.",
    ],
    forWho: "Ceux qui veulent apprendre à lire des comptes pour choisir leurs actions.",
  },
  "Savoir investir": {
    about: "Gérald Autier signe un guide pratique pour les particuliers avisés. Il commence par les notions à maîtriser avant d'investir, puis passe en revue toutes les classes d'actifs : actions, obligations, immobilier, matières premières, placements passion, fonds et capital-investissement. Il présente ensuite des stratégies de construction de portefeuille. La deuxième édition, parue en 2019, ajoute ou réécrit des chapitres sur les hedge funds, les sociétés non cotées, les énergies renouvelables, les métaux précieux et les placements passion. Le livre se veut accessible et rigoureux.",
    ideas: [
      "Comprendre chaque classe d'actifs avant de l'inclure.",
      "La combinaison des actifs compte plus que chaque choix isolé.",
      "Les actifs non cotés apportent du rendement contre de la liquidité.",
      "Les placements passion obéissent à leurs propres règles.",
    ],
    forWho: "Les particuliers qui ont déjà des bases et veulent élargir leur palette de placements.",
  },
  "L'Argent": {
    about: "Dix-huitième roman des Rougon-Macquart, publié en 1891, L'Argent raconte l'ascension et la chute d'Aristide Saccard, qui fonde la Banque universelle à Paris. Porté par la spéculation, le titre de la banque s'envole avant de s'effondrer, ruinant de nombreux petits épargnants. Zola s'est inspiré du krach de l'Union générale en 1882. Le roman décrit avec précision la Bourse de Paris, les manipulations de cours, la presse financière et la fièvre collective. Il reste l'une des meilleures descriptions d'une bulle spéculative.",
    ideas: [
      "Une bulle se nourrit de l'enthousiasme collectif.",
      "Les manipulations de cours trompent d'abord les petits porteurs.",
      "L'argent peut financer de grands projets comme ruiner des familles.",
      "Les mécanismes de la spéculation n'ont guère changé depuis 1882.",
    ],
    forWho: "Tous les lecteurs, pour comprendre une bulle boursière par le roman.",
  },
};
