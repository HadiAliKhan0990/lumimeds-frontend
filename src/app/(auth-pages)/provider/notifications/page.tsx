'use client';

import { CiBellOn } from 'react-icons/ci';
import Loading from '@/components/Dashboard/Loading';
import { useNotifications } from '@/components/Notifications/NotificationProvider';
import { useMarkAllNotificationsAsReadMutation } from '@/store/slices/notificationsApiSlice';
import { useInfiniteScrollNotifications } from '@/hooks/useInfiniteScrollNotifications';
import { useScrollToLoad } from '@/hooks/useScrollToLoad';
import { NotificationItem } from '@/components/Notifications/NotificationItem';
import { InfiniteScrollLoader } from '@/components/Notifications/InfiniteScrollLoader';
import { Notification } from '@/lib/types';
import './styles.css';
import { FiMenu } from 'react-icons/fi';
import { setSidebarOpen } from '@/store/slices/generalSlice';
import { useDispatch } from 'react-redux';
import { setLastRefetchUnreadCountAt } from '@/store/slices/notificationsSlice';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function NotificationsPage() {
  const dispatch = useDispatch();

  return (
    <div className='p-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <div className='d-flex align-items-center gap-3'>
          <FiMenu size={24} className='cursor-pointer d-lg-none' onClick={() => dispatch(setSidebarOpen(true))} />
          <span className='text-4xl fw-medium'>Notifications</span>
        </div>
      </div>
      <NotificationsContent />
    </div>
  );
}

