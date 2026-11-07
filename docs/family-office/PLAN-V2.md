# Quantrih Office — Plan produit v2 (après recherche approfondie)

> Novembre 2026. Fondé sur le rapport « Quantrih Office benchmark et cadre belge »
> (`docs/family-office/recherche/Quantrih Office benchmark et cadre belge.md`).
> Ce plan remplace les phases 3 à 6 de `PLAN-PLATEFORME.md`. À exécuter phase par phase avec Claude Code.
> **Tout ce qui touche au droit doit être validé par un avocat avant la mise en ligne** (liste des questions en §9).

---

## 0. Ce que la recherche change

| Constat | Conséquence pour le produit |
|---|---|
| Aucun coordinateur indépendant n'est implanté en Wallonie ni sur la tranche 1–20 M€. Les family offices belges sont à 63 % en Flandre, 28 % à Bruxelles, 9 % en Wallonie. | Positionnement « coordinateur indépendant, ancré en Wallonie, pour toute la Belgique ». Le site doit être bilingue FR/NL dès que possible. |
| Le vrai concurrent sur 1–5 M€ est le « family service » bancaire (BNPPF et KBC dès 250 k€, Degroof dès 1 M€, Delen Family Services, PaxFamilia/Abbove), présenté comme gratuit. | Il faut prouver la **neutralité** et la **vue multibancaire**. Le simulateur doit chiffrer le **coût total** et l'**économie nette**. |
| Presque aucun MFO ne publie ses prix (en Europe, seuls France Épargne et LIQID le font). | Notre page Honoraires est un **différenciateur** : on la garde et on la renforce. |
| **Risque n° 1** : l'« audit patrimonial avec recommandations » correspond à la **consultation en planification financière** (loi du 25 avril 2014), réservée aux planificateurs financiers indépendants (PFI) agréés par la FSMA. La FSMA a sanctionné en 2022 la dénomination « **Family Office Indépendant** ». | Le produit est conçu dans l'**hypothèse B** par défaut : **diagnostic factuel + coordination**, les recommandations étant **signées par des professionnels habilités** (notaire, avocat, ITAA, PFI). Vocabulaire du site entièrement revu. Il bascule en hypothèse A (agrément PFI) si c'est la voie choisie. |
| La clause « tribunaux du Brabant wallon » est une **clause noire** envers un consommateur (art. VI.83, 23° CDE). | La lettre de mission a **deux régimes** : consommateur (fors légaux, juge de son domicile) et professionnel/holding (Brabant wallon). |
| Depuis le 14/08/2026, un **bouton « Se rétracter du contrat ici »** est obligatoire pour les contrats conclus en ligne. | Le parcours de signature et l'espace client l'intègrent. |
| Le numéro de **Registre national** est réservé aux organismes autorisés. L'APD a sanctionné un commerçant qui exigeait la lecture de l'eID. | On **supprime** la collecte du NRN, qui existe aujourd'hui dans l'onboarding, et on masque ce numéro dans les documents. |
| Ombudsfin n'est pas compétent pour nous. La plateforme européenne de règlement en ligne des litiges est fermée depuis juillet 2025. | Le recours renvoie au **Service de médiation pour le consommateur**. |
| E-mail froid nominatif interdit ; données BCE et Moniteur belge interdites pour le marketing (Black Tiger : 174 640 €) ; avocats, notaires et ITAA ne peuvent recevoir **aucune commission d'apport**. | Le CRM est construit autour d'un **réseau de prescripteurs non rémunéré**, avec des **garde-fous de conformité intégrés** : provenance obligatoire, consentements, liste « Ne m'appelez plus ». |
| Pour des contenus financiers, Google valorise d'abord la confiance (E-E-A-T). Les requêtes belges combinent toujours une **Région** et une **année**. | Le blog prévoit un auteur et un **relecteur nommé** (prescripteur), un badge **statut de la réforme**, des dates de mise à jour et des pages par Région. |

---

## 1. Où se situe Quantrih par rapport aux autres

