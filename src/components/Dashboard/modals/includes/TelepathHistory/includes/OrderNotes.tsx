import { TelepathNote } from '@/store/slices/telepathApiSlice';
import { Spinner } from 'react-bootstrap';
import { format } from 'date-fns';

interface OrderNotesProps {
  notes: TelepathNote[];
  searchTerm: string;
  isInitialLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

export const OrderNotes = ({
  notes,
  searchTerm,
  isInitialLoading,
  isFetchingMore,
  hasMore,
  isError,
  error,
  onRetry,
}: OrderNotesProps) => {
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#fef08a', padding: '2px 4px', borderRadius: '2px' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
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
        ? (error.data as { message?: string })?.message || 'Failed to load order notes'
        : 'Failed to load order notes';
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
      {notes.length === 0 ? (
        <div className='text-center py-5'>
          <p className='text-muted mb-0'>No order notes available at this time.</p>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column gap-3' style={{ maxHeight: 'none' }}>
            {notes.map((note, index) => (
              <div
                key={`${note.telepathOrderId || index}-${index}`}
                className='card tw-bg-white border rounded-3 p-3 tw-shadow-sm hover:tw-shadow-md tw-transition-shadow tw-duration-200'
              >
                <div className='d-flex justify-content-between align-items-start mb-2'>
                  <div className='d-flex flex-column gap-1'>
                    <div className='d-flex align-items-center gap-2'>
                      <span className='fw-semibold text-sm'>Telepath Order #{note.telepathOrderId || 'N/A'}</span>
                      {note.orderStatus && <span className='badge bg-success'>{note.orderStatus}</span>}
                    </div>
                  </div>
                  {note.orderCreatedAt && (
                    <span className='text-muted text-xs'>{formatDateTime(note.orderCreatedAt)}</span>
                  )}
                </div>
                <div className='mt-2'>
                  <div className='text-sm text-muted'>
                    {note.orderNotes && highlightText(note.orderNotes, searchTerm)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isFetchingMore && (
            <div className='d-flex justify-content-center py-3'>
              <Spinner size='sm' className='border-2' />
            </div>
          )}
          {!hasMore && notes.length > 0 && (
            <div className='text-center py-3'>
              <p className='text-muted text-xs mb-0'>No more order notes to load</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
