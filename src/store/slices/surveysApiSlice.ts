import { createApi } from '@reduxjs/toolkit/query/react';
import { setSurvey, Survey } from '@/store/slices/surveySlice';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { setSurveysData } from '@/store/slices/surveysSlice';
import { SurveyType } from '@/store/slices/surveyTypeSlice';
import { setSurveyTypes } from '@/store/slices/surveyTypesSlice';
import { setSurveyResponses } from '@/store/slices/surveyResponsesSlice';
import { setSurveyResponse } from '@/store/slices/surveyResponseSlice';
import { setSurveyQuestions } from '@/store/slices/surveyQuestionsSlice';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { ProductPrice } from '@/store/slices/productTypeSlice';
import { CompletedSurvey, PatientSurveyAnswerType, Response, SurveyAnswer, TelegraSurveyQuestion } from '@/lib/types';
import { SortState } from '@/store/slices/sortSlice';
import { TextInputType } from '@/lib/enums';
import { AnswersResponse } from '@/store/slices/checkoutApiSlice';
import { GetMappingModelsParams, GetMappingModelsResponse } from '@/types/survey';
import { setMappingModels } from '@/store/slices/formBuilderSlice';

export interface SurveysResponse extends Response {
  data: {
    surveyData: Survey[];
    total?: number | null;
    page?: number | null;
    totalPages?: number | null;
  };
}

export interface QuestionResponse extends Response {
  data: SurveyQuestion;
}

