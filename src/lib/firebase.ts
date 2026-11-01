// Firebase setup, kept separate from UI. Web config values are public client identifiers (not secrets).
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
};

export const CONVERSATION_ID = (import.meta.env.VITE_JUSTUS_CONVERSATION_ID as string | undefined) || "main";

export const isFirebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  if (typeof window === "undefined") throw new Error("Firebase is browser-only in this app.");
  if (!app) app = getApps()[0] ?? initializeApp(config);
  return app;
}

export const firebaseAuth = (): Auth => getAuth(getApp());
export const db = (): Firestore => getFirestore(getApp());
