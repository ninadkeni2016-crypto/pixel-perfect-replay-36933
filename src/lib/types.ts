export interface User {
  id: string;
  phone: string;
  countryCode: string;
  displayName: string;
}

export interface Partner {
  id: string;
  displayName: string;
  initials: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  partner: Partner;
  lastMessage?: Pick<Message, "text" | "createdAt" | "senderId"> | undefined;
  unreadCount: number;
}
