# Quantrih mobile

Application iOS et Android de Quantrih, construite avec Expo (React Native + TypeScript).

## Ce qui est partagé avec le site

- **Moteur de backtest** : l'app importe `src/engine` du site (alias `@shared/*`, voir `metro.config.js`
  et `tsconfig.json`). Mêmes calculs, mêmes chiffres. `setApiBase()` fait pointer le moteur vers
  `https://quantrih.com` (réglable dans `app.json`, `expo.extra.apiBase`).
- **Formules** : `src/lib/planLimits.ts` (Freemium, Premium, Pro) est lu par le site et par l'app.
- **Comptes et sauvegardes** : même projet Firebase. Une analyse enregistrée dans l'app
  (`users/{uid}/backtests`, `pageId: "mobile"`) apparaît dans l'espace client du site.
- **Portefeuilles modèles** : `src/data/lazyPortfolios.ts`.

## Écrans (V1)

| Onglet | Contenu |
| --- | --- |
| Marchés | Indices, ETF, crypto, devises, 20 lignes max par liste, heure de mise à jour |
| Portefeuilles | Portefeuilles modèles et analyses enregistrées ; fiche avec donut, courbe, drawdown, années |
| Backtest | Actifs et poids, jusqu'à 3/6/10 portefeuilles selon la formule, période, versements, rééquilibrage, indice de référence |
| Résultats | Courbe comparée, synthèse, années, risque ; enregistrement synchronisé et rapport PDF |
| Analyse | Fiche société : cours, historique, fourchette 52 semaines, chiffres clés ; analyse fondamentale complète en Pro |
| Compte | Connexion e-mail, formule, déconnexion, suppression du compte (exigée par Apple) |

## Lancer en local

```bash
cd apps/mobile
npm install
npx expo start          # puis « i » (simulateur iOS), « a » (Android) ou l'app Expo Go
npm run typecheck
```

Les achats intégrés (RevenueCat) ont besoin d'une *development build* :
`npx eas-cli@latest build --profile development --platform ios`.

## Publier

1. Comptes développeur : Apple Developer (99 $/an) et Google Play Console (25 $ une fois).
2. `npx eas-cli@latest login` puis `npx eas-cli@latest init` (relie le projet à Expo).
3. `npx eas-cli@latest build --profile production --platform all`
4. `npx eas-cli@latest submit --platform ios` et `--platform android`.

## Abonnements intégrés (RevenueCat)

1. Créer le projet RevenueCat, y relier l'App Store et Google Play.
2. Produits : `premium_monthly`, `premium_yearly`, `pro_monthly`, `pro_yearly` ; droits d'accès
   `premium` et `pro` ; offre `default`.
3. Mettre les clés publiques dans `app.json` (`revenueCatIosKey`, `revenueCatAndroidKey`).
4. Webhook RevenueCat vers le serveur du site, qui écrit `users/{uid}/profiles/subscription`
   (`{ plan: "premium" | "pro" }`) avec l'Admin SDK, comme le webhook Stripe. L'app ne l'écrit jamais.

Tant que les clés sont vides, le bouton d'abonnement ouvre `quantrih.com/pricing` : un abonnement
pris sur le site est reconnu dans l'app avec le même compte.
