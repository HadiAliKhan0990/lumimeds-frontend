import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';

export interface GenerateImpersonationLinkResponse extends Response {
  data: {
    link: string;
    token: string;
    expiresAt: string;
    targetUserEmail: string;
    targetUserRole: string;
  };
}

export interface VerifyImpersonationLinkResponse extends Response {
  data: {
    valid: boolean;
    targetUserEmail: string;
    targetUserRole: string;
    expiresAt: string;
    adminEmail: string;
  };
}

export interface CompleteImpersonationResponse extends Response {
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
    };
    impersonationInfo: {
      sessionId: string;
      adminEmail: string;
      adminName: string;
    };
  };
}

export interface GenerateImpersonationLinkPayload {
  targetUserId: string;
  targetUserRole: 'patient' | 'provider';
}

export interface CompleteImpersonationPayload {
  token: string;
  password: string;
}

export const impersonationApi = createApi({
  reducerPath: 'impersonationApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    generateImpersonationLink: builder.mutation<GenerateImpersonationLinkResponse, GenerateImpersonationLinkPayload>({
      query: ({ targetUserId, targetUserRole }) => ({
        url: `/auth/generate-impersonation-link/${targetUserRole}`,
        method: 'POST',
        data: { targetUserId },
      }),
    }),
    verifyImpersonationLink: builder.query<VerifyImpersonationLinkResponse, string>({
      query: (token) => ({
        url: `/auth/verify-impersonation-link/${token}`,
        skipAuth: true,
      }),
    }),
    completeImpersonation: builder.mutation<CompleteImpersonationResponse, CompleteImpersonationPayload>({
      query: (data) => ({
        url: '/auth/complete-impersonation',
        method: 'POST',
        data,
        skipAuth: true,
      }),
    }),
  }),
});

export const {
  useGenerateImpersonationLinkMutation,
  useVerifyImpersonationLinkQuery,
  useLazyVerifyImpersonationLinkQuery,
  useCompleteImpersonationMutation,
} = impersonationApi;

