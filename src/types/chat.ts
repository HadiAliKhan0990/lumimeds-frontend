import { ChatConversation } from '@/store/slices/chatSlice';

export interface BlaseMessageConversationItem {
  conversationItem: ChatConversation;
  preffered: boolean;
}
