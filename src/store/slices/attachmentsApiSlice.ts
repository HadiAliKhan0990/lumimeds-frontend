import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';

export interface Attachment {
  id: string;
  patientId: string;
  orderId?: string;
  messageId?: string;
  providerId?: string;
  attachmentURL: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
  order?: {
    id: string;
    orderNumber?: string;
    requestedProductName?: string;
  };
  message?: {
    id: string;
    content?: string;
  };
  provider?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AttachmentsResponse {
  success: boolean;
  message: string;
  data: Attachment[];
}

export const attachmentsApi = createApi({
  reducerPath: 'attachmentsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Attachments'],
  endpoints: (builder) => ({
    getPatientAttachments: builder.query<AttachmentsResponse['data'], string>({
      query: (patientId: string) => ({
        url: `/attachments/patient/${patientId}`,
      }),
      providesTags: ['Attachments'],
      transformResponse: (res: AttachmentsResponse) => res.data,
    }),
  }),
});

export const {
  useGetPatientAttachmentsQuery,
} = attachmentsApi;
