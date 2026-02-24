import { createApi } from '@reduxjs/toolkit/query/react';
import { Subscription } from '@/store/slices/subscriptionSlice';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { setPatientActiveSubscription, SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { Response } from '@/lib/types';
import { PlanType } from '@/types/medications';

export interface SubscriptionsResponse extends Response {
  data: {
    subscriptions: Subscription[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ActiveSubscriptionResponse extends Response {
  data: SubscriptionsData;
}

export interface SubscriptionsSortQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: string;
  type?: PlanType;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  productType?: 'weight_loss' | 'longevity' | null;
}

export type CreateRecurringSubscriptionPayload = {
  price_id: string;
  paymentMethodId: string;
  medicineTypeId: string;
  couponCode?: string;
  address?: {
    billingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      street2: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
    shippingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      street2: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
  };
};

export type UpdateSubscriptionPayload = {
  subscriptionId: string;
  resumptionDate?: string;
};

export type UpdateSubscriptionBody = {
  subscriptionId: string;
  cancel_at_end: boolean;
  cancellationReason?: string;
};

export type CancelSubscriptionPayload = {
  subscriptionId: string;
  rating?: number;
  cancellationReason?: string;
};

export type UpgradePlanPayload = {
  currentPriceId: string;
  toSwitchPriceId: string;
  paymentMethodId: string;
  medicineTypeId: string;
};

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Subscriptions', 'ActiveSubscription'],
  endpoints: (builder) => ({
    getSubscriptions: builder.query<SubscriptionsResponse, SubscriptionsSortQueryParams>({
      query: ({ page, limit, search, sortOrder, sortField, type, status, startDate, endDate, productType }) => {
        const duration = sortField?.includes('duration: ') && parseInt(sortField.split('duration: ')[1]);
        return {
          url: '/billing/subscriptions',
          params: {
            page,
            limit,
            search,
            sortOrder,
            type,
            ...(status && { status }),
            ...(!duration && { sortField: sortField }),
            ...(duration && { duration }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            ...(productType && { productType }),
          },
        };
      },
      providesTags: ['Subscriptions'],
      keepUnusedDataFor: 1,
    }),

    getActiveSubscription: builder.query<ActiveSubscriptionResponse, void>({
      query: () => ({
        url: '/patients/subscription',
        method: 'GET',
      }),
      providesTags: ['ActiveSubscription'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPatientActiveSubscription(data.data));
        } catch (error) {
          console.error('Failed to fetch subscription:', error);
        }
      },
      keepUnusedDataFor: 60, // Increase to 60 seconds
    }),

    pauseSubscription: builder.mutation<Response, UpdateSubscriptionPayload>({
      query: ({ subscriptionId, resumptionDate }) => ({
        url: '/openpay/subscription/pause/' + subscriptionId,
        method: 'PATCH',
        data: resumptionDate ? { resumptionDate } : undefined,
      }),
    }),

    resumeSubscription: builder.mutation<Response, UpdateSubscriptionPayload>({
      query: ({ subscriptionId }) => ({
        url: '/openpay/subscription/resume/' + subscriptionId,
        method: 'PATCH',
      }),
    }),

    resumeScheduledSubscription: builder.mutation<Response, UpdateSubscriptionPayload>({
      query: ({ subscriptionId }) => ({
        url: '/openpay/subscription/cancel-pause/' + subscriptionId,
        method: 'PATCH',
      }),
    }),

    cancelSubscription: builder.mutation<Response, CancelSubscriptionPayload>({
      query: ({ subscriptionId, rating, cancellationReason }) => ({
        url: '/openpay/subscription/delete/' + subscriptionId,
        method: 'DELETE',
        data: {
          ...(rating !== undefined && { rating }),
          ...(cancellationReason && { cancellationReason }),
        },
      }),
    }),

    updateSubscription: builder.mutation<Response, UpdateSubscriptionBody>({
      query: ({ subscriptionId, cancel_at_end, cancellationReason }) => ({
        url: '/openpay/subscription/update/' + subscriptionId,
        method: 'PUT',
        data: {
          cancel_at_end,
          ...(cancellationReason && { cancellationReason }),
        },
      }),
    }),

    createRecurringSubscription: builder.mutation<Response, CreateRecurringSubscriptionPayload>({
      query: (data) => ({
        url: '/openpay/subscription/create',
        method: 'POST',
        data,
      }),
    }),
    upgradePlan: builder.mutation<Response, UpgradePlanPayload>({
      query: (data) => ({
        url: '/openpay/subscription/upgrade-plan',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['ActiveSubscription'],
    }),
  }),
});

export const {
  useLazyGetSubscriptionsQuery,
  useGetActiveSubscriptionQuery,
  usePauseSubscriptionMutation,
  useCancelSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCreateRecurringSubscriptionMutation,
  useResumeSubscriptionMutation,
  useResumeScheduledSubscriptionMutation,
  useUpgradePlanMutation,
} = subscriptionsApi;
