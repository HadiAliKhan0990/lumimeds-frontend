'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  addNotification,
  setNotifications,
  setUnreadCount,
  setPendingEncountersCount,
  setAppointmentsCount,
  setApprovedCount,
  setUnreadMessageCounts,
  setConnectionStatus,
  setError,
  clearError,
  resetNotifications,
} from '@/store/slices/notificationsSlice';
import notificationSocket from '@/lib/notificationSocket';
import { useGetNotificationsQuery, useLazyGetUnreadCountQuery } from '@/store/slices/notificationsApiSlice';
import { showToast } from '@/lib/toast';
import { Notification, NotificationMessageData } from '@/lib/types';
import {
  setSelectedConversation,
  setMessages,
  setIsNewMessage,
  setNewChatUser,
  setMessagesLoading,
  setMessagesMeta,
  setPatientChatPaymentType,
  setPatientChatPlanName,
} from '@/store/slices/chatSlice';
import {
  setIsBlaseMessaging,
  setIsSelectedAll,
  setSelectedUsers,
  setIsDialogOpen,
} from '@/store/slices/blaseMessagingSlice';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { useRouter } from 'next/navigation';

interface NotificationContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  accessToken?: string | null;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, accessToken }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const notificationState = useSelector((state: RootState) => state.notifications);
  const { selectedConversation, messages = [] } = useSelector((state: RootState) => state.chat);

  const { isConnected, connectionStatus, unreadCount, notifications, isLoading, error, lastRefetchUnreadCountAt } =
    notificationState;

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isInitialized = useRef<boolean>(false);

  // Fetch initial data - only when access token is available
  const { data: notificationsData, error: notificationsError } = useGetNotificationsQuery(
    { limit: 20, offset: 0 },
    { skip: !accessToken }
  );
  const [triggerGetUnreadCount, { data: unreadCountData, error: unreadCountError }] = useLazyGetUnreadCountQuery();
  const [triggerPatientChatMessages] = useLazyGetUserMessagesQuery();

  const fetchMessages = async (userId: string) => {
    try {
      dispatch(setMessagesLoading(true));
      const data = await triggerPatientChatMessages({
        id: userId,
        page: 1,
        limit: 50,
      }).unwrap();
      dispatch(setMessages(data?.messages ?? []));
      dispatch(setMessagesMeta(data?.meta ?? null));
      dispatch(setPatientChatPaymentType(data?.paymentType));
      dispatch(setPatientChatPlanName(data?.planName));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setMessagesLoading(false));
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!accessToken || isInitialized.current) {
      return;
    }

    const initializeSocket = async () => {
      try {
        dispatch(setConnectionStatus('connecting'));

        await notificationSocket.connect(accessToken);

        // Set up event listeners
        notificationSocket.on('connected', () => {
          dispatch(setConnectionStatus('connected'));
          dispatch(clearError());
        });

        notificationSocket.on('notification', (data: { type: string; notification: Notification }) => {
          const notification = data?.notification;
          dispatch(addNotification(notification));

          const navigateHandler = () => {
            if (notification?.data?.redirectionPath) {
              const messageData = notification?.data as NotificationMessageData;

              if (notification.type === 'message' && messageData?.data) {
                const conversation = messageData?.data;
                const userId = conversation?.otherUser?.id;

                // Clear messages if switching to a different conversation
                if (messages.length > 0 && selectedConversation && selectedConversation?.otherUser?.id !== userId) {
                  dispatch(setMessages([]));
                }

                dispatch(setSelectedConversation(conversation));
                dispatch(setIsNewMessage(false));
                dispatch(setNewChatUser(null));
                dispatch(setIsBlaseMessaging(false));
                dispatch(setIsDialogOpen(false));
                dispatch(setIsSelectedAll(false));
                dispatch(setSelectedUsers([]));

                // Fetch messages if switching to a different conversation
                if (userId && userId !== selectedConversation?.otherUser?.id) {
                  fetchMessages(userId);
                }
              }

              router.push(
                notification.type === 'message'
                  ? `${notification?.data?.redirectionPath}?tab=${messageData?.data?.otherUser?.role ?? ''}`
                  : notification?.data?.redirectionPath ?? ''
              );
            }
          };

          // Show toast notification for new notifications
          if (notification && notification.title && notification.message) {
            showToast({
              className: 'cursor-pointer',
              title: notification.title,
              message: notification.message,
              type: 'info',
              duration: 5000,
              onClick: navigateHandler,
            });
          }
        });

        notificationSocket.on('unread_count_update', (data) => {
          dispatch(setUnreadCount(data.count));
        });

        notificationSocket.on('BAD_REQUEST', (data) => {
          dispatch(setError(`Bad request: ${data.error}`));
          dispatch(setConnectionStatus('error'));
        });

        notificationSocket.on('UNAUTHORIZED', (data) => {
          dispatch(setError(`Unauthorized: ${data.error}`));
          dispatch(setConnectionStatus('error'));
        });

        // Monitor connection status
        const checkConnection = () => {
          const status = notificationSocket.connectionStatus;

          if (status === 'connected' && !isConnected) {
            dispatch(setConnectionStatus('connected'));
          } else if (status === 'disconnected' && isConnected) {
            dispatch(setConnectionStatus('disconnected'));
          }
        };

        // Check connection status every 2 seconds
        const connectionInterval = setInterval(checkConnection, 2000);

        isInitialized.current = true;

        // Cleanup interval on unmount
        return () => {
          clearInterval(connectionInterval);
        };
      } catch {
        dispatch(setError('Failed to connect to notification service'));
        dispatch(setConnectionStatus('error'));

        // Attempt to reconnect after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (accessToken) {
            initializeSocket();
          }
        }, 5000);
      }
    };

    initializeSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [accessToken, dispatch]);

  // Update notifications from API
  useEffect(() => {
    // Handle the correct response structure: {success, data: Notification[], meta: {}}
    if (notificationsData?.notifications && Array.isArray(notificationsData.notifications)) {
      dispatch(setNotifications(notificationsData.notifications));
    }
  }, [notificationsData, notificationsError, dispatch]);

  // Update unread count from API
  useEffect(() => {
    if (unreadCountData && accessToken) {
      dispatch(setUnreadCount(unreadCountData.count));
      if (unreadCountData.pendingEncountersCount !== undefined) {
        dispatch(setPendingEncountersCount(unreadCountData.pendingEncountersCount));
      }
      if (unreadCountData.appointmentsCount !== undefined) {
        dispatch(setAppointmentsCount(unreadCountData.appointmentsCount));
      }
      if (unreadCountData.approvedCount !== undefined) {
        dispatch(setApprovedCount(unreadCountData.approvedCount));
      }
      if (
        unreadCountData.patientUnreadMessageCount !== undefined ||
        unreadCountData.adminUnreadMessageCount !== undefined
      ) {
        dispatch(
          setUnreadMessageCounts({
            patientUnreadMessageCount: unreadCountData.patientUnreadMessageCount ?? 0,
            adminUnreadMessageCount: unreadCountData.adminUnreadMessageCount ?? 0,
          })
        );
      }
    } else if (unreadCountError) {
      console.error('Failed to fetch unread count:', unreadCountError);
    }
  }, [unreadCountData, unreadCountError, dispatch, accessToken]);

  useEffect(() => {
    if (lastRefetchUnreadCountAt && accessToken)
      triggerGetUnreadCount()
        .unwrap()
        .then((res) => {
          dispatch(setUnreadCount(res.count));
          if (res.pendingEncountersCount !== undefined) {
            dispatch(setPendingEncountersCount(res.pendingEncountersCount));
          }
          if (res.appointmentsCount !== undefined) {
            dispatch(setAppointmentsCount(res.appointmentsCount));
          }
          if (res.approvedCount !== undefined) {
            dispatch(setApprovedCount(res.approvedCount));
          }
          if (res.patientUnreadMessageCount !== undefined || res.adminUnreadMessageCount !== undefined) {
            dispatch(
              setUnreadMessageCounts({
                patientUnreadMessageCount: res.patientUnreadMessageCount ?? 0,
                adminUnreadMessageCount: res.adminUnreadMessageCount ?? 0,
              })
            );
          }
        });
  }, [lastRefetchUnreadCountAt, accessToken, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notificationSocket.disconnect();
      dispatch(resetNotifications());
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: NotificationContextType = useMemo(() => {
    const seenIds = new Set<number>();
    const uniqueNotifications = notifications.filter(
      (notification) => notification?.id && !seenIds.has(notification.id) && !!seenIds.add(notification.id)
    );

    return {
      isConnected,
      connectionStatus,
      unreadCount,
      notifications: uniqueNotifications,
      isLoading,
      error,
      clearError: () => dispatch(clearError()),
    };
  }, [isConnected, connectionStatus, unreadCount, notifications, isLoading, error, dispatch, clearError]);

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
