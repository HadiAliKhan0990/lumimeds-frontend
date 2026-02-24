import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatUserType, Role } from '@/services/chat/types';
import { shouldReplaceConversation } from '@/helpers/chat';

export type ChatRoomStatus = 'resolved' | 'unresolved' | 'unread';

export interface ChatConversation {
  id?: string | null;
  content?: string | null;
  createdAt?: string | null;
  unreadCount?: number | null;
  chatRoom?: {
    id: string;
    status?: ChatRoomStatus;
  };
  otherUser?: {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
  };
}

export interface ChatMessages {
  id?: string | null;
  content?: string | null;
  createdAt?: string | null;
  isRead?: boolean | null;
  metadata?: {
    adminName?: string;
    actualAdminId?: string;
    fileUrl?: string | null;
  } | null;
  senderId?: string;
  receiverId?: string;
  chatRoomId?: string;
  receiver?: { id?: string; email?: string };
  sender?: { id: string; email: string };
  notifiedAt?: string;

  chatRoom?: {
    id: string;
    status: ChatRoomStatus;
    patientId: string;
    adminId: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
  };
  patient?: {
    firstName: string;
    lastName: string;
    id: string;
    gender: string;
    dob: string;
  };
}

export type ConversationFilter = 'All' | 'Unread' | 'Unresolved';

export type ConversationSortOrderType = 'ASC' | 'DESC';
export type ConversationSortFieldType = 'createdAt' | 'name';

export interface Meta {
  total?: number | null;
  page: number;
  limit: number | null;
  totalPages?: number | null;
  hasNextPage: boolean | null;
  stats?: {
    totalConversations: number | null;
    unreadConversations: number | null;
    unresolvedConversations: number | null;
  };
  sortOrder?: ConversationSortOrderType;
  sortField?: ConversationSortFieldType;
  search?: string | null;
}

interface State {
  conversations: {
    patient: ChatConversation[];
    provider: ChatConversation[];
    admin: ChatConversation[];
  };
  messages?: ChatMessages[];
  selectedConversation?: ChatConversation | null;
  isNewMessage: boolean;
  chatUsers: ChatUserType[] | null;
  selectedRole: Role;
  newChatUser: ChatUserType | null;
  conversationFilter: ConversationFilter;
  conversationsMeta: { patient: Meta | null; provider: Meta | null; admin: Meta | null };
  messagesMeta: Meta | null;
  chatUsersMeta: Omit<Meta, 'hasNextPage'> | null | undefined;
  messagesLoading: boolean;
  isLoadingChats: boolean;
  userId?: string;
  chatRoom?: ChatConversation['chatRoom'] | null;
  chatRoomStatus?: ChatRoomStatus;
  patientMeta?: {
    page?: number;
    limit?: number;
    hasNextPage?: boolean;
  };
  patientMessages?: ChatMessages[];
  filtersLoading: boolean;
  paymentType?: string | null;
  planName?: string | null;
}

