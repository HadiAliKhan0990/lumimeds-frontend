import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { CreatePaymentMethodResponse } from '@/services/paymentMethod/types';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Payment Link'],
  endpoints: (builder) => ({
    getPaymentLinkToken: builder.query<CreatePaymentMethodResponse, void>({
      query: () => ({
        url: `/openpay/payment-link`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useLazyGetPaymentLinkTokenQuery } = paymentApi;
