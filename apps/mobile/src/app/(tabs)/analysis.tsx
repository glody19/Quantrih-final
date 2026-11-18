import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Card, Label, ProBadge, Row, Screen } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { colors, font } from "@/theme";

const POPULAR = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "ASML.AS", name: "ASML Holding" },
  { symbol: "MC.PA", name: "LVMH" },
  { symbol: "AIR.PA", name: "Airbus" },
  { symbol: "ABI.BR", name: "AB InBev" },
  { symbol: "SAP.DE", name: "SAP" },
  { symbol: "NOVO-B.CO", name: "Novo Nordisk" },
  { symbol: "TTE.PA", name: "TotalEnergies" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
];

/** Analyse: fundamental analysis of a company. Price and key figures for everyone, full statements with Pro. */
export default function Analysis() {
  const { plan } = useAuth();
  return (
    <Screen title="Analyse" subtitle="Analyse fondamentale des sociétés cotées">
      <Pressable onPress={() => router.push("/search")} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 10, paddingHorizontal: 12 }} accessibilityRole="search">
        <Text style={[font.small, { color: colors.text4 }]}>⌕  Rechercher une société</Text>
      </Pressable>

      {plan !== "pro" ? (
        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>Analyse fondamentale complète</Text>
            <ProBadge />
          </View>
          <Text style={[font.small, { marginTop: 6, lineHeight: 18 }]}>Valorisation, marges, croissance, dette, flux de trésorerie et 5 ans de comptes. Le cours et les chiffres clés restent gratuits.</Text>
          <Pressable onPress={() => router.push("/subscribe")} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.navy, fontWeight: "600" }}>Voir la formule Pro</Text>
          </Pressable>
        </Card>
      ) : null}

      <Label>Sociétés suivies</Label>
      {POPULAR.map((c) => (
        <Row key={c.symbol} title={c.name} subtitle={c.symbol} onPress={() => router.push({ pathname: "/asset/[symbol]", params: { symbol: c.symbol, name: c.name } })} right={<Text style={{ color: colors.text4, fontSize: 18 }}>›</Text>} />
      ))}
    </Screen>
  );
}
