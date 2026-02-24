import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';

export interface Agent {
  id: string;
  name: string;
  email: string;
  info: {
    phone: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetAgentsResponse extends Response {
  data: {
    agents: Agent[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AgentSortQueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  total?: number;
  page: number;
  limit: number;
  isActive?: boolean;
}

export const agentApi = createApi({
  reducerPath: 'agentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Agents'],
  endpoints: (builder) => ({
    getAgents: builder.query<GetAgentsResponse['data'], AgentSortQueryParams>({
      query: (params) => ({
        url: `/agents`,
        params,
      }),
      transformResponse: (res: GetAgentsResponse) => res.data,
      providesTags: ['Agents'],
    }),
  }),
});

export const { useLazyGetAgentsQuery } = agentApi;
