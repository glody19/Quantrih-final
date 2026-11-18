import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Same Firebase project as quantrih.com (public web config, also in firebase-applet-config.json at
 * the repository root): one account and the same saved analyses on the site and in the app.
 */
const firebaseConfig = {
  projectId: "gen-lang-client-0771843165",
  appId: "1:862062177630:web:baf35bc729abb61254b3cf",
  apiKey: "AIzaSyDGJEmPJmnE37rCISmYFMi8dt9uWNBdH-Y",
  authDomain: "gen-lang-client-0771843165.firebaseapp.com",
  storageBucket: "gen-lang-client-0771843165.firebasestorage.app",
  messagingSenderId: "862062177630",
};
const FIRESTORE_DB = "ai-studio-quantrih-91f81149-24e4-47a1-b17d-c9afaf4efa40";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function makeAuth(): Auth {
  if (Platform.OS === "web") return getAuth(app);
  try {
    // getReactNativePersistence only exists in the React Native build of firebase/auth.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getReactNativePersistence } = require("firebase/auth");
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

export const auth = makeAuth();
export const db = getFirestore(app, FIRESTORE_DB);
