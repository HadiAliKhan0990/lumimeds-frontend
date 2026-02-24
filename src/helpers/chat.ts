import { ChatConversation } from '@/store/slices/chatSlice';

export const shouldReplaceConversation = (existing: ChatConversation, incoming: ChatConversation): boolean => {
  if (existing.createdAt && incoming.createdAt) {
    return new Date(incoming.createdAt) > new Date(existing.createdAt);
  }

  if (incoming.unreadCount && !existing.unreadCount) {
    return true;
  }

  return true;
};
