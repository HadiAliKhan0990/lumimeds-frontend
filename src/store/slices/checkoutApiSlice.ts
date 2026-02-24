import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { PatientSurveyValidationType, Response } from '@/lib/types';
import { Patient } from '@/store/slices/patientSlice';
import { QuestionType } from '@/lib/enums';
import { CheckoutType } from '@/store/slices/productTypeSlice';

export interface CheckoutLineItem {
  id: string;
  object: string;
  created_at: string;
  updated_at: string;
  is_deleted: false;
  amount_subtotal_atom: number;
  amount_total_atom: number;
  checkout_session_id: string;
  description: string;
  currency: string;
  price_id: string;
  billing_interval: number | null;
  billing_interval_count: number | null;
  quantity: number;
}

export interface CheckoutSessionResponseData {
  id: string;
  object: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  account_id: string;
  account_name: string;
  amount_subtotal_atom: number;
  amount_total_atom: number;
  client_reference_id: string | null;
  coupon_id: string | null;
  currency: string;
  customer_id: string | null;
  customer_email: string | null;
  line_items: CheckoutLineItem[];
  mode: string;
  return_url: string | null;
  secure_token: string;
  setup_intent: unknown;
  status: string;
  subscription_id: string | null;
  success_url: string | null;
  tax_amount_atom: number;
  url: string;
  trial_end: unknown;
  trial_period_days: number | null;
  trial_from_price: number | null;
}

export interface CheckoutSessionResponse extends Response {
  data: CheckoutSessionResponseData;
}

export type CreateCheckoutSessionPayload = {
  priceId: string | null;
  currency: string;
  email: string;
  mode: string;
  productId: string | null;
  surveyId: string;
  couponCode?: string;
  overrideTime?: boolean;
};

export type PatientAddressData = Pick<Patient, 'address' | 'email'>;

export type CouponDataType = {
  originalAmount: number;
  amountAfterDiscount: number;
  discountAmount: number;
  discountType: string;
};

export interface CouponResponse extends Response {
  data: CouponDataType;
}

export type PublicIntakeSurveyResponseParams = {
  priceId: string;
  id: string;
};

export type UpdateIntakeSurveyResponse = {
  data: {
    message: string;
    medicalFormUrl: string | null;
    telepathInstructionsUrl?: string | null;
  };
} & Response;

export type AnswersResponse = {
  answer: string;
  position: number;
  isDefault: boolean;
  isRequired: boolean;
  questionId: string;
  validation: PatientSurveyValidationType;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  isHighlighted?: boolean;
};

export type CheckUserEmailResponse = {
  data?: {
    id: string;
    surveyId: string;
    submittedById: string;
    submittedByType: string;
    responses: AnswersResponse[];
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    surveyUrl: string | null;
    submittedByEmail: string;
    isSurveyCompleted: boolean;
  };
} & Response;

export type CheckUserEmailPayload = {
  email: string;
  surveyId: string;
  fromPortal?: boolean;
};

type AddressSchema = {
  firstName: string;
  lastName: string;
  city: string;
  region: string;
  street: string;
  street2: string | undefined;
  zip: string;
  state: string;
};

export type AddPatientAddressPayload = {
  email: string;
  address: {
    billingAddress: AddressSchema;
    shippingAddress: AddressSchema;
  };
  newEmailAddress?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
};

export type CreatePatientOnCheckoutPayload = {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  address: {
    billingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
    shippingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
  };
};

export interface CreatePatientOnCheckoutPayloadResponse extends Response {
  data: {
    existingSubscriptionId: string | null;
  };
}

export type CancelSubscriptionPayloadType = {
  checkoutType: CheckoutType;
  subscriptionId: string;
};

export type IntakeSurveyUrlResponse = {
  data: {
    surveyUrl: string;
    found: boolean;
  };
} & Response;

export type IntakeSurveyUrlParams = {
  email: string;
};

export const checkoutApi = createApi({
  reducerPath: 'checkoutApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [],
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, CreateCheckoutSessionPayload>({
      query: (payload) => ({
        url: '/openpay/checkout',
        method: 'POST',
        data: payload,
        skipAuth: true,
      }),
    }),

    addPatientAddress: builder.mutation<Response, AddPatientAddressPayload>({
      query: (data: PatientAddressData) => ({
        url: '/patients/add-patient-address',
        method: 'POST',
        data,
        skipAuth: true,
      }),
    }),

    applyCoupon: builder.mutation<CouponResponse, { priceId: string; couponCode: string; patientId?: string; overrideTime?: boolean }>({
      query: (data) => ({
        url: '/openpay/coupon',
        method: 'POST',
        data,
        skipAuth: true,
      }),
    }),

    updateIntakeSurveySubmission: builder.mutation<UpdateIntakeSurveyResponse, PublicIntakeSurveyResponseParams>({
      query: ({ id, priceId }) => ({
        url: `/patients/survey/${id}`,
        method: 'PATCH',
        data: { priceId },
        skipAuth: true,
      }),
    }),

    checkUserEmail: builder.mutation<CheckUserEmailResponse, CheckUserEmailPayload>({
      query: (data) => ({
        url: '/patients/check-email',
        method: 'POST',
        data,
        skipAuth: true,
      }),
    }),

    createOrUpdatePatient: builder.mutation<CreatePatientOnCheckoutPayloadResponse, CreatePatientOnCheckoutPayload>({
      query: (data) => ({
        url: '/patients/create-patient',
        method: 'POST',
        data,
        skipAuth: true,
      }),
    }),

    cancelSubscription: builder.mutation<Response, CancelSubscriptionPayloadType>({
      query: ({ subscriptionId, checkoutType }) => ({
        url: `/openpay/subscription/cancel/${subscriptionId}`,
        method: 'PATCH',
        skipAuth: true,
        data: { checkoutType },
      }),
    }),

    getIntakeSurveyUrl: builder.query<IntakeSurveyUrlResponse, IntakeSurveyUrlParams>({
      query: ({ email }) => ({
        url: '/surveys/intake-survey-url',
        method: 'GET',
        params: { email },
        skipAuth: true,
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useAddPatientAddressMutation,
  useApplyCouponMutation,
  useUpdateIntakeSurveySubmissionMutation,
  useCheckUserEmailMutation,
  useCreateOrUpdatePatientMutation,
  useCancelSubscriptionMutation,
  useLazyGetIntakeSurveyUrlQuery,
} = checkoutApi;
