import { useState } from 'react';
import { TelepathLambdaIntakeForm } from '@/store/slices/telepathApiSlice';

// Image component with loading state
const ImageWithLoader = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className='tw-font-medium tw-text-sm tw-text-blue-600 tw-underline'>View Document</span>
    );
  }

  return (
    <div className='tw-relative tw-w-[200px] tw-h-[150px]'>
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
        className={`tw-max-w-[200px] tw-max-h-[150px] tw-object-cover tw-rounded tw-border tw-border-gray-200 hover:tw-border-blue-500 tw-transition-colors ${isLoading ? 'tw-opacity-0' : 'tw-opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

// Helper function to strip HTML tags from text
const stripHtmlTags = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .trim();
};

interface Props {
  isLoading: boolean;
  errorType: 'not_found' | 'error' | null;
  intakeForms: TelepathLambdaIntakeForm[] | undefined;
}

export const SurveyForms = ({ isLoading, errorType, intakeForms }: Props) => {
  // Track which accordions are expanded (all closed by default)
  const [expandedForms, setExpandedForms] = useState<Set<number>>(new Set());

  const toggleForm = (index: number) => {
    setExpandedForms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
        <div className='tw-text-center tw-py-6 tw-text-red-500'>Error loading survey forms</div>
      </div>
    );
  }

  if (!intakeForms || intakeForms.length === 0) {
    return (
      <div className='tw-p-2'>
        <div className='tw-text-center tw-py-6 tw-text-gray-500'>No survey forms available</div>
      </div>
    );
  }

  return (
    <div className='tw-p-2'>
      <div className='tw-space-y-2'>
        {intakeForms.map((form, formIdx) => {
          const isExpanded = expandedForms.has(formIdx);
          return (
            <div key={formIdx} className='tw-border tw-rounded-lg tw-bg-white tw-overflow-hidden'>
              {/* Accordion Header */}
              <button
                type='button'
                onClick={() => toggleForm(formIdx)}
                className='tw-w-full tw-bg-gray-100 tw-px-3 tw-py-2 tw-flex tw-items-center tw-justify-between tw-cursor-pointer hover:tw-bg-gray-150 tw-transition-colors'
              >
                <h5 className='tw-font-semibold tw-text-sm tw-m-0'>Intake Form - Order #{form.orderId}</h5>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className={`tw-w-4 tw-h-4 tw-text-gray-500 tw-transition-transform tw-duration-200 ${isExpanded ? 'tw-rotate-180' : ''}`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                </svg>
              </button>
              {/* Accordion Content */}
              {isExpanded && (
                <div className='tw-px-3 tw-py-2 tw-space-y-1.5'>
                  {form.data
                    .filter((question, idx, arr) => {
                      // Skip the last item if it has selfie_image or document_id
                      if (idx === arr.length - 1 && (question.selfie_image || question.document_id)) {
                        return false;
                      }
                      return true;
                    })
                    .map((question, qIdx) => {
                      // Get the answer - either from ans_value or from selected options
                      const selectedOptions = question.option_values?.map((opt) => opt.option_value).filter(Boolean);
                      const rawAnswer = question.ans_value || selectedOptions?.join(', ') || 'N/A';

                      // Check if answer is a URL
                      const isUrl =
                        typeof rawAnswer === 'string' &&
                        (rawAnswer.startsWith('http://') || rawAnswer.startsWith('https://'));
                      
                      // Check if it's an image URL
                      const isImageUrl = isUrl && /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i.test(rawAnswer);
                      
                      // Check if it's a document/file URL (S3 or other file URLs that are not images)
                      const isDocumentUrl = isUrl && !isImageUrl;

                      // Sanitize question and answer text (only if not a URL)
                      const questionText = stripHtmlTags(question.question_text || question.label);
                      
                      // Handle consent checkbox questions
                      const isConsentQuestion = questionText.toLowerCase().includes('by checking this box, you agree');
                      let answer: string;
                      if (isConsentQuestion) {
                        answer = rawAnswer === '1' ? 'Accepted' : 'Not Accepted';
                      } else {
                        answer = isUrl ? rawAnswer : stripHtmlTags(rawAnswer);
                      }

                      return (
                        <div key={qIdx} className='tw-border-b tw-border-gray-100 tw-pb-1.5 last:tw-border-0 last:tw-pb-0'>
                          <p className='tw-text-xs tw-text-gray-600 tw-mb-0.5'>{questionText}</p>
                          {isImageUrl ? (
                            <a href={rawAnswer} target='_blank' rel='noopener noreferrer' className='tw-block'>
                              <ImageWithLoader src={rawAnswer} alt='Survey answer' />
                            </a>
                          ) : isDocumentUrl ? (
                            <button
                              type='button'
                              onClick={() => window.open(rawAnswer, '_blank', 'noopener,noreferrer')}
                              className='tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-text-white tw-bg-blue-600 tw-rounded hover:tw-bg-blue-700 tw-transition-colors'
                            >
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='tw-w-3 tw-h-3'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                />
                              </svg>
                              Open Document
                            </button>
                          ) : (
                            <p className='tw-font-medium tw-text-xs tw-m-0'>{answer}</p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

