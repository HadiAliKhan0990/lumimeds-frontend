'use client';

import FormBuilder from '@/components/Dashboard/admin/FormBuilder';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { QuestionType } from '@/lib/enums';
import { RootState } from '@/store';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { setSurveyQuestions } from '@/store/slices/surveyQuestionsSlice';
import { useAddSurveyMutation, useUpdateSurveyQuestionsMutation } from '@/store/slices/surveysApiSlice';
import { setSurvey, Survey } from '@/store/slices/surveySlice';
import { isEqual, uniqueId } from 'lodash';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { Error } from '@/lib/types';
import { SurveyConfirmtationModal } from '@/components/Dashboard/forms/SurveyConfirmtationModal';
import { UnsavedChangesModal } from '@/components/Dashboard/forms/UnsavedChangesModal';
import { PublishChangesModal } from '@/components/Dashboard/forms/PublishChangesModal';
import { FiMenu } from 'react-icons/fi';
import { setSidebarOpen } from '@/store/slices/generalSlice';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { isAxiosError } from 'axios';
import { BiChevronLeft } from 'react-icons/bi';

export type ModalType = 'Publish' | 'Save Changes' | 'Unsaved Changes' | 'Publish as Draft';

export default function AdminFormBuilderPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const nextUrlRef = useRef<string | null>(null);
  const backLinkRef = useRef<HTMLAnchorElement>(null);

  const [survey, setSurveyState] = useState<Survey | null>(null);
  const [openModal, setOpenModal] = useState<ModalType | undefined>();
  const [formName, setFormName] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [updateSurveyQuestions, { isLoading }] = useUpdateSurveyQuestionsMutation();
  const [addSurveyMutation, { isLoading: isPending }] = useAddSurveyMutation();

  const questions = useSelector((state: RootState) => state.surveyQuestions);
  const surveySelector = useSelector((state: RootState) => state.survey);
  const { hasUnsavedChanges } = surveySelector;

  function handleClose() {
    setOpenModal(undefined);
    setTimeout(() => {
      setErrorMessages([]);
    }, 200);
  }

  const proceedNavigation = () => {
    const url = nextUrlRef.current;
    nextUrlRef.current = null;
    handleClose();
    if (url) router.push(url);
  };

  const handleUpdateSurvey = (isDraft = false) => {
    const questionsToSend = questions.map((question) => {
      // Exclude UI state properties and other non-API properties
      const questionWithUIState = question as SurveyQuestion & {
        showMappingModal?: boolean;
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { showMappingModal, ...cleanQuestion } = questionWithUIState;

      if (cleanQuestion.isNew) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest} = cleanQuestion;
        return rest;
      }
      return cleanQuestion;
    });

    const errorMessages = questionsToSend
      .map((question, i) => {
        if (!question.questionText) return `Please add a question title to Question #${i + 1}`;
        else if (
          [QuestionType.CHECKBOXES, QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN].includes(
            question.questionType!
          ) &&
          (question.options?.length ?? 0) < 1
        )
          return `Please add at least 2 options to Question #${i + 1}`;
      })
      .filter((message): message is string => message !== undefined);

    if (errorMessages.length > 0) {
      setErrorMessages(errorMessages);
    } else if (survey?.id) {
      updateSurveyQuestions({
        id: survey.id ?? '',
        questions: questionsToSend,
      })
        .unwrap()
        .then(({ success, message }) => {
          if (success) {
            toast.success(message || 'Survey Updated Successfully!');
            backLinkRef.current?.click();
          } else {
            toast.error(message || 'Error while updating questions!');
          }
        })
        .catch((e: unknown) => {
          if (isAxiosError(e)) {
            toast.error(e.response?.data.message || 'Error while updating questions!');
          } else {
            toast.error((e as Error).data.message || 'Error while updating questions!');
          }
        })
        .finally(handleClose);
    } else {
      addSurveyMutation({
        name: survey?.name ?? '',
        questions: questionsToSend.map((q) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { isNew, ...rest } = q;
          return rest;
        }),
        typeId: survey?.type?.id ?? '',
        isManualGenerated: true,
        isActive: !isDraft,
      })
        .unwrap()
        .then(({ data, success, message }) => {
          if (success) {
            setSurveyState(data);
            dispatch(setSurvey({ ...survey, hasUnsavedChanges: false }));

            if (isDraft) {
              toast.success('Form is saved as Draft');
            } else {
              toast.success('Form is published');
            }

            backLinkRef.current?.click();
          } else {
            toast.error(message || 'Error while adding Survey!');
          }
        })
        .catch((e: unknown) => {
          if (isAxiosError(e)) {
            toast.error(e.response?.data.message || 'Error while adding Survey!');
          } else {
            toast.error((e as Error).data.message || 'Error while adding Survey!');
          }
        })
        .finally(handleClose);
    }
  };

  const addNewQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: uniqueId(),
      isRequired: false,
      isNew: true,
      position: questions.length + 1,
      questionText: null,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: null,
      validation: null,
    };
    dispatch(setSurveyQuestions([...questions, newQuestion]));
    toast.success('New Question Added Successfully!');

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        globalThis.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 300);
  };

  function handleClickPublish() {
    const questionsToSend = questions.map((question) => {
      if (question.isNew) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = question;
        return rest;
      }
      return question;
    });

    if (questions.length === 0) {
      toast.error('Survey form must contain at least one question before Publish');
    } else {
      if (survey?.id) {
        const original = survey.questions ?? [];
        if (isEqual(original, questionsToSend)) {
          toast.error('No changes detected. Please update at least one question before submitting.');
          return;
        }
        setOpenModal('Save Changes');
      } else {
        setOpenModal('Publish');
      }
    }
  }

  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsEditing(false),
  });

  useEffect(() => {
    if (survey?.name) setFormName(survey?.name ?? '');
    // else router.push(ROUTES.ADMIN_FORMS_SURVEYS);
  }, [survey?.name]);

  useEffect(() => {
    if (surveySelector.name) {
      setSurveyState(surveySelector);
      localStorage.setItem('lumimeds_savedSurvey', JSON.stringify(surveySelector));
    } else {
      try {
        const survey = JSON.parse(localStorage.getItem('lumimeds_savedSurvey') ?? '{}') as Survey;
        setSurveyState(survey);
      } catch (error) {
        console.error(error);
        backLinkRef.current?.click();
      }
    }
  }, [surveySelector]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    const handleNavigation = (url: string) => {
      if (hasUnsavedChanges && !isLoading && !isPending && !openModal && !survey?.id) {
        nextUrlRef.current = url;
        setOpenModal('Unsaved Changes');
        return false;
      }
      return true;
    };

    history.pushState = function (state, title, url) {
      if (handleNavigation(String(url))) {
        return origPush.apply(this, [state, title, url]);
      }
    };
    history.replaceState = function (state, title, url) {
      if (handleNavigation(String(url))) {
        return origReplace.apply(this, [state, title, url]);
      }
    };

    const onPopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges && !isLoading && !isPending && !openModal) {
        e.preventDefault();
        nextUrlRef.current = globalThis.location.href;
        setOpenModal('Unsaved Changes');
      }
    };

    globalThis.addEventListener('popstate', onPopState);

    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      globalThis.removeEventListener('popstate', onPopState);
    };
  }, [hasUnsavedChanges, isLoading, isPending, openModal]);

  useEffect(() => {
    if (!questions.length) return;

    let needsUpdate = false;
    const seen = new Set<number>();

    const normalizedQuestions = questions.map((question, index) => {
      const desiredPosition = index + 1;
      const currentPosition = question.position ?? desiredPosition;

      if (seen.has(currentPosition) || currentPosition !== desiredPosition) {
        needsUpdate = true;
        seen.add(desiredPosition);
        return {
          ...question,
          position: desiredPosition,
        };
      }

      seen.add(currentPosition);
      return question;
    });

    if (needsUpdate) {
      dispatch(setSurveyQuestions(normalizedQuestions));
    }
  }, [dispatch, questions]);

  return (
    <div>
      {/* Modals */}
      <SurveyConfirmtationModal
        open={openModal === 'Save Changes'}
        handleClose={handleClose}
        errorMessages={errorMessages}
        handleSubmit={() => handleUpdateSurvey(false)}
        isLoading={isLoading || isPending}
      />
      <UnsavedChangesModal
        open={openModal === 'Unsaved Changes'}
        handleClose={proceedNavigation}
        errorMessages={errorMessages}
        handleSubmit={() => handleUpdateSurvey(false)}
        isLoading={isLoading || isPending}
      />
      <PublishChangesModal
        name={survey?.name as string}
        open={openModal === 'Publish'}
        handleClose={handleClose}
        errorMessages={errorMessages}
        handleSubmit={() => handleUpdateSurvey(false)}
        isLoading={isLoading || isPending}
        isDraft={false}
      />
      <PublishChangesModal
        name={survey?.name as string}
        open={openModal === 'Publish as Draft'}
        handleClose={handleClose}
        errorMessages={errorMessages}
        handleSubmit={() => handleUpdateSurvey(true)}
        isLoading={isLoading || isPending}
        isDraft={true}
      />

      <Link
        ref={backLinkRef}
        href={ROUTES.ADMIN_FORMS_SURVEYS}
        className='text-decoration-none text-base d-inline-flex align-items-center'
      >
        <BiChevronLeft className='flex-shrink-0' size={20} />
        Back
      </Link>
      <div className='d-flex align-items-md-center mb-4 gap-3 justify-content-between flex-column flex-md-row'>
        <div className='d-flex align-items-center justify-content-md-start flex-grow-1 gap-2' ref={wrapperRef}>
          <FiMenu size={24} className={'cursor-pointer d-lg-none'} onClick={() => dispatch(setSidebarOpen(true))} />
          {isEditing ? (
            <input
              type='text'
              className='bg-transparent border-0 display-6 fw-medium w-auto p-0 form-bulider-input text-nowrap flex-grow-1'
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                }
              }}
              autoFocus
            />
          ) : (
            <span
              className='bg-transparent border-0 display-6 fw-medium w-auto p-0 form-bulider-input overflow-hidden text-nowrap flex-grow-1'
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {formName}
            </span>
          )}

          {survey?.isActive && (
            <div className='badge fw-normal bg-primary rounded-pill text-base fst-italic px-4 align-content-center'>
              Published
            </div>
          )}
        </div>

        <div className='d-flex align-items-center gap-2 justify-content-end text-nowrap'>
          <span className='text-lg fw-bold'>Type:</span>
          {survey?.type?.name && (
            <span className='rounded-pill text-base fst-italic border border-black py-2 px-3'>
              {survey?.type?.name}
            </span>
          )}
        </div>
      </div>

      <div className='bg-white rounded-12 flex-grow-1 p-md-4 p-3'>
        <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4'>
          <button
            className='btn btn-outline-primary py-2 fw-medium text-sm d-flex align-items-center justify-content-center gap-2'
            onClick={addNewQuestion}
          >
            <FaPlus />
            <span>Add New Question</span>
          </button>
          <div className='d-flex align-items-center flex-wrap gap-3'>
            {!survey?.id && (
              <button
                className={'btn btn-outline-primary py-2 fw-medium text-sm d-flex align-items-center gap-2'}
                onClick={() => {
                  if (questions.length === 0) {
                    toast.error('Survey form must contain at least one question before save as draft.');
                  } else {
                    setOpenModal('Publish as Draft');
                  }
                }}
              >
                Save as Draft
              </button>
            )}
            <button
              type='button'
              className={'btn btn-outline-primary py-2 fw-medium text-sm d-flex align-items-center gap-2'}
              onClick={handleClickPublish}
            >
              {survey?.id ? 'Save Changes' : 'Publish'}
            </button>
          </div>
        </div>
        <FormBuilder />
        {questions.length > 3 && (
          <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mt-5'>
            <button
              className='btn btn-outline-primary py-2 fw-medium text-sm d-flex align-items-center justify-content-center gap-2'
              onClick={addNewQuestion}
            >
              <FaPlus />
              <span>Add New Question</span>
            </button>
            <div className='d-flex align-items-center flex-wrap gap-3'>
              {!survey?.id && (
                <button
                  className={'btn btn-outline-primary py-2 fw-medium text-sm d-flex align-items-center gap-2'}
                  onClick={() => {
                    if (questions.length === 0) {
                      toast.error('Survey form must contain at least one question before save as draft.');
                    } else {
                      setOpenModal('Publish as Draft');
                    }
                  }}
                >
                  Save as Draft
                </button>
              )}
              <button
                type='button'
                className={'btn btn-outline-primary py-2 fw-medium text-sm d-flex align-items-center gap-2'}
                onClick={handleClickPublish}
              >
                {survey?.id ? 'Save Changes' : 'Publish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
