import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { PatientNote } from '@/store/slices/patientNoteSlice';
import { Response } from '@/lib/types';

export interface OrderNoteData {
  patientId: string;
  orderId: string;
  title: string;
  description: string;
  type: 'Order';
}

export interface EditOrderNoteData {
  id: string;
  title: string;
  description: string;
}

export interface ArchiveOrderNotesData {
  ids: string[];
  isDeleted: boolean;
}

export interface OrderNotesSortQueryParams {
  orderId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortField?: string;
  isDeleted?: boolean;
}

export interface OrderNotesResponse {
  notes: PatientNote[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export const orderNotesApi = createApi({
  reducerPath: 'orderNotesApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Order Notes'],
  endpoints: (builder) => ({
    getOrderNotes: builder.query<OrderNotesResponse, OrderNotesSortQueryParams>({
      query: (data) => {
        const { orderId, ...rest } = data;
        return {
          url: `/notes/${orderId}`,
          params: {
            ...rest,
            sortBy: rest.sortBy || 'DESC',
            sortField: rest.sortField || 'createdAt',
          },
        };
      },
      providesTags: ['Order Notes'],
      transformResponse: (res: { data: OrderNotesResponse }) => res.data,
      keepUnusedDataFor: 1,
    }),
    addOrderNote: builder.mutation<Response, OrderNoteData>({
      query: (data) => ({
        url: '/notes/create',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Order Notes'],
    }),
    editOrderNote: builder.mutation({
      query: (data: EditOrderNoteData) => {
        const { id, ...rest } = data;
        return {
          url: `/notes/update/${id}`,
          method: 'PATCH',
          data: rest,
        };
      },
      invalidatesTags: ['Order Notes'],
      transformResponse: (res: { success: boolean; message: string; data: unknown; statusCode: number }) => res,
    }),
    archiveOrderNotes: builder.mutation({
      query: (data: ArchiveOrderNotesData) => ({
        url: '/notes/archive',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Order Notes'],
      transformResponse: (res: { success: boolean; message: string; data: unknown; statusCode: number }) => res,
    }),
    deleteOrderNotes: builder.mutation({
      query: (ids: string[]) => ({
        url: '/notes/delete',
        method: 'DELETE',
        data: { ids },
      }),
      invalidatesTags: ['Order Notes'],
      transformResponse: (res: { success: boolean; message: string; data: unknown; statusCode: number }) => res,
    }),
  }),
});

export const {
  useGetOrderNotesQuery,
  useLazyGetOrderNotesQuery,
  useAddOrderNoteMutation,
  useEditOrderNoteMutation,
  useArchiveOrderNotesMutation,
  useDeleteOrderNotesMutation,
} = orderNotesApi;
