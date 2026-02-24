import { TelepathNote } from '@/store/slices/telepathApiSlice';
import { Spinner } from 'react-bootstrap';
import { format } from 'date-fns';

interface ChartNotesProps {
  notes: TelepathNote[];
  searchTerm: string;
  isInitialLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

export const ChartNotes = ({
  notes,
  searchTerm,
  isInitialLoading,
  isFetchingMore,
  hasMore,
  isError,
  error,
  onRetry,
}: ChartNotesProps) => {
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
        ? (error.data as { message?: string })?.message || 'Failed to load survey forms'
        : 'Failed to load survey forms';
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
          <p className='text-muted mb-0'>No survey forms available at this time.</p>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column gap-3' style={{ maxHeight: 'none' }}>
            {notes.map((note, index) => (
              <div
                key={`${note.telepathOrderId || index}-${index}`}
                className='card tw-bg-white border rounded-3 p-3 tw-shadow-sm hover:tw-shadow-md tw-transition-shadow tw-duration-200'
              >
                <div className='d-flex justify-content-between align-items-start mb-3'>
                  <div className='d-flex flex-column gap-1'>
                    <div className='d-flex align-items-center gap-2'>
                      <span className='fw-semibold text-sm'>Telepath Order #{note.telepathOrderId || 'N/A'}</span>
                    </div>
                  </div>
                  {note.orderCreatedAt && (
                    <span className='text-muted text-xs'>{formatDateTime(note.orderCreatedAt)}</span>
                  )}
                </div>

                {note.surveyForms && Array.isArray(note.surveyForms) && note.surveyForms.length > 0 && (
                  <div className='responses p-2'>
                    {note.surveyForms.map((surveyForm, idx) => (
                      <div key={idx} style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        <p className='text-xs tw-mb-0 fw-medium text-placeholder' style={{ wordBreak: 'break-word' }}>
                          Q{idx + 1}. {highlightText(surveyForm?.question || '', searchTerm)}
                        </p>
                        <div
                          className='text-xs fw-medium ms-4'
                          style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        >
                          {highlightText(surveyForm?.answer || '', searchTerm)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <p className='text-muted text-xs mb-0'>No more survey forms to load</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
