# Quantrih Office — site et plateforme client

Site public, espace client et bureau (back-office) de Quantrih Office, family office à Louvain-la-Neuve.
Plan complet : [`../docs/family-office/PLAN-PLATEFORME.md`](../docs/family-office/PLAN-PLATEFORME.md).

Pile : Next.js 16 (App Router) · TypeScript · Tailwind 4 · Postgres + Drizzle · Auth.js · Resend · hébergement Vercel `fra1` (UE).

## Ce qui est en place

| Espace | Pages |
|---|---|
| Site public | Accueil, Notre approche, Services, Pour qui, Honoraires (simulateur par tranches), À propos, Rendez-vous découverte (formulaire de qualification → prospects), Mentions légales, Confidentialité |
| Connexion | Connexion e-mail + mot de passe, **double authentification obligatoire** (TOTP + 10 codes de secours), invitation à usage unique valable 72 h, blocage après 5 échecs, limitation par adresse IP |
| Espace client `/espace` | Onboarding détaillé (ci-dessous), documents, vue d'ensemble consolidée (net, actifs, dettes, part liquide, répartitions par classe, établissement et titulaire), suivi de l'onboarding en 8 étapes, patrimoine détaillé avec source et date, historique des connexions |
| Bureau `/bureau` | Tableau de bord, prospects (statuts, conversion en client), relations clients (création + invitation, validation des étapes, saisie du patrimoine), journal d'audit (admin) |

Sécurité : toute donnée client est lue via `memberships` (contrôle serveur), clé TOTP chiffrée AES-256-GCM, session relue en base à chaque requête, en-têtes CSP/HSTS, espaces connectés en `noindex` et `no-store`, journal d'audit des actions sensibles.

## Onboarding (phase 2) — adapté à la Belgique

| Étape | Ce que fait le client | Contrôles |
|---|---|---|
| Lettre de mission | Lit le texte (version `LM-2026-11`), voit l'estimation d'honoraires HTVA/TVAC, signe en saisissant son nom | Preuve conservée (date, IP, version) ; délai de rétractation de 14 jours pour un consommateur (CDE, livre VI) avec option de démarrage anticipé |
| Identité et conformité | Méthode d'identification (itsme bientôt, eID), origine du patrimoine, liens étrangers, certification | Questionnaire au sens de la loi anti-blanchiment du 18 septembre 2017 |
| Profil et objectifs | Personnes (lien, régime matrimonial belge, nationalité, résidence fiscale, PEP, FATCA), sociétés (SRL, SA, SC… avec numéro BCE), objectifs et horizon | Numéro de registre national contrôlé (modulo 97) et **chiffré** ; BCE contrôlé (modulo 97) |
| Inventaire du patrimoine | Comptes, branche 21/23/44, épargne-pension, EIP/PLCI, immobilier, participations, dettes | Le client ne peut retirer que ses propres estimations |
| Documents | Liste des pièces calculée selon la situation (avertissement-extrait de rôle, statuts au Moniteur belge, extrait UBO, contrat de mariage…), dépôt glisser-déposer | Type réel du fichier vérifié, 4 Mo max, **chiffrement AES-256-GCM avant stockage**, chaque consultation tracée |
| Autorisations | Autorise chaque professionnel (banque, notaire, avocat, ITAA, courtier) et choisit ce qui peut être partagé ; révocation immédiate | Preuve de consentement RGPD conservée |

Le bureau voit tout le dossier sur la fiche client, avec les signaux de vigilance (PEP, FATCA, résidence fiscale ou structure étrangère).

## Démarrage local

```bash
cp .env.example .env.local      # compléter DATABASE_URL, AUTH_SECRET, ADMIN_*
npm install
npm run db:migrate
SEED_DEMO=1 npm run db:seed     # admin + relation de démonstration « Famille Exemple »
npm run dev
```

Première connexion : `/connexion` avec ADMIN_EMAIL / ADMIN_PASSWORD, puis activation de la double authentification.
Le client de démonstration est `demo.client@quantrih-office.be` (même mot de passe que l'admin).

Sans `RESEND_API_KEY`, aucun e-mail n'est envoyé : le lien d'invitation s'affiche dans le bureau pour être transmis au client.

## Contrôles

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Déploiement Vercel

Projet avec *Root Directory* = `quantrih-office`, variables d'environnement de `.env.example`, base Postgres en Europe (Neon Francfort).
La commande `vercel-build` applique les migrations avant la compilation. Créer l'admin une fois avec `npm run db:seed`.

## Prochaines étapes (plan §8)

- Phase 2 (suite) : itsme (identification et signature qualifiée), prestataire KYC, rappels automatiques par e-mail.
- Phase 3 : documents, projets, messagerie, membres de la famille et droits d'accès.
- Phase 4 : rapports PDF, facturation, registre des rétrocessions.
- Phase 5 : itsme, Ponto, prestataire KYC, néerlandais et anglais.
