import { Platform } from "react-native";
import Constants from "expo-constants";
import type { PurchasesPackage } from "react-native-purchases";
import type { PlanId } from "@shared/lib/planLimits";

/**
 * In-app subscriptions through RevenueCat (App Store and Google Play billing).
 *
 * The app never writes the plan itself: RevenueCat calls the website's webhook, which writes
 * users/{uid}/profiles/subscription with the Admin SDK, the same document Stripe fills for web
 * subscribers. A member who subscribed on quantrih.com is therefore Premium or Pro in the app too.
 *
 * Products expected in RevenueCat: entitlements "premium" and "pro", packages identified as
 * premium_monthly, premium_yearly, pro_monthly, pro_yearly in the "default" offering.
 */
const extra = (Constants.expoConfig?.extra || {}) as Record<string, string>;
const apiKey = Platform.OS === "ios" ? extra.revenueCatIosKey : Platform.OS === "android" ? extra.revenueCatAndroidKey : "";

export const purchasesEnabled = !!apiKey;

let configured = false;
let Purchases: typeof import("react-native-purchases").default | null = null;

async function sdk() {
  if (!purchasesEnabled) return null;
  if (!Purchases) Purchases = (await import("react-native-purchases")).default;
  return Purchases;
}

/** Ties purchases to the Firebase account so the webhook knows which member paid. */
export async function identify(uid: string | null) {
  const P = await sdk();
  if (!P) return;
  if (!configured) {
    P.configure({ apiKey, appUserID: uid });
    configured = true;
    return;
  }
  if (uid) await P.logIn(uid);
  else await P.logOut().catch(() => {});
}

export interface StorePackages {
  monthly: Partial<Record<Exclude<PlanId, "free">, PurchasesPackage>>;
  yearly: Partial<Record<Exclude<PlanId, "free">, PurchasesPackage>>;
}

export async function loadPackages(): Promise<StorePackages | null> {
  const P = await sdk();
  if (!P) return null;
  const off = await P.getOfferings();
  const pk = off.current?.availablePackages || [];
  const find = (id: string) => pk.find((p) => p.identifier === id);
  return {
    monthly: { premium: find("premium_monthly"), pro: find("pro_monthly") },
    yearly: { premium: find("premium_yearly"), pro: find("pro_yearly") },
  };
}

export async function buy(pkg: PurchasesPackage): Promise<boolean> {
  const P = await sdk();
  if (!P) return false;
  try {
    await P.purchasePackage(pkg);
    return true;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore() {
  const P = await sdk();
  if (!P) return;
  await P.restorePurchases();
}
