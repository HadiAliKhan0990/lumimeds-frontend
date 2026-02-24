export interface MessageType {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface MessageSectionType {
  title: string;
  messageCount: number;
  messages: MessageType[];
}