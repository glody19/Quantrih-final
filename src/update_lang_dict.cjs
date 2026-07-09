const fs = require('fs');

function addTranslations(langStr, obj) {
  let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
  
  // Find the block for the given language e.g. en: {
  const regex = new RegExp(`(${langStr}:\\s*\\{[\\s\\S]*?\\n\\s*)(\\},)`);
  const match = content.match(regex);
  
  if (match) {
    let newEntries = '';
    for (const [key, value] of Object.entries(obj)) {
      if (!match[0].includes(`"${key}"`)) {
         newEntries += `    "${key}": "${value}",\n`;
      }
    }
    content = content.replace(regex, `$1${newEntries}$2`);
    fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
  } else {
      // Might be the last one: "nl: { ... }"
      const regexAlt = new RegExp(`(${langStr}:\\s*\\{[\\s\\S]*?\\n\\s*)(^\\})`, 'm');
      const matchAlt = content.match(regexAlt);
      if (matchAlt) {
        let newEntries = '';
        for (const [key, value] of Object.entries(obj)) {
          if (!matchAlt[0].includes(`"${key}"`)) {
             newEntries += `    "${key}": "${value}",\n`;
          }
        }
        content = content.replace(regexAlt, `$1${newEntries}$2`);
        fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
      }
  }
}

const en = {
  "pb.setup": "Setup configuration",
  "pb.assets": "Asset Weights",
  "pb.add": "+ Add Portfolio",
  "pb.run": "Run Backtest",
  "pb.running": "Running...",
  "pb.save": "Save Setup",
  "pb.capital": "Initial Amount",
  "pb.startY": "Start Year",
  "pb.startM": "Start Month",
  "pb.endY": "End Year",
  "pb.endM": "End Month",
  "pb.reb": "Rebalancing",
  "pb.currency": "Base Currency",
  "pb.broker": "Broker Fees",
  "pb.div": "Dividends",
  "pb.bench": "Benchmark",
  "pb.customFee": "Fee per order",
  "pb.audit": "Performance Audit.",
  "pb.simSpan": "Simulation spanning from",
  "pb.to": "to",
  "pb.export": "Export CSV",
  "pb.portSummaries": "Portfolio Summaries",
  "pb.adjusted": "Period adjusted to available data overlap.",
  "pb.since": "Since",
  "pb.alloc": "Allocation",
  "pb.returns": "Annualized Returns",
  "pb.risk": "Risk Assessment",
  "pb.maxDd": "Max Drawdown",
  "pb.vol": "Volatility",
  "pb.sharpe": "Sharpe Ratio",
  "pb.cagr": "CAGR",
  "pb.finalBal": "Final Balance",
  "pb.timeAnal": "Timeframe Analysis",
  "pb.rolling": "Rolling Returns Analysis",
  "pb.heatmap": "Annual Returns Heatmap",
  "pb.wealth": "Wealth Accumulation",
  "pb.initialT": "Initial",
  "ta.tit": "Tactical Allocation"
};

const fr = {
  "pb.setup": "Configuration",
  "pb.assets": "Pondérations des Actifs",
  "pb.add": "+ Ajouter un Portefeuille",
  "pb.run": "Lancer le Backtest",
  "pb.running": "En cours...",
  "pb.save": "Sauvegarder",
  "pb.capital": "Montant Initial",
  "pb.startY": "Année Début",
  "pb.startM": "Mois Début",
  "pb.endY": "Année Fin",
  "pb.endM": "Mois Fin",
  "pb.reb": "Rééquilibrage",
  "pb.currency": "Devise",
  "pb.broker": "Frais de Courtage",
  "pb.div": "Dividendes",
  "pb.bench": "Indice",
  "pb.customFee": "Frais par ordre (€)",
  "pb.audit": "Audit de Performance.",
  "pb.simSpan": "Simulation allant de",
  "pb.to": "à",
  "pb.export": "Exporter CSV",
  "pb.portSummaries": "Résumé des Portefeuilles",
  "pb.adjusted": "Période ajustée au chevauchement historique.",
  "pb.since": "Depuis",
  "pb.alloc": "Allocation",
  "pb.returns": "Rendements Annualisés",
  "pb.risk": "Évaluation du Risque",
  "pb.maxDd": "Drawdown Max",
  "pb.vol": "Volatilité",
  "pb.sharpe": "Ratio de Sharpe",
  "pb.cagr": "TCAM",
  "pb.finalBal": "Capital Final",
  "pb.timeAnal": "Analyse Temporelle",
  "pb.rolling": "Rendements Glissants",
  "pb.heatmap": "Carte Thermique des Rendements",
  "pb.wealth": "Accumulation de Richesse",
  "pb.initialT": "Initial",
  "ta.tit": "Allocation Tactique"
};

