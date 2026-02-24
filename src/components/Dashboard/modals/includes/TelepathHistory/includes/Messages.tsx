import { TelepathMessage } from '@/store/slices/telepathApiSlice';
import { Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import { Fragment } from 'react';
import { parseLinks, renderLinks } from '@/lib/linkUtils';

interface MessagesProps {
  messages: TelepathMessage[];
  searchTerm: string;
  isInitialLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

export const Messages = ({
  messages,
  searchTerm,
  isInitialLoading,
  isFetchingMore,
  hasMore,
  isError,
  error,
  onRetry,
}: MessagesProps) => {
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!text) return null;
    
    // If no search term, just apply link detection
    if (!searchTerm.trim()) {
      const linkParts = parseLinks(text);
      return renderLinks(linkParts);
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        // For highlighted parts, apply link detection to the content
        const linkParts = parseLinks(part);
        return (
          <mark key={index} style={{ backgroundColor: '#fef08a', padding: '2px 4px', borderRadius: '2px' }}>
            {renderLinks(linkParts)}
          </mark>
        );
      } else {
        // For non-highlighted parts, apply link detection
        const linkParts = parseLinks(part);
        return <Fragment key={index}>{renderLinks(linkParts)}</Fragment>;
      }
    });
  };

  if (isInitialLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center py-5'>
        <Spinner className='border-2' />
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      error &&
      typeof error === 'object' &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'message' in error.data
        ? (error.data as { message?: string })?.message || 'Failed to load messages'
        : 'Failed to load messages';
    return (
      <div className='text-center py-5'>
        <p className='text-danger mb-2'>{errorMessage}</p>
        <button className='btn btn-sm btn-outline-primary' onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className='d-flex flex-column gap-3'>
      {messages.length === 0 ? (
        <div className='text-center py-5'>
          <p className='text-muted mb-0'>No messages available at this time.</p>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column gap-3' style={{ maxHeight: 'none' }}>
            {messages.map((message, index) => (
              <div
                key={`${message.createdAt || index}-${index}`}
                className={`d-flex ${message.role === 'Patient' ? 'justify-content-start' : 'justify-content-end'}`}
              >
                <div
                  className={`d-flex flex-column p-3 rounded-3 tw-shadow-sm hover:tw-shadow-md tw-transition-shadow tw-duration-200 ${
                    message.role === 'Patient'
                      ? 'tw-bg-gray-50 tw-border tw-border-gray-200'
                      : 'tw-bg-blue-50 tw-border tw-border-blue-200'
                  }`}
                  style={{ maxWidth: '70%' }}
                >
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <div className='d-flex flex-column gap-1'>
                      <div className='d-flex align-items-center gap-2'>
                        <span className='fw-semibold text-sm'>{message.senderName || 'Unknown'}</span>
                      </div>
                    </div>
                    {message.createdAt && (
                      <span className='text-muted text-xs ms-3'>{formatDateTime(message.createdAt)}</span>
                    )}
                  </div>
                  <div className='text-sm mt-2'>{highlightText(message.message || '', searchTerm)}</div>
                </div>
              </div>
            ))}
          </div>
          {isFetchingMore && (
            <div className='d-flex justify-content-center py-3'>
              <Spinner size='sm' className='border-2' />
            </div>
          )}
          {!hasMore && messages.length > 0 && (
            <div className='text-center py-3'>
              <p className='text-muted text-xs mb-0'>No more messages to load</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
