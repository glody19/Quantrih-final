import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { LAZY_PORTFOLIOS } from "@shared/data/lazyPortfolios";
import { Button, Loading, Notice, Screen } from "@/components/ui";
import { PortfolioView, type PortfolioData } from "@/components/PortfolioView";
import { runPortfolios } from "@/lib/backtest";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { REBALANCE_FR, RISK_FR, TICKER_NAMES } from "@/lib/labels";
import { setState } from "@/lib/store";
import { colors, font } from "@/theme";

const YEARS = 20;

export default function PortfolioDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const lazy = LAZY_PORTFOLIOS.find((p) => p.id === id);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [title, setTitle] = useState(lazy?.name || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (lazy) {
          const end = new Date().getFullYear();
          const out = await runPortfolios(
            [{ name: lazy.name, holdings: lazy.holdings.map((h) => ({ symbol: h.ticker, weight: h.weight })) }],
            { startYear: end - YEARS, endYear: end, initial: 10000, monthly: 0, rebalance: "annually", currency: "EUR", benchmark: "" },
          );
          const v = out.series[0];
          if (live) setData({ ...v, initial: 10000, currency: "EUR" });
        } else if (id?.startsWith("saved:") && user) {
          const [, docId, idx] = id.split(":");
          const snap = await getDoc(doc(db, `users/${user.uid}/backtests`, docId));
          const p = (snap.data() as any)?.resultsSummary?.[Number(idx)];
          if (!p) throw new Error("missing");
          if (live) {
            setTitle(p.name || (snap.data() as any).name);
            setData({
              alloc: p.alloc || {},
              dates: p.curveDates || [],
              values: p.curve || [],
              years: p.annualYears || [],
              annual: (p.annualReturns || []).map((x: number) => x / 100),
              cagr: (p.cagr ?? 0) / 100,
              volatility: (p.stdev ?? 0) / 100,
              maxDrawdown: Math.abs(p.maxDrawdown ?? 0) / 100,
              initial: p.initialAmount,
            });
          }
        } else {
          throw new Error("unknown");
        }
      } catch {
        if (live) setError("Impossible de calculer ce portefeuille pour le moment. Vérifiez la connexion et réessayez.");
      }
    })();
    return () => { live = false; };
  }, [id, lazy, user]);

  const backtest = () => {
    const holdings = lazy
      ? lazy.holdings.map((h) => ({ symbol: h.ticker, label: TICKER_NAMES[h.ticker], weight: h.weight }))
      : Object.entries(data?.alloc || {}).map(([symbol, weight]) => ({ symbol, label: TICKER_NAMES[symbol], weight }));
    setState({ portfolios: [{ name: title || "Portefeuille", holdings }], active: 0 });
    router.push("/backtest");
  };

  return (
    <Screen
      back={{ label: "Portefeuilles", onPress: () => router.back() }}
      title={title}
      subtitle={lazy ? `${lazy.author} · ${RISK_FR[lazy.riskLevel] || lazy.riskLevel} · rééquilibrage ${(REBALANCE_FR[lazy.rebalance] || lazy.rebalance).toLowerCase()}` : undefined}
    >
      {error ? <Notice text={error} tone="error" /> : null}
      {!data && !error ? <Loading text={lazy ? `Backtest sur ${YEARS} ans en cours` : "Chargement"} /> : null}
      {data ? <PortfolioView data={data} /> : null}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
        <Button title="Personnaliser et backtester" onPress={backtest} style={{ flex: 1 }} />
      </View>
      {lazy ? <Text style={[font.small, { color: colors.text4, marginTop: 12 }]}>{`Calcul en euros sur ${YEARS} ans, dividendes réinvestis, rééquilibrage annuel. Les performances passées ne préjugent pas des performances futures.`}</Text> : null}
    </Screen>
  );
}
