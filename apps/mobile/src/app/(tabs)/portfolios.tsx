import React, { useCallback, useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LAZY_PORTFOLIOS } from "@shared/data/lazyPortfolios";
import { Button, Label, Loading, Notice, Row, Screen, Segmented } from "@/components/ui";
import { Donut, Sparkline } from "@/components/charts";
import { useAuth } from "@/lib/auth";
import { listSaved, type SavedItem } from "@/lib/backtest";
import { RISK_FR } from "@/lib/labels";
import { pctRaw } from "@/lib/format";
import { allocationPalette, colors, font } from "@/theme";

type Tab = "models" | "mine";

export default function Portfolios() {
  const [tab, setTab] = useState<Tab>("models");
  const { user } = useAuth();
  const [saved, setSaved] = useState<SavedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setSaved([]); return; }
    setError(null);
    try {
      setSaved(await listSaved(user.uid));
    } catch {
      setError("Impossible de charger vos analyses. Vérifiez la connexion.");
      setSaved([]);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { if (tab === "mine") load(); }, [tab, load]));

  return (
    <Screen
      title="Portefeuilles"
      subtitle={tab === "models" ? "Portefeuilles modèles reconnus, à backtester en un geste" : "Vos analyses, synchronisées avec quantrih.com"}
      refreshControl={tab === "mine" ? <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.navy} /> : undefined}
    >
      <Segmented options={[{ value: "models", label: "Modèles" }, { value: "mine", label: "Mes analyses" }]} value={tab} onChange={setTab} />

      {tab === "models" &&
        LAZY_PORTFOLIOS.map((p) => (
          <Row
            key={p.id}
            title={p.name}
            subtitle={`${p.author} · ${p.holdings.length} actif${p.holdings.length > 1 ? "s" : ""}`}
            left={<Donut values={p.holdings.map((h) => h.weight)} palette={allocationPalette} size={34} stroke={6} />}
            right={<Text style={[font.small, { color: colors.text3 }]}>{RISK_FR[p.riskLevel] || p.riskLevel}</Text>}
            onPress={() => router.push({ pathname: "/portfolio/[id]", params: { id: p.id } })}
          />
        ))}

      {tab === "mine" && !user && (
        <View style={{ marginTop: 8 }}>
          <Notice text="Connectez-vous pour retrouver ici les analyses enregistrées sur le site et dans l'application." />
          <Button title="Se connecter" variant="primary" style={{ marginTop: 12 }} onPress={() => router.push("/account")} />
        </View>
      )}
      {tab === "mine" && user && saved == null && <Loading />}
      {tab === "mine" && error ? <Notice text={error} tone="error" /> : null}
      {tab === "mine" && user && saved?.length === 0 && !error && (
        <View style={{ marginTop: 8 }}>
          <Notice text="Aucune analyse enregistrée pour l'instant. Lancez un backtest puis touchez Enregistrer." />
          <Button title="Nouveau backtest" style={{ marginTop: 12 }} onPress={() => router.push("/backtest")} />
        </View>
      )}
      {tab === "mine" &&
        saved?.map((a) => (
          <View key={a.id}>
            <Label>{`${a.name}${a.startYear ? ` · ${a.startYear} - ${a.endYear}` : ""}`}</Label>
            {(a.resultsSummary || []).map((p, i) => (
              <Row
                key={i}
                title={p.name || `Portefeuille ${i + 1}`}
                subtitle={p.alloc ? Object.keys(p.alloc).slice(0, 4).join(" · ") : undefined}
                left={p.alloc ? <Donut values={Object.values(p.alloc)} palette={allocationPalette} size={34} stroke={6} /> : undefined}
                right={
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {p.curve?.length ? <Sparkline values={p.curve} /> : null}
                    <Text style={[{ fontSize: 14, fontWeight: "600", minWidth: 58, textAlign: "right" }, font.num]}>{pctRaw(p.cagr, 1, false)}</Text>
                  </View>
                }
                onPress={() => router.push({ pathname: "/portfolio/[id]", params: { id: `saved:${a.id}:${i}` } })}
              />
            ))}
          </View>
        ))}
    </Screen>
  );
}
