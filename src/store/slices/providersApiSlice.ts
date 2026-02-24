import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Provider } from '@/store/slices/providerSlice';
import { Response } from '@/lib/types';
import { UploadLicenseStatesPayload, UploadLicenseStatesResponse } from '@/types/licenseStates';

export interface ArchivedProvidersResponse {
  createdAt: string;
  email: string;
  id: string;
  isArchived: boolean;
  orderCount: number;
  provider: Provider | null;
  status: string;
}

export interface UpdateAutoOrdersPayload {
  providerId: string;
  autoOrdersLimit: number;
}

export interface ProvidersResponse extends Response {
  data: {
    providers: Provider[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ProviderSortQueryParams {
  search?: string;
  sortField?: string;
  sortOrder?: string;
  meta?: {
    total?: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
  status?: string | null;
}

export interface ProviderApprovalReportParams {
  startDate?: string;
  endDate?: string;
}

export const providersApi = createApi({
  reducerPath: 'providersApi',
  baseQuery: axiosBaseQuery(),
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
  tagTypes: ['Provider'],
  endpoints: (builder) => ({
    getProviders: builder.query<ProvidersResponse, ProviderSortQueryParams>({
      query: ({ search, sortField, sortOrder, meta, status }) => ({
        url: `/providers/list`,
        params: {
          search,
          sortField,
          sortOrder,
          status,
          page: meta?.page,
          limit: meta?.limit,
        },
      }),
      providesTags: ['Provider'],
      keepUnusedDataFor: 1,
    }),
    updateAutoOrdersLimit: builder.mutation<Response, UpdateAutoOrdersPayload>({
      query: (data) => ({
        url: `/providers/update-limit`,
        method: 'PATCH',
        data,
      }),
    }),
    inviteProviders: builder.mutation<Response, string>({
      query: (email) => ({
        url: `/providers/invite`,
        method: 'POST',
        data: {
          email,
        },
      }),
    }),
    updateProvider: builder.mutation({
      query: (data: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNo: string;
        password: string;
      }) => ({
        url: `/providers/${data.id}/status`,
        method: 'PATCH',
        data,
      }),
      // Avoid broad list refetch; component state should update optimistically or on explicit refresh
    }),
    createProviderSurvey: builder.mutation({
      query: () => ({
        url: `/providers/survey/create`,
        method: 'POST',
        data: {
          name: 'provider feedback',
          description: 'Comprehensive provider feedback survey',
          typeId: '84dbf4e0-0654-4b37-a757-3ab55a9ae4d1',
        },
      }),
    }),
    updateProviderStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/providers/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      // Avoid broad list refetch; component state should update optimistically or on explicit refresh
    }),
    getArchivedProviders: builder.query<ProvidersResponse, ProviderSortQueryParams>({
      query: ({ search, sortField, sortOrder, meta, status }) => ({
        url: `/providers/archived`,
        params: {
          search,
          sortField,
          sortOrder,
          status,
          page: meta?.page,
          limit: meta?.limit,
        },
      }),
      providesTags: ['Provider'],
      keepUnusedDataFor: 1,
    }),
    restoreProvider: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/providers/${id}/restore`,
        method: 'PATCH',
      }),
      // Avoid broad list refetch; component state should update optimistically or on explicit refresh
    }),
    archiveProviders: builder.mutation({
      query: (data: { providerIds: string[]; isArchived: boolean }) => ({
        url: `/providers/archive-provider`,
        method: 'PATCH',
        data,
      }),
    }),
    uploadLicensesStates: builder.mutation<UploadLicenseStatesResponse, UploadLicenseStatesPayload>({
      query: ({ providerId, data }) => ({
        url: `/providers/${providerId}/licenses/import`,
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        formData: true,
      }),
    }),

    pauseProvider: builder.mutation({
      query: (data: { providerId: string; isPaused: boolean }) => ({
        url: `/providers/pause-provider`,
        method: 'PATCH',
        data,
      }),
    }),

    suspendProvider: builder.mutation<Response, { userId: string; suspendReason: string }>({
      query: (data) => ({
        url: `/providers/suspend-provider`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Provider'],
    }),

    unsuspendProvider: builder.mutation<Response, { userId: string }>({
      query: (data) => ({
        url: `/providers/unsuspend-provider`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Provider'],
    }),

    toggleProviderAutomation: builder.mutation<Response, { providerId: string; toggleAutomation: boolean }>({
      query: (data) => ({
        url: `/providers/toggle-automation`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Provider'],
    }),

    exportProviderApprovalReport: builder.query<Blob, ProviderApprovalReportParams>({
      query: (params) => ({
        url: `/reports/provider-approval/export`,
        method: 'GET',
        params,
        responseType: 'blob',
      }),
      transformResponse: (response: Blob) => response,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetProvidersQuery,
  useLazyGetProvidersQuery,
  useInviteProvidersMutation,
  useUpdateProviderMutation,
  useCreateProviderSurveyMutation,
  useUpdateProviderStatusMutation,
  useArchiveProvidersMutation,
  useGetArchivedProvidersQuery,
  useLazyGetArchivedProvidersQuery,
  useRestoreProviderMutation,
  useUploadLicensesStatesMutation,
  usePauseProviderMutation,
  useUpdateAutoOrdersLimitMutation,
  useSuspendProviderMutation,
  useUnsuspendProviderMutation,
  useToggleProviderAutomationMutation,
  useLazyExportProviderApprovalReportQuery,
} = providersApi;
