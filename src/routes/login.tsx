import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSession, requestOtp, validatePhone } from "@/lib/authService";
import { AppButton, Logo, PhoneInput, ScreenContainer } from "@/components/justus";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { phone?: string | undefined; cc?: string | undefined } => ({
    phone: typeof s["phone"] === "string" ? s["phone"] : undefined,
    cc: typeof s["cc"] === "string" ? s["cc"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — JustUs" },
      { name: "description", content: "Sign in to JustUs with your phone number." },
      { property: "og:title", content: "Sign in — JustUs" },
      { property: "og:description", content: "Sign in to JustUs with your phone number." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [cc, setCc] = useState(search.cc ?? "+91");
  const [phone, setPhone] = useState(search.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) navigate({ to: "/chats", replace: true });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePhone(cc, phone);
    setError(err);
    if (err) return;
    setLoading(true);
    try {
      await requestOtp(cc, phone);
      navigate({ to: "/verify-otp", search: { phone, cc } });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="px-6 pt-[max(4rem,env(safe-area-inset-top))] pb-6">
      <div className="animate-rise flex flex-col items-center text-center">
        <Logo size={76} />
        <h1 className="mt-6 font-display text-4xl font-bold">JustUs</h1>
        <p className="mt-2 text-muted-foreground">A little world, just for us.</p>
      </div>

      <form onSubmit={submit} className="animate-rise mt-14 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Enter your phone number</h2>
          <p className="mt-1 text-sm text-muted-foreground">We'll verify it with a 6-digit code.</p>
        </div>
        <PhoneInput countryCode={cc} onCountryChange={(c) => { setCc(c); setError(null); }} value={phone} onChange={(v) => { setPhone(v); setError(null); }} error={error} />
        <AppButton type="submit" loading={loading}>Continue</AppButton>
        <p className="rounded-2xl bg-card px-4 py-3 text-xs text-secondary">Demo mode: no real SMS is sent.</p>
      </form>

      <p className="mt-auto pt-10 text-center text-xs text-muted-foreground">
        By continuing you agree to our <span className="text-foreground underline">Terms</span> and{" "}
        <span className="text-foreground underline">Privacy Policy</span>.
      </p>
    </ScreenContainer>
  );
}
