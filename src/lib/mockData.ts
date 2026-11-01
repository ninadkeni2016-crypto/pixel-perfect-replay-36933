import type { Message, Partner } from "./types";

export const ME_ID = "me";
export const CONVERSATION_ID = "partner";

export const PARTNER: Partner = { id: "partner-1", displayName: "My Love", initials: "ML" };

const now = Date.now();
const min = 60_000;

export const SEED_MESSAGES: Message[] = [
  { id: "s1", conversationId: CONVERSATION_ID, senderId: PARTNER.id, text: "Good morning ☀️", createdAt: now - 26 * 60 * min },
  { id: "s2", conversationId: CONVERSATION_ID, senderId: ME_ID, text: "Morning! Slept well?", createdAt: now - 25.9 * 60 * min },
  { id: "s3", conversationId: CONVERSATION_ID, senderId: PARTNER.id, text: "Dinner tonight? I'm thinking pasta 🍝", createdAt: now - 40 * min },
  { id: "s4", conversationId: CONVERSATION_ID, senderId: PARTNER.id, text: "Miss you already ❤️", createdAt: now - 12 * min },
];

export const SEED_UNREAD = 2;
