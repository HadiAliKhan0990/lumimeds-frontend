'use client';

import React from 'react';
import { CiBellOn } from 'react-icons/ci';
import { Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useNotifications } from './NotificationProvider';
import { ROUTES } from '@/constants';
import './NotificationBell.css';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handleBellClick = () => {
    router.push(ROUTES.PROVIDER_NOTIFICATIONS);
  };

  return (
    <div className={`notification-bell-container bouncing-effect ${className}`}>
      {unreadCount > 0 && (
        <Badge
          bg='danger'
          className='tw-absolute tw--top-1 tw--right-2 tw-z-10 !tw-rounded-full !tw-p-1'
          style={{ fontSize: '10px', minWidth: '18px', height: '18px' }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      <div
        className='notification-bell tw-border tw-border-black/50'
        onClick={handleBellClick}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBellClick();
          }
        }}
        aria-label='Go to Notifications'
      >

        <div className='bell-icon-container'>
          <CiBellOn size={22} />

        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
