# Ega Tax Consulting — site web

Site vitrine de la fiduciaire **Ega Tax Consulting** (comptabilité, fiscalité, TVA, création d'entreprise — Belgique).

100 % statique (HTML / CSS / JS natif), aucune dépendance, aucune étape de build.

## Structure
```
index.html              Page principale (services, mission, profils, méthode, FAQ, contact)
mentions-legales.html   Mentions légales & cookies (champs à compléter)
assets/styles.css       Design system & styles
assets/main.js          Interactions (onglets, profils, animations, formulaire)
assets/favicon.svg      Logo / favicon
```

## Aperçu local
```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

## Mise en ligne
- **GitHub Pages** : Settings → Pages → Branch `main` / root.
- **Vercel / Netlify** : importer le dépôt, aucun réglage nécessaire.
- Domaine personnalisé (ex. `egataxconsulting.be`) : ajouter un fichier `CNAME` et configurer le DNS.

## À compléter
- Numéro de téléphone et adresse du bureau (absents / factices sur l'ancien site)
- Numéros BCE, TVA et ITAA dans `mentions-legales.html`
- Formulaire : ouvre actuellement la messagerie (mailto). Pour un envoi direct, brancher Formspree, Netlify Forms ou un CRM.
