'use client';


import { ChoiceResponseProps } from '@/types/surveyResponsesList';

export function MultipleChoiceResponse({ response, variant = 'patient' }: Readonly<Omit<ChoiceResponseProps, 'type'>>) {
  const selectedAnswers = Array.isArray(response.answer) ? response.answer : [response.answer];

  // Find answers that don't match any predefined option
  const unmatchedAnswers = selectedAnswers.filter((answer) => !response.options.some((opt) => opt.text === answer));

  // Find the "other" option
  const otherOption = response.options.find((opt) => opt.text.toLowerCase().includes('other'));
  const hasOtherOption = !!otherOption;
  const shouldShowCustomAnswers = unmatchedAnswers.length > 0 && hasOtherOption;

  // Process options to mark "other" as checked if we have unmatched answers
  const processedOptions = response.options.map((opt) => {
    const isOtherOption = opt.text.toLowerCase().includes('other');
    if (shouldShowCustomAnswers && isOtherOption) {
      return { ...opt, checked: true };
    }
    return opt;
  });

  if (variant === 'admin') {
    return (
      <div className='d-flex flex-column gap-2 mt-2'>
        {processedOptions.map((option, idx) => {
          const isSelected = option.checked;
          const isOtherOption = option.text.toLowerCase().includes('other');
          return (
            <div key={`${response.questionId}-${idx}`}>
              <div
                className={`d-flex align-items-start gap-2 p-2 rounded border ${isSelected ? 'bg-success bg-opacity-10 border-success' : 'bg-white border-secondary'
                  }`}
              >
                <div className='flex-shrink-0 tw-mt-0.5'>
                  {isSelected ? (
                    <div className='d-flex align-items-center justify-content-center bg-success text-white rounded tw-w-5 tw-h-5'>
                      <svg width='12' height='12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                      </svg>
                    </div>
                  ) : (
                    <div className='border border-secondary rounded tw-w-5 tw-h-5' />
                  )}
                </div>
                <span className={`${isSelected ? 'fw-medium text-dark' : 'text-muted'}`}>{option.text}</span>
              </div>
              {/* Show custom answers if this is the "other" option and we have unmatched answers */}
              {isSelected && isOtherOption && shouldShowCustomAnswers && (
                <div className='ms-4 mt-2 p-2 bg-light border-start border-success border-3'>
                  <small className='text-muted d-block mb-1'>Custom answers:</small>
                  <div className='d-flex flex-column gap-1'>
                    {unmatchedAnswers.map((answer) => (
                      <span key={`custom-${response.questionId}-${answer}`} className='fw-medium text-dark'>
                        • {answer}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {processedOptions.every((opt) => !opt.checked) && (
          <span className='text-muted fst-italic'>No options selected</span>
        )}
      </div>
    );
  }

  return (
    <div className='tw-space-y-2'>
      {processedOptions.map((option) => {
        const isSelected = option.checked;
        const isOtherOption = option.text.toLowerCase().includes('other');
        return (
          <div key={`${response.questionId}-${option.text}`}>
            <div
              className={`tw-flex tw-items-start tw-gap-3 tw-p-3 tw-rounded-lg tw-border tw-transition-all tw-duration-200 ${isSelected ? 'tw-bg-green-50 tw-border-green-300 tw-shadow-sm' : 'tw-bg-white tw-border-gray-200'
                }`}
            >
              <div className='tw-flex-shrink-0 tw-mt-0.5'>
                {isSelected ? (
                  <div className='tw-w-5 tw-h-5 tw-bg-green-600 tw-rounded tw-flex tw-items-center tw-justify-center'>
                    <svg
                      className='tw-w-3.5 tw-h-3.5 tw-text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                ) : (
                  <div className='tw-w-5 tw-h-5 tw-border-2 tw-border-gray-300 tw-rounded' />
                )}
              </div>
              <span
                className={`tw-text-sm tw-leading-relaxed ${isSelected ? 'tw-text-green-900 tw-font-medium' : 'tw-text-gray-600'
                  }`}
              >
                {option.text}
              </span>
            </div>
            {/* Show custom answers if this is the "other" option and we have unmatched answers */}
            {isSelected && isOtherOption && shouldShowCustomAnswers && (
              <div className='tw-ml-11 tw-mt-2 tw-p-3 tw-bg-green-50 tw-border-l-4 tw-border-green-400 tw-rounded-r-lg'>
                <p className='tw-text-xs tw-text-green-600 tw-font-medium tw-mb-1'>Custom answers:</p>
                <div className='tw-space-y-1'>
                  {unmatchedAnswers.map((answer) => (
                    <p
                      key={`custom-${response.questionId}-${answer}`}
                      className='tw-text-sm tw-text-green-900 tw-font-medium'
                    >
                      • {answer}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {selectedAnswers.length === 0 && processedOptions.every((opt) => !opt.checked) && (
        <p className='tw-text-gray-400 tw-text-sm tw-italic tw-pl-3'>No options selected</p>
      )}
    </div>
  );
}
