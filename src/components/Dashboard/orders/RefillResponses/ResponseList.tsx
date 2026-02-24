'use client';

import { ResponseListProps } from '@/types/surveyResponsesList';
import { ResponseRenderer } from './includes/ResponseRenderer';

export function ResponseList({
  responses,
  variant = 'patient',
  productName,
  emptyMessage,
}: Readonly<ResponseListProps>) {
  console.log({ responses });
  if (variant === 'admin') {
    return <ResponseListAdmin responses={responses} />;
  }

  return <ResponseListPatient responses={responses} productName={productName} emptyMessage={emptyMessage} />;
}

// Admin variant
function ResponseListAdmin({ responses }: Readonly<{ responses: ResponseListProps['responses'] }>) {
  if (responses.length === 0) {
    return (
      <div className='text-center text-muted py-4'>
        <p>No responses available</p>
      </div>
    );
  }

  return (
    <div className='d-flex flex-column gap-3 tw-max-h-96 tw-overflow-y-auto'>
      {responses.map((response, index) => (
        <div key={`response-${response.questionId}-${index}`} className='border rounded-2 p-3 bg-white'>
          <div className='mb-2'>
            <span className='fw-bold text-dark'>Question: &nbsp;</span>
            <span className='fw-medium text-dark'>{response.questionText}</span>
          </div>
          <div>
            <span className='fw-bold text-dark'>Answer:</span>&nbsp;
            <ResponseRenderer response={response} variant='admin' />
          </div>
        </div>
      ))}
    </div>
  );
}

// Patient variant
function ResponseListPatient({
  responses,
  productName,
  emptyMessage,
}: Readonly<{
  responses: ResponseListProps['responses'];
  productName?: string;
  emptyMessage?: string;
}>) {
  return (
    <div className='tw-space-y-1'>
      {productName && (
        <div className='tw-mb-6 tw-pb-4 tw-border-b tw-border-gray-200'>
          <div className='tw-flex tw-items-center tw-gap-2'>
            <span className='tw-text-sm tw-font-medium tw-text-gray-500'>Product:</span>
            <span className='tw-text-base tw-font-semibold tw-capitalize tw-text-gray-900'>{productName}</span>
          </div>
        </div>
      )}

      {responses.length === 0 ? (
        <div className='tw-text-center tw-py-12'>
          <div className='tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-bg-gray-100 tw-rounded-full tw-mb-4'>
            <svg className='tw-w-8 tw-h-8 tw-text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <p className='tw-text-gray-500 tw-text-lg tw-font-medium'>{emptyMessage || 'No responses available'}</p>
          <p className='tw-text-gray-400 tw-text-sm tw-mt-1'>This survey has not been completed yet.</p>
        </div>
      ) : (
        <div className='tw-space-y-6'>
          {responses.map((response, index) => (
            <div key={response.questionId}>
              {/* Question Header */}
              <div className='tw-mb-4'>
                <div className='tw-flex tw-items-start tw-gap-3'>
                  <span className='tw-flex-shrink-0 tw-inline-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-bg-blue-600 tw-text-white tw-text-xs tw-font-bold tw-rounded-full'>
                    {index + 1}
                  </span>
                  <div className='tw-flex-1'>
                    <h3 className='tw-text-base tw-font-semibold tw-text-gray-900 tw-leading-relaxed'>
                      {response.questionText}
                    </h3>
                    {response.isHighlighted && (
                      <span className='tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-amber-100 tw-text-amber-800'>
                        ⭐ Highlighted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              <div className='tw-pl-10'>
                <ResponseRenderer response={response} variant='patient' />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
