import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ScrollViewProps, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, font, radius, space } from "@/theme";

/** Page with a large title, white background and the standard side gutter. */
export function Screen({ title, subtitle, back, right, children, scroll = true, ...rest }: {
  title?: string;
  subtitle?: string;
  back?: { label: string; onPress: () => void };
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
} & ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const head = (
    <View style={{ paddingTop: insets.top + 6, paddingHorizontal: space.lg, paddingBottom: space.sm }}>
      {back ? (
        <Pressable onPress={back.onPress} hitSlop={10} accessibilityRole="button">
          <Text style={[font.small, { color: colors.text4, marginBottom: 2 }]}>‹ {back.label}</Text>
        </Pressable>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {title ? <Text style={font.title} numberOfLines={1}>{title}</Text> : <View />}
        {right}
      </View>
      {subtitle ? <Text style={[font.small, { color: colors.text4, marginTop: 2 }]}>{subtitle}</Text> : null}
    </View>
  );
  if (!scroll) return <View style={styles.page}>{head}<View style={{ flex: 1, paddingHorizontal: space.lg }}>{children}</View></View>;
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" {...rest}>
        {head}
        <View style={{ paddingHorizontal: space.lg }}>{children}</View>
      </ScrollView>
    </View>
  );
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ marginTop: space.lg, marginBottom: 6 }, style]}><Text style={font.label}>{children}</Text></View>;
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.segItem, on && styles.segOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[font.small, on ? { color: colors.text, fontWeight: "600" } : null]} numberOfLines={1}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Sober button: black fill for the main action, outline otherwise. Never a coloured block. */
export function Button({ title, onPress, variant = "outline", disabled, loading, style }: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        primary && { backgroundColor: colors.text, borderColor: colors.text },
        variant === "ghost" && { borderColor: "transparent" },
        (disabled || pressed) && { opacity: disabled ? 0.4 : 0.75 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={primary ? "#fff" : colors.text} /> : <Text style={{ fontSize: 14, fontWeight: "600", color: primary ? "#fff" : colors.text }}>{title}</Text>}
    </Pressable>
  );
}

export function Kpi({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <View style={styles.kpi}>
      <Text style={[font.label, { fontSize: 10, letterSpacing: 0.5 }]} numberOfLines={1}>{label}</Text>
      <Text style={[{ fontSize: 16, fontWeight: "600", marginTop: 3, color: tone === "down" ? colors.red : tone === "up" ? colors.green : colors.text }, font.num]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.md }}>{children}</View>;
}

export function ChangePill({ value }: { value: number | null | undefined }) {
  if (value == null || !Number.isFinite(value)) return <Text style={[styles.pill, { color: colors.text4 }]}>-</Text>;
  const up = value >= 0;
  return (
    <Text style={[styles.pill, font.num, { color: up ? colors.green : colors.red, backgroundColor: up ? colors.greenBg : colors.redBg }]}>
      {up ? "+" : ""}{value.toFixed(2).replace(".", ",")} %
    </Text>
  );
}

export function Row({ title, subtitle, right, left, onPress }: { title: string; subtitle?: string; right?: React.ReactNode; left?: React.ReactNode; onPress?: () => void }) {
  const body = (
    <View style={styles.row}>
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[font.small, { color: colors.text4, marginTop: 1 }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.6 }}>{body}</Pressable> : body;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={[font.small, { color: colors.text4 }]}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.text4} {...props} style={[styles.input, props.style]} />;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Loading({ text }: { text?: string }) {
  return (
    <View style={{ paddingVertical: 40, alignItems: "center", gap: 10 }}>
      <ActivityIndicator color={colors.navy} />
      {text ? <Text style={font.small}>{text}</Text> : null}
    </View>
  );
}

export function Notice({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "error" }) {
  return (
    <View style={[styles.card, { marginTop: space.md, borderColor: tone === "error" ? "#F3C5C7" : colors.border }]}>
      <Text style={[font.small, tone === "error" && { color: colors.red }]}>{text}</Text>
    </View>
  );
}

export function ProBadge({ label = "PRO" }: { label?: string }) {
  return <Text style={styles.badge}>{label}</Text>;
}

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  seg: { flexDirection: "row", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 2, marginBottom: space.md },
  segItem: { flex: 1, alignItems: "center", paddingVertical: 7, borderRadius: 7 },
  segOn: { backgroundColor: colors.surface },
  btn: { borderWidth: 1, borderColor: colors.border2, borderRadius: radius.md, paddingVertical: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", minHeight: 46 },
  kpi: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 10 },
  pill: { fontSize: 12, fontWeight: "600", paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, overflow: "hidden", minWidth: 66, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border2 },
  field: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 12, fontSize: 15, color: colors.text, backgroundColor: "#fff" },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: space.md },
  badge: { fontSize: 10, fontWeight: "700", color: colors.navy, borderWidth: 1, borderColor: colors.navy, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, overflow: "hidden" },
});
