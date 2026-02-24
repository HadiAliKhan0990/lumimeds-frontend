import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';

export interface Agent {
  id: string;
  name: string;
  email: string;
  info: {
    phone: string;
    languages: string[];
    specialty: string;
    department: string;
    availability: {
      [key: string]: string;
    };
    certifications: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentsResponse extends Response {
  data: {
    agents: Agent[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface AgentSortQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  isActive?: boolean;
}

export interface CreateAgentPayload {
  name: string;
  email: string;
  info: {
    phone: string;
    specialty?: string;
    department?: string;
    languages?: string[];
    certifications?: string[];
    availability?: {
      [key: string]: string;
    };
  };
  isActive?: boolean;
}

export interface UpdateAgentPayload {
  name: string;
  info: {
    phone: string;
    specialty?: string;
    department?: string;
    languages?: string[];
    certifications?: string[];
    availability?: {
      [key: string]: string;
    };
  };
  isActive?: boolean;
}

export interface UpdateAgentResponse extends Response {
  data: { agent: Agent };
}

export const agentsApi = createApi({
  reducerPath: 'agentsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Agents'],
  endpoints: (builder) => ({
    getAgents: builder.query<AgentsResponse, AgentSortQueryParams>({
      query: (params) => ({
        url: '/agents',
        params,
      }),
      providesTags: ['Agents'],
    }),
    createAgent: builder.mutation<{ data: { agent: Agent } }, CreateAgentPayload>({
      query: (data) => ({
        url: '/agents',
        method: 'POST',
        data,
      }),
    }),
    updateAgent: builder.mutation<UpdateAgentResponse, { id: string; data: UpdateAgentPayload }>({
      query: ({ id, data }) => ({
        url: `/agents/${id}`,
        method: 'PATCH',
        data,
      }),
    }),
  }),
});

export const { useLazyGetAgentsQuery, useCreateAgentMutation, useUpdateAgentMutation } = agentsApi;

// Redux action to update agent in store
export const updateAgentInStore = (updatedAgent: Agent) => ({
  type: 'agents/updateAgent',
  payload: updatedAgent,
});
