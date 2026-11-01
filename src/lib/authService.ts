// Real phone OTP via Firebase Authentication. No codes or secrets are stored by the app.
import {
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";

export const COUNTRIES = [
  { code: "+91", flag: "🇮🇳", name: "India", digits: 10 },
  { code: "+1", flag: "🇺🇸", name: "USA", digits: 10 },
  { code: "+44", flag: "🇬🇧", name: "UK", digits: 10 },
  { code: "+61", flag: "🇦🇺", name: "Australia", digits: 9 },
  { code: "+971", flag: "🇦🇪", name: "UAE", digits: 9 },
];

export const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

export function validatePhone(countryCode: string, phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const c = COUNTRIES.find((x) => x.code === countryCode);
  if (!digits) return "Please enter your phone number.";
  if (c && digits.length !== c.digits) return `Enter a ${c.digits}-digit number.`;
  if (countryCode === "+91" && !/^[6-9]/.test(digits)) return "Indian numbers start with 6–9.";
  return null;
}

// Held in memory only (never persisted). Lost on page refresh → user re-requests a code.
let confirmation: ConfirmationResult | null = null;
let verifier: RecaptchaVerifier | null = null;

export const hasPendingConfirmation = () => confirmation !== null;

export async function requestOtp(countryCode: string, phone: string): Promise<void> {
  const auth = firebaseAuth();
  verifier?.clear();
  const el = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (el) el.innerHTML = "";
  verifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, { size: "invisible" });
  try {
    confirmation = await signInWithPhoneNumber(auth, `${countryCode}${phone.replace(/\D/g, "")}`, verifier);
  } catch (e) {
    verifier.clear();
    verifier = null;
    throw new Error(authErrorMessage(e));
  }
}

export async function verifyOtp(code: string): Promise<FirebaseUser> {
  if (!confirmation) throw new Error("This code has expired. Please request a new one.");
  try {
    const cred = await confirmation.confirm(code);
    confirmation = null;
    return cred.user;
  } catch (e) {
    throw new Error(authErrorMessage(e));
  }
}

export function subscribeAuth(cb: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(firebaseAuth(), cb);
}

export async function logout() {
  confirmation = null;
  await signOut(firebaseAuth());
}

export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-verification-code":
      return "That code isn't right. Please check and try again.";
    case "auth/code-expired":
      return "This code has expired. Tap Resend to get a new one.";
    case "auth/invalid-phone-number":
      return "That phone number doesn't look valid.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a while and try again.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    case "auth/captcha-check-failed":
      return "Security check failed. Please try again.";
    case "auth/quota-exceeded":
      return "SMS limit reached for now. Please try later.";
    case "auth/operation-not-allowed":
      return "Phone sign-in isn't enabled in Firebase yet.";
    case "auth/unauthorized-domain":
      return "This website isn't on Firebase's list of authorized domains yet.";
    default:
      return "Something went wrong. Please try again.";
  }
}
