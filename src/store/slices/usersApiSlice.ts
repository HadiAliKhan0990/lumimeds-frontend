import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';
import {
  ChatLogsQueryParams,
  ChatLogsResponse,
  ProviderPatientsQueryParams,
  ProviderPatientsResponse,
} from '@/types/users';

export interface Payload {
  search?: string | null;
  page?: number;
  limit?: number;
}

export type ExistingUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  patientId: string;
  dob: string;
  email: string;
  phone?: string;
  phoneNumber: string;
  medicalHistory: {
    medicalConditions: string;
    chronicConditions: boolean;
    thyroidCancer: boolean;
    recentBariatricSurgery: boolean;
    type1: boolean;
    cancer: boolean;
    mens2: boolean;
    glp1: boolean;
    glp1Reaction: boolean;
    glp1Details: {
      currentDosage: string;
      lastInjectionDate: string;
      preferredStartDosage: string;
      preferredPharmacy: string;
      threeMonthBulkDelivery: string;
      sixMonthPlanAcknowledged: string;
    };
    allergies: string;
    medications: string;
  };
  bio: {
    height: string;
    weight: string;
    bmi: number;
  };
  gender: string;
  address: {
    billingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      street2: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
    shippingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      street2: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
  };
};

export interface ChatUsersResponse extends Response {
  data: {
    patient?: ExistingUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Patients Data', 'AdminChatLogs', 'ProviderPatients'],
  endpoints: (builder) => ({
    getExistingPatients: builder.query<ChatUsersResponse['data'], Payload>({
      query: ({ search, page, ...params }) => ({
        url: `/chat/patients`,
        method: 'GET',
        params: {
          ...params,
          role: 'patient',
          ...(search && { search }),
          page: page || 1,
        },
      }),
      transformResponse: (response: ChatUsersResponse) => response.data,
      providesTags: ['Patients Data'],
    }),
    getAdminChatLogs: builder.query<ChatLogsResponse['data'], ChatLogsQueryParams>({
      query: ({ providerId, patientId, page = 1, limit = 50, query, startDate, endDate, sentBy }) => ({
        url: '/admin/chat-logs',
        method: 'GET',
        params: {
          providerId,
          patientId,
          page,
          limit,
          ...(query && { query }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(sentBy && sentBy !== 'all' && { sentBy }),
        },
      }),
      transformResponse: (response: ChatLogsResponse) => response.data,
      providesTags: ['AdminChatLogs'],
    }),
    getProviderPatients: builder.query<ProviderPatientsResponse, ProviderPatientsQueryParams>({
      query: ({ providerId, search, page, limit }) => ({
        url: '/admin/provider-patients',
        method: 'GET',
        params: {
          providerId,
          page,
          limit,
          ...(search && { search }),
        },
      }),
      providesTags: ['ProviderPatients'],
    }),
  }),
});

export const { useLazyGetExistingPatientsQuery, useLazyGetAdminChatLogsQuery, useLazyGetProviderPatientsQuery } =
  usersApi;
