import { useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { isFirebaseConfigured, CONVERSATION_ID } from "@/lib/firebase";
import { subscribeAuth } from "@/lib/authService";
import { checkMembership, type MembershipState } from "@/lib/chatService";

export type AuthState = { status: "loading" } | { status: "unconfigured" } | { status: "signed-out" } | { status: "signed-in"; user: FirebaseUser };

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  useEffect(() => {
    if (!isFirebaseConfigured) return setState({ status: "unconfigured" });
    return subscribeAuth((u) => setState(u ? { status: "signed-in", user: u } : { status: "signed-out" }));
  }, []);
  return state;
}

export function useMembership(uid: string | undefined): [MembershipState, () => void] {
  const [state, setState] = useState<MembershipState>({ status: "loading" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    setState({ status: "loading" });
    checkMembership(CONVERSATION_ID, uid).then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, [uid, n]);
  return [state, () => setN((x) => x + 1)];
}
