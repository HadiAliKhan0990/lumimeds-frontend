import { Response } from '@/lib/types';

export interface ChatLogMessage {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  metadata: {
    telegraMessageId?: string;
    channelType?: string;
    messageType?: string;
    fileUrl?: string | null;
    adminName?: string;
    actualAdminId?: string;
    isAttachment?: boolean;
  } | null;
  sender: {
    id: string;
    email: string;
    role?: 'patient' | 'provider';
  };
  senderId?: string;
  receiver: {
    id: string;
    email: string;
  };
  receiverId?: string;
}

export interface ChatLogMeta {
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ChatRoom {
  id: string;
  status: string;
}

export interface ChatLogsResponse extends Response {
  data: {
    messages: ChatLogMessage[];
    meta: ChatLogMeta;
    chatRoom: ChatRoom | null;
  };
}

export type SentByFilter = 'all' | 'patient' | 'provider';

export interface ChatLogsQueryParams {
  providerId: string;
  patientId: string;
  page?: number;
  limit?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
  sentBy?: SentByFilter;
}

export interface ProviderPatientsQueryParams {
  providerId: string;
  page: number;
  limit: number;
  search?: string;
}

export type ProviderChatLogsPatient = {
  userId: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export interface ProviderPatientsResponse extends Response {
  data: {
    patients: ProviderChatLogsPatient[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
