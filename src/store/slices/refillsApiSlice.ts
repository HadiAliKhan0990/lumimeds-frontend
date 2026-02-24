import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { AddressValues, OrderRefillSurveyPayload } from '@/types/refillForm';
import { QuestionType } from '@/lib/enums';
import { Response } from '@/lib/types';
import { BillingInterval, PlanType } from '@/types/medications';

// Survey request status
export type SurveyRequestStatus = 'open' | 'on_hold' | 'approved' | 'rejected';

// Base response interface
interface BaseResponse {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  isHighlighted: boolean;
}

// Text response
export interface TextResponse extends BaseResponse {
  answer: string;
}

// Single choice response (raw)
export interface SingleChoiceResponse extends BaseResponse {
  answer: string;
  options: string[];
}

// Multiple choice response (raw)
export interface MultipleChoiceResponse extends BaseResponse {
  answer: string[];
  options: string[];
}

// Union type for all response types
export type SurveyResponse = TextResponse | SingleChoiceResponse | MultipleChoiceResponse;

// Formatted option with checked state
export interface FormattedOption {
  checked: boolean;
  text: string;
}

// Formatted text response
export interface FormattedTextResponse extends BaseResponse {
  answer: string;
}

// Formatted single choice response
export interface FormattedSingleChoiceResponse extends BaseResponse {
  answer: string;
  options: FormattedOption[];
}

// Formatted multiple choice response
export interface FormattedMultipleChoiceResponse extends BaseResponse {
  answer: string[];
  options: FormattedOption[];
}

// Union type for all formatted response types
export type FormattedSurveyResponse =
  | FormattedTextResponse
  | FormattedSingleChoiceResponse
  | FormattedMultipleChoiceResponse;

// Order information
export interface RefillSurveyOrder {
  id?: string;
  orderUniqueId?: string;
  productName?: string | null;
  category?: string;
  dosageType?: string;
  planType?: PlanType;
  medicineType?: string;
  metadata?: {
    planTier?: string | null;
    intervalCount?: number;
    billingInterval?: BillingInterval;
  };
}

export interface SubmitOrderRefillSurveyOrder {
  id: string;
  productName: string;
  orderUniqueId: string;
  status: string;
  trackingNumber: string | null;
  productType: {
    name: string;
    category: string;
    medicineType: string;
    planType: PlanType;
    dosageType: string;
    metadata: {
      planTier?: string | null;
      intervalCount: number;
      billingInterval: BillingInterval;
    };
    image: string;
  };
}

// Patient information
export interface RefillSurveyPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

// Replacement price
export interface ReplacementPrice {
  id: string;
  amount: string;
  status: 'active' | 'inactive';
}

// Main refill survey request interface
export interface RefillSurveyRequest {
  id: string;
  status: SurveyRequestStatus;
  remarks: string | null;
  responses: SurveyResponse[];
  formattedResponses: FormattedSurveyResponse[];
  address: AddressValues | null;
  createdAt: string;
  updatedAt: string;
  order?: RefillSurveyOrder;
  patient: RefillSurveyPatient;
  replacementPrice: ReplacementPrice | null;
  replacementPrices: ReplacementPrice[];
  refillOrderId?: string | null;
  refillOrderUniqueId?: string | null;
  orderId: string;
  patientId: string;
  statusInfo: {
    status: SurveyRequestStatus;
    statusUpdatedAt: string;
  };
  vialsRequested: number;
  uniqueRefillId?: string;
  isQueueEligible?: boolean;
}
export interface SubmitOrderRefillSurveyRequest {
  id: string;
  status: SurveyRequestStatus;
  remarks: string | null;
  responses: SurveyResponse[];
  formattedResponses: FormattedSurveyResponse[];
  address: AddressValues | null;
  createdAt: string;
  updatedAt: string;
  order?: SubmitOrderRefillSurveyOrder;
  patient: RefillSurveyPatient;
  replacementPrice: ReplacementPrice | null;
  replacementPrices: ReplacementPrice[];
  refillOrderId?: string | null;
  refillOrderUniqueId?: string | null;
  orderId: string;
  patientId: string;
  statusInfo: {
    status: SurveyRequestStatus;
    statusUpdatedAt: string;
  };
  vialsRequested: number;
}