const nl = {
  "pb.setup": "Configuratie",
  "pb.assets": "Asset Wegingen",
  "pb.add": "+ Pas Portefeuille Toe",
  "pb.run": "Start Backtest",
  "pb.running": "Bezig...",
  "pb.save": "Opslaan",
  "pb.capital": "Startbedrag",
  "pb.startY": "Startjaar",
  "pb.startM": "Startmaand",
  "pb.endY": "Eindjaar",
  "pb.endM": "Eindmaand",
  "pb.reb": "Herbalanceren",
  "pb.currency": "Valuta",
  "pb.broker": "Makelaarskosten",
  "pb.div": "Dividenden",
  "pb.bench": "Benchmark",
  "pb.customFee": "Kosten per order (€)",
  "pb.audit": "Prestatie-audit.",
  "pb.simSpan": "Simulatie van",
  "pb.to": "tot",
  "pb.export": "CSV Exporteren",
  "pb.portSummaries": "Portefeuillesamenval",
  "pb.adjusted": "Periode aangepast aan gegevens.",
  "pb.since": "Sinds",
  "pb.alloc": "Allocatie",
  "pb.returns": "Geannualiseerde Rendementen",
  "pb.risk": "Risicobeoordeling",
  "pb.maxDd": "Max Drawdown",
  "pb.vol": "Volatiliteit",
  "pb.sharpe": "Sharpe Ratio",
  "pb.cagr": "CAGR",
  "pb.finalBal": "Eindsaldo",
  "pb.timeAnal": "Tijdsanalyse",
  "pb.rolling": "Voortschrijdende Rendementen",
  "pb.heatmap": "Rendementen Heatmap",
  "pb.wealth": "Vermogensopbouw",
  "pb.initialT": "Initieel",
  "ta.tit": "Tactische Allocatie"
};

const es = {
  "pb.setup": "Configuración",
  "pb.assets": "Pesos de Activos",
  "pb.add": "+ Añadir Cartera",
  "pb.run": "Ejecutar Backtest",
  "pb.running": "Ejecutando...",
  "pb.save": "Guardar",
  "pb.capital": "Monto Inicial",
  "pb.startY": "Año de inicio",
  "pb.startM": "Mes de inicio",
  "pb.endY": "Año de fin",
  "pb.endM": "Mes de fin",
  "pb.reb": "Reequilibrio",
  "pb.currency": "Moneda",
  "pb.broker": "Gastos de corredor",
  "pb.div": "Dividendos",
  "pb.bench": "Índice",
  "pb.customFee": "Tarifa por orden (€)",
  "pb.audit": "Auditoría de rendimiento.",
  "pb.simSpan": "Simulación desde",
  "pb.to": "hasta",
  "pb.export": "Exportar CSV",
  "pb.portSummaries": "Resumen de Carteras",
  "pb.adjusted": "Período ajustado a los datos.",
  "pb.since": "Desde",
  "pb.alloc": "Asignación",
  "pb.returns": "Rendimientos Anualizados",
  "pb.risk": "Evaluación de Riesgo",
  "pb.maxDd": "Caída máx.",
  "pb.vol": "Volatilidad",
  "pb.sharpe": "Ratio de Sharpe",
  "pb.cagr": "CAGR",
  "pb.finalBal": "Saldo Final",
  "pb.timeAnal": "Análisis Temporal",
  "pb.rolling": "Rendimientos Móviles",
  "pb.heatmap": "Mapa de calor",
  "pb.wealth": "Acumulación de riqueza",
  "pb.initialT": "Inicial",
  "ta.tit": "Asignación Táctica"
};

addTranslations('en', en);
addTranslations('fr', fr);
addTranslations('nl', nl);
addTranslations('es', es);

console.log('Translations added');
