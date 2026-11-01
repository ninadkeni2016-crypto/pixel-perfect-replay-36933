import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSession } from "@/lib/authService";
import { Logo, ScreenContainer } from "@/components/justus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JustUs — A little world, just for us" },
      { name: "description", content: "JustUs is a private messaging app for two partners." },
      { property: "og:title", content: "JustUs — A little world, just for us" },
      { property: "og:description", content: "A private messaging app for two partners." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: getSession() ? "/chats" : "/login", replace: true });
  }, [navigate]);
  return (
    <ScreenContainer className="items-center justify-center">
      <Logo size={64} />
    </ScreenContainer>
  );
}
