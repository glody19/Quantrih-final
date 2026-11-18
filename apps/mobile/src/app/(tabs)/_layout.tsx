import { Tabs } from "expo-router/tabs";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme";

/** Line icons drawn in-house so the tab bar stays thin and monochrome. */
function Icon({ name, color }: { name: string; color: string }) {
  const p = { stroke: color, strokeWidth: 1.7, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {name === "markets" && <Path d="M3 17l5-6 4 4 7-9" {...p} />}
      {name === "portfolios" && (<><Circle cx={12} cy={12} r={8} {...p} /><Path d="M12 4v8l6 5" {...p} /></>)}
      {name === "backtest" && <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" {...p} />}
      {name === "analysis" && (<><Circle cx={11} cy={11} r={6} {...p} /><Path d="M20 20l-4.5-4.5" {...p} /></>)}
      {name === "account" && (<><Circle cx={12} cy={8} r={4} {...p} /><Path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" {...p} /></>)}
    </Svg>
  );
}

export default function TabsLayout() {
  const tab = (name: string, title: string) => ({
    title,
    tabBarIcon: ({ color }: { color: unknown }) => <Icon name={name} color={typeof color === "string" ? color : colors.text4} />,
  });
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.text4,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" },
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={tab("markets", "Marchés")} />
      <Tabs.Screen name="portfolios" options={tab("portfolios", "Portefeuilles")} />
      <Tabs.Screen name="backtest" options={tab("backtest", "Backtest")} />
      <Tabs.Screen name="analysis" options={tab("analysis", "Analyse")} />
      <Tabs.Screen name="account" options={tab("account", "Compte")} />
    </Tabs>
  );
}
