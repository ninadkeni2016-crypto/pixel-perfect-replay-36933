import type { Conversation, Message } from "./types";
import { CONVERSATION_ID, ME_ID, PARTNER, SEED_MESSAGES, SEED_UNREAD } from "./mockData";

const MSG_KEY = "justus.messages";
const UNREAD_KEY = "justus.unread";

function load(): Message[] {
  const raw = localStorage.getItem(MSG_KEY);
  if (raw === null) {
    localStorage.setItem(MSG_KEY, JSON.stringify(SEED_MESSAGES));
    localStorage.setItem(UNREAD_KEY, String(SEED_UNREAD));
    return SEED_MESSAGES;
  }
  try {
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

export function getMessages(conversationId: string): Message[] {
  return load()
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function sendMessage(conversationId: string, text: string): Message | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const msg: Message = {
    id: crypto.randomUUID(),
    conversationId,
    senderId: ME_ID,
    text: trimmed,
    createdAt: Date.now(),
  };
  localStorage.setItem(MSG_KEY, JSON.stringify([...load(), msg]));
  return msg;
}

export function markRead(_conversationId: string) {
  localStorage.setItem(UNREAD_KEY, "0");
}

export function getConversations(): Conversation[] {
  const msgs = getMessages(CONVERSATION_ID);
  const last = msgs[msgs.length - 1];
  return [
    {
      id: CONVERSATION_ID,
      partner: PARTNER,
      lastMessage: last && { text: last.text, createdAt: last.createdAt, senderId: last.senderId },
      unreadCount: Number(localStorage.getItem(UNREAD_KEY) ?? 0),
    },
  ];
}

export const isMine = (m: Message) => m.senderId === ME_ID;

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatListTime(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return formatTime(ts);
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function formatDay(ts: number) {
  const t = formatListTime(ts);
  return t.includes(":") ? "Today" : t;
}
