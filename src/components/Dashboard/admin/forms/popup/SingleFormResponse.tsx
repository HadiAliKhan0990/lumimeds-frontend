'use client';

import PreviousButton from '../../../PreviousButton';
import { SurveyResponse } from '@/store/slices/surveyResponseSlice';
import { QuestionType } from '@/lib/enums';
import { FileAnswer } from '@/components/Dashboard/FileAnswer';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { Offcanvas, OffcanvasProps } from 'react-bootstrap';
import { formatProviderNameFromString } from '@/lib/utils/providerName';
import { formatUSDate } from '@/helpers/dateFormatter';
import {
  isEmptyAnswer,
  tryParseJSON,
  formatFieldName,
  renderFieldValue,
  isChoiceQuestion,
} from '@/helpers/surveyResponses';
import { LicenseType, PatientAnswerType } from '@/lib/types';
import { ChoiceQuestionResponse } from '@/components/Dashboard/surveyResponses/ChoiceQuestionResponse';
import { NotProvidedMessage } from '@/components/Dashboard/surveyResponses/NotProvidedMessage';

interface SingleResponsePopupProps extends OffcanvasProps {
  surveyName: string;
  response: SurveyResponse;
}

export default function SingleResponsePopup({ surveyName, response, ...props }: Readonly<SingleResponsePopupProps>) {
  return (
    <Offcanvas {...props} className='form_response_popup' scroll placement='end'>
      <Offcanvas.Header closeButton className='tw-items-start' />
      <Offcanvas.Body className='tw-flex tw-flex-col tw-gap-4 tw-pt-2'>
        <PreviousButton className='tw-top-[23px]' onClick={props.onHide} />
        <p className='tw-mb-1 tw-capitalize tw-text-2xl'>{surveyName}</p>
        <div className='tw-flex tw-items-center tw-gap-2'>
          <span className='tw-text-sm'>Response from: </span>
          <span className='tw-text-xs tw-text-primary'>
            {response.submittedByType?.toLowerCase() === 'provider'
              ? formatProviderNameFromString(response.submittedByName || '')
              : response.submittedByName || ''}
          </span>
        </div>

        {response.responses?.map((resp, idx) => {
          const raw: PatientAnswerType | undefined = resp.answer;

          const renderJSONObject = (obj: object, indentLevel = 0): React.ReactNode => {
            const entries = Object.entries(obj);
            const indentClass = indentLevel > 0 ? 'tw-pl-6' : '';

            return (
              <div className={`tw-flex tw-flex-col tw-gap-2 ${indentClass}`}>
                {entries.map(([key, value]) => {
                  const isNestedObject = value && typeof value === 'object' && !Array.isArray(value) && value !== null;
                  const uniqueKey = `${key}-${indentLevel}`;

                  if (isNestedObject) {
                    return (
                      <div key={uniqueKey} className='tw-flex tw-flex-col tw-gap-1'>
                        <span className='tw-text-[#111827] tw-text-sm tw-font-semibold'>{formatFieldName(key)}:</span>
                        <div>{renderJSONObject(value as object, indentLevel + 1)}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={uniqueKey} className='tw-flex tw-flex-col tw-gap-1'>
                      <span className='tw-text-[#111827] tw-text-sm tw-font-semibold'>{formatFieldName(key)}:</span>
                      <span className='tw-text-[#6B7280] tw-text-sm tw-pl-3'>{renderFieldValue(value)}</span>
                    </div>
                  );
                })}
              </div>
            );
          };

          const checkAndRenderJSON = (answer: PatientAnswerType): React.ReactNode | null => {
            if (answer === null || answer === undefined) {
              return null;
            }

            if (typeof answer === 'string') {
              const parsedJSON = tryParseJSON(answer);
              if (parsedJSON) {
                return renderJSONObject(parsedJSON);
              }
            } else if (Array.isArray(answer)) {
              // Check if it's LicenseType[] or string[]
              if (answer.length > 0 && typeof answer[0] === 'object' && answer[0] !== null && 'state' in answer[0]) {
                // It's LicenseType[], render as JSON object
                return renderJSONObject(answer as unknown as Record<string, unknown>);
              }
              // Check if any item in the array is a stringified JSON object
              const jsonItems = answer.filter(
                (item): item is string => typeof item === 'string' && tryParseJSON(item) !== null
              );
              if (jsonItems.length > 0) {
                return (
                  <div className='tw-flex tw-flex-col tw-gap-3'>
                    {jsonItems.map((item) => {
                      const parsed = tryParseJSON(item);
                      // Use item content as key since JSON strings should be unique
                      const sanitized = item.substring(0, 100).replace(/[^a-zA-Z0-9]/g, '-');
                      const uniqueKey = `json-item-${sanitized}`;
                      return parsed ? (
                        <div key={uniqueKey}>{renderJSONObject(parsed)}</div>
                      ) : (
                        <span key={uniqueKey} className='tw-text-[#6B7280] tw-text-sm'>
                          {item}
                        </span>
                      );
                    })}
                  </div>
                );
              }
            } else if (typeof answer === 'object' && answer !== null) {
              // Handle Record<string, unknown>
              return renderJSONObject(answer);
            }
            return null;
          };

          // Convert PatientAnswerType to displayable string
          const convertAnswerToString = (answer: PatientAnswerType | undefined): string => {
            if (answer === null || answer === undefined) {
              return '';
            }
            if (typeof answer === 'string') {
              if (resp?.validation === 'phone') {
                return formatUSPhoneWithoutPlusOne(answer);
              } else if (resp.validation === 'date') {
                return formatUSDate(answer);
              }
              return answer;
            }
            if (Array.isArray(answer)) {
              // Check if it's LicenseType[] or string[]
              if (answer.length > 0 && typeof answer[0] === 'object' && answer[0] !== null && 'state' in answer[0]) {
                // It's LicenseType[], convert to JSON string
                return JSON.stringify(answer as LicenseType[]);
              }
              // It's string[], join with comma
              return answer.filter((item): item is string => typeof item === 'string').join(', ');
            }
            if (typeof answer === 'object' && !Array.isArray(answer)) {
              // Handle Record<string, unknown> - convert to JSON string
              return JSON.stringify(answer);
            }
            return String(answer);
          };

          const displayString = convertAnswerToString(raw);

          // Check if answer is empty
          const getDisplayValue = (): React.ReactNode => {
            // Check if raw answer is empty using isEmptyAnswer helper
            if (isEmptyAnswer(raw)) {
              return <NotProvidedMessage />;
            }

            // Handle MULTIPLE_CHOICE, DROPDOWN, and CHECKBOXES question types
            if (isChoiceQuestion(resp.questionType) && resp.options && resp.options.length > 0) {
              return <ChoiceQuestionResponse response={resp} textSizeClass='tw-text-sm' />;
            }

            // Check if answer is a JSON object that should be rendered
            if (raw !== undefined && raw !== null) {
              const jsonAnswer = checkAndRenderJSON(raw);
              if (jsonAnswer) {
                return jsonAnswer;
              }
            }

            // Check if display string is empty after transformations
            if (!displayString || displayString.trim().length === 0) {
              return <NotProvidedMessage />;
            }

            return displayString;
          };

          return (
            <div key={resp.questionId || `${resp.questionText}-${idx}`} className='tw-flex tw-flex-col tw-gap-3'>
              <div className='tw-p-4 tw-rounded-xl tw-border border-c-light'>
                <div className='tw-text-lg tw-font-bold tw-pb-3 tw-border-b border-c-light'>{resp.questionText}</div>
                {typeof raw === 'string' && resp.questionType === QuestionType.FILE_UPLOAD ? (
                  <FileAnswer answer={raw} />
                ) : (
                  <p className='tw-m-0 tw-text-[#6B7280] tw-text-sm tw-p-3'>{getDisplayValue()}</p>
                )}
              </div>
            </div>
          );
        })}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
