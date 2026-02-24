'use client';

import toast from 'react-hot-toast';
import QuestionForm from '@/components/ProvidersModule/ProviderIntakeSurvey/includes/QuestionForm';
import { useState, useEffect, useMemo } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useUpdateSurveySubmissionResponsesMutation } from '@/store/slices/surveysApiSlice';
import { getErrorMessage } from '@/lib/errors';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import { FiArrowLeft } from 'react-icons/fi';
import { providerIntakeSurveySchema } from '@/schemas/providerIntakeSurvey';
import { ProviderSurveyFormValues, LicenseQuestionAnswer } from '@/services/providerIntake/types';
import { AdminLicenseQuestion } from './AdminLicenseQuestion';

interface RawLicenseData {
  state: string;
  licenseNumber: string;
  expiryDate: string | Date | null | undefined;
}

interface SurveyResponse {
  questionId: string;
  questionText: string;
  questionType: string;
  answer: unknown;
  options?: string[];
}

interface EditProviderAnswersModalProps {
  show: boolean;
  onClose: () => void;
  submissionId: string;
  surveyName: string;
  responses: SurveyResponse[];
  questions: SurveyQuestion[];
  providerId: string;
  onSuccess?: () => void;
}

export default function EditProviderAnswersModal({
  show,
  onClose,
  submissionId,
  surveyName,
  responses,
  questions,
  onSuccess,
}: Readonly<EditProviderAnswersModalProps>) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [updateSubmissionResponses, { isLoading }] = useUpdateSurveySubmissionResponsesMutation();
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);
  const [isSavingLicenses, setIsSavingLicenses] = useState(false);
  const [fetchedLicenses, setFetchedLicenses] = useState<LicenseQuestionAnswer[] | null>(null);

  const currentQuestion = questions[questionIndex];
  const fieldName = currentQuestion?.id || '';

  const progressValue = ((questionIndex + 1) / questions.length) * 100;
  const isLastQuestion = questionIndex === questions.length - 1;

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = async (
    values: ProviderSurveyFormValues,
    { setTouched, setErrors }: FormikHelpers<ProviderSurveyFormValues>
  ) => {
    const fieldKey = currentQuestion?.id || '';

    await setTouched({ [fieldKey]: true });

    try {
      await providerIntakeSurveySchema(currentQuestion).validate(values, { abortEarly: false });
    } catch (error) {
      if (error instanceof Error && 'inner' in error) {
        const validationError = error as { inner: Array<{ path?: string; message: string }> };
        const validationErrors: Record<string, string> = {};

        validationError.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });

        setErrors(validationErrors);
        toast.error('Please fix the errors before proceeding');
        return;
      }
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSaveChanges = async (values: ProviderSurveyFormValues) => {
    try {
      setIsSavingLicenses(true);

      const responsesPayload = Object.entries(values).map(([questionId, answer]) => {
        const question = questions.find((q) => q.id === questionId);
        const questionText = (question?.questionText || '').toLowerCase();

        const isLicenseQ =
          questionText.includes('licen') &&
          (questionText.includes('provide') ||
            questionText.includes('enter') ||
            questionText.includes('list') ||
            questionText.includes('state license') ||
            questionText.includes('what state') ||
            questionText.includes('add your') ||
            !questionText.includes('do you have'));

        const isProviderGroupQ = questionText.includes('provider group');

        let processedAnswer: string | string[] = '';

        if (isLicenseQ && Array.isArray(answer)) {
          const licensesWithFormattedDates = (answer as LicenseQuestionAnswer[]).map((license) => {
            if (license.expiryDate instanceof Date) {
              const year = license.expiryDate.getFullYear();
              const month = String(license.expiryDate.getMonth() + 1).padStart(2, '0');
              const day = String(license.expiryDate.getDate()).padStart(2, '0');
              return {
                ...license,
                expiryDate: `${year}-${month}-${day}`,
              };
            }
            return license;
          });
          processedAnswer = JSON.stringify(licensesWithFormattedDates);
        } else if (isProviderGroupQ) {
          if (Array.isArray(answer)) {
            processedAnswer = answer
              .filter((item): item is string => typeof item === 'string')
              .filter((item) => item.toLowerCase() !== 'other');
          } else {
            processedAnswer = answer as string;
          }
        } else if (typeof answer === 'string') {
          processedAnswer = answer;
        } else if (Array.isArray(answer)) {
          processedAnswer = answer
            .filter((item): item is string => typeof item === 'string')
            .filter((item) => item.toLowerCase() !== 'other');
        } else if (answer instanceof Date) {
          const year = answer.getFullYear();
          const month = String(answer.getMonth() + 1).padStart(2, '0');
          const day = String(answer.getDate()).padStart(2, '0');
          processedAnswer = `${year}-${month}-${day}`;
        } else {
          processedAnswer = '';
        }

        return {
          questionId,
          answer: processedAnswer,
        };
      });

      const { success, message } = await updateSubmissionResponses({
        submissionId,
        responses: responsesPayload,
        isFromAdmin: true,
      }).unwrap();

      if (success) {
        toast.success('Provider intake form updated successfully');
        onSuccess?.();
        onClose();
      } else {
        toast.error(message || 'Error while updating provider information');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingLicenses(false);
    }
  };

  const handleCancel = () => {
    setQuestionIndex(0);
    onClose();
  };

  const isLicenseQuestion = useMemo(() => {
    const questionText = (currentQuestion?.questionText || '').toLowerCase();
    return (
      questionText.includes('licen') &&
      (questionText.includes('provide') ||
        questionText.includes('enter') ||
        questionText.includes('list') ||
        questionText.includes('state license') ||
        questionText.includes('what state') ||
        questionText.includes('add your') ||
        !questionText.includes('do you have'))
    );
  }, [currentQuestion]);

  const initialValues = useMemo(() => {
    const values: ProviderSurveyFormValues = {};
    responses.forEach((response) => {
      let answer = response.answer;

      const questionText = response.questionText.toLowerCase();
      const isLicenseTableQuestion =
        questionText.includes('licen') &&
        (questionText.includes('provide') ||
          questionText.includes('enter') ||
          questionText.includes('list') ||
          questionText.includes('state license') ||
          questionText.includes('what state') ||
          questionText.includes('add your') ||
          !questionText.includes('do you have'));

      if (isLicenseTableQuestion && fetchedLicenses) {
        values[response.questionId] = fetchedLicenses;
        return;
      }

      if (isLicenseTableQuestion) {
        if (typeof answer === 'string') {
          try {
            answer = JSON.parse(answer);
          } catch {
            answer = [];
          }
        }
        if (!Array.isArray(answer)) {
          answer = [];
        }

        if (Array.isArray(answer) && answer.length > 0) {
          answer = (answer as RawLicenseData[]).map((license) => {
            const cleanLicense: LicenseQuestionAnswer = {
              state: license.state || '',
              expiryDate: null,
              licenseNumber: license.licenseNumber || '',
            };

            if (license.expiryDate) {
              if (typeof license.expiryDate === 'string') {
                const parsedDate = new Date(license.expiryDate);
                if (!isNaN(parsedDate.getTime())) {
                  cleanLicense.expiryDate = parsedDate;
                }
              } else if (license.expiryDate instanceof Date && !isNaN(license.expiryDate.getTime())) {
                cleanLicense.expiryDate = license.expiryDate;
              }
            }

            return cleanLicense;
          });
        }
      }

      const matchingQuestion = questions.find((q) => q.id === response.questionId);
      const isDateField =
        matchingQuestion?.validation === 'date' ||
        questionText.includes('available to start') ||
        questionText.includes('joining date') ||
        questionText.includes('start date');
      const isProviderGroupQuestion = questionText.includes('provider group');

      if (isDateField && answer && typeof answer === 'string') {
        const parsedDate = new Date(answer);
        answer = isNaN(parsedDate.getTime()) ? null : parsedDate;
      }

      if (isProviderGroupQuestion) {
        if (typeof answer === 'string') {
          try {
            answer = JSON.parse(answer);
          } catch {
            answer = [answer];
          }
        }
        if (!Array.isArray(answer)) {
          answer = answer ? [answer] : [];
        }
      }

      values[response.questionId] = answer as string | string[] | Date | LicenseQuestionAnswer[] | undefined;
    });

    if (fetchedLicenses) {
      questions.forEach((question) => {
        const questionText = (question.questionText || '').toLowerCase();
        const isLicenseTableQuestion =
          questionText.includes('licen') &&
          (questionText.includes('provide') ||
            questionText.includes('enter') ||
            questionText.includes('list') ||
            questionText.includes('state license') ||
            questionText.includes('what state') ||
            questionText.includes('add your') ||
            !questionText.includes('do you have'));

        if (isLicenseTableQuestion && question.id) {
          values[question.id] = fetchedLicenses;
        }
      });
    }

    return values;
  }, [responses, questions, fetchedLicenses]);

  useEffect(() => {
    if (show) {
      setQuestionIndex(0);
      setFetchedLicenses(null);
    }
  }, [show]);

  useEffect(() => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion || !show) return;

    const questionText = (currentQuestion.questionText || '').toLowerCase();
    const isLicenseTableQuestion =
      questionText.includes('licen') &&
      (questionText.includes('provide') ||
        questionText.includes('enter') ||
        questionText.includes('list') ||
        questionText.includes('state license') ||
        questionText.includes('what state') ||
        questionText.includes('add your') ||
        !questionText.includes('do you have'));

    if (isLicenseTableQuestion && !fetchedLicenses) {
      const licenseResponse = responses.find((r) => r.questionId === currentQuestion.id);

      if (licenseResponse && licenseResponse.answer) {
        try {
          setIsLoadingLicenses(true);
          let parsedLicenses = [];

          if (typeof licenseResponse.answer === 'string') {
            parsedLicenses = JSON.parse(licenseResponse.answer);
          } else if (Array.isArray(licenseResponse.answer)) {
            parsedLicenses = licenseResponse.answer;
          }

          if (!Array.isArray(parsedLicenses)) {
            parsedLicenses = [];
          }

          const formattedLicenses: LicenseQuestionAnswer[] = parsedLicenses.map((lic: RawLicenseData) => {
            let expiryDate: Date | null = null;
            if (lic.expiryDate) {
              expiryDate = new Date(lic.expiryDate);
            }

            return {
              state: lic.state,
              licenseNumber: lic.licenseNumber,
              expiryDate,
            };
          });

          setFetchedLicenses(formattedLicenses);
        } catch (error) {
          toast.error(`Failed to parse license data: ${error}`);
        } finally {
          setIsLoadingLicenses(false);
        }
      } else {
        setFetchedLicenses([]);
        setIsLoadingLicenses(false);
      }
    }
  }, [questionIndex, questions, show, responses, fetchedLicenses]);

  if (!currentQuestion || !fieldName) {
    return null;
  }

  return (
    <Modal
      dialogClassName='tw-transition-all tw-duration-300'
      show={show}
      onHide={handleCancel}
      centered
      size={isLicenseQuestion ? 'xl' : undefined}
      backdrop='static'
    >
      <Modal.Header className='border-0 align-items-start' closeButton>
        <Modal.Title>{surveyName}</Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize
        validationSchema={providerIntakeSurveySchema(currentQuestion)}
        initialValues={initialValues}
        onSubmit={handleNext}
        validateOnMount
      >
        {({ setTouched, setErrors, values }) => (
          <Form>
            <Modal.Body className='tw-min-h-96'>
              <div className='d-flex gap-4 align-items-center mb-4'>
                {questionIndex > 0 && (
                  <button
                    type='button'
                    onClick={() => {
                      setTimeout(() => {
                        setTouched({});
                        setErrors({});
                      }, 10);
                      handlePrev();
                    }}
                    className='d-inline-flex btn-no-style align-items-center gap-2 text-primary cursor-pointer'
                  >
                    <FiArrowLeft size={16} />
                    Back
                  </button>
                )}
                <div className='progress flex-grow-1 rounded-5 overflow-hidden' style={{ height: '8px' }}>
                  <span className='progress-bar' role='progressbar' style={{ width: `${progressValue}%` }} />
                </div>
                <span className='text-muted small'>
                  {questionIndex + 1} / {questions.length}
                </span>
              </div>

              <p className='md:tw-text-[22px] md:tw-leading-[27px] tw-font-medium tw-font-secondary tw-my-6 md:tw-mt-10 md:tw-mb-8'>
                {currentQuestion.questionText}
              </p>

              {isLicenseQuestion ? (
                isLoadingLicenses ? (
                  <div className='text-center py-5'>
                    <Spinner animation='border' variant='primary' />
                    <p className='mt-3 text-muted'>Loading licensed states...</p>
                  </div>
                ) : (
                  <AdminLicenseQuestion key={`question-${questionIndex}`} question={currentQuestion} name={fieldName} />
                )
              ) : (
                <div className='tw-w-full tw-mx-auto'>
                  <QuestionForm
                    key={`question-${questionIndex}`}
                    question={currentQuestion}
                    name={fieldName}
                    isAdminEdit={true}
                  />
                  <ErrorMessage name={fieldName} component={'div'} className='invalid-feedback d-block' />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className='border-0'>
              <div className='d-flex justify-content-end gap-3 tw-text-nowrap m-0 tw-px-1'>
                {!isLastQuestion && (
                  <button
                    disabled={isLoading || isSavingLicenses}
                    type='submit'
                    className='btn btn-outline-primary px-4 d-flex align-items-center gap-2'
                  >
                    Next
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => handleSaveChanges(values)}
                  disabled={isLoading || isSavingLicenses}
                  className='btn btn-primary px-4 d-flex align-items-center gap-2'
                >
                  {isSavingLicenses ? (
                    <>
                      Saving... <Spinner size='sm' />
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              </div>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
