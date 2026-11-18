import React from "react";

/**
 * Trading and risk settings shared by every tactical model: how often the model trades, when the
 * order is executed, a trailing stop, leverage and what the strategy is compared with.
 * Each choice carries a one-line explanation so the user knows what it changes in the backtest.
 */
export interface ExecutionSettings {
  frequency: number; // months between decisions
  lag: number; // 0 trade on the signal close, 1 a month later
  stop: number; // trailing stop, 0 = none
  leverage: number; // 1 = none
  borrowRate: number; // % per year
  compared: "none" | "buyhold";
  benchmark: "none" | "SPY" | "6040";
  topK?: number; // relative momentum only
}

const SELECT =
  "w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors";

type L = "en" | "fr";
const T = {
  title: { en: "Trading and risk", fr: "Exécution et risque" },
  intro: {
    en: "These settings apply to the model above. They change when and how the trades are made, not the signal itself.",
    fr: "Ces réglages s'appliquent au modèle ci-dessus. Ils changent quand et comment les ordres sont passés, pas le signal lui-même.",
  },
  frequency: { en: "Trading frequency", fr: "Fréquence de décision" },
  frequencyHelp: {
    en: "How often the model is read and the portfolio adjusted. Less frequent means fewer trades and fewer false signals, but slower reactions.",
    fr: "À quel rythme le modèle est relu et le portefeuille ajusté. Moins souvent : moins d'ordres et de faux signaux, mais des réactions plus lentes.",
  },
  monthly: { en: "Monthly", fr: "Mensuelle" },
  quarterly: { en: "Quarterly", fr: "Trimestrielle" },
  yearly: { en: "Yearly", fr: "Annuelle" },
  execution: { en: "Trade execution", fr: "Exécution des ordres" },
  executionHelp: {
    en: "Trading at the signal's month-end close is the textbook case. A one-month delay shows how much the result depends on acting immediately.",
    fr: "Trader au cours de clôture du mois du signal est le cas d'école. Un mois de délai montre à quel point le résultat dépend d'une réaction immédiate.",
  },
  atClose: { en: "At the signal's month-end close", fr: "Au cours de clôture du mois du signal" },
  nextMonth: { en: "One month later", fr: "Un mois plus tard" },
  stop: { en: "Trailing stop-loss", fr: "Stop-loss suiveur" },
  stopHelp: {
    en: "If the portfolio falls this much below its highest value, everything moves to the safe asset until the next decision date.",
    fr: "Si le portefeuille recule de ce pourcentage sous son plus haut, tout passe sur l'actif refuge jusqu'à la prochaine date de décision.",
  },
  noStop: { en: "No stop-loss", fr: "Aucun stop-loss" },
  leverage: { en: "Leverage", fr: "Effet de levier" },
  leverageHelp: {
    en: "Borrow to hold more than 100% while invested (never on the safe asset). Gains and losses grow by the same factor, minus the interest.",
    fr: "Emprunter pour détenir plus de 100 % quand la stratégie est investie (jamais sur l'actif refuge). Gains et pertes sont multipliés d'autant, moins les intérêts.",
  },
  none: { en: "None", fr: "Aucun" },
  borrow: { en: "Borrowing rate (% per year)", fr: "Taux d'emprunt (% par an)" },
  borrowHelp: { en: "Interest paid on the borrowed part.", fr: "Intérêts payés sur la partie empruntée." },
  compared: { en: "Compared allocation", fr: "Allocation comparée" },
  comparedHelp: {
    en: "Adds the same assets held without any signal, to see what the strategy really adds.",
    fr: "Ajoute les mêmes actifs détenus sans aucun signal, pour voir ce que la stratégie apporte vraiment.",
  },
  buyHold: { en: "Same assets, buy and hold", fr: "Mêmes actifs, achat-conservation" },
  benchmark: { en: "Benchmark", fr: "Indice de référence" },
  benchmarkHelp: { en: "A market reference shown next to the results.", fr: "Une référence de marché affichée à côté des résultats." },
  sp500: { en: "S&P 500 (SPY)", fr: "S&P 500 (SPY)" },
  sixtyForty: { en: "60/40 stocks and bonds", fr: "60/40 actions et obligations" },
  topK: { en: "Assets held", fr: "Nombre d'actifs détenus" },
  topKHelp: {
    en: "How many of the best-ranked assets are held at the same time.",
    fr: "Combien des actifs les mieux classés sont détenus en même temps.",
  },
};

