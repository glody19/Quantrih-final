const fs = require('fs');
let txt = fs.readFileSync('src/components/pages/PortfolioBacktesting.tsx', 'utf8');

txt = txt.replace(/Modifier la configuration/g, '{language === "fr" ? "Modifier la configuration" : "Edit Configuration"}');
txt = txt.replace(/>Portfolio<\/th>/g, '>{language === "fr" ? "Portefeuille" : "Portfolio"}</th>');
txt = txt.replace(/>Allocation<\/th>/g, '>{t("pb.alloc")}</th>');
txt = txt.replace(/>Initial<\/th>/g, '>{t("pb.initialT")}</th>');
txt = txt.replace(/>Final<\/th>/g, '>{language === "fr" ? "Solde Final" : "Final"}</th>');
txt = txt.replace(/>Best \/ Worst<\/th>/g, '>{language === "fr" ? "Meill. / Pire" : "Best / Worst"}</th>');
txt = txt.replace(/Depuis \{r\.startYear\}/g, '{t("pb.since")} {r.startYear}');
txt = txt.replace(/Export PDF/g, '{language === "fr" ? "Exporter en PDF" : "Export PDF"}');

fs.writeFileSync('src/components/pages/PortfolioBacktesting.tsx', txt, 'utf8');
