import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircleHeart } from "lucide-react";
import { getSession } from "@/lib/authService";
import { formatDay, getMessages, isMine, markRead, sendMessage } from "@/lib/chatStorage";
import { PARTNER } from "@/lib/mockData";
import type { Message } from "@/lib/types";
import { Avatar, MessageBubble, MessageComposer, ScreenContainer } from "@/components/justus";

export const Route = createFileRoute("/chat/$conversationId")({
  head: () => ({
    meta: [
      { title: "Chat — JustUs" },
      { name: "description", content: "Your private one-to-one chat on JustUs." },
      { property: "og:title", content: "Chat — JustUs" },
      { property: "og:description", content: "Your private one-to-one chat on JustUs." },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { conversationId } = Route.useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getSession()) return void navigate({ to: "/login", replace: true });
    setMessages(getMessages(conversationId));
    markRead(conversationId);
  }, [conversationId, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const onSend = (text: string) => {
    const m = sendMessage(conversationId, text);
    if (m) setMessages((prev) => [...(prev ?? []), m]);
  };

  if (!messages) return <ScreenContainer />;

  return (
    <ScreenContainer>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <button aria-label="Back" onClick={() => navigate({ to: "/chats" })} className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar initials={PARTNER.initials} online size={40} />
        <div>
          <p className="font-semibold leading-tight">{PARTNER.displayName}</p>
          <p className="text-xs text-online">Online · demo</p>
        </div>
      </header>

      <div className="flex-1 space-y-2 px-4 py-4">
        {messages.length === 0 && (
          <div className="mt-24 flex flex-col items-center text-center text-muted-foreground">
            <MessageCircleHeart className="h-10 w-10 text-primary" />
            <p className="mt-3">Say something sweet to start.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const day = formatDay(m.createdAt);
          const showDay = i === 0 || formatDay(messages[i - 1]!.createdAt) !== day;
          return (
            <Fragment key={m.id}>
              {showDay && (
                <div className="flex justify-center py-2">
                  <span className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">{day}</span>
                </div>
              )}
              <MessageBubble message={m} mine={isMine(m)} />
            </Fragment>
          );
        })}
        <div ref={endRef} />
      </div>

      <MessageComposer onSend={onSend} />
    </ScreenContainer>
  );
}