function Field({ label, help, children }: { label: string; help: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-text block">{label}</label>
      {children}
      <p className="text-[12.5px] leading-snug text-text-3">{help}</p>
    </div>
  );
}

export function StrategyExecutionPanel({ lang, value, onChange, showTopK }: { lang: L; value: ExecutionSettings; onChange: (v: ExecutionSettings) => void; showTopK?: boolean }) {
  const t = (k: keyof typeof T) => T[k][lang];
  const set = <K extends keyof ExecutionSettings>(k: K, v: ExecutionSettings[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="mt-8 border-t border-border pt-8">
      <h3 className="text-lg font-semibold text-text">{t("title")}</h3>
      <p className="mt-1 text-sm text-text-3 max-w-3xl">{t("intro")}</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-6">
        {showTopK && (
          <Field label={t("topK")} help={t("topKHelp")}>
            <select className={SELECT} value={value.topK ?? 1} onChange={(e) => set("topK", Number(e.target.value))}>
              {[1, 2, 3, 4].map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
        )}
        <Field label={t("frequency")} help={t("frequencyHelp")}>
          <select className={SELECT} value={value.frequency} onChange={(e) => set("frequency", Number(e.target.value))}>
            <option value={1}>{t("monthly")}</option>
            <option value={3}>{t("quarterly")}</option>
            <option value={12}>{t("yearly")}</option>
          </select>
        </Field>
        <Field label={t("execution")} help={t("executionHelp")}>
          <select className={SELECT} value={value.lag} onChange={(e) => set("lag", Number(e.target.value))}>
            <option value={0}>{t("atClose")}</option>
            <option value={1}>{t("nextMonth")}</option>
          </select>
        </Field>
        <Field label={t("stop")} help={t("stopHelp")}>
          <select className={SELECT} value={value.stop} onChange={(e) => set("stop", Number(e.target.value))}>
            <option value={0}>{t("noStop")}</option>
            <option value={0.1}>10 %</option>
            <option value={0.15}>15 %</option>
            <option value={0.2}>20 %</option>
            <option value={0.25}>25 %</option>
          </select>
        </Field>
        <Field label={t("leverage")} help={t("leverageHelp")}>
          <select className={SELECT} value={value.leverage} onChange={(e) => set("leverage", Number(e.target.value))}>
            <option value={1}>{t("none")}</option>
            <option value={1.25}>1,25×</option>
            <option value={1.5}>1,5×</option>
            <option value={2}>2×</option>
          </select>
        </Field>
        {value.leverage > 1 && (
          <Field label={t("borrow")} help={t("borrowHelp")}>
            <input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={value.borrowRate}
              onChange={(e) => set("borrowRate", Math.max(0, Number(e.target.value) || 0))}
              className={SELECT + " font-mono"}
            />
          </Field>
        )}
        <Field label={t("compared")} help={t("comparedHelp")}>
          <select className={SELECT} value={value.compared} onChange={(e) => set("compared", e.target.value as ExecutionSettings["compared"])}>
            <option value="none">{t("none")}</option>
            <option value="buyhold">{t("buyHold")}</option>
          </select>
        </Field>
        <Field label={t("benchmark")} help={t("benchmarkHelp")}>
          <select className={SELECT} value={value.benchmark} onChange={(e) => set("benchmark", e.target.value as ExecutionSettings["benchmark"])}>
            <option value="none">{t("none")}</option>
            <option value="SPY">{t("sp500")}</option>
            <option value="6040">{t("sixtyForty")}</option>
          </select>
        </Field>
      </div>
    </div>
  );
}
