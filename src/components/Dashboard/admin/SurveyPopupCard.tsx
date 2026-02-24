'use client';

import { LicenseType, PatientAnswerType, PatientSurvey } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { FaRegFileAlt, FaChevronDown } from 'react-icons/fa';
import { client } from '@/lib/baseQuery';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { usePathname } from 'next/navigation';
import { formatHeightWeightString, formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { formatUSDate, formatUSDateTime } from '@/helpers/dateFormatter';
import {
  tryParseJSON,
  formatFieldName,
  renderFieldValue,
  isEmptyAnswer,
  isChoiceQuestion,
} from '@/helpers/surveyResponses';
import { QuestionType } from '@/lib/enums';
import { ChoiceQuestionResponse } from '@/components/Dashboard/surveyResponses/ChoiceQuestionResponse';
import { NotProvidedMessage } from '@/components/Dashboard/surveyResponses/NotProvidedMessage';

interface Props {
  surveys: PatientSurvey[];
  onEditAnswers?: (survey: PatientSurvey) => void;
  isFetchingSurvey?: boolean;
  context?: 'patient' | 'provider';
  onEditSurvey?: (survey: PatientSurvey) => void;
  onViewLogs?: (survey: PatientSurvey) => void;
}

const formatSimpleDate = (dateString: string) => {
  try {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return `${months[month]} ${day}, ${year}`;
  } catch {
    return dateString;
  }
};

const formatDateOfBirth = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${month} ${day}, ${year} `;
  } catch {
    return dateString;
  }
};

const LicensesTable = ({ licensesData }: { licensesData: PatientAnswerType }) => {
  try {
    let licenses: LicenseType[];

    if (licensesData === null || licensesData === undefined) {
      return <>N/A</>;
    }

    if (typeof licensesData === 'string') {
      const trimmed = licensesData.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(licensesData);
        if (Array.isArray(parsed)) {
          licenses = parsed;
        } else {
          return <div className='tw-text-muted tw-text-sm'>{licensesData}</div>;
        }
      } else {
        return <div className='tw-text-muted tw-text-sm'>{licensesData}</div>;
      }
    } else if (Array.isArray(licensesData)) {
      // Check if it's an array of LicenseType or strings
      if (
        licensesData.length > 0 &&
        typeof licensesData[0] === 'object' &&
        licensesData[0] !== null &&
        'state' in licensesData[0]
      ) {
        licenses = licensesData as LicenseType[];
      } else {
        return <div className='tw-text-muted tw-text-sm'>Invalid license data format</div>;
      }
    } else if (typeof licensesData === 'object' && !Array.isArray(licensesData)) {
      // Handle Record<string, unknown> - try to convert to array
      const values = Object.values(licensesData);
      if (values.length > 0 && Array.isArray(values[0])) {
        const firstValue = values[0];
        if (
          Array.isArray(firstValue) &&
          firstValue.length > 0 &&
          typeof firstValue[0] === 'object' &&
          firstValue[0] !== null &&
          'state' in firstValue[0]
        ) {
          licenses = firstValue as LicenseType[];
        } else {
          return <div className='tw-text-muted tw-text-sm'>Invalid license data format</div>;
        }
      } else {
        return <div className='tw-text-muted tw-text-sm'>Invalid license data format</div>;
      }
    } else {
      return <div className='tw-text-muted tw-text-sm'>Invalid license data format</div>;
    }

    if (!Array.isArray(licenses) || licenses.length === 0) {
      return <>N/A</>;
    }

    return (
      <div className='table-responsive mt-2'>
        <table className='table table-sm table-bordered' style={{ fontSize: '11px', backgroundColor: '#f4f4f4' }}>
          <thead>
            <tr>
              <th
                className='fw-semibold text-center text-nowrap'
                style={{ padding: '8px', backgroundColor: '#f4f4f4' }}
              >
                State
              </th>
              <th
                className='fw-semibold text-center text-nowrap'
                style={{ padding: '8px', backgroundColor: '#f4f4f4' }}
              >
                Expiry
              </th>
              <th
                className='fw-semibold text-center text-nowrap'
                style={{ padding: '8px', backgroundColor: '#f4f4f4' }}
              >
                License Number
              </th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license, index) => (
              <tr key={index}>
                <td style={{ padding: '8px', backgroundColor: '#f4f4f4' }} className='text-center'>
                  {license.state || 'N/A'}
                </td>
                <td style={{ padding: '8px', backgroundColor: '#f4f4f4' }} className='text-center  text-nowrap'>
                  {license.expiryDate ? formatUSDate(license.expiryDate) : 'N/A'}
                </td>
                <td style={{ padding: '8px', backgroundColor: '#f4f4f4' }} className='text-center text-nowrap'>
                  {license.licenseNumber || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (error) {
    console.error('Failed to parse license data:', error, licensesData);
    return (
      <div className='tw-text-muted tw-text-sm'>
        <div>Error parsing license data</div>
        <div className='text-wrap' style={{ wordBreak: 'break-all', fontSize: '10px', marginTop: '4px' }}>
          {typeof licensesData === 'string' ? licensesData : JSON.stringify(licensesData)}
        </div>
      </div>
    );
  }
};

export const SurveyPopupCard = ({
  surveys,
  onEditAnswers,
  isFetchingSurvey = false,
  context = 'patient',
  onEditSurvey,
  onViewLogs,
}: Props) => {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  const getTitle = () => {
    if (context === 'provider') {
      return 'Provider Forms & Intake';
    }
    return isAdmin ? 'Forms' : 'Forms & Intake';
  };

  return (
    <div className='border border-c-light rounded-12'>
      <div className='p-12 fw-medium d-flex justify-content-between align-items-center'>
        <span>{getTitle()}</span>
        {onEditAnswers && surveys.length > 0 && (
          <button
            type='button'
            className='btn-no-style text-sm fw-medium text-primary'
            onClick={() => onEditAnswers(surveys[0])}
            disabled={isFetchingSurvey}
          >
            {isFetchingSurvey ? 'Loading...' : 'Manage'}
          </button>
        )}
      </div>
      <div className='p-12 d-flex flex-column gap-3'>
        {surveys.map((survey) => (
          <ResponsesDetails survey={survey} key={survey.id} onEditSurvey={onEditSurvey} onViewLogs={onViewLogs} />
        ))}
      </div>
    </div>
  );
};

const FileAnswer = ({ answer }: { answer: string }) => {
  const [url, setUrl] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const fetchFileUrl = useCallback(async () => {
    try {
      const { data } = await client.get(`/surveys/file-url?key=${answer}`);
      if (data.data?.url) setUrl(data.data.url);
    } catch (error) {
      console.error('Error fetching file URL:', error);
    }
  }, [answer]);

  useEffect(() => {
    fetchFileUrl();
  }, [fetchFileUrl, retryKey]);

  if (!url) return null;

  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(answer);

  return isImage ? (
    <a href={url} target='_blank' rel='noopener noreferrer'>
      <AsyncImage
        key={retryKey}
        onError={() => setRetryKey((k) => k + 1)}
        Transition={Blur}
        loader={<div className='bg-secondary-subtle' />}
        src={url}
        alt='Uploaded file'
        className='file_image async-img'
      />
    </a>
  ) : (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary underline'
      onError={() => setRetryKey((k) => k + 1)}
    >
      <FaRegFileAlt size={56} />
    </a>
  );
};

const ResponsesDetails = ({
  survey,
  onEditSurvey,
  onViewLogs,
}: {
  survey: PatientSurvey;
  onEditSurvey?: (survey: PatientSurvey) => void;
  onViewLogs?: (survey: PatientSurvey) => void;
}) => {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');
  const isProvider = pathname.includes('/provider');

  const renderJSONObject = (obj: object, textSizeClass: string, indentLevel = 0): React.ReactNode => {
    const entries = Object.entries(obj);
    const indentClass = indentLevel > 0 ? 'ms-3' : '';

    return (
      <div className={`d-flex flex-column gap-1 ${indentClass}`}>
        {entries.map(([key, value]) => {
          const isNestedObject = value && typeof value === 'object' && !Array.isArray(value) && value !== null;

          if (isNestedObject) {
            return (
              <div key={key} className='d-flex flex-column gap-1'>
                <span className={`${textSizeClass} fw-medium text-dark`}>{formatFieldName(key)}:</span>
                <div className='ms-3'>{renderJSONObject(value as object, textSizeClass, indentLevel + 1)}</div>
              </div>
            );
          }

          return (
            <div key={key} className='d-flex flex-column gap-1'>
              <span className={`${textSizeClass} fw-medium text-dark`}>{formatFieldName(key)}:</span>
              <span className={`ms-3 ${textSizeClass} tw-text-muted`}>{renderFieldValue(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const checkAndRenderJSON = (answer: PatientAnswerType, textSizeClass: string): React.ReactNode | null => {
    if (answer === null || answer === undefined) {
      return null;
    }

    if (typeof answer === 'string') {
      const parsedJSON = tryParseJSON(answer);
      if (parsedJSON) {
        return renderJSONObject(parsedJSON, textSizeClass);
      }
    } else if (Array.isArray(answer)) {
      // Check if any item in the array is a stringified JSON object
      // First check if it's an array of strings (not LicenseType[])
      const isStringArray = answer.length === 0 || typeof answer[0] === 'string';
      if (isStringArray) {
        const jsonItems = (answer as string[]).filter((item) => {
          if (typeof item !== 'string') return false;
          const parsed = tryParseJSON(item);
          return parsed !== null;
        });
        if (jsonItems.length > 0) {
          return (
            <div className='d-flex flex-column gap-2'>
              {jsonItems.map((item) => {
                const parsed = tryParseJSON(item);
                // Use item content as key since JSON strings should be unique
                const sanitized = item.substring(0, 100).replace(/[^a-zA-Z0-9]/g, '-');
                const uniqueKey = `json-item-${sanitized}`;
                return parsed ? (
                  <div key={uniqueKey}>{renderJSONObject(parsed, textSizeClass)}</div>
                ) : (
                  <span key={uniqueKey} className={textSizeClass}>
                    {item}
                  </span>
                );
              })}
            </div>
          );
        }
      }
    } else if (typeof answer === 'object' && !Array.isArray(answer)) {
      // Handle Record<string, unknown>
      return renderJSONObject(answer, textSizeClass);
    }
    return null;
  };

  return (
    <div className='forms-details'>
      <div
        className={`survey-header d-flex align-items-start justify-content-between gap-3 p-2 ${
          isAdmin ? 'cursor-pointer' : ''
        }`}
        onClick={isAdmin ? () => setOpen(!open) : undefined}
      >
        <div className='border-bottom tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-flex-grow  tw-border-b-gray-400 tw-pb-2 tw-gap-2'>
          <span className={`tw-line-clamp-2  tw-flex-grow ${isProvider ? 'tw-text-sm' : 'tw-text-xs'} tw-font-medium`}>
            {survey.name}
          </span>
          <div className='tw-flex tw-justify-end sm:tw-justify-start tw-items-start tw-gap-1 tw-flex-shrink-0'>
            {onEditSurvey && (
              <button
                type='button'
                className='btn-no-style tw-text-xs tw-font-medium tw-text-primary tw-me-2 tw-flex-shrink-0'
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSurvey?.(survey);
                }}
              >
                Edit
              </button>
            )}
            {onViewLogs && (
              <button
                type='button'
                className='btn-no-style tw-text-xs tw-font-medium tw-text-primary tw-me-2 tw-flex-shrink-0'
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLogs?.(survey);
                }}
              >
                View Logs
              </button>
            )}
            <span className={`${isProvider ? 'text-sm' : 'text-xs'} fw-medium tw-text-muted tw-flex-shrink-0`}>
              {formatUSDateTime(survey.createdAt)}
            </span>
            {isAdmin && <FaChevronDown size={14} className={'chevron-collapse-icon ' + (open ? 'active' : '')} />}
          </div>
        </div>
      </div>
      {isAdmin ? (
        <Collapse in={open}>
          <div className='responses p-2'>
            {survey.responses.map((res, i) => {
              let displayAnswer: React.ReactNode;

              const isEmpty = isEmptyAnswer(res.answer);

              // Check if this is a choice question type (needed for otherText handling)
              if (survey.name?.toLowerCase().includes('provider')) {
              }

              if (isEmpty) {
                displayAnswer = <NotProvidedMessage className={`${isProvider ? 'tw-text-sm' : 'tw-text-xs'}`} />;
              } else if (res.questionText.toLowerCase().includes('licen') && res.questionType !== 'file_upload') {
                displayAnswer = <LicensesTable licensesData={res.answer} />;
              } else if (res.questionText.toLowerCase().includes('available to start')) {
                if (typeof res.answer === 'string') {
                  displayAnswer = <>{formatSimpleDate(res.answer)}</>;
                } else {
                  displayAnswer = <>{String(res.answer)}</>;
                }
              } else if (
                res.questionText.toLowerCase().includes('which days') ||
                res.questionText.toLowerCase().includes('what days') ||
                (res.questionText.toLowerCase().includes('days') && res.questionText.toLowerCase().includes('week'))
              ) {
                const daysString = Array.isArray(res.answer)
                  ? res.answer.filter((d): d is string => typeof d === 'string').join(' ')
                  : typeof res.answer === 'string'
                  ? res.answer
                  : '';
                const days = daysString.split(' ').filter((day: string) => day.trim().length > 0);
                displayAnswer = (
                  <div className='d-flex flex-column'>
                    {days.map((day: string, idx: number) => (
                      <div
                        key={`${res.questionId || i}-day-${day}-${idx}`}
                        className={`${isProvider ? 'text-sm' : 'text-xs'}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                );
              } else if (res.questionText.toLowerCase().includes('height and weight')) {
                if (typeof res.answer === 'string') {
                  displayAnswer = <>{formatHeightWeightString(res.answer)}</>;
                } else {
                  displayAnswer = <>{String(res.answer)}</>;
                }
              } else if (res.questionType === 'file_upload') {
                if (typeof res.answer === 'string') {
                  displayAnswer = <FileAnswer answer={res.answer} />;
                } else {
                  displayAnswer = <>Invalid file answer type</>;
                }
              } else if (
                res.questionText.toLowerCase().includes('phone number') ||
                res.questionText.toLowerCase().includes('contact number')
              ) {
                if (typeof res.answer === 'string') {
                  displayAnswer = <>{formatUSPhoneWithoutPlusOne(res.answer)}</>;
                } else {
                  displayAnswer = <>{String(res.answer)}</>;
                }
              } else if (res.questionText.toLowerCase().includes('date of birth')) {
                if (typeof res.answer === 'string') {
                  displayAnswer = <>{formatDateOfBirth(res.answer)}</>;
                } else {
                  displayAnswer = <>{String(res.answer)}</>;
                }
              } else if (res.questionText.toLowerCase().includes('what are your main weight loss goals')) {
                const answerArray = Array.isArray(res.answer) ? res.answer : [res.answer];
                const stringArray = answerArray.filter((a): a is string => typeof a === 'string').map((a) => String(a));
                displayAnswer = <>{stringArray.join(', ')}</>;
              } else if (
                res.questionText.toLowerCase().includes('do you have or have you ever had any medical condition') ||
                res.questionText.toLowerCase().includes('provider group')
              ) {
                const answerArray = Array.isArray(res.answer) ? res.answer : [res.answer];
                const stringArray = answerArray.filter((a): a is string => typeof a === 'string').map((a) => String(a));
                displayAnswer = <>{stringArray.join(', ')}</>;
              } else {
                // Handle MULTIPLE_CHOICE, DROPDOWN, and CHECKBOXES question types
                if (isChoiceQuestion(res.questionType) && res.options && res.options.length > 0) {
                  displayAnswer = (
                    <ChoiceQuestionResponse response={res} textSizeClass={isProvider ? 'tw-text-sm' : 'tw-text-xs'} />
                  );
                } else {
                  // Check if answer is a stringified JSON object or Record<string, unknown>
                  const jsonAnswer = checkAndRenderJSON(res.answer, isProvider ? 'text-sm' : 'text-xs');
                  if (jsonAnswer) {
                    displayAnswer = jsonAnswer;
                  } else {
                    // Handle different answer types
                    if (
                      typeof res.answer === 'string' ||
                      typeof res.answer === 'number' ||
                      typeof res.answer === 'boolean'
                    ) {
                      displayAnswer = <>{String(res.answer)}</>;
                    } else if (Array.isArray(res.answer)) {
                      displayAnswer = <>{res.answer.map((a) => String(a)).join(', ')}</>;
                    } else if (typeof res.answer === 'object' && res.answer !== null) {
                      displayAnswer = <>{JSON.stringify(res.answer, null, 2)}</>;
                    } else {
                      displayAnswer = <NotProvidedMessage className={`${isProvider ? 'tw-text-sm' : 'tw-text-xs'}`} />;
                    }
                  }
                }
              }

              // Only handle otherText for non-choice questions (choice questions handle it in ChoiceQuestionResponse)
              if (res.otherText && !isChoiceQuestion(res.questionType)) {
                const answerDisplay =
                  typeof res.answer === 'string' || typeof res.answer === 'number' || typeof res.answer === 'boolean'
                    ? String(res.answer)
                    : Array.isArray(res.answer)
                    ? res.answer.map((a) => String(a)).join(', ')
                    : typeof res.answer === 'object' && res.answer !== null
                    ? JSON.stringify(res.answer, null, 2)
                    : '';
                displayAnswer = (
                  <div className='tw-flex tw-flex-col tw-gap-1'>
                    {answerDisplay}
                    <div> {res.otherText}</div>
                  </div>
                );
              }

              return (
                <div key={i} style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  <p
                    className={`${isProvider ? 'text-sm' : 'text-xs'} tw-mb-0 fw-medium ${
                      res.isHighlighted ? 'text-danger' : 'text-placeholder'
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    Q{i + 1}. {res.questionText}
                  </p>
                  <div
                    className={`${isProvider ? 'text-sm' : 'text-xs'} tw-mb-4 fw-medium ms-4`}
                    style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                  >
                    {displayAnswer}
                  </div>
                </div>
              );
            })}
          </div>
        </Collapse>
      ) : (
        <div className='responses p-2'>
          {survey.responses.map((res, i) => {
            let displayAnswer: React.ReactNode;

            const isEmpty = isEmptyAnswer(res.answer);

            if (survey.name?.toLowerCase().includes('provider')) {
            }

            if (isEmpty) {
              displayAnswer = <NotProvidedMessage className={`${isProvider ? 'tw-text-sm' : 'tw-text-xs'}`} />;
            } else if (
              res.questionText.toLowerCase().includes('licen') &&
              res.questionType !== QuestionType.FILE_UPLOAD
            ) {
              displayAnswer = <LicensesTable licensesData={res.answer} />;
            } else if (res.questionText.toLowerCase().includes('available to start')) {
              if (typeof res.answer === 'string') {
                displayAnswer = <>{formatSimpleDate(res.answer)}</>;
              } else {
                displayAnswer = <>{String(res.answer)}</>;
              }
            } else if (
              res.questionText.toLowerCase().includes('which days') ||
              res.questionText.toLowerCase().includes('what days') ||
              (res.questionText.toLowerCase().includes('days') && res.questionText.toLowerCase().includes('week'))
            ) {
              const daysString = Array.isArray(res.answer)
                ? res.answer.filter((d): d is string => typeof d === 'string').join(' ')
                : typeof res.answer === 'string'
                ? res.answer
                : '';
              const days = daysString.split(' ').filter((day: string) => day.trim().length > 0);
              displayAnswer = (
                <div className='d-flex flex-column'>
                  {days.map((day: string, idx: number) => (
                    <div
                      key={`${res.questionId || i}-day-${day}-${idx}`}
                      className={`${isProvider ? 'text-sm' : 'text-xs'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              );
            } else if (res.questionText.toLowerCase().includes('height and weight')) {
              if (typeof res.answer === 'string') {
                displayAnswer = <>{formatHeightWeightString(res.answer)}</>;
              } else {
                displayAnswer = <>{String(res.answer)}</>;
              }
            } else if (res.questionType === QuestionType.FILE_UPLOAD) {
              if (typeof res.answer === 'string') {
                displayAnswer = <FileAnswer answer={res.answer} />;
              } else {
                displayAnswer = <>Invalid file answer type</>;
              }
            } else if (
              res.questionText.toLowerCase().includes('phone number') ||
              res.questionText.toLowerCase().includes('contact number')
            ) {
              if (typeof res.answer === 'string') {
                displayAnswer = <>Anwser: {formatUSPhoneWithoutPlusOne(res.answer)}</>;
              } else {
                displayAnswer = <>{String(res.answer)}</>;
              }
            } else if (res.questionText.toLowerCase().includes('date of birth')) {
              if (typeof res.answer === 'string') {
                displayAnswer = <>{formatDateOfBirth(res.answer)}</>;
              } else {
                displayAnswer = <>{String(res.answer)}</>;
              }
            } else if (res.questionText.toLowerCase().includes('what are your main weight loss goals')) {
              const answerArray = Array.isArray(res.answer) ? res.answer : [res.answer];
              const stringArray = answerArray.filter((a): a is string => typeof a === 'string').map((a) => String(a));
              displayAnswer = <>{stringArray.join(', ')}</>;
            } else if (
              res.questionText.toLowerCase().includes('do you have or have you ever had any medical condition')
            ) {
              const answerArray = Array.isArray(res.answer) ? res.answer : [res.answer];
              const stringArray = answerArray.filter((a): a is string => typeof a === 'string').map((a) => String(a));
              displayAnswer = <>{stringArray.join(', ')}</>;
            } else if (res.questionText.toLowerCase().includes('provider group')) {
              const answerArray = Array.isArray(res.answer) ? res.answer : [res.answer];
              const stringArray = answerArray.filter((a): a is string => typeof a === 'string').map((a) => String(a));
              displayAnswer = <>{stringArray.join(', ')}</>;
            } else {
              // Handle MULTIPLE_CHOICE, DROPDOWN, and CHECKBOXES question types
              if (isChoiceQuestion(res.questionType) && res.options && res.options.length > 0) {
                displayAnswer = (
                  <ChoiceQuestionResponse response={res} textSizeClass={isProvider ? 'tw-text-sm' : 'tw-text-xs'} />
                );
              } else {
                // Check if answer is a stringified JSON object or Record<string, unknown>
                const jsonAnswer = checkAndRenderJSON(res.answer, isProvider ? 'text-sm' : 'text-xs');
                if (jsonAnswer) {
                  displayAnswer = jsonAnswer;
                } else {
                  // Handle different answer types
                  if (
                    typeof res.answer === 'string' ||
                    typeof res.answer === 'number' ||
                    typeof res.answer === 'boolean'
                  ) {
                    displayAnswer = <>{String(res.answer)}</>;
                  } else if (Array.isArray(res.answer)) {
                    displayAnswer = <>{res.answer.map((a) => String(a)).join(', ')}</>;
                  } else if (typeof res.answer === 'object' && res.answer !== null) {
                    displayAnswer = <>{JSON.stringify(res.answer, null, 2)}</>;
                  } else {
                    displayAnswer = <NotProvidedMessage className={`${isProvider ? 'tw-text-sm' : 'tw-text-xs'}`} />;
                  }
                }
              }
            }

            // Only handle otherText for non-choice questions (choice questions handle it in ChoiceQuestionResponse)
            if (res.otherText && !isChoiceQuestion(res.questionType)) {
              const answerDisplay =
                typeof res.answer === 'string' || typeof res.answer === 'number' || typeof res.answer === 'boolean'
                  ? String(res.answer)
                  : Array.isArray(res.answer)
                  ? res.answer.map((a) => String(a)).join(', ')
                  : typeof res.answer === 'object' && res.answer !== null
                  ? JSON.stringify(res.answer, null, 2)
                  : '';
              displayAnswer = (
                <div className='tw-flex tw-flex-col tw-gap-1'>
                  {answerDisplay}
                  <div>{res.otherText}</div>
                </div>
              );
            }

            return (
              <div key={i} style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                <p
                  className={`${isProvider ? 'text-sm' : 'text-xs'} tw-mb-0 fw-medium ${
                    res.isHighlighted ? 'text-danger' : 'text-placeholder'
                  }`}
                  style={{ wordBreak: 'break-word' }}
                >
                  Q{i + 1}. {res.questionText}
                </p>
                <div
                  className={`${isProvider ? 'text-sm' : 'text-xs'} tw-mb-4 fw-medium ms-4`}
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                  {displayAnswer}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PatientPopupCard = SurveyPopupCard;
