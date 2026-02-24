'use client';

import { isDateQuestion, tryFormatDate, tryParseJSON } from '@/helpers/surveyResponses';
import { JSONRenderer } from './JSONRenderer';
import { TextResponseProps } from '@/types/surveyResponsesList';
import { NotProvidedMessage } from '@/components/Dashboard/surveyResponses/NotProvidedMessage';

export function TextResponse({ response, variant = 'patient' }: Readonly<TextResponseProps>) {
  const answer = Array.isArray(response.answer) ? response.answer.join(', ') : response.answer;

  if (!answer) {
    if (variant === 'admin') {
      return <NotProvidedMessage />;
    }
    return (
      <div className='tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-border tw-border-gray-200'>
        <NotProvidedMessage />
      </div>
    );
  }

  // Try to parse as JSON first
  const parsedJSON = tryParseJSON(answer);
  if (parsedJSON) {
    return <JSONRenderer data={parsedJSON} variant={variant} />;
  }

  // Check if it's a date question and try to format the date
  if (isDateQuestion(response.questionText)) {
    const formattedDate = tryFormatDate(answer);
    if (formattedDate) {
      if (variant === 'admin') {
        return <span className='fw-medium'>{formattedDate}</span>;
      }
      return (
        <div className='tw-bg-gray-50 tw-rounded-lg tw-text-sm tw-font-semibold tw-p-4 tw-border tw-border-gray-200'>
          {formattedDate}
        </div>
      );
    }
  }

  // Regular text answer
  if (variant === 'admin') {
    return <span>{answer}</span>;
  }

  return (
    <div className='tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-border tw-border-gray-200'>
      <span className='tw-text-gray-900 tw-text-sm tw-leading-relaxed tw-break-words'>{answer}</span>
    </div>
  );
}
