import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Field, Input, Label, Notice, Screen, Segmented } from "@/components/ui";
import { BENCHMARKS, REBALANCE_LABELS, runPortfolios, type Rebalance } from "@/lib/backtest";
import { useAuth } from "@/lib/auth";
import { getState, setState, useStore } from "@/lib/store";
import { colors, font, radius } from "@/theme";
import { PLAN_NAMES } from "@shared/lib/planLimits";

const FIRST_YEAR = 1995;

function Stepper({ value, onChange, min, max, step = 1, suffix = "" }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string }) {
  const btn = (label: string, d: number) => (
    <Pressable onPress={() => onChange(Math.max(min, Math.min(max, value + d)))} hitSlop={8} style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border2, alignItems: "center", justifyContent: "center" }} accessibilityLabel={label}>
      <Text style={{ fontSize: 16, color: colors.text }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {btn("−", -step)}
      <Text style={[{ fontSize: 15, fontWeight: "600", minWidth: 50, textAlign: "center" }, font.num]}>{value}{suffix}</Text>
      {btn("+", step)}
    </View>
  );
}

export default function Backtest() {
  const { limits, plan } = useAuth();
  const portfolios = useStore((s) => s.portfolios);
  const active = useStore((s) => s.active);
  const settings = useStore((s) => s.settings);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const thisYear = new Date().getFullYear();
  const minStart = Number.isFinite(limits.maxYears) ? thisYear - limits.maxYears : FIRST_YEAR;
  const p = portfolios[active] || portfolios[0];
  const total = p.holdings.reduce((a, h) => a + (Number(h.weight) || 0), 0);
  const allOk = portfolios.every((x) => Math.abs(x.holdings.reduce((a, h) => a + (Number(h.weight) || 0), 0) - 100) < 0.01 && x.holdings.length > 0);

  const updateHoldings = (fn: (h: typeof p.holdings) => typeof p.holdings) =>
    setState((s) => ({ portfolios: s.portfolios.map((x, i) => (i === s.active ? { ...x, holdings: fn(x.holdings) } : x)) }));
  const setSettings = (patch: Partial<typeof settings>) => setState((s) => ({ settings: { ...s.settings, ...patch } }));

  const addPortfolio = () => {
    if (portfolios.length >= limits.maxPortfolios) {
      router.push("/subscribe");
      return;
    }
    setState((s) => ({ portfolios: [...s.portfolios, { name: `Portefeuille ${s.portfolios.length + 1}`, holdings: [] }], active: s.portfolios.length }));
  };

  const removePortfolio = () =>
    setState((s) => (s.portfolios.length <= 1 ? {} : { portfolios: s.portfolios.filter((_, i) => i !== s.active), active: 0 }));

  const run = async () => {
    setError(null);
    setRunning(true);
    try {
      const st = getState();
      const start = Math.max(st.settings.startYear, minStart);
      const out = await runPortfolios(st.portfolios, { ...st.settings, startYear: start });
      setState({ lastRun: out });
      router.push("/results");
    } catch (e: any) {
      setError(e?.message?.startsWith("Aucune") ? e.message : "Le backtest n'a pas pu être calculé. Vérifiez la connexion et les tickers.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Screen title="Backtest" subtitle={`Portefeuille ${active + 1} sur ${limits.maxPortfolios} · ${PLAN_NAMES[plan]}`}>
      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
        {portfolios.map((x, i) => (
          <Pressable key={i} onPress={() => setState({ active: i })} style={[chip, i === active && { borderColor: colors.text }]}>
            <Text style={[font.small, i === active && { color: colors.text, fontWeight: "600" }]} numberOfLines={1}>{x.name}</Text>
          </Pressable>
        ))}
        <Pressable onPress={addPortfolio} style={chip} accessibilityLabel="Ajouter un portefeuille">
          <Text style={[font.small, { color: colors.navy, fontWeight: "600" }]}>+ Comparer</Text>
        </Pressable>
      </View>

      <Label>Nom</Label>
      <Input value={p.name} onChangeText={(t) => setState((s) => ({ portfolios: s.portfolios.map((x, i) => (i === s.active ? { ...x, name: t } : x)) }))} />

      <Label>Actifs</Label>
      {p.holdings.length === 0 ? <Text style={[font.small, { marginBottom: 6 }]}>Ajoutez au moins un actif.</Text> : null}
      {p.holdings.map((h, idx) => (
        <View key={`${h.symbol}-${idx}`} style={{ paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{h.symbol}</Text>
              {h.label ? <Text style={[font.small, { color: colors.text4 }]} numberOfLines={1}>{h.label}</Text> : null}
            </View>
            <Input
              value={String(h.weight)}
              keyboardType="decimal-pad"
              onChangeText={(t) => updateHoldings((hs) => hs.map((x, i) => (i === idx ? { ...x, weight: Math.max(0, Math.min(100, parseFloat(t.replace(",", ".")) || 0)) } : x)))}
              style={{ width: 66, textAlign: "right", paddingVertical: 7 }}
              accessibilityLabel={`Poids de ${h.symbol}`}
            />
            <Text style={font.small}>%</Text>
            <Pressable onPress={() => updateHoldings((hs) => hs.filter((_, i) => i !== idx))} hitSlop={10} accessibilityLabel={`Retirer ${h.symbol}`}>
              <Text style={{ fontSize: 18, color: colors.text4, paddingHorizontal: 4 }}>×</Text>
            </Pressable>
          </View>
          <View style={{ height: 3, backgroundColor: colors.surface, borderRadius: 2, marginTop: 7, overflow: "hidden" }}>
            <View style={{ width: `${Math.min(100, h.weight)}%`, height: "100%", backgroundColor: colors.navy }} />
          </View>
        </View>
      ))}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10 }}>
        <Pressable onPress={() => router.push({ pathname: "/search", params: { mode: "pick" } })} hitSlop={8}>
          <Text style={{ color: colors.navy, fontWeight: "600", fontSize: 14 }}>+ Ajouter un actif</Text>
        </Pressable>
        <Text style={[font.small, font.num, { fontWeight: "600", color: Math.abs(total - 100) < 0.01 ? colors.green : colors.red }]}>
          Total {String(Math.round(total * 10) / 10).replace(".", ",")} %{Math.abs(total - 100) < 0.01 ? " ✓" : ""}
        </Text>
      </View>
      {portfolios.length > 1 ? (
        <Pressable onPress={removePortfolio} style={{ marginTop: 10 }} hitSlop={8}>
          <Text style={[font.small, { color: colors.text4 }]}>Supprimer ce portefeuille</Text>
        </Pressable>
      ) : null}

      <Label>Paramètres</Label>
      <Field label="Année de début">
        <Stepper value={Math.max(settings.startYear, minStart)} min={minStart} max={thisYear - 1} onChange={(v) => setSettings({ startYear: v })} />
      </Field>
      {Number.isFinite(limits.maxYears) ? (
        <Pressable onPress={() => router.push("/subscribe")}>
          <Text style={[font.small, { color: colors.text4, marginTop: -2, marginBottom: 8 }]}>{`Freemium : ${limits.maxYears} ans d'historique. Historique complet avec Premium.`}</Text>
        </Pressable>
      ) : null}
      <Field label="Montant initial (€)">
        <Input value={String(settings.initial)} keyboardType="number-pad" onChangeText={(t) => setSettings({ initial: Math.max(0, parseInt(t.replace(/\D/g, ""), 10) || 0) })} style={{ width: 120, textAlign: "right", paddingVertical: 6 }} />
      </Field>
      <Field label="Versement mensuel (€)">
        <Input value={String(settings.monthly)} keyboardType="number-pad" onChangeText={(t) => setSettings({ monthly: Math.max(0, parseInt(t.replace(/\D/g, ""), 10) || 0) })} style={{ width: 120, textAlign: "right", paddingVertical: 6 }} />
      </Field>
      <Text style={[font.small, { color: colors.text4, marginTop: 4, marginBottom: 6 }]}>Rééquilibrage</Text>
      <Segmented<Rebalance> options={(["none", "monthly", "quarterly", "annually"] as Rebalance[]).map((v) => ({ value: v, label: REBALANCE_LABELS[v] }))} value={settings.rebalance} onChange={(v) => setSettings({ rebalance: v })} />
      <Text style={[font.small, { color: colors.text4, marginBottom: 6 }]}>Devise des résultats</Text>
      <Segmented<"EUR" | "USD"> options={[{ value: "EUR", label: "Euro" }, { value: "USD", label: "Dollar US" }]} value={settings.currency} onChange={(v) => setSettings({ currency: v })} />
      <Text style={[font.small, { color: colors.text4, marginBottom: 6 }]}>Indice de référence</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {BENCHMARKS.map((b) => (
          <Pressable key={b.symbol || "none"} onPress={() => setSettings({ benchmark: b.symbol })} style={[chip, settings.benchmark === b.symbol && { borderColor: colors.text }]}>
            <Text style={[font.small, settings.benchmark === b.symbol && { color: colors.text, fontWeight: "600" }]}>{b.label}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Notice text={error} tone="error" /> : null}
      <Button title={running ? "Calcul en cours" : "Lancer le backtest"} variant="primary" onPress={run} loading={running} disabled={!allOk} style={{ marginTop: 20 }} />
      {!allOk ? <Text style={[font.small, { color: colors.text4, marginTop: 8, textAlign: "center" }]}>Chaque portefeuille doit totaliser 100 %.</Text> : null}
    </Screen>
  );
}

const chip = { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingVertical: 6, paddingHorizontal: 11, maxWidth: 160 } as const;
