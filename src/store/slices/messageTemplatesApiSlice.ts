import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';
import {
  appendMessageTemplates,
  setMessageTemplates,
  setMessageTemplatesMeta,
  prependMessageTemplate,
  updateMessageTemplateInList,
  deleteMessageTemplateFromList,
} from '@/store/slices/messageTemplatesSlice';

export type MessageTemplateType = {
  id: string;
  key: string;
  name: string;
  content: string;
  variables: string[];
  previewData: Record<string, string>;
  style: {
    borderColor?: string;
  };
  createdBy: {
    id: string;
    email: string;
  };
  createdById: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  templateUniqueId: string;
};

interface GetMessageTemplatesResponse extends Response {
  data: {
    data: MessageTemplateType[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface MessageTemplateSortQueryParams {
  search?: string;
  sortOrder?: string;
  page: number;
  limit: number;
  isActive?: boolean;
}

export interface CreateMessageTemplatePayload {
  name: string;
  content: string;
  variables?: string[];
  previewData?: Record<string, string>;
  style?: {
    borderColor?: string;
  };
}

export interface UpdateMessageTemplatePayload {
  id: string;
  name?: string;
  content?: string;
  variables?: string[];
  previewData?: Record<string, string>;
  style?: {
    borderColor?: string;
  };
  isActive?: boolean;
}

interface MutationMessageTemplateResponse extends Response {
  data: MessageTemplateType;
}

export const messageTemplatesApi = createApi({
  reducerPath: 'messageTemplatesApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['MessageTemplates'],
  endpoints: (builder) => ({
    getMessageTemplates: builder.query<GetMessageTemplatesResponse['data'], MessageTemplateSortQueryParams>({
      query: (params) => ({
        url: `/chat/message-templates`,
        params,
      }),
      providesTags: ['MessageTemplates'],
      transformResponse: (res: GetMessageTemplatesResponse) => res.data,
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          const { data, meta } = result.data || {};
          if (meta.page > 1) {
            dispatch(appendMessageTemplates(data));
            dispatch(setMessageTemplatesMeta(meta));
          } else {
            dispatch(setMessageTemplates({ data, meta }));
          }
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),

    createMessageTemplate: builder.mutation<MutationMessageTemplateResponse, CreateMessageTemplatePayload>({
      query: (data) => ({
        url: `/chat/message-template`,
        method: 'POST',
        data,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          if (result.data.success && result.data.data) {
            dispatch(prependMessageTemplate(result.data.data));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),

    updateMessageTemplate: builder.mutation<MutationMessageTemplateResponse, UpdateMessageTemplatePayload>({
      query: ({ id, ...data }) => ({
        url: `/chat/message-template/${id}`,
        method: 'PATCH',
        data,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          if (result.data.success && result.data.data) {
            dispatch(updateMessageTemplateInList(result.data.data));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),

    deleteMessageTemplate: builder.mutation<Response, string>({
      query: (id) => ({
        url: `/chat/message-template/${id}`,
        method: 'DELETE',
      }),
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          if (result.data.success) {
            dispatch(deleteMessageTemplateFromList(id));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useLazyGetMessageTemplatesQuery,
  useCreateMessageTemplateMutation,
  useUpdateMessageTemplateMutation,
  useDeleteMessageTemplateMutation,
} = messageTemplatesApi;
