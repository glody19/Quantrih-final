# Quantrih Family Office — Plan de la plateforme

> Document de cadrage destiné à être exécuté par Claude Code, phase par phase.
> Version 1 — novembre 2026. Statut réglementaire retenu : **option A, coordinateur patrimonial pur**
> (pas de recommandation personnalisée sur des instruments financiers, exécution par des partenaires agréés).

---

## 0. Décisions de cadrage (à lire avant tout développement)

| Sujet | Décision | Pourquoi |
|---|---|---|
| Clientèle | Familles **et** personnes seules à patrimoine important (1 à 20 M€ et plus) | Le modèle de données repose sur une « relation client » qui peut contenir une seule personne, un foyer ou une famille élargie avec des sociétés |
| Positionnement | Entre le gestionnaire de patrimoine et la banque privée : vision consolidée, coordination, transparence | Le site **n'utilise jamais** les mots « banque », « banque privée », « gestion de fortune », « gestion discrétionnaire » ni « conseil en investissement » pour décrire Quantrih : ces termes sont protégés ou supposent un agrément FSMA. Dire plutôt « family office », « coordination patrimoniale », « vision consolidée » |
| Application | **Nouvelle application séparée**, pas dans le dépôt Quantrih (outils de backtesting) | Le dépôt actuel (Vite + Express + Firebase + SQLite, appels Stripe, Alpaca, Gemini) n'est pas fait pour stocker des données d'identité et de patrimoine. Les outils publics Quantrih restent un produit à part, lié depuis la rubrique « Ressources » |
| Socle technique | Celui de **Norval Partners**, déjà éprouvé : Next.js App Router, TypeScript, Tailwind 4, Postgres + Drizzle, Auth.js, Resend, Vercel | Même maintenance, même savoir-faire, on peut reprendre des composants (auth, dépôt de documents, admin) |
| Hébergement | **Union européenne uniquement** : Vercel région `fra1`, Postgres Neon ou Supabase en Europe (Francfort), stockage privé en Europe | RGPD, attentes des clients fortunés, demandes des partenaires |
| Montants de la grille tarifaire | **Paramétrables en back-office**, jamais codés en dur | La grille est encore en cours de validation (tranches continues, TVA, commission de performance) |

