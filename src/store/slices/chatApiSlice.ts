import { createApi } from '@reduxjs/toolkit/query/react';
import { User } from '@/store/slices/userSlice';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Role } from '@/services/chat/types';
import { Response } from '@/lib/types';
import { RootState } from '@/store';
import {
  ChatConversation,
  ChatMessages,
  ChatRoomStatus,
  ConversationSortFieldType,
  ConversationSortOrderType,
  Meta,
  setPatientsConversations,
  setProvidersConversations,
  setSelectedConversation,
  setPatientsConversationsMeta,
  setProvidersConversationsMeta,
  setAdminConversationsMeta,
} from '@/store/slices/chatSlice';

export interface Payload {
  role: Role | null;
  search?: string | null;
  page?: number;
  limit?: number;
}

export interface ChatUsersResponse extends Response {
  data: {
    admin?: User[];
    provider?: User[];
    patient?: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StatusUpdateResponse extends Response {
  data?: {
    id: string;
    status: ChatRoomStatus;
  };
}

type StatusUpdatePayloadType = {
  id: string;
  status?: ChatRoomStatus;
};

export type BlastMessagePayload = {
  sendToAll: boolean;
  userIds?: string[];
  message: string;
  attachment?: string;
  isSendEmail?: boolean;
  templateId?: string;
};

export type BlastMessageResponse = {
  data?: {
    success: boolean;
    message: string;
    blastId: string;
  };
} & Response;

export type MessagesPayload = {
  id: string;
  page?: number;
  limit?: number;
};

export type UserMessagesResponse = {
  data?: {
    messages: ChatMessages[];
    meta: {
      page: number;
      limit: number;
      hasNextPage: boolean;
    };
    paymentType: string;
    planName: string;
  };
} & Response;

export type ConversationsPayload = {
  page?: number | null;
  limit?: number | null;
  search?: string | null;
  unreadOnly?: boolean | null;
  unresolvedOnly?: boolean;
  sortOrder?: ConversationSortOrderType;
  sortField?: ConversationSortFieldType;
  role?: Role;
};

export type ConversationsResponse = {
  data: {
    conversations: ChatConversation[];
    meta: Meta;
  };
} & Response;

export type BlastMessageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type BlastMessageRecord = {
  id: string;
  title: string;
  message: string;
  totalPatients: number;
  processedPatients: number;
  successfulEmails: number;
  successfulMessages: number;
  failedEmailCount: number;
  failedMessagesCount: number;
  status: BlastMessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type BlastMessagesListPayload = {
  page?: number;
  limit?: number;
};

export type BlastMessagesListResponse = {
  data?: {
    data: BlastMessageRecord[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
} & Response;

export type RetryBlastMessagePayload = {
  blastMessageId: string;
};

export type RetryBlastMessageResponse = {
  data: {
    success: boolean;
    message: string;
    blastId: string;
    remainingUsers: number;
    totalProcessed: number;
  };
} & Response;

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: axiosBaseQuery(),
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
  tagTypes: ['ChatUsers', 'Patient Chat', 'Conversations', 'BlastMessages'],
  endpoints: (builder) => ({
    getChatUsers: builder.query<ChatUsersResponse['data'], Payload>({
      query: ({ role, search, page, ...params }) => ({
        url: `/chat/users`,
        method: 'GET',
        params: {
          ...params,
          role: role,
          ...(search && { search }),
          page: page || 1,
        },
      }),
      transformResponse: (response: ChatUsersResponse) => response.data,
      providesTags: ['ChatUsers'],
    }),
    getUserMessages: builder.query<UserMessagesResponse['data'], MessagesPayload>({
      query: ({ id, page, limit }) => ({
        url: `/chat/messages/${id}`,
        method: 'GET',
        params: { page, limit },
      }),
      transformResponse: (response: UserMessagesResponse) => response.data,
      providesTags: ['Patient Chat'],
    }),
    getConversationsList: builder.query<ConversationsResponse['data'], ConversationsPayload>({
      query: ({ page, limit, ...rest }) => ({
        url: `/chat/conversations`,
        method: 'GET',
        params: {
          ...rest,
          page: page ?? 1,
          limit: limit ?? 30,
        },
      }),
      transformResponse: (response: ConversationsResponse) => response.data,
      providesTags: ['Conversations'],
    }),
    updatePatientStatus: builder.mutation<StatusUpdateResponse, StatusUpdatePayloadType>({
      query: ({ id, status }) => ({
        url: `/chat/rooms/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      // Optimistically update conversations list queries and Redux state to avoid refetching
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled, getState }) {
        // Get current Redux state to update conversations
        const rootState = getState() as RootState;
        const chatState = rootState.chat;
        const activeFilter = chatState?.conversationFilter || 'All';

        // Get the original status before update (check selected conversation, then all conversation arrays)
        const originalStatus =
          chatState?.selectedConversation?.chatRoom?.id === id
            ? chatState.selectedConversation.chatRoom?.status
            : chatState?.conversations?.patient?.find((c) => c.chatRoom?.id === id)?.chatRoom?.status ||
              chatState?.conversations?.provider?.find((c) => c.chatRoom?.id === id)?.chatRoom?.status ||
              chatState?.conversations?.admin?.find((c) => c.chatRoom?.id === id)?.chatRoom?.status;

        // Store original state for rollback on error (patient and provider conversations need rollback)
        const originalState = {
          patient: chatState?.conversations?.patient ? [...chatState.conversations.patient] : undefined,
          provider: chatState?.conversations?.provider ? [...chatState.conversations.provider] : undefined,
          selectedConversation: chatState?.selectedConversation ? { ...chatState.selectedConversation } : undefined,
          patientMeta: chatState?.conversationsMeta?.patient ? { ...chatState.conversationsMeta.patient } : undefined,
          providerMeta: chatState?.conversationsMeta?.provider
            ? { ...chatState.conversationsMeta.provider }
            : undefined,
          adminMeta: chatState?.conversationsMeta?.admin ? { ...chatState.conversationsMeta.admin } : undefined,
        };

        // Helper to check if conversation should be removed from list based on filter
        const shouldRemoveFromList = (originalStatus: ChatRoomStatus, newStatus: ChatRoomStatus): boolean => {
          // If filter is "All", never remove conversations
          if (activeFilter === 'All') {
            return false;
          }

          // If filter is "Unresolved": remove if conversation was unresolved and is now something else
          if (activeFilter === 'Unresolved') {
            return originalStatus === 'unresolved' && newStatus !== 'unresolved';
          }

          // If filter is "Unread": remove if conversation was unread and is now something else
          if (activeFilter === 'Unread') {
            return originalStatus === 'unread' && newStatus !== 'unread';
          }

          return false;
        };

        // Helper to update meta stats when conversation status changes
        const updateMetaStats = (
          meta: Meta | null,
          originalStatus: ChatRoomStatus,
          newStatus: ChatRoomStatus
        ): Meta | null => {
          if (!meta) {
            return meta;
          }

          const updatedStats: {
            totalConversations: number | null;
            unreadConversations: number | null;
            unresolvedConversations: number | null;
          } = {
            totalConversations: meta.stats?.totalConversations ?? null,
            unreadConversations: meta.stats?.unreadConversations ?? null,
            unresolvedConversations: meta.stats?.unresolvedConversations ?? null,
          };

          // Decrement unread count if status changes from unread to something else
          if (originalStatus === 'unread' && newStatus !== 'unread') {
            updatedStats.unreadConversations = Math.max(0, (updatedStats.unreadConversations || 0) - 1);
          }

          // Increment unread count if status changes to unread from something else
          if (originalStatus !== 'unread' && newStatus === 'unread') {
            updatedStats.unreadConversations = (updatedStats.unreadConversations || 0) + 1;
          }

          // Decrement unresolved count if status changes from unresolved to something else
          if (originalStatus === 'unresolved' && newStatus !== 'unresolved') {
            updatedStats.unresolvedConversations = Math.max(0, (updatedStats.unresolvedConversations || 0) - 1);
          }

          // Increment unresolved count if status changes to unresolved from something else
          if (originalStatus !== 'unresolved' && newStatus === 'unresolved') {
            updatedStats.unresolvedConversations = (updatedStats.unresolvedConversations || 0) + 1;
          }

          // Only return updated meta if stats actually changed
          if (
            updatedStats.unreadConversations === meta.stats?.unreadConversations &&
            updatedStats.unresolvedConversations === meta.stats?.unresolvedConversations
          ) {
            return meta;
          }

          return {
            ...meta,
            stats: updatedStats,
          };
        };

        // Update patient conversations
        if (chatState?.conversations?.patient) {
          const updatedPatientConversations = chatState.conversations.patient
            .map((conv) => {
              if (conv.chatRoom?.id === id) {
                return {
                  ...conv,
                  chatRoom: { ...conv.chatRoom, status },
                };
              }
              return conv;
            })
            .filter((conv) => {
              // Remove from list if it no longer matches the active filter
              if (
                conv.chatRoom?.id === id &&
                shouldRemoveFromList(originalStatus || 'unresolved', status || 'unresolved')
              ) {
                return false;
              }
              return true;
            });

          dispatch(setPatientsConversations(updatedPatientConversations));

          // Update meta stats when conversation status changes
          if (chatState?.conversationsMeta?.patient && originalStatus) {
            const updatedMeta = updateMetaStats(
              chatState.conversationsMeta.patient,
              originalStatus,
              status || 'unresolved'
            );
            if (updatedMeta && updatedMeta !== chatState.conversationsMeta.patient) {
              dispatch(setPatientsConversationsMeta(updatedMeta));
            }
          }
        }

        // Update provider conversations
        if (chatState?.conversations?.provider) {
          const updatedProviderConversations = chatState.conversations.provider
            .map((conv) => {
              if (conv.chatRoom?.id === id) {
                return {
                  ...conv,
                  chatRoom: { ...conv.chatRoom, status },
                };
              }
              return conv;
            })
            .filter((conv) => {
              // Remove from list if it no longer matches the active filter
              if (
                conv.chatRoom?.id === id &&
                shouldRemoveFromList(originalStatus || 'unresolved', status || 'unresolved')
              ) {
                return false;
              }
              return true;
            });

          dispatch(setProvidersConversations(updatedProviderConversations));

          // Update meta stats when conversation status changes
          if (chatState?.conversationsMeta?.provider && originalStatus) {
            const updatedMeta = updateMetaStats(
              chatState.conversationsMeta.provider,
              originalStatus,
              status || 'unresolved'
            );
            if (updatedMeta && updatedMeta !== chatState.conversationsMeta.provider) {
              dispatch(setProvidersConversationsMeta(updatedMeta));
            }
          }
        }

        // Update admin conversations meta stats when conversation status changes
        if (chatState?.conversationsMeta?.admin && originalStatus) {
          const updatedMeta = updateMetaStats(
            chatState.conversationsMeta.admin,
            originalStatus,
            status || 'unresolved'
          );
          if (updatedMeta && updatedMeta !== chatState.conversationsMeta.admin) {
            dispatch(setAdminConversationsMeta(updatedMeta));
          }
        }

        // Update selected conversation's chatRoom status
        // Always update the selected conversation status, even if it's removed from the filtered list
        if (chatState?.selectedConversation?.chatRoom?.id === id) {
          const updatedSelectedConversation = {
            ...chatState.selectedConversation,
            chatRoom: {
              ...chatState.selectedConversation.chatRoom,
              status,
            },
          };
          dispatch(setSelectedConversation(updatedSelectedConversation));
        }

        try {
          await queryFulfilled;
          // No cache invalidation - we've already updated the state optimistically
        } catch {
          // Revert Redux state updates on error
          if (originalState.patient) {
            dispatch(setPatientsConversations(originalState.patient));
          }
          if (originalState.provider) {
            dispatch(setProvidersConversations(originalState.provider));
          }
          if (originalState.selectedConversation) {
            dispatch(setSelectedConversation(originalState.selectedConversation));
          }
          if (originalState.patientMeta) {
            dispatch(setPatientsConversationsMeta(originalState.patientMeta));
          }
          if (originalState.providerMeta) {
            dispatch(setProvidersConversationsMeta(originalState.providerMeta));
          }
          if (originalState.adminMeta) {
            dispatch(setAdminConversationsMeta(originalState.adminMeta));
          }
        }
      },
    }),
    sendBlastMessage: builder.mutation<BlastMessageResponse, BlastMessagePayload>({
      query: ({ sendToAll, userIds, message, attachment, isSendEmail, templateId }) => ({
        url: `/chat/blast-message`,
        method: 'POST',
        data: {
          sendToAll,
          message,
          ...(userIds && userIds.length > 0 && { userIds }),
          ...(attachment && { attachment }),
          ...(isSendEmail !== undefined && { sendEmail: isSendEmail }),
          ...(templateId && { templateId }),
        },
      }),
      invalidatesTags: ['BlastMessages', 'Conversations'],
    }),
    getBlastMessagesList: builder.query<BlastMessagesListResponse, BlastMessagesListPayload>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/chat/list-blast-messages`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['BlastMessages'],
    }),
    retryBlastMessage: builder.mutation<RetryBlastMessageResponse, RetryBlastMessagePayload>({
      query: ({ blastMessageId }) => ({
        url: `/chat/retry-blast-message`,
        method: 'POST',
        data: { blastMessageId },
      }),
      invalidatesTags: ['BlastMessages'],
    }),
  }),
});

export const {
  useUpdatePatientStatusMutation,
  useLazyGetConversationsListQuery,
  useLazyGetChatUsersQuery,
  useSendBlastMessageMutation,
  useLazyGetBlastMessagesListQuery,
  useRetryBlastMessageMutation,
} = chatApi;
