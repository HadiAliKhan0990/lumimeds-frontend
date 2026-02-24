import { createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getCachedAuth } from '@/lib/baseQuery';
export interface CalendlyDoctorStatus {
  authorized: boolean;
  tokenExpired: boolean;
  connectedAt: string;
  selectedEventTypeUri: string | null;
  hasConsultationEvent: boolean;
}
export interface CalendlyConnection {
  id: string;
  accessToken: string;
  userUri: string;
  schedulingUrl: string;
  isActive: boolean;
}
// Custom base query for Calendly service (localhost:3001)
// Includes current user's authentication token
const calendlyBaseQuery =
  () =>
  async ({ url, method, data, params, headers, skipAuth }: AxiosRequestConfig & { skipAuth?: boolean }) => {
    try {
      // Get current user's authentication token
      const { accessToken } = await getCachedAuth();

      // For Calendly endpoints, use base URL without /api prefix since deployed backend doesn't use it
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const calendlyBaseURL = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;

      const result = await axios.request({
        baseURL: calendlyBaseURL,
        url,
        method,
        data,
        params,
        headers: {
          ...headers,
          // Include authentication token for all requests
          ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      return { data: result.data };
    } catch (axiosError: unknown) {
      return {
        error: {
          status: (axiosError as AxiosError).response?.status,
          data: (axiosError as AxiosError).response?.data || (axiosError as unknown as Error).message,
        },
      };
    }
  };
export const calendlyApi = createApi({
  reducerPath: 'calendlyApi',
  baseQuery: calendlyBaseQuery(),
  tagTypes: ['CalendlyConnection', 'CalendlyDoctorStatus'],
  endpoints: (builder) => ({
    // Get doctor's Calendly status
    getCalendlyDoctorStatus: builder.query<CalendlyDoctorStatus, string>({
      query: (doctorId) => ({
        url: `/calendly/doctor/${doctorId}/status`,
      }),
      providesTags: ['CalendlyDoctorStatus'],
    }),
    // OAuth callback - Includes current user's authentication
    connectCalendly: builder.mutation<CalendlyDoctorStatus, { code: string; doctorId: string }>({
      query: ({ code, doctorId }) => ({
        url: `/calendly/callback?code=${code}&state=${doctorId}`,
        method: 'GET',
      }),
      invalidatesTags: ['CalendlyDoctorStatus'],
    }),
    // Legacy endpoints (keeping for compatibility)
    getCalendlyConnection: builder.query<CalendlyConnection, void>({
      query: () => ({
        url: '/calendly/connection',
      }),
      providesTags: ['CalendlyConnection'],
    }),
    disconnectCalendly: builder.mutation<void, void>({
      query: () => ({
        url: '/calendly/disconnect',
        method: 'DELETE',
      }),
      invalidatesTags: ['CalendlyConnection', 'CalendlyDoctorStatus'],
    }),
  }),
});
export const {
  useGetCalendlyDoctorStatusQuery,
  useConnectCalendlyMutation,
  useGetCalendlyConnectionQuery,
  useDisconnectCalendlyMutation,
} = calendlyApi;