**Benchmarks d'inspiration (pour l'expérience, pas pour copier marque ou visuels)**
- Consolidation et reporting : Addepar, Masttro, Asora, Altoo, Kubera
- Onboarding numérique : Revolut Business, Stripe (liste d'étapes reprenable, progression visible), Bunq
- Ton et sobriété du site : Pictet, Lombard Odier, Stonehage Fleming (typographie sobre, peu de mots, beaucoup d'air)
- Belgique : itsme pour l'identité, Ponto (Isabel Group) pour l'agrégation des comptes bancaires

---

## 1. Vue d'ensemble — trois espaces, une application

```
quantrih-fo (Next.js, un seul déploiement)
├── (site)    → site public              https://quantrih-fo.be/
├── (portail) → espace client            https://quantrih-fo.be/espace
└── (admin)   → back-office Quantrih     https://quantrih-fo.be/bureau   (rôle admin/collaborateur, IP + MFA)
```

Rôles : `prospect`, `client_titulaire`, `client_membre` (conjoint, enfant majeur), `mandataire_externe`
(comptable, avocat, notaire : lecture limitée et sur autorisation), `collaborateur`, `admin`.

### Pile technique

| Couche | Choix | Remarque |
|---|---|---|
| Framework | Next.js 16 (App Router, Server Actions), TypeScript strict | Comme Norval |
| UI | Tailwind 4 + composants maison (base shadcn/ui), icônes Lucide | Design system décrit en §6 |
| i18n | FR (par défaut), EN ; NL en phase 5 | `next-intl` ou le système i18n de Norval |
| Base de données | Postgres (Neon Europe) + Drizzle ORM + migrations | Chiffrement au niveau champ pour les données sensibles (§5) |
| Authentification | Auth.js : e-mail + mot de passe + **MFA obligatoire** (TOTP, puis passkeys) ; itsme (OIDC) en phase 5 | Pas d'inscription libre : le compte est créé sur invitation |
| Stockage des documents | Stockage objet privé en Europe (Vercel Blob privé ou S3 Scaleway/OVH), URL signées courtes, analyse antivirus | Jamais d'URL publique |
| E-mails | Resend (domaine vérifié, SPF/DKIM/DMARC) | Aucune donnée patrimoniale dans les e-mails, seulement « un nouveau document vous attend » |
| Signature électronique | Yousign (eIDAS, européen) | Lettre de mission, autorisations, mandats d'information |
| KYC / identité | Ondato ou Sumsub (document + selfie + filtrage PEP et sanctions) ; itsme ensuite | Prestataire européen avec contrat de sous-traitance (DPA) |
| Agrégation bancaire | Ponto (PSD2, agréé) | La PSD2 ne couvre que les comptes de paiement. Les comptes-titres arrivent par import de relevés (CSV/PDF), puis par flux des dépositaires |
| Tâches planifiées | Vercel Cron + file de tâches (Inngest ou tables Postgres) | Relances, rafraîchissement des soldes, rapports trimestriels |
| PDF | `@react-pdf/renderer` | Rapports consolidés, relevés d'honoraires |
| Supervision | Sentry (région UE), logs Vercel | Pas de données personnelles dans les logs |
| Prise de rendez-vous | Cal.com (intégré au site) | |

---

## 2. Site public `(site)`

Objectif : inspirer confiance en dix secondes, expliquer le rôle de chef d'orchestre et faire prendre un rendez-vous découverte.

### Arborescence

| Page | Contenu clé |
|---|---|
| Accueil | Promesse en une phrase (« Une vision complète de votre patrimoine, et une seule personne pour coordonner ceux qui le servent »), trois piliers (Vision consolidée, Coordination, Transparence), schéma du chef d'orchestre, appel « Prendre un rendez-vous découverte » |
| Notre approche | Le rôle de coordinateur, ce que nous faisons **et ce que nous ne faisons pas** (pas de décision à votre place, pas de produits maison, les professionnels mandatés restent responsables), méthode en cinq étapes |
| Services | Les douze services, chacun indiquant qui l'exécute : « coordonné par Quantrih, réalisé par un partenaire agréé » |
| Pour qui | Trois profils : familles, entrepreneurs (avant ou après une cession), particuliers à patrimoine important. Situations types, pas de faux témoignages |
| Honoraires | Grille transparente, simulateur (patrimoine → honoraire annuel HTVA / TVAC), engagement de reversement à 100 % des rétrocessions. **C'est notre principal argument : il doit être visible** |
| Écosystème | Catégories de partenaires (banques dépositaires, avocats, notaires, experts-comptables ITAA, courtiers), noms et logos seulement après accord écrit |
| À propos | Fondateur, Louvain-la-Neuve, vision à 35 ans, plan de continuité (que se passe-t-il si le coordinateur est indisponible) |
| Ressources | Articles, lien vers les outils Quantrih (backtesting) en tant que produit distinct |
| Contact / Rendez-vous | Formulaire de qualification (§3, étape 1) + agenda Cal.com |
| Mentions légales, Confidentialité, Cookies | Statut exact, numéro BCE, mention « Quantrih Family Office ne fournit pas de conseil en investissement au sens de la loi du 25 octobre 2016 » (formulation à valider par l'avocat) |

### Exigences
- Performance : Lighthouse ≥ 95 sur mobile, pages statiques (SSG), images optimisées.
- Accessibilité WCAG 2.1 AA.
- SEO local : « family office Louvain-la-Neuve », « family office Belgique », « coordination patrimoniale », données structurées `ProfessionalService`.
- Aucun cookie de suivi sans consentement ; mesure d'audience sans cookie (Vercel Analytics ou Plausible UE).
- Contenu conforme : pas de promesse de rendement, pas de performance passée, pas de « garanti ».

---

## 3. Parcours d'onboarding (cœur du projet)

Principe repris des meilleurs (Stripe, Revolut Business) : **une liste d'étapes visible, reprenable à tout moment, enregistrée automatiquement**, avec un pourcentage d'avancement et la mention de qui attend quoi (« À vous », « Chez Quantrih », « Chez le partenaire »).

```
 Prospect                                   Client
 ───────────────────────────────────────────────────────────────────────────────▶
 1 Qualification → 2 Rendez-vous → 3 Invitation → 4 Lettre de mission → 5 Identité (KYC)
   → 6 Profil et objectifs → 7 Inventaire du patrimoine → 8 Documents
   → 9 Autorisations et partenaires → 10 Revue Quantrih → 11 Activation et audit patrimonial
```

| # | Étape | Qui | Détail | Résultat en base |
|---|---|---|---|---|
| 1 | Qualification (site public) | Prospect | Nom, e-mail, téléphone ; fourchette de patrimoine (< 1 M€, 1-5, 5-10, 10-20, > 20) ; situation (famille, entrepreneur, particulier) ; besoins (cases à cocher parmi les 12 services) ; comment nous avez-vous connus ; consentement RGPD | `leads` (statut `nouveau`) + e-mail interne |
| 2 | Rendez-vous découverte | Prospect + Quantrih | Réservation Cal.com, visio ou Louvain-la-Neuve. Notes du rendez-vous saisies en back-office | `leads.statut = rdv_fait` |
| 3 | Invitation | Quantrih | Le collaborateur convertit le lead en relation client : lien d'invitation valable 72 h → création du mot de passe → **activation MFA obligatoire** | `relationships`, `users` |
| 4 | Proposition et lettre de mission | Client | Proposition générée depuis la grille (honoraire estimé HTVA et TVAC, périmètre, services inclus ou sur devis, politique de rétrocessions, durée, résiliation) → signature Yousign | `engagements` (version, PDF signé, date) |
| 5 | Identité et conformité | Client | Pour chaque personne : identité (itsme, ou document + selfie via le prestataire KYC), adresse, nationalité, résidence fiscale, statut PEP ; pour chaque société : bénéficiaires effectifs (UBO) ; origine des fonds et du patrimoine (questionnaire + pièces) | `kyc_checks` (résultat du prestataire, sans stocker les images si le prestataire les garde) |
| 6 | Profil et objectifs | Client | Composition de la relation (personnes, liens, sociétés, structures) ; objectifs (faire fructifier, préserver, transmettre, céder l'entreprise, financer un projet), horizon, priorités, préoccupations ; perception du risque **à titre informatif** : l'évaluation MiFID d'adéquation reste faite par le partenaire agréé | `persons`, `entities`, `objectives` |
| 7 | Inventaire du patrimoine | Client (assistant guidé) | Assistant par catégorie : comptes bancaires (connexion Ponto ou saisie), comptes-titres (import de relevé), immobilier, participations et sociétés, assurances (vie, branche 21/23, prévoyance), crédits et dettes, actifs de passion, liquidités. Chaque élément est rattaché à un titulaire (personne ou société) | `accounts`, `assets`, `liabilities` |
| 8 | Documents | Client | Liste de pièces générée selon les réponses (ex. : immobilier → acte ; société → statuts et dernier bilan ; testament ou donations → copies). Dépôt glisser-déposer, statut par pièce | `documents` (rattachés à un élément) |
| 9 | Autorisations et partenaires | Client | Choix des partenaires actuels du client (sa banque, son notaire…) et des partenaires Quantrih proposés ; **consentement explicite et révocable** au partage de données, par partenaire et par type de données ; signature des lettres d'autorisation d'information destinées aux banques | `partner_links`, `consents`, `mandates` |
| 10 | Revue Quantrih | Collaborateur | Liste de contrôle en back-office : KYC conforme, documents complets, conflits d'intérêts vérifiés, risques signalés ; validation à quatre yeux pour les risques élevés | `onboarding_reviews` |
| 11 | Activation | Quantrih → Client | Espace client complet ouvert, première vision consolidée, planification de la restitution de l'audit patrimonial | `relationships.statut = actif` |

**Règles d'expérience**
- On peut quitter et reprendre à chaque étape ; enregistrement automatique (débounce de 800 ms) avec l'indication « Enregistré ».
- Une question par écran pour les sujets sensibles (origine des fonds), formulaires groupés pour le reste.
- Le client peut inviter son conjoint ou son comptable à remplir une partie, avec des droits limités.
- Relances automatiques douces (J+3, J+7, J+14) et tableau « Ce qui reste à faire ».
- Le collaborateur voit en temps réel où en est chaque onboarding (tableau kanban).
- Objectif : parcours client complet en moins de 45 minutes, hors collecte des pièces.

---

## 4. Espace client `(portail)` après activation

| Module | Fonctions | Inspiration |
|---|---|---|
| Vue d'ensemble | Patrimoine net consolidé ; répartition par classe d'actifs, par titulaire (personnes et sociétés), par établissement, liquide / illiquide ; évolution dans le temps ; date de fraîcheur de chaque donnée | Addepar, Kubera |
| Patrimoine | Détail de chaque compte, bien et dette ; documents liés ; historique des valorisations ; mises à jour manuelles par le client (ex. : estimation d'un bien) signalées comme « déclaratif » | Altoo |
| Structure | Organigramme interactif : personnes, sociétés, holdings, pourcentages de détention | Masttro |
| Projets | Chaque mission (succession, cession, financement, création de holding) avec ses étapes, le partenaire responsable, les échéances et les décisions attendues du client | Kanban simplifié |
| Coffre-fort documentaire | Classement par catégorie et par titulaire, recherche, versions, partage contrôlé avec un partenaire, dates d'expiration (ex. : carte d'identité, contrats d'assurance) | |
| Messagerie sécurisée | Fils par sujet ou par projet, pièces jointes, notification par e-mail sans le contenu | |
| Rapports | Rapport consolidé trimestriel (PDF) et rapport annuel ; archive | Banques privées |
| Honoraires et transparence | Honoraires facturés, détail du calcul par tranche, **registre des rétrocessions reçues et reversées**, factures | Différenciateur Quantrih, n'existe pas chez les concurrents |
| Agenda | Rendez-vous, échéances (fiscales, renouvellements, fin de crédit) | |
| Membres et accès | Le titulaire gère les accès (conjoint en lecture complète, enfant en lecture partielle, comptable sur un périmètre précis), journal de qui a vu quoi | |
| Sécurité | MFA, appareils connectés, déconnexion à distance, export de mes données (RGPD) | |

---

## 5. Back-office `(admin)`

- **CRM** : leads, pipeline (nouveau → rendez-vous → proposition → onboarding → client actif), notes, source.
- **Onboardings** : vue kanban par étape, contrôles de revue, validation à quatre yeux.
- **Relations clients** : fiche 360° (personnes, sociétés, patrimoine, documents, projets, consentements, KYC, revue périodique).
- **Saisie et imports** : import CSV/PDF des relevés de dépositaires avec association des colonnes, valorisations manuelles, rafraîchissement Ponto.
- **Annuaire des partenaires** : catégorie, agrément (numéro FSMA, ITAA…), contrat, accords de rétrocession, contacts.
- **Projets et tâches** : affectation au partenaire, échéances, relances.
- **Facturation** : calcul des honoraires par tranches marginales (paramétrables), TVA 21 %, minimum annuel, honoraires de mission, factures PDF, export comptable.
- **Conformité** : registre des conflits d'intérêts, registre des rétrocessions (reçue → reversée), revues KYC périodiques (selon le niveau de risque), registre des traitements RGPD, demandes d'exercice des droits.
- **Journal d'audit** : toute lecture et toute modification d'une donnée client (qui, quoi, quand, depuis quelle IP), non modifiable.
- **Paramètres** : grille tarifaire, modèles de documents, listes de pièces par situation, textes légaux.

---

## 6. Modèle de données (première version)

```
relationships (la relation client : une personne seule, un foyer, une famille)
 ├── persons            (identité, résidence fiscale, liens familiaux, statut PEP)
 ├── entities           (sociétés, holdings, fondations, structures étrangères ; UBO → persons)
 ├── ownerships         (qui détient quoi : person|entity → entity|asset, % de détention)
 ├── accounts           (banque, compte-titres, assurance-vie… ; établissement, source = ponto|import|manuel)
 │    └── positions / valuations (date, montant, devise, source, fraîcheur)
 ├── assets             (immobilier, participations, actifs de passion ; valorisation déclarative ou expertisée)
 ├── liabilities        (crédits, garanties)
 ├── objectives
 ├── projects ─ tasks   (avec partner_id)
 ├── documents          (catégorie, rattachement, version, expiration, chiffrement)
 ├── messages / threads
 ├── engagements        (lettre de mission signée, grille appliquée)
 ├── fee_invoices / retrocessions
 ├── consents / mandates / partner_links
 └── kyc_checks / onboarding_steps / onboarding_reviews
users (comptes de connexion) ── memberships (user ↔ relationship, rôle, périmètre)
partners, leads, audit_log, settings
```

**Sécurité des données**
- Chiffrement applicatif (AES-256-GCM, clé gérée hors base) pour le numéro national, les IBAN, les numéros de document d'identité et les notes sensibles.
- Contrôle d'accès vérifié **côté serveur à chaque requête** : une requête ne lit jamais une relation sans appartenance (`memberships`) ; tests automatisés pour chaque route.
- Sessions courtes (30 min d'inactivité), MFA obligatoire, verrouillage après 5 échecs (comme Norval).
- Conservation : pièces KYC 10 ans après la fin de la relation (anti-blanchiment, à confirmer), puis suppression automatique.
- Avant la mise en production : analyse d'impact RGPD (DPIA), contrat de sous-traitance (DPA) avec chaque prestataire, test d'intrusion externe.

---

## 7. Design system

- Ton : sobre, intemporel, « vieille maison » mais numérique. Peu de couleurs, beaucoup d'espace.
- Palette proposée : bleu nuit `#0F1E2E` (texte, en-têtes), ivoire `#F7F4EE` (fonds), or atténué `#B08D57` (accent, avec parcimonie), gris ardoise `#5B6672`, vert sauge `#5E7D6A` pour les états positifs. Thème sombre pour l'espace client.
- Typographies : une serif éditoriale pour les titres (ex. « Cormorant Garamond » ou « Libre Caslon »), une sans-serif lisible pour l'interface et les chiffres (« Inter », chiffres tabulaires).
- Chiffres : toujours tabulaires, alignés à droite, devise explicite, date de valorisation affichée.
- Pas d'animations décoratives dans l'espace client ; animations discrètes autorisées sur le site.
- Composants : carte de synthèse, tableau de patrimoine, liste d'étapes d'onboarding, zone de dépôt, fil de messages, organigramme, graphiques (donut de répartition, courbe d'évolution).

---

## 8. Phases de réalisation et consignes pour Claude Code

Chaque phase se termine par : `npm run typecheck`, `npm run lint`, tests (Vitest + Playwright pour les parcours), déploiement de prévisualisation Vercel, courte note de livraison dans `docs/livraisons/`.

| Phase | Contenu | Durée indicative |
|---|---|---|
| 0. Fondations | Nouveau dépôt `quantrih-fo` ; Next.js + Tailwind + Drizzle + Auth.js (repris de Norval) ; design system de base ; schéma §6 (tables principales) ; MFA ; journal d'audit ; i18n FR/EN ; CI | 1 à 2 semaines |
| 1. Site public | Toutes les pages §2, formulaire de qualification → `leads`, Cal.com, simulateur d'honoraires lu depuis `settings` | 1 à 2 semaines |
| 2. Onboarding | Étapes 3 à 11 (§3) avec saisie manuelle et dépôt de documents ; back-office CRM + kanban des onboardings + revue ; signature et KYC **simulés** derrière des interfaces | 3 à 4 semaines |
| 3. Espace client v1 | Vue d'ensemble, patrimoine, structure, documents, messagerie, projets, membres et accès | 3 semaines |
| 4. Rapports et facturation | Rapport trimestriel PDF, calcul des honoraires, factures, registre des rétrocessions et page de transparence | 2 semaines |
| 5. Intégrations | Yousign, prestataire KYC, itsme, Ponto, import des relevés des dépositaires partenaires, néerlandais | 3 à 4 semaines |
| 6. Durcissement | DPIA, test d'intrusion, plan de continuité, sauvegardes testées, supervision | 1 à 2 semaines |

### Consigne type à donner à Claude Code (exemple pour la phase 0)

> Lis `docs/family-office/PLAN-PLATEFORME.md`. Crée l'application `quantrih-fo` en reprenant de Norval Partners
> l'authentification (Auth.js, mots de passe bcrypt, verrouillage après 5 échecs), la configuration Drizzle et la structure
> par groupes de routes. Ajoute : MFA TOTP obligatoire, les tables de la §6 (relationships, persons, entities, ownerships,
> accounts, valuations, assets, liabilities, documents, memberships, audit_log, settings, leads), un contrôle d'accès
> serveur basé sur `memberships` avec des tests, et le design system de la §7. Pas encore de site public ni
> d'onboarding. Livre avec typecheck, lint et tests au vert.

---

## 9. Points à valider par le fondateur (avant la phase 1)

1. Nom de domaine et marque (« Quantrih Family Office », domaine `.be`, et éventuellement `.com`).
2. Grille tarifaire définitive : tranches continues, taux, minimum annuel, sort de la commission de performance.
3. Formulations légales du site et de la lettre de mission (avocat en droit financier).
4. Obligations anti-blanchiment applicables au statut de coordinateur (avocat / SPF Finances), à défaut niveau KYC exigé par les partenaires.
5. Liste des partenaires et accord de chacun pour figurer sur le site et recevoir des données via la plateforme.
6. Choix du prestataire KYC (Ondato ou Sumsub) et contrat itsme.
7. Contenu « À propos » : parcours, photo, plan de continuité.
