import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { RunOutput } from "./backtest";
import { seriesColor } from "./series";
import { money, num, pct } from "./format";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

function svgChart(run: RunOutput, w = 680, h = 220) {
  const all = run.series.flatMap((s) => s.values);
  const mn = Math.min(...all), mx = Math.max(...all);
  const lines = run.series
    .map((s, k) => {
      const n = s.values.length;
      const pts = s.values.map((v, i) => `${((i / Math.max(1, n - 1)) * w).toFixed(1)},${(h - 4 - ((v - mn) / (mx - mn || 1)) * (h - 8)).toFixed(1)}`).join(" ");
      return `<polyline fill="none" stroke="${seriesColor(s, k)}" stroke-width="${k === 0 ? 2 : 1.4}" points="${pts}"/>`;
    })
    .join("");
  const grid = [1, 2, 3].map((g) => `<line x1="0" x2="${w}" y1="${(h * g) / 4}" y2="${(h * g) / 4}" stroke="#EEF0F3"/>`).join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${grid}${lines}</svg>`;
}

/** Report on white paper, same sober style as the site's PDF. Opens the share sheet (e-mail, WhatsApp, Files). */
export async function sharePdf(run: RunOutput, title: string) {
  const ccy = run.settings.currency;
  const head = run.series.map((s, i) => `<th style="color:${seriesColor(s, i)}">${esc(s.name)}</th>`).join("");
  const row = (label: string, f: (s: RunOutput["series"][number]) => string) => `<tr><td>${label}</td>${run.series.map((s) => `<td class="n">${f(s)}</td>`).join("")}</tr>`;
  const allocs = run.series
    .filter((s) => !s.isBenchmark)
    .map((s) => `<p><b>${esc(s.name)}</b> : ${Object.entries(s.alloc).map(([k, v]) => `${esc(k)} ${num(v, v % 1 ? 1 : 0)} %`).join(", ")}</p>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#111118;margin:36px}
    h1{font-size:24px;margin:0 0 4px} .sub{color:#858899;font-size:12px;margin-bottom:22px}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:18px}
    th{text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:.06em;padding:6px;border-bottom:1px solid #D3D5DD}
    th:first-child{text-align:left} td{padding:7px 6px;border-bottom:1px solid #E6E7EC} td.n{text-align:right;font-variant-numeric:tabular-nums}
    p{font-size:12px;color:#23232D;margin:4px 0} .foot{margin-top:28px;font-size:10px;color:#858899}
  </style></head><body>
    <div style="font-weight:700;font-size:13px;color:#1B3F72;margin-bottom:22px">Quantrih</div>
    <h1>${esc(title)}</h1>
    <div class="sub">${run.settings.startYear} - ${run.settings.endYear} · montant initial ${money(run.settings.initial, ccy)}${run.settings.monthly ? ` · versement mensuel ${money(run.settings.monthly, ccy)}` : ""} · dividendes réinvestis</div>
    ${svgChart(run)}
    <table><tr><th>Mesure</th>${head}</tr>
      ${row("Valeur finale", (s) => money(s.endBalance, ccy))}
      ${row("Rendement annuel", (s) => pct(s.cagr))}
      ${row("Volatilité", (s) => pct(s.volatility))}
      ${row("Sharpe", (s) => num(s.sharpe, 2))}
      ${row("Pire baisse", (s) => pct(-s.maxDrawdown))}
      ${row("Meilleure année", (s) => pct(s.bestYear, 1, true))}
      ${row("Pire année", (s) => pct(s.worstYear, 1, true))}
    </table>
    <div style="margin-top:18px">${allocs}</div>
    <div class="foot">Rapport créé avec l'application Quantrih le ${new Date().toLocaleDateString("fr-FR")}. Les performances passées ne préjugent pas des performances futures. Ce document n'est pas un conseil en investissement.</div>
  </body></html>`;

  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: title });
}
