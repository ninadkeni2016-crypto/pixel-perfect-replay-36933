import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Heart, Loader2, SendHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/authService";
import type { Conversation, Message } from "@/lib/types";
import { formatListTime, formatTime } from "@/lib/chatStorage";

export function ScreenContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className={cn("mx-auto flex min-h-dvh w-full max-w-md flex-col", className)}>{children}</div>
    </div>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="bg-love grid place-items-center rounded-2xl shadow-glow" style={{ width: size, height: size }}>
      <Heart className="fill-primary-foreground text-primary-foreground" style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}

const buttonVariants = cva(
  "inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-love text-primary-foreground shadow-glow",
        ghost: "text-secondary hover:bg-accent",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function AppButton({
  loading,
  variant,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <button className={cn(buttonVariants({ variant }), className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function PhoneInput({
  countryCode,
  onCountryChange,
  value,
  onChange,
  error,
}: {
  countryCode: string;
  onCountryChange: (c: string) => void;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
}) {
  const c = COUNTRIES.find((x) => x.code === countryCode)!;
  return (
    <div>
      <div className={cn("flex items-center rounded-2xl border bg-card transition focus-within:border-primary", error && "border-destructive")}>
        <label className="relative flex items-center gap-1 border-r px-3 py-4 text-sm">
          <span>{c.flag}</span>
          <span>{c.code}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            aria-label="Country code"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={countryCode}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            {COUNTRIES.map((x) => (
              <option key={x.code} value={x.code}>
                {x.flag} {x.name} ({x.code})
              </option>
            ))}
          </select>
        </label>
        <input
          aria-label="Phone number"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="Phone number"
          className="min-w-0 flex-1 bg-transparent px-4 py-4 text-lg tracking-wide outline-none placeholder:text-muted-foreground"
          value={value}
          maxLength={c.digits}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function OtpInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  useEffect(() => refs.current[0]?.focus(), []);

  const setAt = (i: number, d: string) => {
    const arr = [...digits];
    arr[i] = d;
    onChange(arr.join("").slice(0, 6));
  };

  return (
    <div className="flex justify-between gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-label={`Digit ${i + 1}`}
          inputMode="numeric"
          maxLength={1}
          value={d}
          className={cn(
            "h-14 w-12 rounded-2xl border bg-card text-center text-2xl font-semibold outline-none transition focus:border-primary",
            error && "border-destructive",
          )}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) {
              onChange(v.slice(0, 6));
              refs.current[Math.min(v.length, 5)]?.focus();
              return;
            }
            setAt(i, v);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              setAt(i - 1, "");
              refs.current[i - 1]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}

export function Avatar({ initials, online, size = 48 }: { initials: string; online?: boolean; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="bg-love grid h-full w-full place-items-center rounded-full font-semibold text-primary-foreground" style={{ fontSize: size * 0.34 }}>
        {initials}
      </div>
      {online && <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background bg-online" />}
    </div>
  );
}

export function ChatListItem({ conversation, online, onClick }: { conversation: Conversation; online: boolean; onClick: () => void }) {
  const { partner, lastMessage, unreadCount } = conversation;
  return (
    <button onClick={onClick} className="animate-rise flex w-full items-center gap-3 rounded-3xl bg-card p-4 text-left transition hover:bg-accent">
      <Avatar initials={partner.initials} online={online} size={54} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold">{partner.displayName}</span>
          {lastMessage && <span className={cn("shrink-0 text-xs", unreadCount ? "text-primary" : "text-muted-foreground")}>{formatListTime(lastMessage.createdAt)}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-sm text-muted-foreground">
            {lastMessage ? (lastMessage.senderId === "me" ? "You: " : "") + lastMessage.text : "Say hi 👋"}
          </span>
          {unreadCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">{unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
}

export function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={cn("animate-rise flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-3xl px-4 py-2.5",
          mine ? "bg-love rounded-br-md text-primary-foreground" : "rounded-bl-md bg-card text-card-foreground",
        )}
      >
        <p className="break-words whitespace-pre-wrap">{message.text}</p>
        <p className={cn("mt-1 text-right text-[11px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(message.createdAt)}</p>
      </div>
    </div>
  );
}

export function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [text]);

  const send = () => {
    if (!canSend) return;
    onSend(text);
    setText("");
    ref.current?.focus();
  };

  return (
    <div className="sticky bottom-0 flex items-end gap-2 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      <textarea
        ref={ref}
        rows={1}
        aria-label="Message"
        placeholder="Message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        className="max-h-36 flex-1 resize-none rounded-3xl bg-card px-4 py-3 outline-none placeholder:text-muted-foreground"
      />
      <button
        aria-label="Send"
        disabled={!canSend}
        onClick={send}
        className="bg-love grid h-12 w-12 shrink-0 place-items-center rounded-full text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
