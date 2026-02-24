'use client';

import { FiCheckCircle, FiCircle } from 'react-icons/fi';
import { ChoiceResponseProps } from '@/types/surveyResponsesList';

export function SingleChoiceResponse({ response, variant = 'patient' }: Readonly<Omit<ChoiceResponseProps, 'type'>>) {
  const selectedAnswer = Array.isArray(response.answer) ? response.answer[0] : response.answer;

  // Helper function to check if a question requires "Yes" text field
  const requiresYesTextField = (questionText: string) => {
    const text = questionText?.trim() || '';
    const exactMatches = [
      'Have you experienced any side effects since your last dose?',
      'Severity of Side Effects (optional but recommended), If yes, how would you rate the severity?',
      'Since your last refill, have there been any changes to your medical history?',
      'Have you started any new medications or been diagnosed with any new medical conditions?',
    ];
    return exactMatches.includes(text);
  };

  // Check if the answer matches any of the predefined options
  const answerMatchesOption = response.options.some((opt) => opt.text === selectedAnswer);

  // Find the "other" and "yes" options
  const otherOption = response.options.find((opt) => opt.text.toLowerCase().includes('other'));
  const hasOtherOption = !!otherOption;
  const yesOption = response.options.find((opt) => opt.text.toLowerCase().includes('yes'));
  const hasYesOption = !!yesOption;
  const needsYesTextField = requiresYesTextField(response.questionText || '');

  const shouldShowOtherCustomAnswer = !answerMatchesOption && hasOtherOption && selectedAnswer;

  const shouldShowYesCustomAnswer = !answerMatchesOption && hasYesOption && needsYesTextField && selectedAnswer;

  // Process options to mark "other" or "yes" as checked if needed
  const processedOptions = response.options.map((opt) => {
    const isOtherOption = opt.text.toLowerCase().includes('other');
    const isYesOption = opt.text.toLowerCase().includes('yes');
    
    // Mark "other" as checked if answer doesn't match and it's an "other" answer
    if (shouldShowOtherCustomAnswer && isOtherOption) {
      return { ...opt, checked: true };
    }
    // Mark "yes" as checked if answer doesn't match (meaning it's the yes_text value) and question requires yes_text
    if (shouldShowYesCustomAnswer && isYesOption) {
      return { ...opt, checked: true };
    }
    // Default: check if option text matches the answer (normal case)
    if (opt.text === selectedAnswer) {
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
          const isYesOption = option.text.toLowerCase().includes('yes');
          return (
            <div key={`${response.questionId}-${idx}`}>
              <div
                className={`d-flex align-items-start gap-2 p-2 rounded border ${
                  isSelected ? 'bg-primary bg-opacity-10 border-primary' : 'bg-white border-secondary'
                }`}
              >
                <div className='tw-flex tw-items-center tw-justify-center tw-flex-shrink-0 tw-mt-0.5'>
                  {isSelected ? (
                    <FiCheckCircle className='text-primary tw-w-5 tw-h-5 tw-flex-shrink-0' />
                  ) : (
                    <FiCircle className='text-secondary tw-w-5 tw-h-5 tw-flex-shrink-0' />
                  )}
                </div>
                <span className={`${isSelected ? 'fw-medium text-dark' : 'text-muted'}`}>{option.text}</span>
              </div>
              {/* Show custom answer if this is the "other" option and we have custom text */}
              {isSelected && isOtherOption && shouldShowOtherCustomAnswer && (
                <div className='ms-4 mt-2 p-2 bg-light border-start border-primary border-2 rounded'>
                  <small className='text-muted d-block mb-1'>Custom answer:</small>
                  <span className='fw-medium text-dark'>{selectedAnswer}</span>
                </div>
              )}
              {/* Show custom answer if this is the "yes" option and we have custom text */}
              {isSelected && isYesOption && shouldShowYesCustomAnswer && (
                <div className='ms-4 mt-2 p-2 bg-light border-start border-primary border-2 rounded'>
                  <small className='text-muted d-block mb-1'>Details:</small>
                  <span className='fw-medium text-dark'>{selectedAnswer}</span>
                </div>
              )}
            </div>
          );
        })}
        {processedOptions.every((opt) => !opt.checked) && (
          <span className='text-muted fst-italic'>No option selected</span>
        )}
      </div>
    );
  }

  return (
    <div className='tw-space-y-2'>
      {processedOptions.map((option) => {
        const isSelected = option.checked;
        const isOtherOption = option.text.toLowerCase().includes('other');
        const isYesOption = option.text.toLowerCase().includes('yes');
        return (
          <div key={`${response.questionId}-${option.text}`}>
            <div
              className={`tw-flex tw-items-start tw-gap-3 tw-p-3 tw-rounded-lg tw-border tw-transition-all tw-duration-200 ${
                isSelected ? 'tw-bg-blue-50 tw-border-blue-300 tw-shadow-sm' : 'tw-bg-white tw-border-gray-200'
              }`}
            >
              <div className='tw-flex-shrink-0 tw-mt-0.5'>
                {isSelected ? (
                  <FiCheckCircle className='tw-w-5 tw-h-5 tw-text-blue-600' />
                ) : (
                  <FiCircle className='tw-w-5 tw-h-5 tw-text-gray-300' />
                )}
              </div>
              <span
                className={`tw-text-sm tw-leading-relaxed ${
                  isSelected ? 'tw-text-blue-900 tw-font-medium' : 'tw-text-gray-600'
                }`}
              >
                {option.text}
              </span>
            </div>
            {/* Show custom answer if this is the "other" option and we have custom text */}
            {isSelected && isOtherOption && shouldShowOtherCustomAnswer && (
              <div className='tw-ml-11 tw-mt-2 tw-p-3 tw-bg-blue-50 tw-border-l-4 tw-border-blue-400 tw-rounded-r-lg'>
                <p className='tw-text-xs tw-text-blue-600 tw-font-medium tw-mb-1'>Custom answer:</p>
                <span className='tw-text-sm tw-text-blue-900 tw-font-medium'>{selectedAnswer}</span>
              </div>
            )}
            {/* Show custom answer if this is the "yes" option and we have custom text */}
            {isSelected && isYesOption && shouldShowYesCustomAnswer && (
              <div className='tw-ml-11 tw-mt-2 tw-p-3 tw-bg-blue-50 tw-border-l-4 tw-border-blue-400 tw-rounded-r-lg'>
                <p className='tw-text-xs tw-text-blue-600 tw-font-medium tw-mb-1'>Details:</p>
                <span className='tw-text-sm tw-text-blue-900 tw-font-medium'>{selectedAnswer}</span>
              </div>
            )}
          </div>
        );
      })}
      {!selectedAnswer && processedOptions.every((opt) => !opt.checked) && (
        <p className='tw-text-gray-400 tw-text-sm tw-italic tw-pl-3'>No option selected</p>
      )}
    </div>
  );
}