| | Banques privées (Delen, BNPPF, KBC, Degroof) | MFO indépendants belges (Family Partners, Portolani, Intuitae, Infinitum…) | **Quantrih Office** |
|---|---|---|---|
| Seuil | 250 k€ à 2,5 M€ | Souvent 25 M€+ | **1 à 20 M€+** |
| Implantation | Nationale | Flandre et Bruxelles | **Wallonie, pour toute la Belgique** |
| Neutralité | Produits maison, rétrocessions | Variable | **Aucun produit, 100 % des rétrocessions reversées, aucune commission d'apport** |
| Tarifs publiés | Grille PDF (Delen : 1,10 % HTVA) | Rarement | **Oui, avec simulateur** |
| Vue multibancaire | Non (leurs propres avoirs) | Rarement mise en avant | **Oui, dans le portail** |
| Portail client | Excellent (application Delen : itsme, mode discret) | Peu mis en avant | **Oui** (à hisser au niveau de Delen) |
| Statut | Banque agréée | PFI, courtier ou coordinateur déclaré non licencié | **À trancher (§9, question 1)** |

**Points faibles à corriger** :
- la grille (0,95 % HTVA, soit 1,15 % TVAC) s'ajoute aux frais bancaires, soit environ 2,5 %/an en tout. Il faut **démontrer** l'économie nette ;
- la tranche au-delà de 10 M€ est chère : environ 0,75 % effectif à 20 M€, contre environ 0,3 % en Europe ;
- l'assiette et la date d'évaluation ne sont pas définies.

---

## 2. Phase A — Mise en conformité du code existant (à faire en premier, environ 1 semaine)

1. **Supprimer le numéro de Registre national** : champ `niss` de l'onboarding, colonnes `niss_encrypted` et `niss_last4` (migration qui efface les valeurs), validation, affichage. On garde la date de naissance. L'identité sera vérifiée par itsme (phase C), sans copie de carte.
2. **Revoir le vocabulaire** partout (site, métadonnées, e-mails, lettre de mission, portail) :
   - à proscrire : « family office indépendant », « planification financière/successorale », « planificateur », « financial planner », « optimisation », « nous optimisons », « stratégie patrimoniale », « feuille de route » au sens de recommandations ;
   - à employer : « coordination patrimoniale », « diagnostic factuel », « vision consolidée », « avec vos notaire, avocat et banquier », « recommandations émises par des professionnels habilités ».
   - Ajouter un **test automatisé** (lint de contenu) qui fait échouer la compilation si un terme interdit apparaît dans `src/`.
