import { client } from '@/lib/baseQuery';
import { ConversationsPayload, ConversationsResponse } from '@/store/slices/chatApiSlice';
import { GetChatUserData, GetChatUserResponse, Role } from '@/services/chat/types';

export const getChatUsers = async (
  role: Role,
  page: number | null = null,
  limit: number | null = null,
  search: string | null = null
): Promise<GetChatUserData> => {
  const {
    data: { data },
  } = await client.get<GetChatUserResponse>('/chat/users', {
    params: { role, page, limit, search },
  });

  return {
    users: data[role as 'admin' | 'provider' | 'patient'] || [],
    meta: {
      page: data.page,
      totalPages: data.totalPages,
      limit: data.limit,
      total: data.total,
    },
  };
};

export const getConversationsList = async ({
  page = 1,
  limit = 30,
  role,
  unreadOnly,
  unresolvedOnly,
  sortOrder,
  sortField,
  search,
}: ConversationsPayload): Promise<ConversationsResponse['data']> => {
  try {
    const { data } = await client.get<ConversationsResponse>('/chat/conversations', {
      params: { page, limit, role, unreadOnly, unresolvedOnly, sortOrder, sortField, search },
    });
    return (
      data.data || { conversations: [], meta: { page: 1, limit: 30, total: 0, totalPages: 1, hasNextPage: false } }
    );
  } catch (error) {
    console.log(error);
    return { conversations: [], meta: { page: 1, limit: 30, total: 0, totalPages: 1, hasNextPage: false } };
  }
};
