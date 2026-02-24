import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';
import { appendAdmins, setAdmins, setAdminsMeta } from '@/store/slices/adminsSlice';

export type AdminUserType = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  status: string;
  isEmailEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
};

interface GetAdminsResponse extends Response {
  data: {
    admins: AdminUserType[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AdminSortQueryParams {
  search?: string;
  sortField?: string;
  sortOrder?: string;
  total?: number;
  page: number;
  limit: number;
  totalPages?: number;
  status?: string | null;
}

export interface ResendAdminInvitePayload {
  adminId: string;
  email: string;
}

export interface DeactivateAdminPayload {
  adminId: string;
}

export interface ToggleEmailEnabledPayload {
  adminId: string;
  isEmailEnabled: boolean;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Admins'],
  endpoints: (builder) => ({
    inviteAdmin: builder.mutation<Response, string>({
      query: (email) => ({
        url: `/admin/invite`,
        method: 'POST',
        data: {
          email,
        },
      }),
      invalidatesTags: ['Admins'],
    }),
    resendAdminInvite: builder.mutation<Response, ResendAdminInvitePayload>({
      query: (data) => ({
        url: `/admin/resend-invite`,
        method: 'POST',
        data,
      }),
    }),
    deactivateAdmin: builder.mutation<Response, DeactivateAdminPayload>({
      query: (data) => ({
        url: `/admin/deactivate`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Admins'],
    }),
    toggleEmailEnabled: builder.mutation<Response, ToggleEmailEnabledPayload>({
      query: (data) => ({
        url: `/admin/toggle-email-enabled`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Admins'],
    }),
    getAdmins: builder.query<GetAdminsResponse['data'], AdminSortQueryParams>({
      query: (params) => ({
        url: `/admin/list`,
        params,
      }),
      providesTags: ['Admins'],
      transformResponse: (res: GetAdminsResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          const { admins, meta } = result.data || {};
          if (meta.page > 1) {
            dispatch(appendAdmins(admins));
            dispatch(setAdminsMeta(meta));
          } else {
            dispatch(setAdmins({ data: admins, meta }));
          }
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
  }),
});

export const {
  useInviteAdminMutation,
  useLazyGetAdminsQuery,
  useResendAdminInviteMutation,
  useDeactivateAdminMutation,
  useToggleEmailEnabledMutation,
} = adminApi;
