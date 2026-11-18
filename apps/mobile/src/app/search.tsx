import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Input, Label, Loading, Notice, Row, Screen } from "@/components/ui";
import { searchSymbols, type SearchHit } from "@/lib/api";
import { setState } from "@/lib/store";
import { colors, font } from "@/theme";

/** Suggestions shown before typing: the building blocks most portfolios use. */
const SUGGESTED: SearchHit[] = [
  { symbol: "VWCE.DE", label: "Vanguard FTSE All-World (acc.)", exchange: "Xetra", type: "ETF" },
  { symbol: "IWDA.AS", label: "iShares Core MSCI World", exchange: "Amsterdam", type: "ETF" },
  { symbol: "CSPX.AS", label: "iShares Core S&P 500", exchange: "Amsterdam", type: "ETF" },
  { symbol: "EIMI.AS", label: "iShares Core MSCI EM IMI", exchange: "Amsterdam", type: "ETF" },
  { symbol: "AGGH.AS", label: "iShares Global Aggregate Bond (EUR hedged)", exchange: "Amsterdam", type: "ETF" },
  { symbol: "VT", label: "Vanguard Total World Stock", exchange: "NYSE Arca", type: "ETF" },
  { symbol: "BND", label: "Vanguard Total Bond Market", exchange: "Nasdaq", type: "ETF" },
  { symbol: "GLD", label: "SPDR Gold Shares", exchange: "NYSE Arca", type: "ETF" },
  { symbol: "TLT", label: "iShares 20+ Year Treasury Bond", exchange: "Nasdaq", type: "ETF" },
  { symbol: "BTC-USD", label: "Bitcoin", exchange: "Crypto", type: "Crypto" },
];

export default function Search() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const pick = mode === "pick";
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (!q.trim()) { setHits(null); return; }
    const id = ++seq.current;
    const t = setTimeout(async () => {
      setBusy(true);
      setError(false);
      try {
        const r = await searchSymbols(q);
        if (id === seq.current) setHits(r);
      } catch {
        if (id === seq.current) setError(true);
      } finally {
        if (id === seq.current) setBusy(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const choose = (h: SearchHit) => {
    if (pick) {
      setState((s) => ({
        portfolios: s.portfolios.map((p, i) => {
          if (i !== s.active || p.holdings.some((x) => x.symbol === h.symbol)) return p;
          const used = p.holdings.reduce((a, x) => a + x.weight, 0);
          return { ...p, holdings: [...p.holdings, { symbol: h.symbol, label: h.label, weight: Math.max(0, Math.round((100 - used) * 10) / 10) }] };
        }),
      }));
      router.back();
    } else {
      router.replace({ pathname: "/asset/[symbol]", params: { symbol: h.symbol, name: h.label } });
    }
  };

  const list = hits ?? SUGGESTED;
  return (
    <Screen back={{ label: "Fermer", onPress: () => router.back() }} title={pick ? "Ajouter un actif" : "Rechercher"}>
      <Input autoFocus value={q} onChangeText={setQ} placeholder="Nom, ticker ou ISIN" autoCapitalize="characters" autoCorrect={false} returnKeyType="search" />
      <Label>{hits ? "Résultats" : "Suggestions"}</Label>
      {busy && !hits ? <Loading /> : null}
      {error ? <Notice text="La recherche ne répond pas. Vérifiez la connexion." tone="error" /> : null}
      {hits?.length === 0 && !busy ? <Text style={font.small}>Aucun résultat.</Text> : null}
      {list.map((h) => (
        <Row
          key={h.symbol}
          title={h.symbol}
          subtitle={h.label}
          right={<View><Text style={[font.small, { color: colors.text4 }]}>{[h.type, h.exchange].filter(Boolean).join(" · ")}</Text></View>}
          onPress={() => choose(h)}
        />
      ))}
    </Screen>
  );
}