export interface SubmissionLogsResponse extends Response {
  data: {
    logs: Array<{
      id: string;
      updatedBy: {
        id: string;
        firstName: string;
        lastName: string;
        userRole: string;
      };
      updatedAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  surveyName: string;
  submittedById: string;
  submittedByType: string;
  submittedByName: string;
  submittedByEmail: string;
  responses: Array<{
    answer: string | string[];
    position: number;
    isDefault: boolean;
    isRequired: boolean;
    questionId: string;
    validation?: string;
    questionText: string;
    questionType: string;
    options?: string[];
  }>;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  surveyType: {
    id: string;
    name: string;
    type: string;
  };
}

export interface SurveySubmissionsResponse extends Response {
  data: {
    submissions: SurveySubmission[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PatientSurveysResponse extends Response {
  data?: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    questions?: SurveyQuestion[];
    createdAt: string;
    generationType: boolean;
    type: {
      id: string;
      name: string;
      description: string;
      isActive: boolean;
    };
    patientId: string;
    productId: string;
    productName: string;
    isSurveyCompleted?: boolean;
  };
}

export type RefillQuestion = {
  id: string;
  metaData?: {
    previous?: number;
    nextByAnswer?: {
      [key: string]: number;
    };
    conditional?: {
      showIf: string;
      dependsOn: number;
    };
    addressField?: 'shippingAddress';
  };
  options?: string[];
  position: number;
  isDefault: boolean;
  isRequired: boolean;
  validation: TextInputType;
  description: string;
  questionText: string;
  questionType: string;
};

export interface RefillSurveyResponse extends Response {
  data?: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    questions?: RefillQuestion[];
    createdAt: string;
    generationType: boolean;
    type: {
      id: string;
      name: string;
      description: string;
      isActive: boolean;
    };
  };
}

export interface TelegraSurveysResponse extends Response {
  data?: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    questions?: TelegraSurveyQuestion[];
    createdAt: string;
    generationType: boolean;
    type: {
      id: string;
      name: string;
      description: string;
      isActive: boolean;
    };
    patientId: string;
    productId: string;
    productName: string;
  };
}

export type PendingSurvey = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  surveyUrl: string;
  expiryDate: string | null;
  isSubmissionRequired: boolean;
  orderId?: string;
  submissionMetadata?: {
    orderId?: string;
    uniqueOrderId?: string;
    type?: 'intake' | 'renewal';
  } | null;
  type: {
    id: string;
    name: string;
    type: string;
  };
};

export interface PendingSurveysResponse extends Response {
  data: {
    surveys?: PendingSurvey[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CompletedSurveysResponse extends Response {
  data: {
    responses: CompletedSurvey[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SurveyTypesResponse extends Response {
  data: SurveyType[];
}

export type ProductSurvey = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdById: string;
  type: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    type: string;
    createdAt: string;
    updatedAt: string;
    isDefault: boolean;
  };
  typeId: string;
  questions: Array<{
    id: string;
    options: string[];
    position: number;
    isDefault: boolean;
    isRequired: boolean;
    validation: string;
    description: string | null;
    questionText: string;
    questionType: string;
    validationRules: string | null;
  }>;
  isSystemGenerated: false;
  createdAt: string;
  updatedAt: string;
  surveyToken: string | null;
};

export type ProductSurveysData = {
  surveys: ProductSurvey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface ProductSurveysResponse extends Response {
  data: ProductSurveysData;
}

export type FormSubmissionsType = 'PRODUCT_INTAKE' | 'GENERAL' | 'PRODUCT_REFILL' | 'PROVIDER_INTAKE';

export interface SurveysSortQueryParams {
  page?: number | null;
  limit?: number | null;
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  type?: FormSubmissionsType;
}

export interface PatientSurveysParams {
  id?: string | string[];
  token?: string | null;
  email?: string | null;
}

export interface RefillSurveysParams {
  surveyId: string | null;
  token: string | null;
}

export interface SurveyResponseParams {
  id: string;
  search?: string;
  sortOrder?: string;
}

export interface AddSurveyParams {
  name?: string | null;
  description?: string | null;
  typeId?: string | null;
  questions?: SurveyQuestion[] | null;
}

export interface GeneralSurveyPayload {
  id: string;
  data: { email?: string; answers: SurveyAnswer[] };
}

export interface RefillSurveyPayload {
  orderId: string | null;
  surveyId: string | null;
  email: string | null;
  answers: Omit<PatientSurveyAnswerType, 'isValid'>[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2: string;
    city: string;
    region: string;
    state: string;
    zip: string;
  } | null;
}

export interface SubmitResponsePayload {
  surveyId: string;
  patientId: string;
  answers: Omit<SurveyAnswer, 'isValid'>[];
  isSurveyCompleted?: boolean;
  patientEmail?: string;
  submissionId?: string;
}

export interface SubmitPendingIntakeAnswer {
  questionId: string;
  isRequired: boolean;
  answer: string | string[] | Date | File | null | undefined;
  otherText?: string;
}

export interface SubmitPendingIntakeResponsePayload {
  surveyId: string;
  answers: SubmitPendingIntakeAnswer[];
  isSurveyCompleted: boolean;
  patientEmail: string;
}

export type SubmitResponse = {
  data: { id: string };
} & Response;

export interface SubmitPendingIntakeResponse extends Response {
  data: {
    id: string;
    surveyId: string;
    patientId: string;
    responses: AnswersResponse[];
    isCompleted: boolean;
    isSurveyCompleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PatientTelegraSurveySubmitPayload {
  surveyId: string;
  email: string;
  token: string;
  answers: {
    questionId: string;
    answer: string | string[];
    isRequired: boolean | null | undefined;
  }[];
  productId: string;
}

export interface SingleSurveyResponse extends Response {
  data?: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    questions: SurveyQuestion[];
    createdAt: string;
    generationType: boolean;
    type: {
      id: string;
      name: string;
      description: string;
      isActive: boolean;
    };
    isSurveyCompleted?: boolean;
  };
}

export type SingleSurveyResponseParams = {
  surveyId: string;
  skipAuth?: boolean;
};

export type PublicIntakeProductType = {
  name: string;
  price: ProductPrice;
  prices?: ProductPrice[];
  image?: string | null;
  id: string;
};

export interface PublicIntakeSurveyResponse extends Response {
  data?: {
    product?: PublicIntakeProductType;
    survey: {
      id: string;
      name: string;
      description: string;
      isActive: boolean;
      questions: SurveyQuestion[];
      createdAt: string;
      generationType: boolean;
      type: {
        id: string;
        name: string;
        description: string;
        isActive: boolean;
      };
    };
  };
}

export type AddSurveyPayload = {
  name: string;
  questions: SurveyQuestion[];
  typeId: string;
  description?: string;
  isManualGenerated: boolean;
  isActive: boolean;
};

export type AddSurveyResponse = {
  data: {
    id: string;
    name: string;
    typeId: string;
  };
} & Response;

interface UpdateSurveyQuestionsPayload {
  id: string;
  questions: SurveyQuestion[];
}

export interface GetProductSurveysParams {
  type?: 'PRODUCT_REFILL' | 'INTAKE' | 'PRODUCT' | 'PRODUCT_RENEWAL';
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const surveysApi = createApi({
  reducerPath: 'surveysApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Surveys',
    'Survey',
    'Survey Types',
    'Survey Responses',
    'Survey Response',
    'Patient Survey',
    'General Surveys',
    'Refill Surveys',
    'Intake Survey',
    'Survey Submissions',
    'Provider',
    'Pending Surveys',
    'Mapping Models',
  ],
  endpoints: (builder) => ({
    getTelegraPatientSurvey: builder.query<TelegraSurveysResponse['data'], PatientSurveysParams>({
      query: ({ id, email, token }) => ({
        url: `/surveys/${id}`,
        params: { email, token },
      }),
      providesTags: ['Patient Survey'],
      transformResponse: (res: TelegraSurveysResponse) => res.data,
    }),
    getGeneralSurvey: builder.query<PatientSurveysResponse['data'], PatientSurveysParams>({
      query: ({ id }) => ({
        url: `/surveys/general-survey/${id}`,
      }),
      providesTags: ['General Surveys'],
      transformResponse: (res: PatientSurveysResponse) => res.data,
    }),
    getRefillSurvey: builder.query<RefillSurveyResponse['data'], RefillSurveysParams>({
      query: (params) => ({
        url: `/surveys/get-refill-survey`,
        params,
      }),
      providesTags: ['Refill Surveys'],
      transformResponse: (res: RefillSurveyResponse) => res.data,
    }),
    getProductSurveys: builder.query<ProductSurveysResponse['data'], GetProductSurveysParams>({
      query: (params) => ({
        url: `/surveys/product-surveys`,
        params,
      }),
      transformResponse: (res: ProductSurveysResponse) => res.data,
    }),
    getSurveys: builder.query<SurveysResponse['data'], SurveysSortQueryParams>({
      query: (params) => ({ url: `/surveys/list`, params }),
      keepUnusedDataFor: 0,
      providesTags: ['Surveys'],
      transformResponse: (res: SurveysResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          const { surveyData, page, total, totalPages } = result.data || {};

          dispatch(
            setSurveysData({ data: surveyData, meta: { page, total, totalPages, limit: 10 } as SortState['meta'] })
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),
    getSurvey: builder.query<SingleSurveyResponse['data'], SingleSurveyResponseParams>({
      query: ({ surveyId, skipAuth }) => ({
        url: `/surveys/${surveyId}`,
        skipAuth,
      }),
      providesTags: ['Intake Survey'],
      keepUnusedDataFor: 1,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          const cleanedQuestions = (result.data?.questions || []).map((question) => {
            return {
              ...question,
              isHighlighted: question.isHighlighted ?? false,
            };
          });
          dispatch(setSurveyQuestions(cleanedQuestions));
        } catch (error) {
          console.log(error);
        }
      },
      transformResponse: (res: SingleSurveyResponse) => res.data,
    }),
    getSurveyByPrice: builder.query<PublicIntakeSurveyResponse['data'], string>({
      query: (price) => ({
        url: `/surveys`,
        params: { price },
      }),
      providesTags: ['Survey'],
      keepUnusedDataFor: 1,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setSurvey(result.data?.survey as Survey));
          const cleanedQuestions = (result.data?.survey.questions || []).map((question) => {
            return {
              ...question,
              isHighlighted: question.isHighlighted ?? false,
            };
          });
          dispatch(setSurveyQuestions(cleanedQuestions));
        } catch (error) {
          console.log(error);
        }
      },
      transformResponse: (res: PublicIntakeSurveyResponse) => res.data,
    }),
    getMappingModels: builder.query<GetMappingModelsResponse, GetMappingModelsParams | void>({
      query: (params) => ({ url: `/system/models`, params }),
      providesTags: ['Mapping Models'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.data.models) {
            dispatch(setMappingModels(data?.data?.models));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    submitGeneralSurvey: builder.mutation<Response, GeneralSurveyPayload>({
      query: ({ id, data }) => ({
        url: `/surveys/${id}/general-survey`,
        method: 'POST',
        data,
      }),
    }),
    submitRefillSurvey: builder.mutation({
      query: ({ orderId, surveyId, ...data }: RefillSurveyPayload) => ({
        url: `/surveys/${surveyId}/refill-submit`,
        method: 'POST',
        params: { orderId },
        data,
      }),
    }),

    addSurvey: builder.mutation<AddSurveyResponse, AddSurveyPayload>({
      query: (data: AddSurveyParams) => ({
        url: `/surveys`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Survey'],
    }),
    addSurveyType: builder.mutation<Response, string>({
      query: (name) => ({
        url: `/surveys/types`,
        method: 'POST',
        data: { name },
      }),
      invalidatesTags: ['Survey Types'],
    }),
    deleteSurvey: builder.mutation<Response, string>({
      query: (id) => ({
        url: `/surveys/${id}`,
        method: 'DELETE',
      }),
    }),
    deleteSurveyType: builder.mutation<Response, string>({
      query: (id) => ({ url: `/surveys/types/${id}`, method: 'DELETE' }),
    }),
    getSurveyTypes: builder.query<SurveyTypesResponse, void>({
      query: () => ({
        url: `/surveys/types`,
      }),
      providesTags: ['Survey Types'],
      keepUnusedDataFor: 1,
      transformResponse: (res: SurveyTypesResponse) => res,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setSurveyTypes(result.data.data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    getSurveyResponses: builder.query({
      query: (payload: SurveyResponseParams) => {
        const { id, ...params } = payload;
        return {
          url: `/surveys/${id}/responses`,
          params,
        };
      },
      providesTags: ['Survey Responses'],
      keepUnusedDataFor: 1,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setSurveyResponses(result.data.data.responses));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    getSurveyResponse: builder.query({
      query: (id: string) => ({
        url: `/surveys/responses/${id}`,
      }),
      providesTags: ['Survey Response'],
      keepUnusedDataFor: 1,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setSurveyResponse(result.data.data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateSurveyQuestions: builder.mutation<Response, UpdateSurveyQuestionsPayload>({
      query: ({ id, questions }) => {
        return {
          url: `/surveys/${id}/questions`,
          method: 'PATCH',
          data: { questions },
        };
      },
      invalidatesTags: ['Survey', 'Surveys', 'Survey Response', 'Survey Responses'],
    }),
    updateSurveyName: builder.mutation({
      query: ({ id, name }: { id: string; name: string }) => ({
        url: `/surveys/${id}/name`,
        method: 'PATCH',
        data: { name },
      }),
      invalidatesTags: ['Survey', 'Surveys'],
    }),
    updateSurveyStatus: builder.mutation<Response, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/surveys/${id}/status`,
        method: 'PATCH',
        data: {
          isActive,
        },
      }),
    }),

    submitResponses: builder.mutation<SubmitResponse, SubmitResponsePayload>({
      query: (payload) => {
        const { surveyId, ...data } = payload;
        return {
          url: `/surveys/${surveyId}/submit`,
          method: 'POST',
          data,
        };
      },
    }),

    submitPendingIntakeResponses: builder.mutation<SubmitPendingIntakeResponse, SubmitPendingIntakeResponsePayload>({
      query: ({ surveyId, ...data }) => ({
        url: `/surveys/${surveyId}/submit-pending-intake`,
        method: 'POST',
        data,
        skipAuth: true,
      }),
      invalidatesTags: ['Pending Surveys', 'Surveys'],
    }),

    getSubmissionLogs: builder.query<
      {
        logs: Array<{
          id: string;
          updatedBy: {
            id: string;
            firstName: string;
            lastName: string;
            userRole: string;
          };
          updatedAt: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      },
      { submissionId: string; page?: number; limit?: number }
    >({
      query: ({ submissionId, page = 1, limit = 10 }) => ({
        url: `/surveys/submissions/${submissionId}/logs`,
        params: { page, limit },
      }),
      transformResponse: (response: SubmissionLogsResponse) => response.data,
    }),

    getQuestionById: builder.query<SurveyQuestion, { questionId: string; type?: string; patientId?: string }>({
      query: ({ questionId, type, patientId }) => ({
        url: `/surveys/questions/${questionId}`,
        params: {
          ...(type && { type }),
          ...(patientId && { patientId }),
        },
      }),
      transformResponse: (response: QuestionResponse) => response.data,
    }),

    updateRefillRequestResponses: builder.mutation<
      { success: boolean; message: string; data: unknown },
      {
        refillRequestId: string;
        responses: Array<{
          questionId: string;
          answer: string | string[] | number | boolean | Date | null | undefined | Record<string, unknown>;
        }>;
      }
    >({
      query: ({ refillRequestId, responses }) => ({
        url: `/surveys/refill-requests/${refillRequestId}/responses`,
        method: 'PATCH',
        data: { responses },
      }),
      transformResponse: (response: { success: boolean; message: string; data: unknown }) => response,
    }),

    submitTelegraSurveyFormResponses: builder.mutation({
      query: ({ surveyId, ...data }: PatientTelegraSurveySubmitPayload) => ({
        url: `/surveys/${surveyId}/submit-with-token`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Survey Responses', 'Survey Response'],
    }),
    getPendingSurveys: builder.query<PendingSurveysResponse['data'], SurveysSortQueryParams>({
      query: (query: SurveysSortQueryParams) => ({
        url: `/patients/pending-surveys`,
        params: {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        },
      }),
      providesTags: ['Pending Surveys'],
      transformResponse: (res: PendingSurveysResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getCompletedSurveys: builder.query<CompletedSurveysResponse['data'], SurveysSortQueryParams>({
      query: (query: SurveysSortQueryParams) => ({
        url: `/patients/survey-submissions`,
        params: {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        },
      }),
      providesTags: ['Surveys'],
      transformResponse: (res: CompletedSurveysResponse) => res.data,
      keepUnusedDataFor: 1,
    }),

    getSurveysSubmission: builder.query<SurveySubmissionsResponse['data'], SurveysSortQueryParams>({
      query: (params: SurveysSortQueryParams) => ({
        url: `/surveys/survey-submissions`,
        method: 'GET',
        params,
      }),
      transformResponse: (res: SurveySubmissionsResponse) => res.data,
      providesTags: (result, error, query) => [{ type: 'Survey Submissions', id: query.type ?? undefined }],
    }),
    updateSurveySubmissionResponses: builder.mutation<
      Response,
      {
        submissionId: string;
        responses: Array<{ questionId: string; answer: unknown }>;
        isFromAdmin?: boolean;
      }
    >({
      query: ({ submissionId, responses, isFromAdmin = true }) => ({
        url: `/surveys/submissions/${submissionId}/responses`,
        method: 'PATCH',
        data: { responses, isFromAdmin },
      }),
      invalidatesTags: ['Survey Response', 'Survey Responses', 'Survey Submissions', 'Provider'],
    }),
  }),
});

export const {
  useLazyGetSurveysQuery,
  useGetRefillSurveyQuery,
  useLazyGetSurveyTypesQuery,
  useGetGeneralSurveyQuery,
  useGetSurveyQuery,
  useLazyGetSurveyQuery,
  useGetTelegraPatientSurveyQuery,
  useDeleteSurveyTypeMutation,
  useAddSurveyMutation,
  useAddSurveyTypeMutation,
  useLazyGetSurveyResponseQuery,
  useDeleteSurveyMutation,
  useUpdateSurveyStatusMutation,
  useSubmitResponsesMutation,
  useUpdateSurveyQuestionsMutation,
  useLazyGetQuestionByIdQuery,
  useUpdateSurveyNameMutation,
  useLazyGetSurveyResponsesQuery,
  useSubmitTelegraSurveyFormResponsesMutation,
  useSubmitGeneralSurveyMutation,
  useSubmitRefillSurveyMutation,
  useLazyGetPendingSurveysQuery,
  useLazyGetCompletedSurveysQuery,
  useGetSurveyByPriceQuery,
  useLazyGetSurveysSubmissionQuery,
  useUpdateSurveySubmissionResponsesMutation,
  useSubmitPendingIntakeResponsesMutation,
  useGetProductSurveysQuery,
  useGetSubmissionLogsQuery,
  useLazyGetSubmissionLogsQuery,
  useUpdateRefillRequestResponsesMutation,
  useLazyGetMappingModelsQuery,
} = surveysApi;
