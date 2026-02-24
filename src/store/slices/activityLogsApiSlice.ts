import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';

export type ActivityLogPayload = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined;

// Types for Activity Logs
export interface ActivityLog {
  id: string;
  userId: string;
  userRole: string;
  userEmail: string;
  userName: string;
  method: string;
  endpoint: string;
  requestBody: ActivityLogPayload;
  requestQuery: ActivityLogPayload;
  requestParams: ActivityLogPayload;
  statusCode: number;
  errorMessage: string | null;
  responseTime: number;
  ipAddress: string;
  createdAt: string;
}

export interface ActivityLogsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityLogsResponse {
  success: boolean;
  message: string;
  data: {
    logs: ActivityLog[];
    meta: ActivityLogsMeta;
  };
  statusCode: number;
}

export interface ActivityLogsUserResponse {
  success: boolean;
  message: string;
  data: {
    data: ActivityLog[];
    meta: ActivityLogsMeta;
  };
  statusCode: number;
}

export interface ActivityLogsQueryParams {
  role: 'admin' | 'patient' | 'provider';
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityLogsUserSearchParams {
  email: string;
  page?: number;
  limit?: number;
}

export const activityLogsApi = createApi({
  reducerPath: 'activityLogsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['ActivityLogs'],
  endpoints: (builder) => ({
    getActivityLogs: builder.query<ActivityLogsResponse['data'], ActivityLogsQueryParams>({
      query: ({ role, page = 1, limit = 50, search, sortField, sortOrder }: ActivityLogsQueryParams) => ({
        url: '/activity-logs',
        params: {
          role,
          page,
          limit,
          ...(search && { search }),
          ...(sortField && { sortField }),
          ...(sortOrder && { sortOrder }),
        },
      }),
      providesTags: ['ActivityLogs'],
      transformResponse: (res: ActivityLogsResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getActivityLogsByUser: builder.query<{ logs: ActivityLog[]; meta: ActivityLogsMeta }, ActivityLogsUserSearchParams>(
      {
        query: ({ email, page = 1, limit = 10 }: ActivityLogsUserSearchParams) => ({
          url: '/activity-logs/user',
          params: {
            email,
            page,
            limit,
          },
        }),
        providesTags: ['ActivityLogs'],
        transformResponse: (res: ActivityLogsUserResponse) => ({ logs: res.data.data, meta: res.data.meta }),
        keepUnusedDataFor: 1,
      }
    ),
  }),
});

export const { useLazyGetActivityLogsQuery, useLazyGetActivityLogsByUserQuery } = activityLogsApi;