3. **Service « Audit patrimonial et stratégie »** → « **Diagnostic patrimonial** » (inventaire, cartographie, points d'attention) ; « Fiscalité et structuration » → « Coordination fiscale et juridique (réalisée par des avocats et des conseillers ITAA) ».
4. **Lettre de mission v2** (texte, données et parcours) : voir §7.
5. **Mentions légales** (CSA 2:20) sur le site, les e-mails et les factures : dénomination, SRL, siège, BCE, RPM et tribunal, TVA, statut réglementaire, assureur RC pro. Champs paramétrables en attendant les vraies valeurs.
6. **Page Plaintes** : service interne avec délai de réponse, puis Service de médiation pour le consommateur. Retirer toute mention d'Ombudsfin ou de la plateforme européenne.
7. **Formulaire de contact** : consentements séparés (être recontacté / recevoir la newsletter), provenance enregistrée, texte affiché conservé.

---

## 3. Phase B — Site public v2 (2 à 3 semaines)

### Arborescence

```
Accueil
Notre approche          (ce que nous faisons / ce que nous ne faisons pas)
Services                (Diagnostic initial au forfait · Coordination annuelle · Missions ponctuelles)
Pour qui                (Familles · Entrepreneurs avant/après cession · Particuliers)
  └ Situations types    (4 cas anonymisés : cession en Brabant wallon, famille transfrontalière,
                          démembrement, famille recomposée)
Honoraires              (grille par tranches, simulateur du coût total, politique de rétrocessions)
Statut & indépendance   (statut exact, ce que la loi nous permet, assureur, BFOA si admis, absence de commissions)
Équipe                  (vraies photos, biographies, LinkedIn)
Gouvernance & continuité (plan de continuité, secret professionnel, sécurité des données)
Réseau de professionnels (catégories, principe sans commission, devenir partenaire)
Insights                (blog, voir phase E)
Contact / Rendez-vous
Plaintes · Mentions légales · Confidentialité · Cookies · Accessibilité
```

### Page d'accueil (dans cet ordre, inspiré des meilleurs)
1. **Accroche précise** : qui, quelle tranche de patrimoine, quelle zone, quel rôle. Exemple : « Coordination patrimoniale indépendante pour les familles et les entrepreneurs de toute la Belgique, de 1 à 20 M€ et plus. »
2. **Bandeau de preuves** : statut exact · assureur RC pro · 100 % des rétrocessions reversées · aucune commission d'apport · BFOA (si admis).
3. **Ce que nous faisons / ne faisons pas.**
4. **Méthode en 4 étapes** : rendez-vous découverte → diagnostic au forfait → coordination annuelle → reporting et revue.
5. **Aperçu des honoraires** avec lien vers le simulateur.
6. **Situations types** anonymisées.
7. **Équipe.**
8. **Derniers articles.**
9. **Appel à l'action** « Prendre rendez-vous ».
10. Lien **« Espace client »** permanent en haut à droite.

### Honoraires
- Tranches marginales affichées **HTVA et TVAC**.
- **Assiette** définie : actifs pris en compte, valorisation au 31/12 sur relevés, traitement des actifs illiquides.
- **Simulateur du coût total** : honoraires Quantrih + frais bancaires saisis ou estimés − rétrocessions récupérées = coût net. Mention « illustratif, pas une offre ».
- **Forfait de diagnostic initial**, distinct de l'honoraire annuel. Il sert aussi de base au calcul en cas de rétractation.
- Décision à prendre : 4e palier au-delà de 20 M€ ou plafond (§10).

### Langues, référencement, accessibilité, design
- **FR au lancement, NL ensuite, EN** ; routes `/nl/...` et `/en/...`, `hreflang`, sélecteur de langue.
- `llms.txt`, `sitemap.xml`, `robots.txt`, schema.org `Organization`, `ProfessionalService`, `Person`, `BreadcrumbList`.
- Cible **WCAG 2.2 AA**, `prefers-reduced-motion`, contraste vérifié.
- Design « quiet luxury » conservé (serif + sans-serif, ivoire, bleu nuit, or sourd **en accent seulement**). **Photographie éditoriale locale** (Louvain-la-Neuve, Brabant wallon), jamais de visages générés par IA.
- Aucun avis client au lancement (art. VI.100 CDE). Plus tard, uniquement des témoignages vérifiés, avec une note expliquant la vérification.
- Mesure d'audience sans cookie ; bannière cookies seulement si nécessaire.

---

## 4. Phase C — Connexion v2 (même style que le site, environ 1 semaine, itsme ensuite)

- Lien unique « Espace client » → `espace.<domaine>` (sous-domaine dédié, même charte).
- Page de connexion en écran partagé (déjà en place) avec en plus :
  - une phrase anti-hameçonnage : « Nous ne vous demanderons jamais votre mot de passe ni un code par e-mail ou par téléphone » ;
  - le sélecteur FR/NL/EN ;
  - les liens Support et Confidentialité.
- **Passkeys (WebAuthn)** comme méthode principale, proposées dès la 2e connexion. **Application d'authentification (TOTP)** en secours, déjà en place. **Pas de SMS.**
- **itsme** (OpenID Connect) pour la connexion, la vérification d'identité à l'entrée en relation et la **signature qualifiée** de la lettre de mission. Il faut un contrat avec itsme ou passer par un intermédiaire (Signicat, Namirial, Yousign).
- **Authentification renforcée** pour signer, modifier des données sensibles ou télécharger des documents.
- **Alertes** de nouvelle connexion par e-mail, **gestion des appareils**, déconnexion à distance, expiration de session.
- Récupération de compte avec revérification de l'identité (itsme, ou le coordinateur via un canal vérifié).
- **Mode discret** qui masque les montants (comme Delen).
- Aucun pixel ni traceur sur les pages de connexion.

---

## 5. Phase D — Bureau (back-office) et CRM avancé de prospection (3 à 4 semaines)

### Modèle de données
- **Contacts** (personnes) · **Organisations** · **Foyers/familles** · **Relations** entre eux.
- **Prescripteurs** : profession (notaire, avocat, ITAA, banque, M&A…), ordre professionnel, langue, région, cadence de suivi.
- **Opportunités** : tranche de patrimoine, honoraires estimés, probabilité, **événement déclencheur** (cession, succession, retraite, expatriation…), source.
- **Registre des recommandations** dans les deux sens (données / reçues), **champ monétaire verrouillé à 0 €**, attestation d'indépendance.
- **Journal des consentements** en ajout seul : canal, finalité, base légale (CDE : consentement / client existant / adresse générique ; RGPD : consentement / intérêt légitime), texte affiché, horodatage, retrait.
- **Provenance** obligatoire pour chaque contact (rencontre, recommandation, événement, formulaire du site…).
- **Liste d'exclusion** et résultat du filtrage « Ne m'appelez plus ».
- **Activités** (appels, rendez-vous, notes), **tâches**, **documents**, **événements**, **campagnes**, **journal d'audit**.

### Fonctions
- **Pipeline en kanban** : Identifié → Introduit → 1er rendez-vous → Diagnostic → Proposition / lettre de mission → Signé → Onboarding, plus les statuts Nurture et Dormant. On fait glisser les cartes d'une étape à l'autre.
- **Prochaine action datée obligatoire** sur chaque opportunité. Alertes sans activité à 30, 60 et 90 jours. Tâches du jour sur le tableau de bord.
- **Score explicable** : qualité du prescripteur + déclencheur + tranche + adéquation. Chaque point est affiché.
- **Prévision pondérée** : honoraires et patrimoine coordonné à 12 mois.
- **Module prescripteurs** : vue 360°, recommandations données et reçues (réciprocité), taux de conversion, délai jusqu'à la signature, prochaine prise de contact, **formulaire de transmission avec consentement du client**, registre des cadeaux et invitations.
- **Événements** : création, page d'inscription publique FR/NL/EN avec consentements séparés, liste d'attente, présence, tâches de suivi automatiques, partage des coûts avec le coorganisateur.
- **Newsletter** :
  - abonnements par thème et par langue, **double opt-in** ;
  - **aucun pixel de suivi** par défaut, désinscription en un clic, exclusion globale ;
  - segments légaux uniquement : abonnés consentants ; « clients existants », pour des services similaires seulement ; « adresses génériques de sociétés », pour des personnes morales seulement.
- **Modèles d'e-mails** et envoi individuel depuis le CRM (pas de séquences automatiques vers des prospects non consentants).
- **Garde-fous de conformité** :
  - **import bloqué** sans provenance, et bloqué pour toute source BCE ou Moniteur ;
  - tâche d'appel bloquée sans filtrage « Ne m'appelez plus » ;
  - LinkedIn en saisie manuelle uniquement ;
  - **notice art. 14 RGPD** envoyée automatiquement dans le mois qui suit la création d'un contact non consentant ;
  - durées de conservation et purge automatique ;
  - traitement des demandes d'accès, de rectification et d'opposition ;
  - journal des exports.
- **Rôles** : admin, collaborateur, assistant (sans export), lecture seule.
- **Facturation** :
  - calcul par tranches marginales, TVA 21 %, forfait de diagnostic, prorata en cas de résiliation ;
  - indexation selon une formule objective ;
  - **Peppol** pour les holdings assujetties à la TVA ;
  - relances conformes au **Livre XIX** pour les consommateurs (premier rappel gratuit, 14 jours, plafonds) et à la loi du 2/8/2002 pour les entreprises ;
  - registre des **rétrocessions** : reçue → reversée, avec date.
- **Tableau de bord des indicateurs** :
  - **acquisition** : prospects par source, taux de passage et délais par étape (recommandés contre non recommandés) ;
  - **résultats** : familles signées, honoraires nouveaux, patrimoine coordonné, pipeline pondéré ;
  - **coût d'acquisition incluant le temps du fondateur** (saisie du temps passé) ;
  - **prescripteurs** : productivité, réciprocité, concentration sur les trois premiers ;
  - **santé de la conformité** : part des contacts avec base légale et provenance, notices envoyées, oppositions traitées, fiches expirées.

---

## 6. Phase E — Blog « Insights » et CMS (2 semaines pour l'outil, puis 3 mois de contenu)

- **CMS intégré au bureau** : éditeur Markdown avec aperçu, images sous licence (champ crédit obligatoire), catégories, Régions, langue, liaison des versions FR/NL/EN.
- **Champs obligatoires** :
  - dates de publication et de mise à jour, journal des modifications ;
  - Région(s) ;
  - **badge de statut de la réforme** (Annoncé / Voté / Publié au Moniteur / En vigueur), affiché en haut de l'article ;
  - auteur (fiche `Person` avec LinkedIn) et **relecteur nommé** (notaire, avocat, ITAA) ;
  - sources légales (liens vers le Moniteur, les circulaires) ;
  - avertissement standard.
- **Processus** : Brouillon → Relecture experte → Validation conformité → Publié. **Rappel de révision** trimestriel et à chaque nouvelle publication au Moniteur sur le sujet.
- **Vérificateur de conformité** à l'enregistrement : noms de produits, codes ISIN, rendements chiffrés, « planificateur », « conseil en investissement », « family office indépendant », « comment éviter l'impôt » → avertissement bloquant.
- Pas de commentaires publics. Les questions personnelles sont redirigées vers un rendez-vous.
- schema.org `BlogPosting`, `Person`, `Organization`, `BreadcrumbList` ; flux RSS ; partage LinkedIn.
- **Lettre mensuelle** « Ce qui a changé pour votre patrimoine », envoyée aux seuls abonnés consentants.
- **Notes réservées aux clients** publiées dans l'espace client.
- **10 premiers sujets** (ordre conseillé ; à rédiger puis faire relire, chiffres à revérifier sur les sources primaires) :
  1. Page pilier : succession, donation et droits d'enregistrement dans les 3 Régions (2026)
  2. Impôt de 10 % sur les plus-values financières : guide 2026 pour les familles
  3. Succession en Wallonie : ce qui s'applique, ce qui est annoncé pour 2028
  4. Don bancaire ou donation enregistrée : le délai de 5 ans dans les trois Régions
  5. Taxe sur les comptes-titres à 0,30 % : calcul, plafond, comptes multiples
  6. Réserve de liquidation et VVPRbis après la loi-programme
  7. Participations de 20 % et plus : barème et exonération de 1 M€
  8. Transmettre l'entreprise familiale selon la Région
  9. Calendrier patrimonial : points à vérifier avec vos conseillers avant le 31 décembre
  10. Réforme « Arizona » : ce qui a été promis, ce qui est en vigueur

---

## 7. Lettre de mission v2 (texte + parcours dans l'espace client)

- **Deux régimes** :
  - **consommateur** : fors légaux, le client peut saisir le juge de son domicile ; droit de rétractation ; signature qualifiée itsme ;
  - **professionnel / holding** : compétence exclusive du Brabant wallon ; pas de rétractation ; signature simple + convention de preuve ; vérification des pouvoirs du signataire.
- **Langues** : FR et NL complets (EN en option). Le client choisit, et la version signée fait foi.
- **Qualification du client** (consommateur ou professionnel) par déclaration, avec contrôle par le coordinateur.
- **Périmètre verrouillé** : consolidation, diagnostic factuel, coordination et suivi.
  - **Exclusions expresses** : planification financière (sauf agrément), conseil en investissement, réception et transmission d'ordres, gestion, intermédiation bancaire, d'assurance ou de crédit, conseil juridique ou fiscal.
  - Ni détention de fonds ni **procuration**.
  - Les recommandations sont émises par les professionnels mandatés, à leur nom.
- **Mandat d'information** vers les tiers (banques, notaires, ITAA), limité et révocable : relié aux autorisations déjà en place.
- **Honoraires** :
  - forfait de diagnostic + honoraire annuel par tranches marginales ; assiette, date et sources d'évaluation ;
  - TVA 21 %, échéancier, indexation objective, prorata en cas de résiliation ;
  - rétrocessions **versées directement au client** (ou parts sans rétrocession) ;
  - clause « ni commission d'apport payée ni reçue ».
- **Rétractation (consommateur)** :
  - information précontractuelle complète, formulaire type téléchargeable ;
  - case **séparée** pour la demande expresse d'exécution anticipée ; montant proportionnel calculé sur le forfait de diagnostic ;
  - **bouton « Se rétracter du contrat ici / Herroepen van de overeenkomst hier »** visible pendant 14 jours, étape de confirmation, accusé de réception par e-mail.
- **PDF signé envoyé immédiatement par e-mail** (support durable) et archivé dans le coffre-fort.
- **Reconduction annuelle** avec rappel préalable (obligatoire à partir du 01/05/2027, prévu dès maintenant).
- **Retards de paiement** : Livre XIX en B2C (clause réciproque), loi du 2/8/2002 en B2B.
- **Responsabilité** : obligation de moyens, plafond raisonnable, sans exclure le dol ni la faute lourde ; assureur RC pro mentionné.
- **Données** : renvoi à la politique de confidentialité, consentement explicite pour les données de santé, **aucun NRN**, liste des sous-traitants.
- **Connaissance du client** volontaire, avec droit de refuser ou de suspendre la mission.
- **Plaintes** : service interne avec délai de réponse, puis Service de médiation pour le consommateur, sans préjudice du juge.
- **Versionnage** : chaque modification du texte crée une nouvelle version. Les signatures conservent la version signée (déjà en place).

---

## 8. Phase F — Portail client v2 (3 à 4 semaines, ou marque blanche)

- **Construire ou acheter** pour la consolidation : évaluer **Kubera** (environ 300 $/mois en marque blanche), **Asora** (environ 900 $/mois, ISO 27001), **Masttro** (prix fixe) et **Altoo** (Suisse) sur quatre critères : hébergement UE/CH, certifications, contrat de sous-traitance RGPD, portabilité. Pour **Abbove** (ex-PaxFamilia), vérifier l'actionnariat (neutralité). Recommandation : **garder notre portail** pour l'onboarding, la coordination, les documents et la conformité ; brancher un moteur de consolidation en marque blanche **uniquement** quand les flux bancaires automatiques deviendront nécessaires.
- **Carte des entités** : personnes, holdings, sociétés simples, **usufruit / nue-propriété**, pourcentages.
- **Patrimoine consolidé** : immobilier, parts de société, assurances, art, dettes ; date et source de chaque valeur.
- **Coffre-fort** : dossiers par actif et par entité, **échéances** (carte d'identité, contrats, baux, crédits), **masquage du NRN** dans les documents déposés.
- **Messagerie sécurisée** et **prise de rendez-vous**.
- **Suivi des décisions et actions** (qui fait quoi : notaire, avocat, banque) : le cœur du rôle de coordinateur.
- **Rapports** trimestriel et annuel (PDF et en ligne) avec un **relevé annuel des honoraires et des rétrocessions reversées** et une **estimation des économies obtenues**.
- **Accès par rôle** :
  - conjoint ;
  - génération suivante, en lecture partielle ;
  - **professionnels externes en lecture limitée** (notaire, comptable) ;
  - **accès d'urgence** pour un bénéficiaire désigné.
- **PWA** (application installable), biométrie via les passkeys, mode discret.

---

## 9. Questions pour l'avocat (par ordre de priorité)

1. **Priorité absolue — agrément PFI (loi du 25 avril 2014)** :
   - notre activité est-elle de la consultation en planification financière ?
   - faut-il l'agrément, ou quelle formulation de l'offre et des livrables nous garde hors périmètre ?
   - faut-il écrire à la FSMA avant le lancement ?
   - exemption via un associé ITAA ou avocat ?
   - la marque « Quantrih Office » et le mot « family office » sont-ils sûrs (transaction FSMA de 2022) ?
   - un accès **en lecture** aux comptes vaut-il **procuration** ?
2. Percevoir puis reverser des rétrocessions fait-il de nous un intermédiaire ? Quel mécanisme de versement direct au client ? Quel traitement TVA ?
3. La coordination est-elle un « service financier » au sens du CDE ? Quel article exact pour le bouton de rétractation ? Comment calculer le montant proportionnel ? Le paiement anticipé est-il permis pendant le délai ? Comment organiser la reconduction ?
4. Statut anti-blanchiment : test de l'activité principale de conseil fiscal, effet d'un agrément PFI, préparation au règlement AMLR (2027).
5. Stockage incident de documents contenant le NRN, analyse d'impact (AIPD), durées de conservation.
6. RC pro : montants, exclusions liées aux activités réglementées, couverture cyber.
7. Clauses d'honoraires : indexation, limitation de responsabilité B2C et B2B, clause pénale réciproque.
8. Prospection : la liste « Ne m'appelez plus » s'applique-t-elle en B2B ? LinkedIn = « courrier électronique » ? Texte final de la recommandation de l'APD ? Pixels de suivi ?
9. Partenariats non monétaires et événements cofinancés : règles de l'OBFG, des notaires et de l'ITAA.
10. Primauté linguistique en B2C ; accessibilité (EAA, exemption des micro-entreprises).

**Démarches en parallèle** : candidature à la **Belgian Family Office Association** (sa charte de transparence correspond à notre modèle), devis RC pro et cyber, contrat itsme ou intermédiaire de signature, AIPD.

---

## 10. Décisions attendues du fondateur

1. **Voie FSMA** : A (demander l'agrément PFI) ou B (diagnostic factuel + recommandations signées par les partenaires, par défaut dans ce plan), en attendant l'avis de l'avocat.
2. **Honoraires** : montant du **forfait de diagnostic initial** ; **4e palier** au-delà de 20 M€ (par exemple 0,45 %) ou plafond.
3. **Langues au lancement** : FR seul, ou FR + NL.
4. **Contenu humain** : photo et biographie du fondateur, réseau de partenaires actuels (noms et accord pour figurer sur le site), nom de domaine.

---

## 11. Ordre d'exécution

| Ordre | Phase | Durée indicative | Dépend de |
|---|---|---|---|
| 1 | **A — Mise en conformité** (NRN, vocabulaire, lettre de mission v2, mentions, plaintes) | 1 semaine | — |
| 2 | **B — Site public v2** (FR, structure NL prête) | 2 à 3 semaines | A |
| 3 | **C — Connexion v2** (passkeys, alertes, appareils, mode discret ; itsme dès que le contrat est signé) | 1 semaine | A |
| 4 | **D — Bureau / CRM avancé** | 3 à 4 semaines | A |
| 5 | **E — Blog et CMS** (outil), puis 10 articles en 3 mois | 2 semaines + contenu | D (bureau) |
| 6 | **F — Portail client v2** | 3 à 4 semaines | C |
| 7 | Traduction NL complète, tests d'accessibilité et d'intrusion, mise en ligne | 2 semaines | Avis de l'avocat |

Chaque phase se termine par : typecheck, lint, tests unitaires, test de bout en bout dans le navigateur, captures d'écran, commit et push sur la branche.
