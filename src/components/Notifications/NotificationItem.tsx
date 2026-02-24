'use client';

import { memo } from 'react';
import { Notification, NotificationMessageData } from '@/lib/types';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { useMounted } from '@/hooks/usemounted';
import { useRouter } from 'next/navigation';
import {
  setMessages,
  setIsNewMessage,
  setSelectedConversation,
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
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
}

const formatRelativeTime = (dateInput: string | Date) => {
  const now = new Date();
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const getSenderInitial = (notification: Notification): string => {
  // Try to get initial from senderName in data
  if (notification?.data?.senderName) {
    return notification?.data?.senderName.charAt(0).toUpperCase();
  }

  // Fallback: try to extract initial from title
  if (notification.title) {
    // Look for patterns like "Message from John Doe" or "John Doe sent a message"
    const titleWords = notification.title.split(' ');
    for (const word of titleWords) {
      if (word.length > 1 && /^[A-Za-z]/.test(word)) {
        return word.charAt(0).toUpperCase();
      }
    }
  }

  // Final fallback: use first letter of message or '?'
  if (notification.message && notification.message.length > 0) {
    return notification.message.charAt(0).toUpperCase();
  }

  return '?';
};

const getNotificationIcon = (notification: Notification): string => {
  switch (notification.type) {
    case 'message':
      return getSenderInitial(notification);
    case 'order_status':
      return '📦';
    case 'encounter_expiring':
      return '⏰';
    case 'batch_reminder':
      return '📋';
    case 'order_assign':
      return '📦';
    case 'appointment':
      return '📅';
    case 'system':
      return '⚙️';
    case 'alert':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return getSenderInitial(notification);
  }
};

const getNotificationBadge = (notification: Notification) => {
  switch (notification.type) {
    case 'batch_reminder':
      return (
        <span
          className='badge'
          style={{
            backgroundColor: '#FF6B35',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Reminder
        </span>
      );
    case 'order_assign':
      return (
        <span
          className='badge'
          style={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Order Assigned
        </span>
      );
    case 'order_status':
      return (
        <span
          className='badge'
          style={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Order Update
        </span>
      );
    case 'encounter_expiring':
      return (
        <span
          className='badge'
          style={{
            backgroundColor: '#FF6B35',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Expiring Soon
        </span>
      );
    default:
      return null;
  }
};

const getVisitTypeBadge = (notification: Notification) => {
  if (notification.type === 'order_assign' && notification.data?.visitType) {
    const visitType = notification.data.visitType;
    return (
      <span
        className={`badge ${
          visitType === 'document' ? 'text-success bg-success-subtle' : 'bg-primary-subtle text-primary'
        }`}
      >
        {visitType === 'document' ? 'Document' : 'Video'}
      </span>
    );
  }
  return null;
};

export const NotificationItem = memo<NotificationItemProps>(({ notification }) => {
  const router = useRouter();
  const { windowWidth } = useWindowWidth();
  const dispatch = useDispatch();
  const { mounted } = useMounted();

  const isMobile = mounted && windowWidth <= 500;

  const { selectedConversation, messages = [] } = useSelector((state: RootState) => state.chat);

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

  return (
    <div
      className='notification-card p-4 mb-3 rounded border cursor-pointer'
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        backgroundColor: notification.isRead ? '#f8f9fa' : '#ffffff',
        borderLeft: notification.isRead ? '4px solid #e9ecef' : '4px solid #4164D9',
        cursor: !notification.isRead ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!notification.isRead) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!notification.isRead) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }
      }}
      onClick={navigateHandler}
    >
      {/* Timestamp */}
      <div className='position-absolute' style={{ top: '12px', right: '12px', textAlign: 'right' }}>
        <div
          style={{
            fontSize: '11px',
            color: '#6c757d',
            lineHeight: '1.2',
          }}
        >
          {formatRelativeTime(notification.createdAt || new Date())}
        </div>
      </div>

      <div className='d-flex flex-column flex-sm-row align-items-start gap-3'>
        {/* Icon Avatar */}
        <div className={`d-flex align-items-center justify-content-between flex-wrap ${isMobile ? 'w-100' : ''}`}>
          <div
            className={`notification-avatar rounded-circle d-flex align-items-center justify-content-center `}
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: notification.isRead ? '#E9ECEF' : '#CDDFFF',
              flexShrink: 0,
              color: notification.isRead ? '#6c757d' : '#4164D9',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            {getNotificationIcon(notification)}
          </div>
          <div className='d-block d-sm-none d-flex align-items-center gap-2'>
            {getNotificationBadge(notification)}
            {getVisitTypeBadge(notification)}
          </div>
        </div>

        {/* Content */}
        <div className='flex-grow-1'>
          {/* Title with Badge */}
          <div className='mb-2 d-flex align-items-center gap-2 flex-wrap'>
            <h6
              className='mb-0 fw-bold'
              style={{
                color: notification.isRead ? '#6c757d' : '#000000',
                fontWeight: notification.isRead ? '500' : '600',
                fontSize: '16px',
              }}
            >
              {notification.title}
            </h6>
            <div className='d-none d-sm-flex align-items-center gap-2'>
              {getNotificationBadge(notification)}
              {getVisitTypeBadge(notification)}
            </div>
          </div>

          {/* Message */}
          <p
            className='mb-3'
            style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: notification.isRead ? '#6c757d' : '#495057',
            }}
          >
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';
