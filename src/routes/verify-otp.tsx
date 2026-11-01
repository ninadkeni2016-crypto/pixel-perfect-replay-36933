import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DEMO_OTP, requestOtp, verifyOtp } from "@/lib/authService";
import { AppButton, OtpInput, ScreenContainer } from "@/components/justus";

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (s: Record<string, unknown>) => ({
    phone: typeof s["phone"] === "string" ? s["phone"] : "",
    cc: typeof s["cc"] === "string" ? s["cc"] : "+91",
  }),
  head: () => ({
    meta: [
      { title: "Verify your number — JustUs" },
      { name: "description", content: "Enter the 6-digit code to sign in to JustUs." },
      { property: "og:title", content: "Verify your number — JustUs" },
      { property: "og:description", content: "Enter the 6-digit code to sign in to JustUs." },
    ],
  }),
  component: Verify,
});

const RESEND_SECONDS = 30;

function Verify() {
  const navigate = useNavigate();
  const { phone, cc } = Route.useSearch();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!phone) navigate({ to: "/login", replace: true });
  }, [phone, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = async () => {
    if (otp.length !== 6) return setError("Enter all 6 digits.");
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(cc, phone, otp);
      navigate({ to: "/chats", replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    await requestOtp(cc, phone);
    setOtp("");
    setError(null);
    setSeconds(RESEND_SECONDS);
  };

  return (
    <ScreenContainer className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6">
      <button aria-label="Back" onClick={() => navigate({ to: "/login", search: { phone, cc } })} className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-accent">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="animate-rise mt-8">
        <h1 className="font-display text-3xl font-bold">Verify it's you</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the code for <span className="text-foreground">{cc} {phone}</span>{" "}
          <button onClick={() => navigate({ to: "/login", search: { phone, cc } })} className="font-medium text-secondary underline">Edit</button>
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-secondary/30 bg-card px-4 py-3 text-sm text-secondary">
        Demo verification — not real phone authentication. Use code <b className="tracking-widest text-foreground">{DEMO_OTP}</b>.
      </div>

      <div className="mt-8">
        <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(null); }} error={!!error} />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      <AppButton className="mt-8" loading={loading} onClick={verify} disabled={otp.length !== 6}>Verify</AppButton>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {seconds > 0 ? (
          <>Resend code in <span className="text-foreground">0:{String(seconds).padStart(2, "0")}</span></>
        ) : (
          <button onClick={resend} className="font-semibold text-primary">Resend code</button>
        )}
      </div>
    </ScreenContainer>
  );
}
