import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { AddressType, Response } from '@/lib/types';
import { PaymentMethod, setPaymentMethods } from '@/store/slices/paymentMethodsSlice';

type PaymentMethodsResponse = {
  data?: {
    paymentMethods: PaymentMethod[];
    currentPaymentMethodId?: string | null;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
} & Response;

export type UpdatePaymentMethodPayload = {
  id: string;
  address?: {
    billingAddress: AddressType;
    shippingAddress: AddressType;
  };
};

export const patientPaymentApiSlice = createApi({
  reducerPath: 'patientPaymentApiSlice',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['PaymentMethods'],
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentMethodsResponse['data'], void>({
      query: () => ({
        url: '/openpay/payment-methods',
      }),
      transformResponse: (res: PaymentMethodsResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setPaymentMethods(result.data?.paymentMethods || []));
        } catch (error) {
          console.log(error);
        }
      },
      providesTags: ['PaymentMethods'],
      keepUnusedDataFor: 1,
    }),
    updatePaymentMethod: builder.mutation<Response, UpdatePaymentMethodPayload>({
      query: ({ id, address }) => ({
        url: '/openpay/payment-method/' + id,
        method: 'PATCH',
        ...(address && { data: { address } }),
      }),
    }),
    deletePaymentMethod: builder.mutation<Response, string>({
      query: (id) => ({
        url: '/openpay/payment-method/' + id,
        method: 'DELETE',
      }),
    }),
    syncPatientWithOpenPayByCustomerId: builder.mutation<Response, { customer_id: string }>({
      query: (data) => ({
        url: '/openpay/sync/customer',
        method: 'POST',
        data,
      }),
    }),

  }),
});

export const { 
  useUpdatePaymentMethodMutation, 
  useDeletePaymentMethodMutation, 
  useGetPaymentMethodsQuery,
  useLazyGetPaymentMethodsQuery, 
  useSyncPatientWithOpenPayByCustomerIdMutation 
} = patientPaymentApiSlice;
