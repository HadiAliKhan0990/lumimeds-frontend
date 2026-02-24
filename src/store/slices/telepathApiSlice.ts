import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';

// Lambda API Types
export interface TelepathLambdaIntakeQuestion {
  user_question_ans_id: number;
  question_type: number;
  question_id: number;
  ans_value: string;
  ans_type: number;
  sequence: number;
  label: string;
  is_required: number;
  question_text: string;
  option_values: { user_question_ans_option_id: number; question_option_id: number; option_value: string }[];
  user_question_ans_option: { user_question_ans_option_id: number; question_option_id: number; option_value: string }[];
  selfie_image?: string;
  document_id?: string;
}

export interface TelepathLambdaIntakeForm {
  orderId: number;
  data: TelepathLambdaIntakeQuestion[];
}

export interface TelepathLambdaNoteAttachment {
  file: string;
}

export interface TelepathLambdaNote {
  type: number;
  order_note_id: number;
  note: string;
  created_by: number;
  user_id: number;
  order_id: number | string;
  created_at: string;
  created_at_tz: string;
  createdby: {
    first_name: string;
    last_name: string;
    email: string;
    user_type: number;
  };
  order_notes_attachments: TelepathLambdaNoteAttachment[];
}

export interface TelepathLambdaOrder {
  order_id: number;
  total_amount: string;
  order_status: number;
  created_at: string;
  order_items: {
    formulary: {
      name: string;
      featured_image: string;
      short_description: string;
    };
  }[];
  order_addresses: { first_name: string; last_name: string }[];
  users: { first_name: string; last_name: string; phone: string; email?: string };
  assigner?: { first_name: string; last_name: string; email?: string };
  order_details?: {
    order_note?: string | null;
    order_addresses?: {
      type: number;
      first_name: string;
      last_name: string;
      phone: string;
      address: string;
      city: string;
      state_id: number;
      zipcode: string;
      state_name: string;
    }[];
  };
}

export interface TelepathLambdaPatient {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface TelepathLambdaResponse {
  _id: string;
  remoteUserId: number;
  createdAt: string;
  intakeForms: TelepathLambdaIntakeForm[];
  notes: TelepathLambdaNote[];
  orders: TelepathLambdaOrder[];
  patient: TelepathLambdaPatient;
  page: number;
}

export interface TelepathMessage {
  role: 'Patient' | 'Staff';
  message: string;
  createdAt: string;
  senderName: string;
  senderEmail: string;
  receiverEmail: string;
}

export interface ChartNote {
  question: string;
  answer: string;
}

export interface TelepathNote {
  surveyForms: ChartNote[] | null;
  chartNotes?: string | null; // Chart notes as string (parsed on frontend)
  orderNotes: string | null;
  orderStatus: string;
  localOrderId: string | null;
  orderCreatedAt: string;
  telepathOrderId: string;
  matchedInSurveyForms: boolean;
}

export interface TelepathDataResponse {
  data: TelepathMessage[] | TelepathNote[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  patientInfo: {
    patientId: string;
    patientEmail: string;
  };
  type: 'patient_messages' | 'notes';
}

export interface TelepathApiResponse extends Response {
  data: TelepathDataResponse;
}

export interface TelepathQueryParams {
  patientId: string;
  type: 'notes' | 'patient_messages';
  search?: string;
  searchIn?: 'surveyForms' | 'orderNotes' | 'chartNotes' | 'all';
  page?: number;
  limit?: number;
}

export const telepathApi = createApi({
  reducerPath: 'telepathApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Telepath Messages', 'Telepath Notes', 'Telepath Lambda'],
  endpoints: (builder) => ({
    getTelepathData: builder.query<TelepathDataResponse, TelepathQueryParams>({
      query: ({ patientId, type, search, searchIn, page, limit }) => ({
        url: '/telepath/data',
        method: 'GET',
        params: {
          patientId,
          type,
          ...(search && { search }),
          ...(searchIn && { searchIn }),
          ...(page && { page }),
          ...(limit && { limit }),
        },
      }),
      providesTags: (result) => (result?.type === 'patient_messages' ? ['Telepath Messages'] : ['Telepath Notes']),
      transformResponse: (response: TelepathApiResponse) => response.data,
    }),
  }),
});

// Separate API for Lambda endpoint (proxied through Next.js API route)
export const telepathLambdaApi = createApi({
  reducerPath: 'telepathLambdaApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Telepath Lambda'],
  endpoints: (builder) => ({
    getTelepathLambdaData: builder.query<TelepathLambdaResponse, { patientId: string }>({
      query: ({ patientId }) => ({
        url: '/telepath-lambda',
        method: 'GET',
        params: { patientId },
      }),
      providesTags: ['Telepath Lambda'],
    }),
  }),
});

export const { useLazyGetTelepathDataQuery } = telepathApi;
export const { useLazyGetTelepathLambdaDataQuery, useGetTelepathLambdaDataQuery } = telepathLambdaApi;
