import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { ProviderDashboardResponse, ProviderDashboardStats } from '@/lib/types/providerDashboard';

export const providerDashboardApi = createApi({
  reducerPath: 'providerDashboardApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['ProviderDashboard'],
  endpoints: (builder) => ({
    getProviderDashboardStats: builder.query<ProviderDashboardStats, void>({
      query: () => ({
        url: `/dashboard/provider`,
        method: 'GET',
      }),
      providesTags: ['ProviderDashboard'],
      transformResponse: (response: ProviderDashboardResponse) => response.data,
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Failed to fetch provider dashboard stats:', error);
        }
      },
    }),
  }),
});

export const { useGetProviderDashboardStatsQuery } = providerDashboardApi;
