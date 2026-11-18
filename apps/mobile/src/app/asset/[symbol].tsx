import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Kpi, KpiRow, Label, Loading, Notice, ProBadge, Screen, Segmented } from "@/components/ui";
import { Bars, Gauge, LineChart } from "@/components/charts";
import { fetchAssetQuote, fetchFinancials, fetchHistory, fetchRatios, type AssetQuote, type HistoryRange, type IncomeRow, type Ratios } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { setState } from "@/lib/store";
import { compact, num, pctRaw } from "@/lib/format";
import { colors, font } from "@/theme";

const RANGES: { value: HistoryRange; label: string }[] = [
  { value: "1mo", label: "1M" },
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1A" },
  { value: "5y", label: "5A" },
  { value: "max", label: "Max" },
];

const n = (r: Ratios | null, k: string) => (r && typeof r[k] === "number" ? (r[k] as number) : null);

export default function Asset() {
  const { symbol, name } = useLocalSearchParams<{ symbol: string; name?: string }>();
  const { limits } = useAuth();
  // Premium: key ratios and statements. Pro: everything, including analyst targets.
  const pro = limits.fundamentals !== "none";
  const full = limits.fundamentals === "full";
  const [q, setQ] = useState<AssetQuote | null>(null);
  const [range, setRange] = useState<HistoryRange>("1y");
  const [hist, setHist] = useState<{ date: string; close: number }[] | null>(null);
  const [ratios, setRatios] = useState<Ratios | null>(null);
  const [income, setIncome] = useState<IncomeRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    fetchAssetQuote(symbol).then((r) => live && setQ(r)).catch(() => live && setError(true));
    fetchRatios(symbol).then((r) => live && setRatios(r)).catch(() => {});
    return () => { live = false; };
  }, [symbol]);

  useEffect(() => {
    if (!pro) return;
    let live = true;
    fetchFinancials(symbol).then((r) => live && setIncome([...(r.income || [])].reverse())).catch(() => live && setIncome([]));
    return () => { live = false; };
  }, [symbol, pro]);

  useEffect(() => {
    let live = true;
    setHist(null);
    fetchHistory(symbol, range)
      .then((r) => live && setHist(r.filter((x) => Number.isFinite(x.close))))
      .catch(() => live && setHist([]));
    return () => { live = false; };
  }, [symbol, range]);

  const qq = q?.quote;
  const ccy = qq?.currency || (ratios?.currency as string) || "";
  const isEquity = !qq?.quoteType || qq.quoteType === "EQUITY";
  const lo = qq?.yearLow ?? n(ratios, "fiftyTwoWeekLow");
  const hi = qq?.yearHigh ?? n(ratios, "fiftyTwoWeekHigh");
  const pos = qq?.price != null && lo != null && hi != null && hi > lo ? (qq.price - lo) / (hi - lo) : null;
  const first = hist?.[0]?.close;
  const last = hist?.[hist.length - 1]?.close;
  const rangeChange = first && last ? (last / first - 1) * 100 : null;

  const addToBacktest = () => {
    setState((s) => ({
      portfolios: s.portfolios.map((p, i) => (i !== s.active || p.holdings.some((h) => h.symbol === symbol) ? p : { ...p, holdings: [...p.holdings, { symbol, label: qq?.name || name, weight: 0 }] })),
    }));
    router.push("/backtest");
  };

  return (
    <Screen
      back={{ label: "Retour", onPress: () => router.back() }}
      title={qq?.name || name || symbol}
      subtitle={[symbol, q?.profile?.sector, qq?.fullExchangeName].filter(Boolean).join(" · ")}
    >
      {error && !q ? <Notice text="Données indisponibles pour ce titre." tone="error" /> : null}
      {qq?.price != null ? (
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text style={[{ fontSize: 28, fontWeight: "600", color: colors.text, letterSpacing: -0.5 }, font.num]}>{num(qq.price, 2)} <Text style={{ fontSize: 15, color: colors.text4 }}>{ccy}</Text></Text>
          <Text style={[{ fontSize: 14, fontWeight: "600", color: (qq.changesPercentage || 0) >= 0 ? colors.green : colors.red }, font.num]}>{pctRaw(qq.changesPercentage)}</Text>
        </View>
      ) : !error ? <Loading /> : null}

      <View style={{ marginTop: 12 }}>
        {hist == null ? <View style={{ height: 190 }}><Loading /></View> : hist.length > 1 ? (
          <LineChart series={[{ values: hist.map((h) => h.close), color: colors.navy }]} dates={hist.map((h) => h.date.slice(0, 10))} format={(v) => num(v, 2)} height={170} />
        ) : <Notice text="Historique indisponible." />}
      </View>
      <View style={{ marginTop: 10 }}>
        <Segmented options={RANGES} value={range} onChange={setRange} />
      </View>
      {rangeChange != null ? <Text style={[font.small, { marginTop: -4 }]}>{`Sur la période : ${pctRaw(rangeChange)}`}</Text> : null}

      {pos != null ? (
        <>
          <Label>Fourchette sur 52 semaines</Label>
          <Gauge value={pos} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
            <Text style={[font.small, font.num]}>{num(lo, 2)}</Text>
            <Text style={[font.small, font.num]}>{num(hi, 2)}</Text>
          </View>
        </>
      ) : null}

      {isEquity ? (
        <>
          <Label>Chiffres clés</Label>
          <KpiRow>
            <Kpi label="PER" value={num(n(ratios, "priceEarningsRatioTTM") ?? qq?.pe ?? null, 1)} />
            <Kpi label="Capitalisation" value={compact(n(ratios, "marketCapTTM") ?? qq?.marketCap ?? null)} />
            <Kpi label="Rend. div." value={pctRaw(n(ratios, "dividendYieldTTM"), 2, false)} />
          </KpiRow>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
            <Text style={font.h2}>Analyse fondamentale</Text>
            <ProBadge label="PREMIUM" />
          </View>

          {!pro ? (
            <Card style={{ marginTop: 10 }}>
              <Text style={[font.small, { lineHeight: 18 }]}>Marges, rentabilité, dette, croissance et 5 ans de chiffre d'affaires et de bénéfices sont inclus dans Premium et Pro.</Text>
              <Button title="Voir les formules" onPress={() => router.push("/subscribe")} style={{ marginTop: 12 }} />
            </Card>
          ) : (
            <>
              <KpiRow>
                <Kpi label="Marge nette" value={pctRaw(n(ratios, "netProfitMarginTTM"), 1, false)} />
                <Kpi label="Marge opé." value={pctRaw(n(ratios, "operatingProfitMarginTTM"), 1, false)} />
                <Kpi label="ROE" value={pctRaw(n(ratios, "returnOnEquityTTM"), 1, false)} />
              </KpiRow>
              <KpiRow>
                <Kpi label="Croissance CA" value={pctRaw(n(ratios, "revenueGrowth"), 1)} tone={(n(ratios, "revenueGrowth") ?? 0) < 0 ? "down" : undefined} />
                <Kpi label="Dette / FP" value={num(n(ratios, "debtEquityRatioTTM") != null ? (n(ratios, "debtEquityRatioTTM") as number) / 100 : null, 2)} />
                <Kpi label="PER futur" value={num(n(ratios, "priceToEarningsRatioForward"), 1)} />
              </KpiRow>

              {income == null ? <Loading /> : income.length ? (
                <>
                  <Label>{`Chiffre d'affaires (${ccy || "devise"})`}</Label>
                  <Bars values={income.map((r) => r.revenue ?? 0)} labels={income.map((r) => r.calendarYear)} format={(v) => compact(v)} />
                  <Label>Bénéfice net</Label>
                  <Bars values={income.map((r) => r.netIncome ?? 0)} labels={income.map((r) => r.calendarYear)} format={(v) => compact(v)} />
                </>
              ) : <Notice text="Comptes annuels indisponibles pour ce titre." />}

              {full && n(ratios, "targetMeanPrice") != null ? (
                <>
                  <Label>Objectif moyen des analystes</Label>
                  <Text style={[font.body, font.num]}>
                    {`${num(n(ratios, "targetMeanPrice"), 2)} ${ccy}`}
                    <Text style={{ color: colors.text4 }}>{` · ${n(ratios, "numberOfAnalystOpinions") ?? "-"} analystes`}</Text>
                  </Text>
                </>
              ) : null}
            </>
          )}
        </>
      ) : null}

      {q?.profile?.description ? (
        <>
          <Label>Activité</Label>
          <Text style={[font.small, { lineHeight: 19, color: colors.text2 }]} numberOfLines={8}>{q.profile.description}</Text>
        </>
      ) : null}

      <Pressable onPress={addToBacktest} style={{ marginTop: 22 }}>
        <Text style={{ color: colors.navy, fontWeight: "600", fontSize: 14 }}>+ Ajouter au backtest</Text>
      </Pressable>
    </Screen>
  );
}
