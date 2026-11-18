import React, { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { deleteUser } from "firebase/auth";
import { Button, Card, Input, Label, Notice, Row, Screen, Segmented } from "@/components/ui";
import { authErrorMessage, useAuth } from "@/lib/auth";
import { PLAN_NAMES } from "@shared/lib/planLimits";
import { colors, font } from "@/theme";

type Mode = "signin" | "signup";

function SignIn() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone?: "error" } | null>(null);

  const submit = async () => {
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(name, email, password);
    } catch (e) {
      setMsg({ text: authErrorMessage(e), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) { setMsg({ text: "Indiquez votre e-mail puis touchez à nouveau Mot de passe oublié.", tone: "error" }); return; }
    try {
      await resetPassword(email);
      setMsg({ text: "Un e-mail de réinitialisation vient d'être envoyé." });
    } catch (e) {
      setMsg({ text: authErrorMessage(e), tone: "error" });
    }
  };

  return (
    <View>
      <Text style={[font.body, { color: colors.text3, lineHeight: 20, marginBottom: 14 }]}>Le même compte que sur quantrih.com : vos analyses et votre formule vous suivent.</Text>
      <Segmented<Mode> options={[{ value: "signin", label: "Se connecter" }, { value: "signup", label: "Créer un compte" }]} value={mode} onChange={setMode} />
      <View style={{ gap: 10 }}>
        {mode === "signup" ? <Input placeholder="Prénom et nom" value={name} onChangeText={setName} textContentType="name" autoComplete="name" /> : null}
        <Input placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" autoComplete="email" />
        <Input placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry textContentType={mode === "signin" ? "password" : "newPassword"} autoComplete={mode === "signin" ? "current-password" : "new-password"} onSubmitEditing={submit} />
      </View>
      {msg ? <Notice text={msg.text} tone={msg.tone} /> : null}
      <Button title={mode === "signin" ? "Se connecter" : "Créer mon compte"} variant="primary" onPress={submit} loading={busy} disabled={!email || !password} style={{ marginTop: 14 }} />
      {mode === "signin" ? (
        <Pressable onPress={reset} style={{ alignSelf: "center", marginTop: 14 }}>
          <Text style={[font.small, { color: colors.text3 }]}>Mot de passe oublié</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Account() {
  const { user, loading, plan, isAdmin, signOut } = useAuth();

  const removeAccount = () =>
    Alert.alert("Supprimer le compte", "Votre compte et vos analyses enregistrées seront supprimés. Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            if (user) await deleteUser(user);
          } catch (e: any) {
            Alert.alert("Supprimer le compte", String(e?.code || "").includes("requires-recent-login") ? "Par sécurité, déconnectez-vous puis reconnectez-vous avant de supprimer le compte." : "La suppression a échoué.");
          }
        },
      },
    ]);

  return (
    <Screen title="Compte" subtitle={user ? user.email || undefined : "Connexion"}>
      {loading ? null : !user ? (
        <SignIn />
      ) : (
        <>
          <Card>
            <Text style={font.label}>Formule</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <Text style={{ fontSize: 22, fontWeight: "600", color: colors.text }}>{PLAN_NAMES[plan]}{isAdmin ? <Text style={[font.small, { color: colors.text4 }]}>  · administrateur</Text> : null}</Text>
              <Pressable onPress={() => router.push("/subscribe")}><Text style={{ color: colors.navy, fontWeight: "600" }}>{plan === "pro" ? "Gérer" : "Changer"}</Text></Pressable>
            </View>
          </Card>

          <Label>Mon compte</Label>
          <Row title={user.displayName || "Profil"} subtitle={user.email || undefined} />
          <Row title="Mes analyses" subtitle="Backtests enregistrés sur le site et l'application" onPress={() => router.push("/portfolios")} right={<Text style={{ color: colors.text4, fontSize: 18 }}>›</Text>} />
          <Row title="Ouvrir quantrih.com" subtitle="Optimisation, Monte Carlo, allocation tactique" onPress={() => Linking.openURL("https://quantrih.com")} right={<Text style={{ color: colors.text4, fontSize: 18 }}>›</Text>} />

          <Label>Informations</Label>
          <Row title="Confidentialité" onPress={() => Linking.openURL("https://quantrih.com/privacy")} right={<Text style={{ color: colors.text4, fontSize: 18 }}>›</Text>} />
          <Row title="Nous contacter" subtitle="contact@quantrih.com" onPress={() => Linking.openURL("mailto:contact@quantrih.com")} right={<Text style={{ color: colors.text4, fontSize: 18 }}>›</Text>} />

          <Button title="Se déconnecter" onPress={signOut} style={{ marginTop: 22 }} />
          <Pressable onPress={removeAccount} style={{ alignSelf: "center", marginTop: 16 }}>
            <Text style={[font.small, { color: colors.red }]}>Supprimer mon compte</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}
