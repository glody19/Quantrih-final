const fs = require('fs');

let content = fs.readFileSync('src/components/pages/PortfolioBacktesting.tsx', 'utf8');

// Top level fixes
content = content.replace(/>Setup configuration</g, ">{t('pb.setup')}<");
content = content.replace(/>Configure Assets</g, ">{t('pb.assets')}<");
content = content.replace(/>\+ Add Portfolio</g, ">{t('pb.add')}<");
content = content.replace(/>\s*Run Backtest\s*</g, "> {t('pb.run')} <");
content = content.replace(/>\s*Running\.\.\.\s*</g, "> {t('pb.running')} <");
content = content.replace(/>Save Setup</g, ">{t('pb.save')}<");

// Parameters
content = content.replace(/label="Initial Amount"/g, `label={t('pb.capital')}`);
content = content.replace(/label="Start Year"|label="Start Month"/g, (match) => {
   if (match.includes("Year")) return `label={t('pb.startY')}`;
   else return `label={t('pb.startM')}`;
});
content = content.replace(/label="End Year"|label="End Month"/g, (match) => {
   if (match.includes("Year")) return `label={t('pb.endY')}`;
   else return `label={t('pb.endM')}`;
});

content = content.replace(/>Rebalancing</g, ">{t('pb.reb')}<");
content = content.replace(/label="Base Currency"/g, `label={t('pb.currency')}`);
content = content.replace(/label="Broker \/ Platform"/g, `label={t('pb.broker')}`);
content = content.replace(/>Dividends</g, ">{t('pb.div')}<");
content = content.replace(/>Frais par ordre \(\€\)</g, ">{t('pb.customFee')}<");

// Results
content = content.replace(/>\s*Performance Audit\.\s*</g, ">\n                       {t('pb.audit')}\n                    <");
content = content.replace(/Simulation spanning from/g, `{t('pb.simSpan')}`);
content = content.replace(/to \{results/g, ` {t('pb.to')} {results`);

content = content.replace(/>\s*Export CSV\s*</g, ">\n                      {t('pb.export')}\n                    <");
content = content.replace(/>Portfolio Summaries</g, ">{t('pb.portSummaries')}<");
content = content.replace(/>\s*Période ajustée au chevauchement commun des données disponibles\.\s*</g, ">\n                                  {t('pb.adjusted')}\n                                <");

content = content.replace(/Since \{r\.startYear\}/g, `{t('pb.since')} {r.startYear}`);
content = content.replace(/>Allocation</g, ">{t('pb.alloc')}<");
content = content.replace(/>Annualized Returns</g, ">{t('pb.returns')}<");
content = content.replace(/>Risk Assessment</g, ">{t('pb.risk')}<");
content = content.replace(/>Max Drawdown</g, ">{t('pb.maxDd')}<");
content = content.replace(/>Volatility</g, ">{t('pb.vol')}<");

content = content.replace(/>Timeframe Analysis</g, ">{t('pb.timeAnal')}<");
content = content.replace(/>Rolling Returns Analysis</g, ">{t('pb.rolling')}<");
content = content.replace(/>Annual Returns Heatmap</g, ">{t('pb.heatmap')}<");
content = content.replace(/>Wealth Accumulation</g, ">{t('pb.wealth')}<");

content = content.replace(/>Final Account Balance</g, ">{t('pb.finalBal')}<");


fs.writeFileSync('src/components/pages/PortfolioBacktesting.tsx', content);
console.log('Fixed translations in PortfolioBacktesting');
