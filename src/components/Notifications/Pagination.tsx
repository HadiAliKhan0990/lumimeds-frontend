'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`d-flex justify-content-center align-items-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        className='btn btn-outline-primary btn-sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        style={{
          minWidth: '40px',
          height: '40px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
          color: currentPage === 1 ? '#6c757d' : '#495057',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        ←
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span
              className='d-flex align-items-center justify-content-center'
              style={{
                minWidth: '40px',
                height: '40px',
                color: '#6c757d',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              ...
            </span>
          ) : (
            <button
              className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onPageChange(page as number)}
              disabled={isLoading}
              style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '8px',
                border: page === currentPage ? 'none' : '1px solid #dee2e6',
                backgroundColor: page === currentPage ? '#4164D9' : 'white',
                color: page === currentPage ? 'white' : '#495057',
                fontSize: '14px',
                fontWeight: page === currentPage ? '600' : '500',
                boxShadow: page === currentPage ? '0 2px 4px rgba(65, 100, 217, 0.3)' : 'none',
              }}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        className='btn btn-outline-primary btn-sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        style={{
          minWidth: '40px',
          height: '40px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
          color: currentPage === totalPages ? '#6c757d' : '#495057',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        →
      </button>
    </div>
  );
};
