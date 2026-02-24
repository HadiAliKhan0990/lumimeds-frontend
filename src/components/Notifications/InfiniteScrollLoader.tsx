'use client';

import React from 'react';

interface InfiniteScrollLoaderProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  totalNotifications: number;
}

export const InfiniteScrollLoader: React.FC<InfiniteScrollLoaderProps> = ({
  isLoading,
  hasMore,
  onLoadMore,
  loadMoreRef,
  totalNotifications,
}) => {
  if (!hasMore && totalNotifications > 0) {
    return (
      <div className='text-center py-4'>
        <div className='text-muted' style={{ fontSize: '14px' }}>
          {/* <span className='badge bg-success me-2'>✓</span> */}
          {/* You've reached the end of notifications */}
        </div>
      </div>
    );
  }

  // Don't show anything if there are no notifications at all
  if (totalNotifications === 0) {
    return null;
  }

  return (
    <div ref={loadMoreRef} className='mt-4'>
      {isLoading ? (
        <div className='text-center py-3'>
          <div className='spinner-border spinner-border-sm text-primary me-2' role='status' aria-hidden='true'></div>
          <span className='text-muted'>Loading more notifications...</span>
        </div>
      ) : (
        <div className='text-center py-3'>
          <button
            className='btn btn-outline-primary btn-sm'
            onClick={onLoadMore}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};
