import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import {
  Notification,
  NotificationResponse,
  NotificationsListResponse,
  SingleNotificationResponse,
  UnreadCountResponse,
} from '@/lib/types';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Notifications', 'UnreadCount'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsListResponse['data'], { limit?: number; offset?: number }>({
      query: ({ limit = 20, offset = 0 }) => ({
        url: `/notifications?limit=${limit}&offset=${offset}`,
        method: 'GET',
      }),
      providesTags: ['Notifications'],
      transformResponse: (response: NotificationsListResponse) => response.data,
      // Add error handling
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      },
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET',
      }),
      providesTags: ['UnreadCount'],
    }),

    getNotificationById: builder.query<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Notifications', id }],
      transformResponse: (response: SingleNotificationResponse) => response.data,
    }),

    markNotificationAsRead: builder.mutation<NotificationResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
      transformResponse: (response: NotificationResponse) => response,
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', { limit: 20, offset: 0 }, (draft) => {
            if (draft?.notifications && Array.isArray(draft.notifications)) {
              const notification = draft.notifications.find((n) => n.id === parseInt(id));
              if (notification) {
                notification.isRead = true;
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    markAllNotificationsAsRead: builder.mutation<NotificationResponse, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
      transformResponse: (response: NotificationResponse) => response,
      // No optimistic update - let the local state handle the UI
    }),
    // markAllNotificationsAsRead: builder.mutation<NotificationResponse, void>({
    //   query: () => ({
    //     url: '/notifications/mark-all-read',
    //     method: 'PUT',
    //   }),
    //   invalidatesTags: ['Notifications', 'UnreadCount'],
    //   transformResponse: (response: NotificationResponse) => response,
    //   // Optimistic update
    //   async onQueryStarted(_, { dispatch, queryFulfilled }) {
    //     const patchResult = dispatch(
    //       notificationsApi.util.updateQueryData('getNotifications', { limit: 20, offset: 0 }, (draft) => {
    //         if (draft?.data && Array.isArray(draft.data)) {
    //           draft.data.forEach((notification) => {
    //             notification.isRead = true;
    //           });
    //         }
    //       })
    //     );
    //     try {
    //       await queryFulfilled;
    //     } catch {
    //       patchResult.undo();
    //     }
    //   },
    // }),

    deleteNotification: builder.mutation<NotificationResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
      transformResponse: (response: NotificationResponse) => response,
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', { limit: 20, offset: 0 }, (draft) => {
            if (draft?.notifications && Array.isArray(draft.notifications)) {
              const index = draft.notifications.findIndex((n) => n.id === parseInt(id));
              if (index !== -1) {
                draft.notifications.splice(index, 1);
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetUnreadCountQuery,
  useGetNotificationByIdQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
