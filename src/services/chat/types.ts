import { Response } from '@/lib/types';

export type Role = 'admin' | 'provider' | 'patient' | 'support' | 'clinical';

export type ChatUserType = {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: string;
  email?: string | null;
  dob?: string | null;
};

export interface GetChatUserResponse extends Response {
  data: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
    admin?: ChatUserType[];
    patient?: ChatUserType[];
    provider?: ChatUserType[];
  };
}

export interface GetChatUserData {
  users: ChatUserType[];
  meta: {
    page: number;
    totalPages: number;
    limit: number;
    total: number;
  };
}
