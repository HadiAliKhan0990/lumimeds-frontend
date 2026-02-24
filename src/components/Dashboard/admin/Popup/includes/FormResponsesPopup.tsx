'use client';

import Link from 'next/link';
import Search from '@/components/Dashboard/Search';
import Loading from '@/components/Dashboard/Loading';
import PreviousButton from '@/components/Dashboard/PreviousButton';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetSurveyResponseQuery, useLazyGetSurveyResponsesQuery } from '@/store/slices/surveysApiSlice';
import { debounce } from 'lodash';
import { formatUSDate, formatUSDateTime } from '@/helpers/dateFormatter';
import { SurveyResponse } from '@/store/slices/surveyResponseSlice';
import { QuestionType } from '@/lib/enums';
import { FileAnswer } from '@/components/Dashboard/FileAnswer';
import { Column, Table } from '@/components/Dashboard/Table';
import { NotesState } from '@/store/slices/patientNotesSlice';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineSkipNext, MdOutlineSkipPrevious } from 'react-icons/md';
import { setShowResponses } from '@/store/slices/surveyResponsePopupSlice';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import {
  tryParseJSON,
  formatFieldName,
  renderFieldValue,
  isEmptyAnswer,
  isChoiceQuestion,
} from '@/helpers/surveyResponses';
import { PatientAnswerType } from '@/lib/types';
import { ChoiceQuestionResponse } from '@/components/Dashboard/surveyResponses/ChoiceQuestionResponse';
import { NotProvidedMessage } from '@/components/Dashboard/surveyResponses/NotProvidedMessage';

