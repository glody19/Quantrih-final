import React, { useEffect, useState } from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Notice, Screen, Segmented } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { buy, identify, loadPackages, purchasesEnabled, restore, type StorePackages } from "@/lib/purchases";
import { PLAN_NAMES, PLAN_PRICES, type PlanId } from "@shared/lib/planLimits";
import { colors, font, radius } from "@/theme";

const FEATURES: Record<PlanId, string[]> = {
  free: ["3 portefeuilles par backtest", "20 ans d'historique", "5 analyses enregistrées", "1 rapport PDF par mois"],
  premium: ["6 portefeuilles, historique complet", "100 analyses, 10 PDF par mois à votre logo", "Notes, export CSV, comparaison de 4"],
  pro: ["10 portefeuilles, tout illimité", "Analyse fondamentale des sociétés", "PDF en marque blanche, comparaison de 8"],
};

type Period = "monthly" | "yearly";

export default function Subscribe() {
  const { user, plan, refreshPlan } = useAuth();
  const [period, setPeriod] = useState<Period>("monthly");
  const [choice, setChoice] = useState<PlanId>(plan === "free" ? "premium" : plan);
  const [pkgs, setPkgs] = useState<StorePackages | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone?: "error" } | null>(null);

  useEffect(() => {
    if (!purchasesEnabled) return;
    identify(user?.uid ?? null).then(loadPackages).then(setPkgs).catch(() => setPkgs(null));
  }, [user]);

  const priceOf = (p: PlanId) => {
    const pkg = p === "free" ? undefined : pkgs?.[period][p];
    if (pkg) return pkg.product.priceString;
    const v = period === "monthly" ? PLAN_PRICES[p].monthly : PLAN_PRICES[p].yearly;
    return `${v} €`;
  };

  const go = async () => {
    setMsg(null);
    if (choice === "free" || choice === plan) { router.back(); return; }
    if (!user) { router.replace("/account"); return; }
    const pkg = pkgs?.[period][choice];
    if (!purchasesEnabled || !pkg) {
      // Store billing not configured yet: subscribe on the website, the plan follows the account.
      Linking.openURL("https://quantrih.com/pricing");
      return;
    }
    setBusy(true);
    try {
      if (await buy(pkg)) {
        // The webhook writes the plan within seconds; read it again.
        setTimeout(refreshPlan, 4000);
        setMsg({ text: `Merci ! Votre formule ${PLAN_NAMES[choice]} est activée.` });
      }
    } catch {
      setMsg({ text: "Le paiement n'a pas abouti. Aucun montant n'a été prélevé.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen back={{ label: "Fermer", onPress: () => router.back() }} title="Abonnement" subtitle="Sans engagement, résiliable à tout moment">
      <Segmented<Period> options={[{ value: "monthly", label: "Mensuel" }, { value: "yearly", label: "Annuel · 2 mois offerts" }]} value={period} onChange={setPeriod} />
      {(["free", "premium", "pro"] as PlanId[]).map((p) => {
        const sel = choice === p;
        return (
          <Pressable key={p} onPress={() => setChoice(p)} style={{ borderWidth: sel ? 1.5 : 1, borderColor: sel ? colors.text : colors.border, borderRadius: radius.lg, padding: 14, marginBottom: 10 }} accessibilityRole="radio" accessibilityState={{ selected: sel }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                {PLAN_NAMES[p]}{plan === p ? <Text style={[font.small, { color: colors.text4, fontWeight: "400" }]}>  · formule actuelle</Text> : null}
              </Text>
              <Text style={[{ fontSize: 20, fontWeight: "600", color: colors.text }, font.num]}>
                {priceOf(p)}<Text style={[font.small, { color: colors.text4 }]}>{p === "free" ? "" : period === "monthly" ? " /mois" : " /an"}</Text>
              </Text>
            </View>
            {FEATURES[p].map((f) => <Text key={f} style={[font.small, { marginTop: 4 }]}>·  {f}</Text>)}
          </Pressable>
        );
      })}
      {msg ? <Notice text={msg.text} tone={msg.tone} /> : null}
      <Button
        title={choice === plan ? "Garder ma formule" : choice === "free" ? "Rester en Freemium" : `Continuer avec ${PLAN_NAMES[choice]}`}
        variant="primary"
        onPress={go}
        loading={busy}
        style={{ marginTop: 6 }}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 18, marginTop: 14 }}>
        {purchasesEnabled ? (
          <Pressable onPress={() => restore().then(refreshPlan).then(() => setMsg({ text: "Achats restaurés." })).catch(() => setMsg({ text: "Aucun achat à restaurer.", tone: "error" }))}>
            <Text style={[font.small, { color: colors.text3 }]}>Restaurer un achat</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => Linking.openURL("https://quantrih.com/privacy")}><Text style={[font.small, { color: colors.text3 }]}>Confidentialité</Text></Pressable>
        <Pressable onPress={() => Linking.openURL(Platform.OS === "ios" ? "https://apps.apple.com/account/subscriptions" : "https://play.google.com/store/account/subscriptions")}>
          <Text style={[font.small, { color: colors.text3 }]}>Gérer / résilier</Text>
        </Pressable>
      </View>
      <Text style={[font.small, { color: colors.text4, marginTop: 14, lineHeight: 18 }]}>
        Un abonnement pris sur quantrih.com est reconnu dans l'application avec le même compte. L'abonnement se renouvelle automatiquement sauf résiliation au moins 24 h avant la fin de la période.
      </Text>
    </Screen>
  );
}