function NotificationsContent() {
  const dispatch = useDispatch();

  const unreadNotificationsRef = useRef<Notification[]>([]);
  const isRefLocked = useRef<boolean>(false);

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [hasInitializedTab, setHasInitializedTab] = useState(false);
  const [localUnreadNotifications, setLocalUnreadNotifications] = useState<Notification[]>([]);
  const [hasMarkedUnreadAsRead, setHasMarkedUnreadAsRead] = useState(false);

  const { notifications: typedRealtimeNotifications } = useNotifications();
  const { notifications, isLoading, isLoadingMore, hasMore, loadMore, refresh } = useInfiniteScrollNotifications(20); // 20 per chunk, automatic memory management
  const { loadMoreRef } = useScrollToLoad(loadMore, {
    threshold: 100,
    rootMargin: '100px',
    enabled: hasMore && !isLoadingMore,
  });

  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const allNotifications = useMemo(() => {
    const notificationMap = new Map<number, Notification>();
    notifications.forEach((notification) => {
      notificationMap.set(notification.id, notification);
    });

    typedRealtimeNotifications.forEach((notification) => {
      notificationMap.set(notification.id, notification);
    });

    return Array.from(notificationMap.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [notifications, typedRealtimeNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      const refNotifications = unreadNotificationsRef.current;
      if (refNotifications.length > 0) {
        return refNotifications;
      }
      const stateNotifications = localUnreadNotifications;
      if (stateNotifications.length > 0) {
        return stateNotifications;
      }
      const filtered = allNotifications.filter((n: Notification) => !n.isRead);

      return filtered;
    }
    return allNotifications;
  }, [activeTab, allNotifications, localUnreadNotifications]);

  // Calculate unread count based on current state
  const unreadCount = useMemo(() => {
    if (activeTab === 'unread') {
      const refCount = unreadNotificationsRef.current.length;
      const stateCount = localUnreadNotifications.length;
      if (refCount > 0) return refCount;
      if (stateCount > 0) return stateCount;
    }
    return allNotifications.filter((n: Notification) => !n.isRead).length;
  }, [activeTab, allNotifications, localUnreadNotifications]);

  // // Fresh load on component mount
  // useEffect(() => {
  //   if (!hasInitialLoad) {
  //     refresh();
  //     setHasInitialLoad(true);
  //   }
  // }, [hasInitialLoad, refresh]);

  useEffect(() => {
    if (!hasInitializedTab && allNotifications && allNotifications.length > 0 && !isLoading) {
      const hasUnread = unreadCount > 0;
      setActiveTab(hasUnread ? 'unread' : 'all');
      setHasInitializedTab(true);
    }
  }, [allNotifications, unreadCount, isLoading, hasInitializedTab]);

  // Auto-mark unread notifications as read when component first renders on unread tab
  useEffect(() => {
    if (hasInitializedTab && activeTab === 'unread' && !hasMarkedUnreadAsRead && unreadCount > 0) {
      dispatch(setLastRefetchUnreadCountAt(new Date().toISOString()));
      const currentUnreadNotifications = allNotifications.filter((n: Notification) => !n.isRead);
      unreadNotificationsRef.current = currentUnreadNotifications;
      isRefLocked.current = true; // Lock the ref to prevent it from being cleared
      setLocalUnreadNotifications(currentUnreadNotifications);
      markAllAsRead()
        .unwrap()
        .then(() => {
          setHasMarkedUnreadAsRead(true);
        })
        .catch((error) => {
          console.error('Failed to mark all notifications as read:', error);
          if (!isRefLocked.current) {
            unreadNotificationsRef.current = [];
          }
          setLocalUnreadNotifications([]);
        });
    }
  }, [hasInitializedTab, activeTab, hasMarkedUnreadAsRead, unreadCount, allNotifications, markAllAsRead]);

  const handleRefresh = () => {
    isRefLocked.current = false; // Unlock the ref
    unreadNotificationsRef.current = [];
    setLocalUnreadNotifications([]);
    setHasMarkedUnreadAsRead(false);
    refresh();
  };

  const handleTabChange = (tab: 'all' | 'unread') => {
    setActiveTab(tab);

    dispatch(setLastRefetchUnreadCountAt(new Date().toISOString()));

    if (tab === 'unread' && !hasMarkedUnreadAsRead) {
      const currentUnreadNotifications = allNotifications.filter((n: Notification) => !n.isRead);
      unreadNotificationsRef.current = currentUnreadNotifications;
      isRefLocked.current = true; // Lock the ref to prevent it from being cleared
      setLocalUnreadNotifications(currentUnreadNotifications);

      markAllAsRead()
        .unwrap()
        .then(() => {
          setHasMarkedUnreadAsRead(true);
        })
        .catch((error) => {
          console.error('Failed to mark all notifications as read:', error);
          // If the API call fails, clear the local state so user can try again
          if (!isRefLocked.current) {
            unreadNotificationsRef.current = [];
          }
          setLocalUnreadNotifications([]);
        });
    } else if (tab === 'all') {
      isRefLocked.current = false; // Unlock the ref
      unreadNotificationsRef.current = [];
      setLocalUnreadNotifications([]);
      setHasMarkedUnreadAsRead(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (allNotifications && allNotifications.length === 0) {
    return (
      <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full'>
        <div className='tw-text-center tw-text-muted tw-mt-10'>
          <h4 className='tw-text-muted'>No Notifications Found.</h4>
        </div>
      </div>
    );
  }

  if (allNotifications && allNotifications.length > 0) {
    return (
      <div>
        <div className='d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4'>
          <div className='d-flex  align-items-center gap-3'>
            <div
              className='segmented-control d-inline-flex'
              style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '4px' }}
            >
              <button
                className={`btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
                style={{
                  backgroundColor: activeTab === 'all' ? '#4164D9' : 'transparent',
                  color: activeTab === 'all' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontWeight: activeTab === 'all' ? '600' : '400',
                  boxShadow: activeTab === 'all' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                  minWidth: '80px',
                  fontSize: '14px',
                }}
              >
                Show All
              </button>
              <button
                className={`btn ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => handleTabChange('unread')}
                style={{
                  backgroundColor: activeTab === 'unread' ? '#4164D9' : 'transparent',
                  color: activeTab === 'unread' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontWeight: activeTab === 'unread' ? '600' : '400',
                  boxShadow: activeTab === 'unread' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                  minWidth: '80px',
                  fontSize: '14px',
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* <button
            className='btn btn-outline-primary btn-sm'
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {isLoading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button> */}
        </div>

        <div className='notifications-list'>
          {filteredNotifications.map((notification: Notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>

        {/* Infinite Scroll Loading - show if there are notifications and more to load */}
        {filteredNotifications.length > 0 && hasMore && (activeTab === 'all' || activeTab === 'unread') && (
          <InfiniteScrollLoader
            isLoading={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loadMoreRef={loadMoreRef}
            totalNotifications={filteredNotifications.length}
          />
        )}
      </div>
    );
  }

  return (
    <div className='text-center py-5'>
      <div className='mb-4'>
        <CiBellOn size={64} className='text-muted' />
      </div>
      <h4 className='text-muted mb-3'>No Notifications Yet</h4>
      <p className='text-muted mb-4' style={{ fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
        {`You’re all caught up! Any new messages, order updates, or encounter reminders will show up here automatically.`}
      </p>
      <div className='d-flex justify-content-center gap-3'>
        <button
          className='btn btn-primary'
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
          }}
          onClick={handleRefresh}
        >
          Refresh
        </button>
        <button
          className='btn btn-outline-primary'
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
          }}
          onClick={() => handleTabChange('all')}
        >
          View All
        </button>
      </div>
    </div>
  );
}
