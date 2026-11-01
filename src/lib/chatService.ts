// Real-time chat on Cloud Firestore. Membership is set in the Firebase console only; rules enforce it.
import {
  collection,
  doc,
  getDoc,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Message } from "./types";

export const MAX_MESSAGE_LENGTH = 2000;

export interface ConversationInfo {
  members: string[];
  names: Record<string, string>;
}

export type MembershipState =
  | { status: "loading" }
  | { status: "ok"; info: ConversationInfo }
  | { status: "not-setup" }
  | { status: "denied" }
  | { status: "error"; message: string };

export async function checkMembership(conversationId: string, uid: string): Promise<MembershipState> {
  try {
    const snap = await getDoc(doc(db(), "conversations", conversationId));
    if (!snap.exists()) return { status: "not-setup" };
    const d = snap.data() as Partial<ConversationInfo>;
    const members = Array.isArray(d.members) ? d.members : [];
    if (!members.includes(uid)) return { status: "denied" };
    return { status: "ok", info: { members, names: d.names ?? {} } };
  } catch (e) {
    const code = (e as { code?: string }).code;
    // Rules deny reading a conversation you are not a member of (or one that doesn't exist).
    if (code === "permission-denied") return { status: "denied" };
    if (code === "unavailable") return { status: "error", message: "You're offline. Reconnect and try again." };
    return { status: "error", message: "Couldn't load your conversation." };
  }
}

const messagesCol = (conversationId: string) => collection(db(), "conversations", conversationId, "messages");

function toMessage(id: string, d: Record<string, unknown>, pending: boolean): Message {
  const ts = d["createdAt"] as Timestamp | null | undefined;
  return {
    id,
    conversationId: String(d["conversationId"] ?? ""),
    senderId: String(d["senderId"] ?? ""),
    text: String(d["text"] ?? ""),
    createdAt: ts ? ts.toMillis() : Date.now(),
    status: pending ? "sending" : "sent",
  };
}

export function subscribeMessages(
  conversationId: string,
  onData: (msgs: Message[]) => void,
  onError: (msg: string) => void,
) {
  const q = query(messagesCol(conversationId), orderBy("createdAt", "asc"), limitToLast(500));
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => onData(snap.docs.map((d) => toMessage(d.id, d.data({ serverTimestamps: "estimate" }), d.metadata.hasPendingWrites))),
    () => onError("Lost connection to chat. Retrying when you're back online."),
  );
}

export function subscribeLastMessage(conversationId: string, onData: (m: Message | null) => void) {
  const q = query(messagesCol(conversationId), orderBy("createdAt", "desc"), limit(1));
  return onSnapshot(q, (snap) => {
    const d = snap.docs[0];
    onData(d ? toMessage(d.id, d.data({ serverTimestamps: "estimate" }), false) : null);
  });
}

/** Creates a new message id up front so retries reuse it (no duplicates). */
export const newMessageId = (conversationId: string) => doc(messagesCol(conversationId)).id;

export function validateMessage(text: string): string | null {
  const t = text.trim();
  if (!t) return "Message is empty.";
  if (t.length > MAX_MESSAGE_LENGTH) return `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.`;
  return null;
}

export async function sendMessage(conversationId: string, id: string, senderId: string, text: string) {
  const t = text.trim();
  if (validateMessage(t)) throw new Error(validateMessage(t)!);
  await setDoc(doc(messagesCol(conversationId), id), {
    id,
    conversationId,
    senderId,
    text: t,
    createdAt: serverTimestamp(),
  });
}
