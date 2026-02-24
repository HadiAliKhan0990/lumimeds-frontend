'use client';

import React from 'react';

interface NotificationBadgeProps {
  count: number;
  isOpen: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, isOpen }) => {
  if (count === 0) return null;

  // Calculate badge width based on number of digits
  const displayText = count > 99 ? '99+' : String(count);
  const isTwoDigits = count >= 10 && count <= 99;
  const isThreeOrMore = count > 99;
  
  // Dynamic width: 18px for single digit, 22px for two digits, 26px for "99+"
  const badgeWidth = isThreeOrMore ? '28px' : isTwoDigits ? '22px' : '18px';
  const badgeHeight = '18px';

  return (
    <div
      className='position-relative d-flex align-items-center justify-content-center'
      style={{
        minWidth: '30px',
        height: '30px',
      }}
    >
      {/* Badge with count for collapsed sidebar */}
      {!isOpen && (
        <div
          className='rounded-circle d-flex align-items-center justify-content-center'
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            width: badgeWidth,
            minWidth: badgeWidth,
            height: badgeHeight,
            padding: '0 2px',
            position: 'absolute',
            top: '0px',
            right: '22px',
            border: '2px solid #1a1a1a', // Match sidebar background
            zIndex: 10,
            lineHeight: '1',
          }}
        >
          {displayText}
        </div>
      )}

      {/* Badge with count for expanded sidebar */}
      {isOpen && (
        <div
          className='rounded-circle d-flex align-items-center justify-content-center'
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            width: badgeWidth,
            minWidth: badgeWidth,
            height: badgeHeight,
            padding: '0 2px',
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            border: '2px solid #1a1a1a', // Match sidebar background
            zIndex: 10,
            lineHeight: '1',
          }}
        >
          {displayText}
        </div>
      )}
    </div>
  );
};
