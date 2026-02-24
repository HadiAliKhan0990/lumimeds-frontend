import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';
import { PatientChatState, setUnreadCountData } from '@/store/slices/patientChatSlice';

export type MessagesPayload = {
  id: string;
  page?: number;
  limit?: number;
};

export type UserMessagesResponse = {
  data?: PatientChatState['chatData'];
} & Response;

export type UnreadResponse = {
  data: PatientChatState['unreadCountData'];
} & Response;

export const patientChatApi = createApi({
  reducerPath: 'patientChatApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Patient Messages', 'Patient Chat Unread Count'],
  endpoints: (builder) => ({
    getUserMessages: builder.query<UserMessagesResponse['data'], MessagesPayload>({
      query: ({ id, page, limit }) => ({
        url: `/chat/messages/${id}`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Patient Messages'],
      transformResponse: (response: UserMessagesResponse) => response.data,
      keepUnusedDataFor: 1,
    }),
    getPatientUnreadCount: builder.query<UnreadResponse['data'], void>({
      query: () => ({
        url: '/chat/patient/unread-count',
        method: 'GET',
      }),
      transformResponse: (response: UnreadResponse) => response.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setUnreadCountData(result.data));
        } catch (error) {
          console.log(error);
        }
      },
      providesTags: ['Patient Chat Unread Count'],
    }),
  }),
});

export const { useLazyGetUserMessagesQuery, useGetPatientUnreadCountQuery, useLazyGetPatientUnreadCountQuery } =
  patientChatApi;
