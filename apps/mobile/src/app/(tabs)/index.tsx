import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";
import { router } from "expo-router";
import { ChangePill, Label, Notice, Row, Screen, Segmented, Loading } from "@/components/ui";
import { fetchQuotes, type Quote } from "@/lib/api";
import { MARKETS, MARKET_TABS, type MarketTab } from "@/lib/markets";
import { num, timeHHMM } from "@/lib/format";
import { colors, font } from "@/theme";

/** Marchés: one list per tab, 20 lines max, one colour for the change, update time always visible. */
export default function Markets() {
  const [tab, setTab] = useState<MarketTab>("indices");
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [updated, setUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (t: MarketTab, pull = false) => {
    pull ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const list = await fetchQuotes(MARKETS[t].map((m) => m.symbol));
      const map: Record<string, Quote> = {};
      list.forEach((q) => (map[q.symbol] = q));
      setQuotes((prev) => ({ ...prev, ...map }));
      setUpdated(new Date());
    } catch {
      setError("Cours indisponibles pour le moment. Tirez vers le bas pour réessayer.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const items = MARKETS[tab].slice(0, 20);
  return (
    <Screen
      title="Marchés"
      subtitle={updated ? `Mis à jour à ${timeHHMM(updated)}` : "Chargement des cours"}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(tab, true)} tintColor={colors.navy} />}
    >
      <Pressable onPress={() => router.push("/search")} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12 }} accessibilityRole="search">
        <Text style={[font.small, { color: colors.text4 }]}>⌕  Rechercher une action, un ETF, un ticker</Text>
      </Pressable>
      <Segmented options={MARKET_TABS} value={tab} onChange={setTab} />
      <Label style={{ marginTop: 0 }}>{`Top ${items.length} · ${MARKET_TABS.find((t) => t.value === tab)?.label}`}</Label>
      {error ? <Notice text={error} tone="error" /> : null}
      {loading && !Object.keys(quotes).length ? <Loading /> : null}
      {items.map((m) => {
        const q = quotes[m.symbol];
        return (
          <Row
            key={m.symbol}
            title={m.name}
            subtitle={m.code || m.symbol}
            onPress={() => router.push({ pathname: "/asset/[symbol]", params: { symbol: m.symbol, name: m.name } })}
            right={
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={[{ fontSize: 14, fontWeight: "600", color: colors.text, minWidth: 74, textAlign: "right" }, font.num]}>
                  {q?.regularMarketPrice != null ? num(q.regularMarketPrice, tab === "fx" ? 4 : 2) : "-"}
                </Text>
                <ChangePill value={q?.regularMarketChangePercent} />
              </View>
            }
          />
        );
      })}
    </Screen>
  );
}
