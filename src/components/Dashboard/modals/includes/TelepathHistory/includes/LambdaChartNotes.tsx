import { useState } from 'react';
import { TelepathLambdaNote } from '@/store/slices/telepathApiSlice';

// Image component with loading state
const ImageWithLoader = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className='tw-w-20 tw-h-20 tw-bg-gray-100 tw-rounded tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-center'>
        <span className='tw-text-[10px] tw-text-gray-400'>Failed</span>
      </div>
    );
  }

  return (
    <div className='tw-relative tw-w-20 tw-h-20'>
      {isLoading && (
        <div className='tw-absolute tw-inset-0 tw-bg-gray-100 tw-rounded tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-center'>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`tw-w-20 tw-h-20 tw-object-cover tw-rounded tw-border tw-border-gray-200 hover:tw-border-blue-500 tw-transition-colors ${isLoading ? 'tw-opacity-0' : 'tw-opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

interface Props {
  isLoading: boolean;
  errorType: 'not_found' | 'error' | null;
  notes: TelepathLambdaNote[] | undefined;
}

export const LambdaChartNotes = ({ isLoading, errorType, notes }: Props) => {
  if (isLoading) {
    return (
      <div className='tw-p-2'>
        <div className='tw-flex tw-justify-center tw-py-6'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (errorType === 'not_found') {
    return (
      <div className='tw-p-2'>
        <div className='tw-text-center tw-py-6 tw-text-gray-500'>Record not found</div>
      </div>
    );
  }

  if (errorType === 'error') {
    return (
      <div className='tw-p-2'>
        <div className='tw-text-center tw-py-6 tw-text-red-500'>Error loading notes</div>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className='tw-p-2'>
        <div className='tw-text-center tw-py-6 tw-text-gray-500'>No chart notes available</div>
      </div>
    );
  }

  return (
    <div className='tw-p-2'>
      <div className='tw-space-y-2'>
        {notes.map((note) => {
          const createdByName = note.createdby
            ? `${note.createdby.first_name} ${note.createdby.last_name}`
            : 'Unknown';
          const dateTime = `${new Date(note.created_at).toLocaleDateString()} ${new Date(note.created_at).toLocaleTimeString()}`;

          return (
            <div key={note.order_note_id} className='tw-border tw-rounded-lg tw-bg-white tw-overflow-hidden'>
              {/* Header */}
              <div className='tw-px-3 tw-py-2'>
                <div className='d-flex justify-content-between align-items-start'>
                  <div className='d-flex align-items-center gap-2'>
                    <span className='fw-semibold text-sm'>{createdByName}</span>
                    {note.order_id && <span className='tw-font-normal text-xs'>| Order #{note.order_id}</span>}
                  </div>
                  {note.created_at && (
                    <span className='text-muted text-xs ms-3'>{dateTime}</span>
                  )}
                </div>
              </div>
              {/* Content */}
              <div className='tw-px-3 tw-py-2 tw-space-y-1.5'>
                {/* Note text */}
                <p className='tw-text-xs tw-text-gray-600 tw-whitespace-pre-wrap tw-m-0'>{note.note}</p>

                {/* Attachments */}
                {note.order_notes_attachments && note.order_notes_attachments.length > 0 && (
                  <div className='tw-mt-2 tw-flex tw-flex-wrap tw-gap-2'>
                    {note.order_notes_attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.file}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='tw-block'
                      >
                        <ImageWithLoader src={attachment.file} alt={`Attachment ${idx + 1}`} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
