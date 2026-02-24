'use client';

import { PatientSurveyResponseType } from '@/lib/types';
import { isEmptyAnswer } from '@/helpers/surveyResponses';
import { NotProvidedMessage } from './NotProvidedMessage';

interface ChoiceQuestionResponseProps {
  response: PatientSurveyResponseType;
  textSizeClass?: string;
  showAnswerLabel?: boolean;
  className?: string;
}

/**
 * Reusable component for rendering MULTIPLE_CHOICE, DROPDOWN, and CHECKBOXES question types.
 * Displays all available options and highlights selected ones, including handling "Other" option with custom text.
 */
export function ChoiceQuestionResponse({
  response,
  textSizeClass = 'tw-text-sm',
  showAnswerLabel = true,
  className = '',
}: Readonly<ChoiceQuestionResponseProps>) {
  // Check if answer is empty
  if (isEmptyAnswer(response.answer)) {
    return <NotProvidedMessage className={textSizeClass} />;
  }

  if (!response.options || response.options.length === 0) {
    return <NotProvidedMessage className={textSizeClass} />;
  }

  // Normalize selected answers to array of strings for comparison
  let selectedAnswers: string[] = [];
  if (Array.isArray(response.answer)) {
    selectedAnswers = response.answer.filter((item): item is string => typeof item === 'string');
  } else if (typeof response.answer === 'string') {
    selectedAnswers = [response.answer];
  }

  // Check if selectedAnswers is empty after normalization
  if (
    selectedAnswers.length === 0 ||
    (selectedAnswers.length > 0 && selectedAnswers.every((ans) => !ans || ans.trim().length === 0))
  ) {
    return <NotProvidedMessage className={textSizeClass} />;
  }

  // Check if there's an "Other" option or options with "please list" (like "Yes (please list)")
  const otherOption = response.options.find(
    (opt) => opt.toLowerCase().includes('other') || opt.toLowerCase().includes('please list')
  );
  const hasOtherOption = !!otherOption;

  // Check if answer matches any option
  const matchedOptions = response.options.filter((option) =>
    selectedAnswers.some((selected) => selected.trim().toLowerCase() === option.trim().toLowerCase())
  );

  // Check if answer matches the "Other" option specifically
  const answerMatchesOtherOption =
    hasOtherOption &&
    otherOption &&
    selectedAnswers.some((selected) => selected.trim().toLowerCase() === otherOption.toLowerCase());

  // Check if answer doesn't match any option (for custom text fallback)
  const answerDoesNotMatchAnyOption =
    matchedOptions.length === 0 &&
    selectedAnswers.length > 0 &&
    !selectedAnswers.some((selected) =>
      response.options!.some((opt) => selected.trim().toLowerCase() === opt.trim().toLowerCase())
    );

  // Check if otherText exists
  const hasOtherText = Boolean(response.otherText && response.otherText.trim().length > 0);

  // "Other" option should be selected if:
  // 1. Answer matches "Other" option, OR
  // 2. otherText exists (edge case), OR
  // 3. Answer doesn't match any option (fallback case)
  const isOtherSelected = Boolean(
    answerMatchesOtherOption || (hasOtherOption && hasOtherText) || (hasOtherOption && answerDoesNotMatchAnyOption)
  );

  // Determine custom text to display:
  // - If otherText exists, use otherText (highest priority)
  // - If answer doesn't match options, use the answer itself
  let customText: string | null = null;
  if (hasOtherText) {
    customText = response.otherText!;
  } else if (answerDoesNotMatchAnyOption) {
    customText = selectedAnswers[0];
  }

  return (
    <div className={className}>
      {showAnswerLabel && <p className={`${textSizeClass} tw-font-medium tw-text-dark tw-mb-2`}>Answer:</p>}
      <div className='tw-space-y-1'>
        {response.options.map((option, optionIndex) => {
          const isOtherOption = option.toLowerCase().includes('other') || option.toLowerCase().includes('please list');
          let isSelected = false;

          // Determine if this option is selected:
          // 1. For "Other" option: selected if isOtherSelected is true
          // 2. For regular options: selected if answer matches
          if (isOtherOption) {
            isSelected = Boolean(isOtherSelected);
          } else {
            isSelected = selectedAnswers.some(
              (selected) => selected.trim().toLowerCase() === option.trim().toLowerCase()
            );
          }

          const optionKey = `${response.questionId || optionIndex}-option-${optionIndex}`;

          return (
            <div key={optionKey} className='tw-flex tw-flex-col tw-gap-1'>
              <div
                className={`tw-flex tw-items-center tw-gap-2 tw-p-2 tw-rounded ${
                  isSelected ? 'tw-bg-primary tw-bg-opacity-10 tw-border tw-border-primary' : ''
                }`}
              >
                <span className={`tw-font-medium ${textSizeClass} ${isSelected ? 'tw-text-primary' : 'tw-text-muted'}`}>
                  {isSelected ? '✓' : '○'}
                </span>
                <span className={`${textSizeClass} ${isSelected ? 'tw-text-primary tw-font-medium' : 'tw-text-dark'}`}>
                  {option}
                </span>
              </div>
              {isSelected && isOtherOption && customText && (
                <div className='tw-ml-6 tw-mt-1 tw-p-2 tw-bg-gray-50 tw-rounded tw-border tw-border-gray-200'>
                  <span className={`${textSizeClass} tw-text-gray-800`}>{customText}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