export default function FormResponsesPopup() {
  const dispatch = useDispatch();

  const [searchString, setSearchString] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [meta, setMeta] = useState<NotesState['meta']>();

  const survey = useSelector((state: RootState) => state.survey);
  const showResponses = useSelector((state: RootState) => state.surveyResponsePopup.showResponses);
  const isPopupOpen = useSelector((state: RootState) => state.popup);

  const [surveyResponsesTrigger, { isFetching: isFetchingResponses }] = useLazyGetSurveyResponsesQuery();
  const [surveyResponseTrigger, { isFetching: isFetchingResponse }] = useLazyGetSurveyResponseQuery();

  const isFetching = useMemo(
    () => isFetchingResponses || isFetchingResponse,
    [isFetchingResponses, isFetchingResponse]
  );

  async function fetchResponses(queryMeta?: NotesState['meta']) {
    try {
      const { data } = await surveyResponsesTrigger({
        id: survey.id ?? '',
        ...(queryMeta ? { page: queryMeta.page, limit: queryMeta.limit } : { page: 1, limit: 15 }),
      }).unwrap();

      setMeta(data?.meta);
    } catch (error) {
      console.log(error);
    }
  }

  const responses = useSelector((state: RootState) => state.surveyResponses);
  const response = useSelector((state: RootState) => state.surveyResponse);

  const onSortChange = (sortOrder: string) => {
    setSortOrder(sortOrder);
    surveyResponsesTrigger({
      id: survey.id ?? '',
      sortOrder,
      ...(searchString !== '' && { search: searchString }),
    });
  };

  const onSearchChange = (value: string) => {
    setSearchString(value);
    debouncedSearch(value);
  };

  const searchResponses = (search: string) => {
    surveyResponsesTrigger({
      id: survey.id ?? '',
      ...(search !== '' && { search }),
      ...(sortOrder !== 'default' && { sortOrder }),
    });
  };

  const debouncedSearch = useCallback(debounce(searchResponses, 750), [survey.id, sortOrder]);

  const handleShowResponses = (response: SurveyResponse) => {
    dispatch(setShowResponses(true));
    surveyResponseTrigger(response.id ?? '');
  };

  useEffect(() => {
    if (survey.id) fetchResponses();
  }, [survey.id]);

  useEffect(() => {
    if (!isPopupOpen) {
      setSearchString('');
      setSortOrder('default');
    }
  }, [isPopupOpen]);

  if (isFetching) return <Loading />;

  if (showResponses)
    return (
      <>
        <PreviousButton style={{ top: '23px' }} onClick={() => dispatch(setShowResponses(false))} />
        <p className='mb-1 text-capitalize' style={{ fontSize: '24px' }}>
          {survey.name}
        </p>
        <div className='d-flex align-items-center gap-2'>
          <span className='text-sm'>Response from: </span>
          <span className='text-xs text-primary'>{response.patientName || response.submittedByName || ''}</span>
        </div>

        {response.responses?.map((resp, idx) => {
          const raw = resp.answer;
          let display = null;

          // Check if answer is empty using isEmptyAnswer helper
          if (isEmptyAnswer(raw)) {
            display = 'Not Provided';
          } else if (typeof raw === 'string') {
            if (resp?.validation === 'phone') {
              display = formatUSPhoneWithoutPlusOne(raw);
            } else if (resp.validation === 'date') {
              display = formatUSDate(raw);
            } else {
              display = raw;
            }
          } else if (Array.isArray(raw)) {
            display = raw.join(', ');
          } else if (typeof raw === 'object') {
            display = JSON.stringify(raw, null, 2);
          } else {
            display = String(raw);
          }

          const renderJSONObject = (obj: object, indentLevel = 0): React.ReactNode => {
            const entries = Object.entries(obj);
            const indentStyle = indentLevel > 0 ? { paddingLeft: '24px' } : {};

            return (
              <div style={indentStyle} className='d-flex flex-column gap-2'>
                {entries.map(([key, value]) => {
                  const isNestedObject = value && typeof value === 'object' && !Array.isArray(value) && value !== null;

                  if (isNestedObject) {
                    return (
                      <div key={key} className='d-flex flex-column gap-1'>
                        <span style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                          {formatFieldName(key)}:
                        </span>
                        <div>{renderJSONObject(value as object, indentLevel + 1)}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className='d-flex flex-column gap-1'>
                      <span style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                        {formatFieldName(key)}:
                      </span>
                      <span style={{ color: '#6B7280', fontSize: '14px', paddingLeft: '12px' }}>
                        {renderFieldValue(value)}
                      </span>
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
                  <div className='d-flex flex-column gap-3'>
                    {jsonItems.map((item, itemIdx) => {
                      const parsed = tryParseJSON(item);
                      return parsed ? (
                        <div key={itemIdx}>{renderJSONObject(parsed)}</div>
                      ) : (
                        <span key={itemIdx} style={{ color: '#6B7280', fontSize: '14px' }}>
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

          // Handle MULTIPLE_CHOICE, DROPDOWN, and CHECKBOXES question types
          const renderChoiceAnswer = (): React.ReactNode | null => {
            if (!isChoiceQuestion(resp.questionType) || !resp.options || resp.options.length === 0) {
              return null;
            }
            return <ChoiceQuestionResponse response={resp} textSizeClass='tw-text-sm' />;
          };

          return (
            <div key={idx} className='d-flex flex-column gap-3'>
              <div className='p-4 rounded-12 border border-c-light'>
                <div className='text-lg fw-bold pb-3 border-bottom border-c-light'>{resp.questionText}</div>
                {typeof raw === 'string' && resp.questionType === QuestionType.FILE_UPLOAD ? (
                  <FileAnswer answer={raw} />
                ) : (
                  <div style={{ color: '#6B7280', fontSize: '14px', padding: '12px' }}>
                    {(() => {
                      // Check if answer is empty first
                      if (isEmptyAnswer(raw)) {
                        return <NotProvidedMessage />;
                      }

                      // Check for choice question types first
                      const choiceAnswer = renderChoiceAnswer();
                      if (choiceAnswer) {
                        return choiceAnswer;
                      }

                      // Check if answer is a stringified JSON object or Record<string, unknown>
                      if (raw !== undefined && raw !== null) {
                        const jsonAnswer = checkAndRenderJSON(raw);
                        if (jsonAnswer) {
                          return jsonAnswer;
                        }
                      }
                      // Check if display string is empty after transformations
                      if (!display || (typeof display === 'string' && display.trim().length === 0)) {
                        return <NotProvidedMessage />;
                      }
                      // Otherwise display normally
                      return display;
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </>
    );

  const columns: Column<SurveyResponse>[] = [
    {
      header: 'NAME',
      renderCell: (o) =>
        o.submittedByType?.toLowerCase() === 'patient' || o.submittedByType?.toLowerCase() === 'provider' ? (
          <Link
            href={{
              pathname: '/admin/users',
              query: { q: o.name, r: o.submittedByType?.toLowerCase() },
            }}
            className='text-nowrap'
          >
            {o.name}
          </Link>
        ) : (
          o.name
        ),
    },
    { header: 'RESPONDENT', accessor: 'submittedByType' },
    {
      header: 'DATE OF RESPONSE',
      renderCell: (o) => (o.createdAt ? formatUSDateTime(o.createdAt) : '-'),
    },
    {
      header: 'ACTIONS',
      renderCell: (o) => (
        <span
          className='text-decoration-underline text-xs text-primary text-nowrap cursor-pointer'
          onClick={() => handleShowResponses(o)}
        >
          View Response
        </span>
      ),
    },
  ];

  const onClickFirst = () => {
    if (meta?.page && meta.page > 1) {
      fetchResponses({ ...meta, page: 1 });
    }
  };

  const onClickLast = () => {
    if (meta?.page && meta?.totalPages && meta.page < meta.totalPages) {
      fetchResponses({ ...meta, page: meta.totalPages });
    }
  };

  const onClickNext = () => {
    if (meta?.page && meta?.totalPages && meta.page < meta.totalPages) {
      fetchResponses({ ...meta, page: meta.page + 1 });
    }
  };

  const onClickPrev = () => {
    if (meta?.page && meta.page > 1) {
      fetchResponses({ ...meta, page: meta.page - 1 });
    }
  };
  return (
    <>
      <p className={'text-2xl text-capitalize'}>{survey.name}</p>
      <div className='d-flex align-items-sm-center justify-content-between gap-3 flex-column flex-sm-row'>
        <span className='text-primary fw-bold'>Respondents</span>
        <div className='row'>
          <div className='col-6'>
            <Search
              className='w-100'
              value={searchString ?? ''}
              placeholder='Search...'
              onChange={(e) => onSearchChange(e.currentTarget.value)}
            />
          </div>
          <div className='col-6'>
            <select
              className='form-select w-100 shadow-none'
              value={sortOrder ?? 'default'}
              onChange={(e) => onSortChange(e.currentTarget.value)}
            >
              <option value={'default'} disabled>
                Sort By
              </option>
              <option value={'ASC'}>ASC</option>
              <option value={'DESC'}>DESC</option>
            </select>
          </div>
        </div>
      </div>
      <div className='admin-content p-0 overflow-y-auto flex-grow-1'>
        <Table data={responses} columns={columns} />
      </div>
      {responses.length > 0 && (
        <div className='d-flex align-items-center justify-content-end gap-3'>
          <div>
            {meta?.page} of {meta?.totalPages}
          </div>
          <div className='d-flex align-items-center gap-3'>
            <button disabled={meta?.page === 1 || isFetching} onClick={onClickFirst} className='btn-no-style'>
              <MdOutlineSkipPrevious />
            </button>
            <button disabled={meta?.page === 1 || isFetching} onClick={onClickPrev} className='btn-no-style'>
              <MdKeyboardArrowLeft />
            </button>
            <button
              disabled={meta?.page === meta?.totalPages || isFetching}
              onClick={onClickNext}
              className='btn-no-style'
            >
              <MdKeyboardArrowRight />
            </button>
            <button
              disabled={meta?.page === meta?.totalPages || isFetching}
              onClick={onClickLast}
              className='btn-no-style'
            >
              <MdOutlineSkipNext />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
