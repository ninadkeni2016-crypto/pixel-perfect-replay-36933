// DEMO auth. No SMS is sent. Swap these functions for a real OTP provider in Phase 2.
import type { User } from "./types";

const SESSION_KEY = "justus.session";
export const DEMO_OTP = "123456";

export const COUNTRIES = [
  { code: "+91", flag: "🇮🇳", name: "India", digits: 10 },
  { code: "+1", flag: "🇺🇸", name: "USA", digits: 10 },
  { code: "+44", flag: "🇬🇧", name: "UK", digits: 10 },
  { code: "+61", flag: "🇦🇺", name: "Australia", digits: 9 },
  { code: "+971", flag: "🇦🇪", name: "UAE", digits: 9 },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function validatePhone(countryCode: string, phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const c = COUNTRIES.find((x) => x.code === countryCode);
  if (!digits) return "Please enter your phone number.";
  if (c && digits.length !== c.digits) return `Enter a ${c.digits}-digit number.`;
  if (countryCode === "+91" && !/^[6-9]/.test(digits)) return "Indian numbers start with 6–9.";
  return null;
}

export async function requestOtp(_countryCode: string, _phone: string): Promise<void> {
  await wait(700); // demo: pretend to send
}

export async function verifyOtp(countryCode: string, phone: string, otp: string): Promise<User> {
  await wait(800);
  if (otp !== DEMO_OTP) throw new Error("That code isn't right. Try 123456 in demo mode.");
  const user: User = { id: "me", phone, countryCode, displayName: "You" };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY); // chat history intentionally kept
}
