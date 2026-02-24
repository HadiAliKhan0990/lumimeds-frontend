'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { IoClose } from 'react-icons/io5';
import { Button } from 'react-bootstrap';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from '@/store/slices/notificationsApiSlice';
import { NotificationItem } from './NotificationItem';
import './NotificationPanel.css';
import { CiBellOn } from 'react-icons/ci';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('unread');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  const {
    data: notificationsData,
    isLoading,
    isFetching,
  } = useGetNotificationsQuery({
    limit: 20,
    offset: (page - 1) * 20,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  // Update hasMore based on API response
  useEffect(() => {
    if (notificationsData?.meta) {
      const { page: currentPage, totalPages } = notificationsData.meta;
      setHasMore(currentPage < totalPages);
    }
  }, [notificationsData]);

  const filteredNotifications = activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id.toString()).unwrap();
      // The API slice will automatically update the store
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      // The API slice will automatically update the store
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleTabChange = (tab: 'all' | 'unread') => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when changing tabs
  };

  return (
    <div className='notification-panel'>
      <div className='notification-panel-header'>
        <div className='d-flex justify-content-between align-items-center'>
          <h6 className='m-0 fw-semibold'>Notifications</h6>
          <button className='btn btn-link p-0 text-muted' onClick={onClose} aria-label='Close notifications'>
            <IoClose size={20} />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className='d-flex justify-content-between align-items-center mt-2'>
            <span className='text-muted small'>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
            <Button
              variant='link'
              size='sm'
              className='p-0 text-decoration-none'
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </div>

      <div className='notification-panel-tabs'>
        <div className='d-flex segmented-control'>
          <button
            className={`btn border-0 px-3 py-2 ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            Show All
          </button>
          <button
            className={`btn border-0 px-3 py-2 ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => handleTabChange('unread')}
          >
            Unread
          </button>
        </div>
      </div>

      <div className='notification-panel-content'>
        {isLoading && page === 1 ? (
          <div className='text-center py-4'>
            <div className='spinner-border spinner-border-sm text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className='text-center py-4'>
            <div className='text-muted'>
              <CiBellOn size={32} className='mb-2' />
              <p className='mb-0'>No notifications</p>
              <small>{`You're all caught up!`}</small>
            </div>
          </div>
        ) : (
          <>
            <div className='notifications-list'>
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>

            {hasMore && (
              <div className='text-center py-3'>
                <Button variant='outline-primary' size='sm' onClick={loadMore} disabled={isFetching}>
                  {isFetching ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' role='status' />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
