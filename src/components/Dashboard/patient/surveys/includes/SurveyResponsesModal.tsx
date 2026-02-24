'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/elements';
import { CompletedSurvey, LicenseType, PatientAnswerType } from '@/lib/types';
import { FileAnswer } from '@/components/Dashboard/FileAnswer';
import {
  tryParseJSON,
  formatFieldName,
  renderFieldValue,
  isEmptyValue,
  isEmptyAnswer,
  isChoiceQuestion,
} from '@/helpers/surveyResponses';
import { PDFPreviewModal } from '@/components/Dashboard/PDFPreviewModal';
import { ChoiceQuestionResponse } from '@/components/Dashboard/surveyResponses/ChoiceQuestionResponse';
import { NotProvidedMessage } from '@/components/Dashboard/surveyResponses/NotProvidedMessage';

interface Props {
  survey?: CompletedSurvey;
  onClose: () => void;
}

const urlPattern = /^https?:\/\//i;

export default function SurveyResponsesModal({ survey, onClose }: Readonly<Props>) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfOpen, setPdfOpen] = useState(false);

  const handlePdfPreview = (url: string) => {
    setPdfUrl(url);
    setPdfOpen(true);
  };

  const handlePdfToggle = (open: boolean) => {
    setPdfOpen(open);
    if (!open) setPdfUrl('');
  };

  useEffect(() => {
    if (!survey) {
      setPdfOpen(false);
      setPdfUrl('');
    }
  }, [survey]);

  return (
    <>
      <Modal
        isOpen={!!survey}
        onClose={onClose}
        size='md'
        bodyClassName='tw-pt-4'
        footer={
          <button
            type='button'
            onClick={onClose}
            className='tw-bg-primary tw-text-white tw-w-full tw-font-normal tw-rounded-lg tw-px-4 tw-py-2 tw-transition-all hover:tw-bg-primary/90'
          >
            Close
          </button>
        }
        showFooter={true}
      >
        <h2 className='tw-font-normal tw-text-xl tw-mb-4'>{survey?.name}</h2>
        <div className='tw-rounded-xl tw-border tw-overflow-hidden'>
          <div className='tw-flex tw-items-center tw-bg-gray-50 tw-justify-between tw-px-3 tw-py-2 tw-border-b'>
            <div className='tw-font-normal tw-text-base'>{survey?.surveyType.name}</div>
            <div className='tw-text-xs tw-text-gray-500'>
              {survey?.createdAt
                ? new Intl.DateTimeFormat('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }).format(new Date(survey?.createdAt || ''))
                : '-'}
            </div>
          </div>
          <div className='tw-overflow-auto tw-max-h-80'>
            <div className='tw-flex tw-flex-col tw-gap-3 tw-p-3 tw-bg-gray-50'>
              {survey?.responses?.map((resp, respIndex) => {
                const baseKey = resp.questionId || `${resp.questionText || 'question'}-${resp.position ?? '0'}`;
                const responseKey = `${baseKey}-${respIndex}`;

                // Convert PatientAnswerType to array of strings for display
                const convertAnswerToArray = (answer: PatientAnswerType): string[] => {
                  if (answer === null || answer === undefined) {
                    return [];
                  }
                  if (typeof answer === 'string') {
                    return [answer];
                  }
                  if (Array.isArray(answer)) {
                    // Check if it's LicenseType[] or string[]
                    if (
                      answer.length > 0 &&
                      typeof answer[0] === 'object' &&
                      answer[0] !== null &&
                      'state' in answer[0]
                    ) {
                      // It's LicenseType[], convert to JSON string
                      return [JSON.stringify(answer as LicenseType[])];
                    }
                    // It's string[], return as is
                    return answer.filter((item): item is string => typeof item === 'string');
                  }
                  if (typeof answer === 'object' && !Array.isArray(answer)) {
                    // Handle Record<string, unknown> - convert to JSON string
                    return [JSON.stringify(answer)];
                  }
                  return [String(answer)];
                };

                const answers = convertAnswerToArray(resp.answer);

                const renderJSONObject = (
                  obj: object,
                  indentLevel = 0,
                  parentKey = '',
                  rootKey = responseKey
                ): React.ReactNode => {
                  const entries = Object.entries(obj);
                  const indentClass = indentLevel > 0 ? 'tw-ml-3' : '';

                  return (
                    <div className={`tw-flex tw-flex-col tw-gap-2 ${indentClass}`}>
                      {entries.map(([key, value], idx) => {
                        const isNestedObject =
                          value && typeof value === 'object' && !Array.isArray(value) && value !== null;
                        // Create unique key combining parent key (or root key), current key, indent level, and entry index
                        const uniqueKey = parentKey
                          ? `${parentKey}-${key}-${indentLevel}-${idx}`
                          : `${rootKey}-json-${key}-${indentLevel}-${idx}`;

                        if (isNestedObject) {
                          // Check if nested object is empty
                          if (isEmptyValue(value)) {
                            return (
                              <div key={uniqueKey} className='tw-flex tw-flex-col tw-gap-1'>
                                <span className='tw-font-medium tw-text-dark'>{formatFieldName(key)}:</span>
                                <span className='tw-ml-3'>
                                  <NotProvidedMessage />
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div key={uniqueKey} className='tw-flex tw-flex-col tw-gap-1'>
                              <span className='tw-font-medium tw-text-dark'>{formatFieldName(key)}:</span>
                              <div className='tw-ml-3'>
                                {renderJSONObject(value as object, indentLevel + 1, uniqueKey, rootKey)}
                              </div>
                            </div>
                          );
                        }

                        // Check if value is empty before rendering
                        const renderedValue = renderFieldValue(value);
                        const isEmpty = isEmptyValue(value) || renderedValue.trim().length === 0;

                        return (
                          <div key={uniqueKey} className='tw-flex tw-flex-col tw-gap-1'>
                            <span className='tw-font-medium tw-text-dark'>{formatFieldName(key)}:</span>
                            <span className='tw-ml-3 tw-text-muted'>
                              {isEmpty ? <NotProvidedMessage /> : renderedValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                const renderAnswer = () => {
                  // Check if answer is empty using isEmptyAnswer helper
                  if (isEmptyAnswer(resp.answer)) {
                    return (
                      <span>
                        Answer: <NotProvidedMessage />
                      </span>
                    );
                  }

                  // Handle MULTIPLE_CHOICE, DROPDOWN, and CHECKBOXES question types
                  if (isChoiceQuestion(resp.questionType) && resp.options && resp.options.length > 0) {
                    return <ChoiceQuestionResponse response={resp} textSizeClass='tw-text-sm' />;
                  }

                  if (answers.length === 0) {
                    return (
                      <span>
                        Answer: <NotProvidedMessage />
                      </span>
                    );
                  }

                  if (answers.length === 1) {
                    const ans = answers[0];

                    // Check if answer is empty before any transformations
                    if (isEmptyValue(ans)) {
                      return (
                        <span>
                          Answer: <NotProvidedMessage />
                        </span>
                      );
                    }

                    if (typeof ans === 'string' && urlPattern.test(ans)) {
                      return <FileAnswer answer={ans} onPdfPreview={handlePdfPreview} />;
                    }
                    // Check if answer is a stringified JSON object
                    if (typeof ans === 'string') {
                      const parsedJSON = tryParseJSON(ans);
                      if (parsedJSON) {
                        // Check if parsed JSON is empty
                        if (isEmptyValue(parsedJSON)) {
                          return (
                            <span>
                              Answer: <NotProvidedMessage />
                            </span>
                          );
                        }
                        return (
                          <div className='tw-flex tw-flex-col tw-gap-2'>
                            <span className='tw-font-medium tw-text-dark'>Answer:</span>
                            {renderJSONObject(parsedJSON, 0, '', responseKey)}
                          </div>
                        );
                      }
                      // Check if string is empty after JSON parsing attempt
                      if (ans.trim().length === 0) {
                        return (
                          <span>
                            Answer: <NotProvidedMessage />
                          </span>
                        );
                      }
                    }
                    return <span>Answer: {ans}</span>;
                  }

                  return (
                    <div className='tw-flex tw-flex-col tw-gap-1'>
                      <span>Answers:</span>
                      {answers.map((ans, index) => {
                        // Create unique key using responseKey, index, and answer content
                        const answerPrefix =
                          typeof ans === 'string' ? ans.substring(0, 50).replaceAll(/[^a-zA-Z0-9]/g, '-') : String(ans);
                        const key = `${responseKey}-answer-${index}-${answerPrefix}`;

                        // Check if answer is empty
                        if (isEmptyValue(ans)) {
                          return (
                            <span key={key} className='tw-ml-3'>
                              <NotProvidedMessage />
                            </span>
                          );
                        }

                        if (typeof ans === 'string' && urlPattern.test(ans)) {
                          return <FileAnswer key={key} answer={ans} onPdfPreview={handlePdfPreview} />;
                        }

                        // Check if answer is a stringified JSON object
                        if (typeof ans === 'string') {
                          const parsedJSON = tryParseJSON(ans);
                          if (parsedJSON) {
                            // Check if parsed JSON is empty
                            if (isEmptyValue(parsedJSON)) {
                              return (
                                <span key={key} className='tw-ml-3'>
                                  <NotProvidedMessage />
                                </span>
                              );
                            }
                            return (
                              <div key={key} className='tw-ml-3 tw-flex tw-flex-col tw-gap-2'>
                                {renderJSONObject(parsedJSON, 0, key, responseKey)}
                              </div>
                            );
                          }
                        }

                        return (
                          <span key={key} className='tw-ml-3'>
                            {ans}
                          </span>
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <div key={responseKey}>
                    <div className='tw-font-normal tw-text-muted tw-mb-1 tw-text-sm'>
                      {resp.position ? `Q${resp.position}.` : ''} {resp.questionText}
                    </div>
                    <div className='tw-font-normal tw-text-sm'>{renderAnswer()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {pdfUrl && <PDFPreviewModal open={pdfOpen} setOpen={handlePdfToggle} url={pdfUrl} />}
    </>
  );
}
