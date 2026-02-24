import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';

export type AddNewAddressPayload = {
  email: string;
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
  paymentMethodId: string;
};

export interface SendIntakeFormResponse {
  success: boolean;
  message: string;
  data: SendIntakeFormResponseData;
}
export interface SendIntakeFormResponseData {
  surveyData: SendIntakeFormResponseSurveyData[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SendIntakeFormResponseSurveyData {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: SendIntakeFormResponseCreatedBy;
  totalResponses: number;
  isSystemGenerated: boolean;
  surveyPublicUrl: string | null;
  type: SendIntakeFormResponseType;
}

export interface SendIntakeFormResponseCreatedBy {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface SendIntakeFormResponseType {
  id: string;
  name: string;
  type: string;
}

export interface SendIntakeFormQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface SendIntakeFormPayload {
  patientId: string;
  surveyIds: string[];
  orderId?: string;
}

export interface AssignedForm {
  id: string;
  surveyId: string;
  surveyName: string;
  surveyType: string;
  surveyTypeEnum: string | null;
  assignedDate: string;
  surveyUrl: string | null;
  metadata: {
    orderId?: string;
    type?: 'intake' | 'renewal';
    uniqueOrderId?: string;
  } | null;
}

export interface RemoveAssignedFormPayload {
  patientId: string;
  submissionId: string;
}
export interface TrustpilotLogInfo {
  id: string;
  patientId: string;
  adminId: string;
  action: string;
  requestPayload: {
    link?: string;
    adminId?: string;
    content?: string;
    patientId?: string;
  };
  responsePayload: {
    trustPilotReviewLink?: string;
  };
  errorMessage: string | null;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  admin: {
    id: string;
    email: string;
  };
}
export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['SingleOrder', 'AssignedForms'],
  endpoints: (builder) => ({
    addPatientNewAddress: builder.mutation<void, AddNewAddressPayload>({
      query: (data) => ({
        url: '/patients/add-new-address',
        method: 'POST',
        data
      })
    }),
    getPatientSendIntakeForms: builder.query<SendIntakeFormResponse['data'], SendIntakeFormQueryParams>({
      query: (data) => ({
        url: 'patients/get-surveys',
        method: 'GET',
        params: data
      }),
      transformResponse: (res: SendIntakeFormResponse) => res.data
    }),
    sendPatientIntakeForm: builder.mutation<Response, SendIntakeFormPayload>({
      query: (data) => ({
        url: 'patients/add-intake-submission',
        method: 'POST',
        data
      })
    }),
    getTrustpilotLogs: builder.query<
      Response & {
      data: {
        logs: Array<TrustpilotLogInfo>;
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    },
      { patientId: string; page?: number; limit?: number; sortOrder?: 'ASC' | 'DESC' }
    >({
      query: ({ patientId, page = 1, limit = 10, sortOrder = 'DESC' }) => ({
        url: `/patients/${patientId}/trustpilot-logs`,
        method: 'GET',
        params: { page, limit, sortOrder },
      }),
      providesTags: (_result, _error, { patientId }) => [{ type: 'SingleOrder', id: patientId }],
      keepUnusedDataFor: 60
    }),
    getPatientAssignedForms: builder.query<AssignedForm[], string>({
      query: (patientId) => ({
        url: `/patients/${patientId}/assigned-forms`,
        method: 'GET',
      }),
      providesTags: (_result, _error, patientId) => [
        { type: 'SingleOrder', id: patientId },
        { type: 'AssignedForms', id: patientId },
      ],
      transformResponse: (res: Response & { data: AssignedForm[] }) => {
        if (res && res.data) {
          return Array.isArray(res.data) ? res.data : [];
        }
        return [];
      },
    }),
    removeAssignedForm: builder.mutation<Response, RemoveAssignedFormPayload>({
      query: ({ patientId, submissionId }) => ({
        url: `/patients/${patientId}/remove-assigned-form/${submissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { patientId }) => [
        { type: 'SingleOrder', id: patientId },
        { type: 'AssignedForms', id: patientId },
      ],
    })
  })
});

export const {
  useAddPatientNewAddressMutation,
  useGetPatientSendIntakeFormsQuery,
  useSendPatientIntakeFormMutation,
  useLazyGetPatientSendIntakeFormsQuery,
  useLazyGetTrustpilotLogsQuery,
  useGetPatientAssignedFormsQuery,
  useRemoveAssignedFormMutation
} = patientApi;
