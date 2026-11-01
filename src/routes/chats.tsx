import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, MessageCircleHeart } from "lucide-react";
import { getSession, logout } from "@/lib/authService";
import { getConversations } from "@/lib/chatStorage";
import type { Conversation, User } from "@/lib/types";
import { Avatar, ChatListItem, Logo, ScreenContainer } from "@/components/justus";

export const Route = createFileRoute("/chats")({
  head: () => ({
    meta: [
      { title: "Chats — JustUs" },
      { name: "description", content: "Your private conversation on JustUs." },
      { property: "og:title", content: "Chats — JustUs" },
      { property: "og:description", content: "Your private conversation on JustUs." },
    ],
  }),
  component: Chats,
});

function Chats() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) return void navigate({ to: "/login", replace: true });
    setUser(s);
    setConvos(getConversations());
  }, [navigate]);

  if (!user) return <ScreenContainer />;

  return (
    <ScreenContainer className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="relative flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="font-display text-2xl font-bold">JustUs</span>
        </div>
        <button aria-label="Profile menu" onClick={() => setMenu((m) => !m)} className="rounded-full">
          <Avatar initials="ME" size={38} />
        </button>
        {menu && (
          <div className="animate-rise absolute top-14 right-0 z-10 w-52 rounded-2xl border bg-popover p-2 shadow-glow">
            <p className="px-3 py-2 text-xs text-muted-foreground">{user.countryCode} {user.phone}</p>
            <button
              onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        )}
      </header>

      <h2 className="mt-4 mb-3 px-1 text-sm font-medium text-muted-foreground">Messages</h2>
      <div className="space-y-3">
        {convos.map((c) => (
          <ChatListItem key={c.id} conversation={c} online onClick={() => navigate({ to: "/chat/$conversationId", params: { conversationId: c.id } })} />
        ))}
      </div>
      {convos[0] && !convos[0].lastMessage && (
        <div className="mt-16 flex flex-col items-center text-center text-muted-foreground">
          <MessageCircleHeart className="h-10 w-10 text-primary" />
          <p className="mt-3">No messages yet. Start chatting!</p>
        </div>
      )}
      <p className="mt-6 text-center text-xs text-muted-foreground">Online status is simulated in demo mode.</p>
    </ScreenContainer>
  );
}
