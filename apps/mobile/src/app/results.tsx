import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Input, Label, Notice, Screen, Segmented } from "@/components/ui";
import { DrawdownChart, LineChart } from "@/components/charts";
import { Legend } from "@/components/PortfolioView";
import { listSaved, saveRun, type SeriesView } from "@/lib/backtest";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { money, num, pct } from "@/lib/format";
import { sharePdf } from "@/lib/pdf";
import { seriesColor } from "@/lib/series";
import { colors, font } from "@/theme";

type Tab = "summary" | "years" | "risk";

function Table({ series, rows }: { series: SeriesView[]; rows: { label: string; get: (s: SeriesView) => string; tone?: (s: SeriesView) => "down" | undefined }[] }) {
  const colW = series.length <= 2 ? undefined : 96;
  return (
    <ScrollView horizontal={series.length > 2} showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: "100%" }}>
        <View style={{ flexDirection: "row", paddingVertical: 6 }}>
          <Text style={[font.label, { flex: 1.3, minWidth: 110 }]}>Mesure</Text>
          {series.map((s, i) => (
            <Text key={i} style={[font.label, { flex: 1, width: colW, textAlign: "right", color: seriesColor(s, i) }]} numberOfLines={1}>{s.name}</Text>
          ))}
        </View>
        {rows.map((r) => (
          <View key={r.label} style={{ flexDirection: "row", paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={[font.small, { flex: 1.3, minWidth: 110, color: colors.text2 }]}>{r.label}</Text>
            {series.map((s, i) => (
              <Text key={i} style={[font.small, font.num, { flex: 1, width: colW, textAlign: "right", color: r.tone?.(s) === "down" ? colors.red : colors.text, fontWeight: i === 0 ? "600" : "400" }]}>{r.get(s)}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function Results() {
  const run = useStore((s) => s.lastRun);
  const portfolios = useStore((s) => s.portfolios);
  const { user, limits } = useAuth();
  const [tab, setTab] = useState<Tab>("summary");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!run) {
    return (
      <Screen back={{ label: "Backtest", onPress: () => router.back() }} title="Résultats">
        <Notice text="Aucun backtest pour l'instant." />
      </Screen>
    );
  }
  const ccy = run.settings.currency;
  const s0 = run.series[0];

  const save = async () => {
    if (!user) { router.push("/account"); return; }
    setSaving(true);
    setMsg(null);
    try {
      const count = (await listSaved(user.uid)).length;
      if (count >= limits.maxSaved) { router.push("/subscribe"); return; }
      await saveRun(user.uid, name.trim() || portfolios.map((p) => p.name).join(" vs "), run, portfolios);
      setSaved(true);
    } catch {
      setMsg("L'enregistrement a échoué. Vérifiez la connexion.");
    } finally {
      setSaving(false);
    }
  };

  const pdf = async () => {
    setPdfBusy(true);
    try {
      await sharePdf(run, name.trim() || portfolios.map((p) => p.name).join(" vs "));
    } catch {
      Alert.alert("PDF", "Le rapport n'a pas pu être créé.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <Screen back={{ label: "Paramètres", onPress: () => router.back() }} title="Résultats" subtitle={`${run.settings.startYear} - ${run.settings.endYear} · ${ccy === "EUR" ? "en euros" : "en dollars"} · dividendes réinvestis`}>
      <Segmented<Tab> options={[{ value: "summary", label: "Synthèse" }, { value: "years", label: "Années" }, { value: "risk", label: "Risque" }]} value={tab} onChange={setTab} />

      {tab === "summary" && (
        <>
          <LineChart series={run.series.map((s, i) => ({ values: s.values, color: seriesColor(s, i) }))} dates={s0.dates} format={(v) => money(v, ccy)} height={190} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8, marginBottom: 6 }}>
            {run.series.map((s, i) => <Legend key={i} color={seriesColor(s, i)} label={s.name} />)}
          </View>
          <Table
            series={run.series}
            rows={[
              { label: "Valeur finale", get: (s) => money(s.endBalance, ccy) },
              ...(run.settings.monthly > 0 ? [{ label: "Versements", get: (s: SeriesView) => money(run.settings.initial + s.contributions, ccy) }] : []),
              { label: "Rendement annuel", get: (s) => pct(s.cagr) },
              { label: "Volatilité", get: (s) => pct(s.volatility) },
              { label: "Sharpe", get: (s) => num(s.sharpe, 2) },
              { label: "Pire baisse", get: (s) => pct(-s.maxDrawdown), tone: () => "down" },
            ]}
          />
        </>
      )}

      {tab === "years" && (
        <Table
          series={run.series}
          rows={[...s0.years].reverse().map((y) => ({
            label: String(y),
            get: (s: SeriesView) => {
              const k = s.years.indexOf(y);
              return k >= 0 ? pct(s.annual[k], 1, true) : "-";
            },
            tone: (s: SeriesView) => {
              const k = s.years.indexOf(y);
              return k >= 0 && s.annual[k] < 0 ? "down" : undefined;
            },
          }))}
        />
      )}

      {tab === "risk" && (
        <>
          {run.series.filter((s) => !s.isBenchmark).map((s, i) => (
            <View key={i}>
              <Label>{`Baisse depuis le sommet · ${s.name}`}</Label>
              <DrawdownChart values={s.drawdowns.length ? s.drawdowns : [0]} height={70} />
            </View>
          ))}
          <Label>Mesures de risque</Label>
          <Table
            series={run.series}
            rows={[
              { label: "Volatilité", get: (s) => pct(s.volatility) },
              { label: "Pire baisse", get: (s) => pct(-s.maxDrawdown), tone: () => "down" },
              { label: "Meilleure année", get: (s) => pct(s.bestYear, 1, true) },
              { label: "Pire année", get: (s) => pct(s.worstYear, 1, true), tone: (s) => (s.worstYear < 0 ? "down" : undefined) },
              { label: "Sharpe", get: (s) => num(s.sharpe, 2) },
              { label: "Sortino", get: (s) => num(s.sortino, 2) },
            ]}
          />
        </>
      )}

      {run.warnings.length ? <Notice text={run.warnings.slice(0, 2).join("\n")} /> : null}

      <Label>Enregistrer</Label>
      {saved ? (
        <Notice text="Analyse enregistrée. Elle apparaît dans Portefeuilles et dans votre espace client sur quantrih.com." />
      ) : (
        <>
          <Input placeholder={portfolios.map((p) => p.name).join(" vs ")} value={name} onChangeText={setName} />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Button title={user ? "Enregistrer" : "Se connecter pour enregistrer"} onPress={save} loading={saving} style={{ flex: 1 }} />
            <Button title="PDF" onPress={pdf} loading={pdfBusy} style={{ width: 90 }} />
          </View>
        </>
      )}
      {msg ? <Notice text={msg} tone="error" /> : null}
      <Text style={[font.small, { color: colors.text4, marginTop: 14 }]}>Les performances passées ne préjugent pas des performances futures. Ceci n'est pas un conseil en investissement.</Text>
    </Screen>
  );
}
