# Abonnements Stripe (Premium et Pro)

## Ce qui est branché

- `/pricing` : « Choisir Premium / Pro » ouvre Stripe Checkout (mensuel ou annuel). Un visiteur non connecté passe par la connexion puis revient au paiement.
- `/profile#plan` : statut, date de renouvellement, factures et carte (portail Stripe), annulation avec confirmation, reprise.
- Annulation : toujours en fin de période payée (`cancel_at_period_end`). Le membre garde sa formule jusqu'à la date affichée.
- Webhook `/api/stripe/webhook` : écrit `users/{uid}/profiles/subscription` (Admin SDK). Les règles Firestore interdisent au navigateur d'écrire ce document.
- Prix : 15 € / 150 € (Premium), 40 € / 400 € (Pro). Créés automatiquement au premier paiement (lookup keys `quantrih_premium_monthly`, `quantrih_premium_yearly`, `quantrih_pro_monthly`, `quantrih_pro_yearly`) si aucun `STRIPE_PRICE_*` n'est fourni.

## Mise en route

1. **Stripe** (dashboard.stripe.com, commencer en mode Test)
   - Développeurs > Clés API : copier la clé secrète `sk_test_...`.
   - Développeurs > Webhooks > Ajouter un endpoint : `https://quantrih.com/api/stripe/webhook`, événements
     `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Copier le secret `whsec_...`.
   - Paramètres > Paiements : activer les moyens voulus (carte, Bancontact, SEPA...).
2. **Firebase** (console.firebase.google.com, projet `gen-lang-client-0771843165`)
   - Paramètres du projet > Comptes de service > Générer une nouvelle clé privée (fichier JSON).
   - Firestore > Règles : publier le contenu de `firestore.rules`.
3. **Vercel** > projet > Settings > Environment Variables (Production) :
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `FIREBASE_SERVICE_ACCOUNT` : le contenu du JSON sur une ligne (ou encodé en base64)
   - `APP_URL=https://quantrih.com`
   - puis redéployer.
4. Tester avec la carte `4242 4242 4242 4242`, puis refaire les étapes 1 et 3 avec les clés Live.

La TVA n'est pas calculée automatiquement : activer Stripe Tax si nécessaire.
