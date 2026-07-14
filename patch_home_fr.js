import fs from 'fs';
const content = fs.readFileSync('src/components/pages/Home.tsx', 'utf-8');
const fixed = content
.replace("title: 'Asset Allocation',", "title: 'Allocation d\\'Actifs',")
.replace("cta: 'Define Allocation',", "cta: 'Définir l\\'Allocation',")
.replace("desc: 'Build your investment basket. Select your stocks, ETFs, or bonds, and instantly visualize their allocation clearly and graphically with our interactive heatmap.'", "desc: 'Construisez votre panier d\\'investissement. Sélectionnez vos actions, ETFs ou obligations, et visualisez instantanément leur allocation de manière claire et graphique avec notre carte thermique interactive.'")
.replace("title: 'Portfolio Backtesting',", "title: 'Backtest de Portefeuille',")
.replace("cta: 'Start Simulation',", "cta: 'Démarrer la Simulation',")
.replace("desc: 'Travel back in time to test your ideas. Observe how your portfolio would have performed over the past 10, 20, or 30 years to understand its real returns and historical risks.',", "desc: 'Voyagez dans le temps pour tester vos idées. Observez comment votre portefeuille se serait comporté au cours des 10, 20 ou 30 dernières années pour comprendre ses rendements réels et ses risques historiques.',")
.replace("title: 'Tactical Allocation',", "title: 'Allocation Tactique',")
.replace("cta: 'Build Rotation',", "cta: 'Créer une Rotation',")
.replace("desc: 'Set conditional triggers based on market momentum. Define rules that dynamically shift your weightings to protect against drawdowns and maximize growth in bull cycles.',", "desc: 'Définissez des déclencheurs conditionnels basés sur le momentum du marché. Définissez des règles qui modifient dynamiquement vos pondérations pour vous protéger contre les baisses et maximiser la croissance lors des cycles haussiers.',")
.replace("title: 'Dual Momentum',", "title: 'Momentum Dual',")
.replace("cta: 'Explore Framework',", "cta: 'Explorer le Modèle',")
.replace("desc: 'Harness the power of absolute and relative momentum simultaneously. Let the system algorithmically pivot your assets to outpace benchmarks with rigorous, battle-tested mechanics.'", "desc: 'Exploitez la puissance du momentum absolu et relatif simultanément. Laissez le système pivoter algorithmiquement vos actifs pour surpasser les indices de référence grâce à des mécanismes rigoureux et éprouvés.'");
fs.writeFileSync('src/components/pages/Home.tsx', fixed);