const initialState: State = {
  conversations: {
    patient: [],
    provider: [],
    admin: [],
  },
  messages: [],
  selectedConversation: null,
  isNewMessage: false,
  chatUsers: null,
  selectedRole: 'patient',
  newChatUser: null,
  conversationFilter: 'All',
  messagesMeta: {
    page: 0,
    limit: null,
    total: null,
    totalPages: null,
    hasNextPage: null,
  },
  conversationsMeta: {
    patient: {
      page: 1,
      limit: 30,
      total: null,
      totalPages: null,
      hasNextPage: null,
      sortField: 'createdAt',
      sortOrder: 'DESC',
    },
    provider: {
      page: 1,
      limit: 30,
      total: null,
      totalPages: null,
      hasNextPage: null,
      sortField: 'createdAt',
      sortOrder: 'DESC',
    },
    admin: {
      page: 1,
      limit: 30,
      total: null,
      totalPages: null,
      hasNextPage: null,
      sortField: 'createdAt',
      sortOrder: 'DESC',
    },
  },
  chatUsersMeta: {
    page: 1,
    limit: null,
    total: null,
    totalPages: null,
  },
  messagesLoading: false,
  isLoadingChats: true,
  filtersLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setPatientsConversations: (state, action: PayloadAction<State['conversations']['patient']>) => {
      if (!action.payload) {
        state.conversations.patient = action.payload;
        return;
      }

      const uniqueConversationsMap = new Map<string, ChatConversation>();

      action.payload.forEach((conversation) => {
        const key = conversation.otherUser?.id || conversation.chatRoom?.id || '';

        // If conversation already exists, keep the one with more recent data
        const existing = uniqueConversationsMap.get(key);
        if (!existing || shouldReplaceConversation(existing, conversation)) {
          uniqueConversationsMap.set(key, conversation);
        }
      });

      state.conversations.patient = Array.from(uniqueConversationsMap.values());
    },

    setProvidersConversations: (state, action: PayloadAction<State['conversations']['provider']>) => {
      state.conversations.provider = action.payload;
    },

    setAdminConversations: (state, action: PayloadAction<State['conversations']['admin']>) => {
      state.conversations.admin = action.payload;
    },

    setPatientsConversationsMeta: (state, action: PayloadAction<Meta | null>) => {
      state.conversationsMeta.patient = action.payload;
    },

    setAdminConversationsMeta: (state, action: PayloadAction<Meta | null>) => {
      state.conversationsMeta.admin = action.payload;
    },

    setProvidersConversationsMeta: (state, action: PayloadAction<Meta | null>) => {
      state.conversationsMeta.provider = action.payload;
    },

    setMessages: (state, action: PayloadAction<ChatMessages[] | null>) => {
      const incoming = action.payload ?? [];

      // Early return for empty/single item
      if (incoming.length <= 1) {
        state.messages = incoming;
        return;
      }

      // Check if already sorted during processing
      let needsSort = false;
      let prevTime = 0;
      const uniqueMessages: ChatMessages[] = [];
      const seenIds = new Set<string>();

      for (const msg of incoming) {
        if (!seenIds.has(msg.id || '')) {
          seenIds.add(msg.id || '');
          uniqueMessages.push(msg);

          const currentTime = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
          if (currentTime < prevTime) needsSort = true;
          prevTime = currentTime;
        }
      }

      state.messages = needsSort
        ? [...uniqueMessages].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
          })
        : uniqueMessages;
    },
    addMessage: (state, action: PayloadAction<ChatMessages>) => {
      // Initialize messages array if it doesn't exist
      if (!state.messages) {
        state.messages = [];
      }

      // Fast duplicate check using findIndex
      const existingIndex = state.messages.findIndex((msg) => msg.id === action.payload.id);
      if (existingIndex !== -1) return; // Message already exists

      // Optimized insertion while maintaining sort order
      const newMessageTime = action.payload.createdAt ? new Date(action.payload.createdAt).getTime() : 0;
      let insertIndex = state.messages.length; // Default to append at end

      // Binary search to find the correct insertion position
      let low = 0;
      let high = state.messages.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midMessageTime = state.messages[mid].createdAt ? new Date(state.messages[mid].createdAt).getTime() : 0;

        if (midMessageTime < newMessageTime) {
          low = mid + 1;
        } else {
          high = mid - 1;
          insertIndex = mid;
        }
      }

      // Insert the message at the correct position
      state.messages.splice(insertIndex, 0, action.payload);
    },
    setSelectedConversation: (state, action: PayloadAction<ChatConversation | null | undefined>) => {
      state.selectedConversation = action.payload;
    },
    setIsNewMessage: (state, action: PayloadAction<boolean>) => {
      state.isNewMessage = action.payload;
    },
    setChatUsers: (state, action: PayloadAction<ChatUserType[] | null>) => {
      state.chatUsers = action.payload;
    },

    setSelectedRole: (state, action: PayloadAction<Role>) => {
      state.selectedRole = action.payload;
    },

    setNewChatUser: (state, action: PayloadAction<ChatUserType | null>) => {
      state.newChatUser = action.payload;
    },

    setConversationFilter: (state, action: PayloadAction<ConversationFilter>) => {
      state.conversationFilter = action.payload;
    },

    setMessagesMeta: (state, action: PayloadAction<Meta | null>) => {
      state.messagesMeta = action.payload;
    },

    setChatUsersMeta: (state, action: PayloadAction<Omit<Meta, 'hasNextPage'> | null | undefined>) => {
      state.chatUsersMeta = action.payload;
    },

    setMessagesLoading: (state, action: PayloadAction<boolean>) => {
      state.messagesLoading = action.payload;
    },

    setLoadingChats: (state, action) => {
      state.isLoadingChats = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setChatRoom: (state, action) => {
      state.chatRoom = action.payload;
    },
    setChatRoomStatus: (state, action) => {
      state.chatRoomStatus = action.payload;
    },
    setPatientMessagesMeta: (state, action) => {
      state.patientMeta = action.payload;
    },
    setPatientMessages: (state, action: PayloadAction<ChatMessages[]>) => {
      const newMessages = action.payload ?? [];

      // Early return for empty or single-item arrays (no sorting needed)
      if (newMessages.length <= 1) {
        state.patientMessages = newMessages;
        return;
      }

      // Check if array is already sorted (common case optimization)
      let isSorted = true;
      let prevTime = newMessages[0].createdAt ? new Date(newMessages[0].createdAt).getTime() : 0;

      for (let i = 1; i < newMessages.length; i++) {
        const currentTime = newMessages[i].createdAt ? new Date(newMessages?.[i]?.createdAt || '').getTime() : 0;
        if (currentTime < prevTime) {
          isSorted = false;
          break;
        }
        prevTime = currentTime;
      }

      // Only sort if necessary
      state.patientMessages = isSorted
        ? newMessages
        : [...newMessages].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
          });
    },
    addPatientChatMessage: (state, action: PayloadAction<ChatMessages>) => {
      // Initialize messages array if it doesn't exist
      if (!state.patientMessages) {
        state.patientMessages = [];
      }

      // Fast duplicate check using a Set (O(1) lookup)
      const existingIds = new Set(state.patientMessages.map((msg) => msg.id));
      if (existingIds.has(action.payload.id)) return;

      // Get timestamp for new message (calculate once)
      const newMessageTime = action.payload.createdAt ? new Date(action.payload.createdAt).getTime() : 0;

      // Binary search to find insertion index
      let insertIndex = state.patientMessages.length;
      let low = 0;
      let high = state.patientMessages.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const currentTime = state.patientMessages[mid].createdAt
          ? new Date(state.patientMessages[mid].createdAt).getTime()
          : 0;

        if (currentTime < newMessageTime) {
          low = mid + 1;
        } else {
          high = mid - 1;
          insertIndex = mid;
        }
      }

      // Insert message at correct position
      state.patientMessages.splice(insertIndex, 0, action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      if (state.messages) {
        state.messages = state.messages.map((m) => {
          if (m.id === action.payload) {
            return { ...m, isRead: true };
          }
          return m;
        });
      }
    },
    setFiltersLoading: (state, action: PayloadAction<boolean>) => {
      state.filtersLoading = action.payload;
    },
    setPatientChatPaymentType: (state, action: PayloadAction<State['paymentType']>) => {
      state.paymentType = action.payload;
    },
    setPatientChatPlanName: (state, action: PayloadAction<State['planName']>) => {
      state.planName = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearPatientMessages: (state) => {
      state.patientMessages = [];
    },
    updateConversationStatusByChatRoomId: (
      state,
      action: PayloadAction<{
        chatRoomId: string;
        status: 'resolved' | 'unresolved' | 'unread';
        message?: ChatMessages;
        role?: Role; // Optional role to determine which array to update/add to
      }>
    ) => {
      const { chatRoomId, status, message, role } = action.payload;

      // Helper function to update a conversation
      const updateConversation = (conversation: ChatConversation) => {
        const updated: ChatConversation = {
          ...conversation,
          chatRoom: conversation.chatRoom
            ? {
                ...conversation.chatRoom,
                status,
              }
            : {
                id: chatRoomId,
                status,
              },
        };

        // Update content and createdAt if message is provided
        if (message) {
          // Always update content with new message (even if empty, as it might be an attachment)
          if (message.content !== undefined) {
            updated.content = message.content;
          }
          // Always update createdAt with new message timestamp
          if (message.createdAt) {
            updated.createdAt = message.createdAt;
          }
        }

        return updated;
      };

      // Helper function to create a new conversation from message data
      const createConversationFromMessage = (): ChatConversation | null => {
        if (!message) return null;

        // We can only create a conversation if we have patient data
        // For other cases, the conversation should already exist from initial load
        if (!message.patient) return null;

        const sender = message.sender;
        if (!sender) return null;

        const otherUser = {
          id: message.patient.id,
          email: sender.email || '',
          role: 'patient' as Role,
          firstName: message.patient.firstName,
          lastName: message.patient.lastName,
        };

        return {
          content: message.content || null,
          createdAt: message.createdAt || null,
          unreadCount: 1,
          chatRoom: {
            id: chatRoomId,
            status,
          },
          otherUser,
        };
      };

      // Helper function to update or add conversation in an array
      const updateOrAddConversation = (conversations: ChatConversation[], targetRole: Role) => {
        const index = conversations.findIndex((conv) => conv.chatRoom?.id === chatRoomId);

        if (index !== -1) {
          // Conversation exists - update it and move to top
          const updated = updateConversation(conversations[index]);
          conversations.splice(index, 1); // Remove from current position
          conversations.unshift(updated); // Add to top
        } else if (role === targetRole && message) {
          // Conversation doesn't exist - create and add at top
          const newConversation = createConversationFromMessage();
          if (newConversation) {
            conversations.unshift(newConversation);
          }
        }
      };

      // Update or add in appropriate conversation arrays
      if (role) {
        // If role is specified, only update that specific array
        if (role === 'patient') {
          updateOrAddConversation(state.conversations.patient, 'patient');
        } else if (role === 'provider') {
          updateOrAddConversation(state.conversations.provider, 'provider');
        } else if (role === 'admin') {
          updateOrAddConversation(state.conversations.admin, 'admin');
        }
      } else {
        // If no role specified, update in all arrays where conversation exists
        const patientIndex = state.conversations.patient.findIndex((conv) => conv.chatRoom?.id === chatRoomId);
        if (patientIndex !== -1 && state.conversations.patient[patientIndex].chatRoom) {
          const updated = updateConversation(state.conversations.patient[patientIndex]);
          state.conversations.patient.splice(patientIndex, 1);
          state.conversations.patient.unshift(updated);
        }

        const providerIndex = state.conversations.provider.findIndex((conv) => conv.chatRoom?.id === chatRoomId);
        if (providerIndex !== -1 && state.conversations.provider[providerIndex].chatRoom) {
          const updated = updateConversation(state.conversations.provider[providerIndex]);
          state.conversations.provider.splice(providerIndex, 1);
          state.conversations.provider.unshift(updated);
        }

        const adminIndex = state.conversations.admin.findIndex((conv) => conv.chatRoom?.id === chatRoomId);
        if (adminIndex !== -1 && state.conversations.admin[adminIndex].chatRoom) {
          const updated = updateConversation(state.conversations.admin[adminIndex]);
          state.conversations.admin.splice(adminIndex, 1);
          state.conversations.admin.unshift(updated);
        }
      }

      // Update selectedConversation if it matches
      if (state.selectedConversation?.chatRoom?.id === chatRoomId && state.selectedConversation.chatRoom) {
        state.selectedConversation = updateConversation(state.selectedConversation);
      }

      // Update chatRoom state if it matches
      if (state.chatRoom?.id === chatRoomId) {
        state.chatRoom = {
          ...state.chatRoom,
          status,
        };
      }
    },
    updateConversationByChatRoomId: (
      state,
      action: PayloadAction<{
        chatRoomId: string;
        message: ChatMessages;
        status?: 'resolved' | 'unresolved' | 'unread';
      }>
    ) => {
      const { chatRoomId, message, status } = action.payload;
      const newStatus = status || (message.chatRoom?.status as 'resolved' | 'unresolved' | 'unread') || 'unresolved';

      // Helper function to update a conversation in an array
      const updateConversationInArray = (conversations: ChatConversation[]) => {
        const index = conversations.findIndex((conv) => conv.chatRoom?.id === chatRoomId);
        if (index !== -1 && conversations[index].chatRoom) {
          conversations[index] = {
            ...conversations[index],
            content: message.content || conversations[index].content,
            createdAt: message.createdAt || conversations[index].createdAt,
            chatRoom: {
              ...conversations[index].chatRoom,
              status: newStatus,
            },
            unreadCount: (conversations[index].unreadCount || 0) + 1,
          };
        }
      };

      // Update in all conversation arrays
      updateConversationInArray(state.conversations.patient);
      updateConversationInArray(state.conversations.provider);
      updateConversationInArray(state.conversations.admin);

      // Update selectedConversation if it matches
      if (state.selectedConversation?.chatRoom?.id === chatRoomId && state.selectedConversation.chatRoom) {
        state.selectedConversation = {
          ...state.selectedConversation,
          content: message.content || state.selectedConversation.content,
          createdAt: message.createdAt || state.selectedConversation.createdAt,
          chatRoom: {
            ...state.selectedConversation.chatRoom,
            status: newStatus,
          },
        };
      }

      // Update chatRoom state if it matches
      if (state.chatRoom?.id === chatRoomId) {
        state.chatRoom = {
          ...state.chatRoom,
          status: newStatus,
        };
      }
    },
  },
});

export const {
  setPatientsConversations,
  setProvidersConversations,
  setAdminConversations,
  setMessages,
  addMessage,
  setSelectedConversation,
  setIsNewMessage,
  setChatUsers,
  setSelectedRole,
  setNewChatUser,
  setMessagesMeta,
  setChatUsersMeta,
  setPatientsConversationsMeta,
  setProvidersConversationsMeta,
  setAdminConversationsMeta,
  setConversationFilter,
  setMessagesLoading,
  setLoadingChats,
  setUserId,
  setChatRoom,
  setChatRoomStatus,
  setPatientMessages,
  setPatientMessagesMeta,
  markAsRead,
  addPatientChatMessage,
  setFiltersLoading,
  setPatientChatPaymentType,
  setPatientChatPlanName,
  clearMessages,
  clearPatientMessages,
  updateConversationStatusByChatRoomId,
  updateConversationByChatRoomId,
} = chatSlice.actions;

export default chatSlice.reducer;