export interface RefillSurveyRequestResponse {
  requests: RefillSurveyRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RefillSurveyRequestsResponse extends Response {
  data: RefillSurveyRequestResponse;
}

export interface RefillSurveyRequestsParams {
  page: number;
  limit: number;
  search?: string;
  sortOrder?: string;
  status?: string;
  productType?: 'weight_loss' | 'longevity';
}

// Refill proposal status enum
export enum RefillProposalStatus {
  ACCEPT = 'accepted',
  REJECT = 'rejected',
}

// Refill proposal payload
export interface RefillProposalPayload {
  status: RefillProposalStatus;
  paymentMethodId?: string;
}

// Update refill status payload
export interface UpdateRefillStatusPayload {
  status: SurveyRequestStatus;
  replacementPriceId?: string;
  remarks?: string;
}

// Update remarks payload
export interface UpdateRemarksPayload {
  remarks: string;
  refillRequestId: string;
}

export interface RefillRequestResponse extends Response {
  data: RefillSurveyRequest | null;
}

export interface SubmitOrderRefillSurveyResponse extends Response {
  data: SubmitOrderRefillSurveyRequest;
}

export interface CheckExistingRefillResponse extends Response {
  data: {
    exists: boolean;
    refillRequest: RefillSurveyRequest | null;
  };
}

export const refillsApi = createApi({
  reducerPath: 'refillsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Refills'],
  endpoints: (builder) => ({
    getRefillSurveyRequests: builder.query<RefillSurveyRequestsResponse, RefillSurveyRequestsParams>({
      query: (params) => ({
        url: '/surveys/refill-survey-requests',
        params,
      }),
      providesTags: ['Refills'],
      keepUnusedDataFor: 1,
    }),

    updateRefillProposal: builder.mutation<
      RefillRequestResponse,
      { refillRequestId: string; payload: RefillProposalPayload }
    >({
      query: ({ refillRequestId, payload }) => ({
        url: `/surveys/${refillRequestId}/refill-proposal`,
        method: 'PATCH',
        data: payload,
      }),
    }),

    updateRefillStatus: builder.mutation<
      RefillRequestResponse,
      { refillRequestId: string; payload: UpdateRefillStatusPayload }
    >({
      query: ({ refillRequestId, payload }) => ({
        url: `/surveys/${refillRequestId}/refill-request`,
        method: 'PATCH',
        data: payload,
      }),
    }),

    submitOrderRefillSurvey: builder.mutation<SubmitOrderRefillSurveyResponse, OrderRefillSurveyPayload>({
      query: (data) => ({
        url: `surveys/submit-refill`,
        method: 'POST',
        data,
      }),
    }),

    updateRefillRemarks: builder.mutation<RefillRequestResponse, UpdateRemarksPayload>({
      query: ({ refillRequestId, remarks }) => ({
        url: `/surveys/${refillRequestId}/refill-request-remarks`,
        method: 'PATCH',
        data: { remarks },
      }),
    }),

    checkExistingRefill: builder.query<CheckExistingRefillResponse, string>({
      query: (orderId) => ({
        url: `/surveys/check-existing-refill/${orderId}`,
      }),
    }),
  }),
});

export const {
  useLazyGetRefillSurveyRequestsQuery,
  useUpdateRefillProposalMutation,
  useUpdateRefillStatusMutation,
  useSubmitOrderRefillSurveyMutation,
  useUpdateRefillRemarksMutation,
  useLazyCheckExistingRefillQuery,
} = refillsApi;
