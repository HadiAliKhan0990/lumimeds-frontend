import { createApi } from '@reduxjs/toolkit/query/react';
import { Invoice } from '@/store/slices/invoiceSlice';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { setInvoicesData } from '@/store/slices/invoicesSlice';
import { SortState } from '@/store/slices/sortSlice';
import { Response } from '@/lib/types';

export interface InvoicesResponse extends Response {
  data: {
    invoiceData: Invoice[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface PatientInvoicesResponse extends Response {
  data: {
    invoiceData: Invoice[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface SingleInvoiceResponse extends Response {
  data: Invoice;
}

export interface InvoicesSortQueryParams {
  page?: number | null;
  limit?: number | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  status?: string | null;
  search?: string | null;
  sortField?: string | null;
}

interface PatientInvoicesQueryParams {
  meta?: {
    total?: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
  sortOrder?: string;
  sortStatus?: string | null;
  search?: string;
}

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Invoices', 'SingleInvoice', 'PatientInvoices'],
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoicesResponse, InvoicesSortQueryParams>({
      query: (params) => ({
        url: '/billing/invoices',
        params,
      }),
      providesTags: ['Invoices'],
      keepUnusedDataFor: 1, // for pagination issues not refetching on previous pages
    }),
    getPatientInvoices: builder.query<PatientInvoicesResponse['data'], PatientInvoicesQueryParams>({
      query: ({ meta, sortOrder, sortStatus, search }) => ({
        url: '/billing/patient-invoices',
        params: {
          page: meta?.page,
          limit: meta?.limit,
          sortOrder,
          search,
          ...(sortStatus && { status: sortStatus }),
        },
      }),
      providesTags: ['PatientInvoices'],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          const { invoiceData, page, total, totalPages } = result.data || {};
          dispatch(setInvoicesData({ data: invoiceData, meta: { page, total, totalPages } as SortState['meta'] }));
        } catch (error) {
          console.log(error);
        }
      },
      transformResponse: (res: PatientInvoicesResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getInvoiceById: builder.query<SingleInvoiceResponse['data'], string>({
      query: (id) => ({
        url: `/billing/invoice/${id}`,
      }),
      transformResponse: (res: SingleInvoiceResponse) => res.data,
      providesTags: (result, error, id) => [{ type: 'SingleInvoice', id }],
    }),
  }),
});

export const { useLazyGetInvoicesQuery, useLazyGetPatientInvoicesQuery, useGetInvoiceByIdQuery } = invoicesApi;
