'use client';

import { FormattedSurveyResponse } from '@/store/slices/refillsApiSlice';
import { TextResponse } from './TextResponse';
import { SingleChoiceResponse } from './SingleChoiceResponse';
import { MultipleChoiceResponse } from './MultipleChoiceResponse';
import { QuestionType } from '@/lib/enums';
import { ResponseRendererProps } from '@/types/surveyResponsesList';
import { FileAnswer } from '@/components/Dashboard/FileAnswer';
import { NotProvidedMessage } from '@/components/Dashboard/surveyResponses/NotProvidedMessage';

export function ResponseRenderer({ response, variant = 'patient', className }: Readonly<ResponseRendererProps>) {
  const hasMultipleChoiceOptions = (
    response: FormattedSurveyResponse
  ): response is Extract<FormattedSurveyResponse, { options: unknown }> => {
    return 'options' in response;
  };

  const renderResponse = () => {
    if (response.questionType === QuestionType.INPUT_BOX) {
      return <TextResponse response={response} variant={variant} />;
    } else if (
      (response.questionType === QuestionType.CHECKBOXES || response.questionType === QuestionType.DROPDOWN) &&
      hasMultipleChoiceOptions(response)
    ) {
      return <SingleChoiceResponse response={response} variant={variant} />;
    } else if (response.questionType === QuestionType.MULTIPLE_CHOICE && hasMultipleChoiceOptions(response)) {
      return <MultipleChoiceResponse response={response} variant={variant} />;
    } else if (response.questionType === QuestionType.FILE_UPLOAD) {
      if (!response.answer) {
        return <NotProvidedMessage />;
      }
      return <FileAnswer answer={response.answer as string} />;
    }
    return null;
  };

  return <div className={className}>{renderResponse()}</div>;
}
