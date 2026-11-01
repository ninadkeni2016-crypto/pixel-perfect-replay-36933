export interface Partner {
  id: string;
  displayName: string;
  initials: string;
}

export type MessageStatus = "sending" | "sent" | "failed";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: number;
  status?: MessageStatus;
}

export interface Conversation {
  id: string;
  partner: Partner;
  lastMessage?: Pick<Message, "text" | "createdAt" | "senderId"> | undefined;
  unreadCount: number;
}
