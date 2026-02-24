'use client';

import QuestionForm from '@/components/ProvidersModule/ProviderIntakeSurvey/includes/QuestionForm';
import toast from 'react-hot-toast';
import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import * as Yup from 'yup';
import { QuestionType } from '@/lib/enums';
import { useSubmitSurveyMutation } from '@/store/slices/providerInviteApi';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa6';
import { FiArrowLeft } from 'react-icons/fi';
import { Error } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ErrorMessage, Form, Formik, FormikErrors, FormikHelpers, FormikTouched } from 'formik';
import { LicenseQuestionAnswer, ProviderSurveyFormValues } from '@/services/providerIntake/types';
import { loadSync, queueEncryptedSave, saveEncrypted, loadEncrypted } from '@/lib/encryptedStorage';
import { INVITATION_TOKEN, PROVIDER_SURVEY_ANSWERS } from '@/constants/intakeSurvey';
import { isAxiosError } from 'axios';
import { setModal } from '@/store/slices/modalSlice';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { providerIntakeSurveySchema } from '@/schemas/providerIntakeSurvey';

interface Props {
  token?: string;
  email?: string;
  message: string;
  questions: SurveyQuestion[];
  surveyId: string;
}

export const ProviderIntakeSurvey = ({ email = '', token, questions, message, surveyId }: Readonly<Props>) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { windowWidth } = useWindowWidth();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<ProviderSurveyFormValues>({});

  // Ref to track if initial answers restoration has been done
  const hasRestoredAnswers = useRef(false);

  const [submitSurvey, { isLoading }] = useSubmitSurveyMutation();

  const handleUnifiedSubmit = async (
    values: ProviderSurveyFormValues,
    { setTouched, setErrors }: FormikHelpers<ProviderSurveyFormValues>
  ) => {
    const currentQuestion = questions[questionIndex];
    const fieldKey = currentQuestion?.id || '';

    // For license questions, we need to set touched for nested fields
    const isCurrentLicenseQuestion = (currentQuestion?.questionText || '').toLowerCase().includes('licen');

    if (isCurrentLicenseQuestion) {
      // Mark all licenses and their fields as touched
      const licenseValues = (values[fieldKey] as LicenseQuestionAnswer[]) || [];
      const touchedLicenses = licenseValues.map(() => ({
        state: true,
        expiryDate: true,
        licenseNumber: true,
      }));
      // Type assertion needed because FormikTouched doesn't support nested touched state for dynamic field arrays
      await setTouched({
        [fieldKey]: touchedLicenses,
      } as unknown as FormikTouched<ProviderSurveyFormValues>);
    } else {
      // For non-license fields, just mark the field as touched
      await setTouched({ [fieldKey]: true });
    }

    // Check if the current field is valid
    try {
      await providerIntakeSurveySchema(currentQuestion).validate(values, { abortEarly: false });
    } catch (error) {
      // If validation fails, check if it's a non-required empty license field
      if (error instanceof Yup.ValidationError) {
        const licenseValues = (values[fieldKey] as LicenseQuestionAnswer[]) || [];

        // If license question is not required and array is empty, allow proceeding
        if (isCurrentLicenseQuestion && !currentQuestion.isRequired && licenseValues.length === 0) {
          // Validation passes, continue to next question
        } else {
          // Build error object with proper typing
          const validationErrors: Record<string, string | Record<string, string>[]> = {};

          error.inner.forEach((err) => {
            if (err.path) {
              // Handle nested paths for license arrays (e.g., "questionId.0.state")
              const pathParts = err.path.split('.');
              if (pathParts.length > 1) {
                const [arrayKey, index, field] = pathParts;
                const idx = parseInt(index, 10);

                if (!validationErrors[arrayKey]) {
                  validationErrors[arrayKey] = [];
                }

                const errorsArray = validationErrors[arrayKey] as Record<string, string>[];
                if (!errorsArray[idx]) {
                  errorsArray[idx] = {};
                }
                errorsArray[idx][field] = err.message;
              } else {
                // Simple field error
                validationErrors[err.path] = err.message;
              }
            }
          });

          setErrors(validationErrors as FormikErrors<ProviderSurveyFormValues>);
          toast.error('Please fill in all required fields before proceeding');
          return;
        }
      }
    }

    // If we get here, validation passed
    // Save current answers to state and encrypted storage
    const updatedAnswers = { ...savedAnswers, ...values };
    setSavedAnswers(updatedAnswers);
    saveEncrypted(PROVIDER_SURVEY_ANSWERS, updatedAnswers);

    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
    } else {
      await submitFinal(values);
    }

    setTouched({});
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      const prevIndex = questionIndex - 1;
      setQuestionIndex(prevIndex);
    }
  };

  const submitFinal = async (currentValues: ProviderSurveyFormValues) => {
    if (!token || !surveyId) return;

    const answers = Object.keys(currentValues).map((questionId) => {
      const question = questions.find((question) => question.id === questionId);
      const { isRequired } = question || {};
      const questionText = (question?.questionText || '').toLowerCase();
      const isLicenseQuestion = questionText.includes('licen');
      // const isProviderGroupQuestion = questionText.includes('provider group');

      const answer = currentValues[questionId];
      let serializedAnswer: unknown = answer;

      if (answer instanceof Date) {
        const year = answer.getFullYear();
        const month = String(answer.getMonth() + 1).padStart(2, '0');
        const day = String(answer.getDate()).padStart(2, '0');
        serializedAnswer = `${year}-${month}-${day}`;
      } else if (isLicenseQuestion && Array.isArray(answer)) {
        type SerializedLicense = { state: string; licenseNumber: string; expiryDate: string };
        serializedAnswer = (answer as LicenseQuestionAnswer[]).map(
          (license): LicenseQuestionAnswer | SerializedLicense => {
            if (license.expiryDate instanceof Date) {
              const year = license.expiryDate.getFullYear();
              const month = String(license.expiryDate.getMonth() + 1).padStart(2, '0');
              const day = String(license.expiryDate.getDate()).padStart(2, '0');
              return {
                state: license.state,
                licenseNumber: license.licenseNumber,
                expiryDate: `${year}-${month}-${day}`,
              };
            }
            return license;
          }
        );
      }

      return {
        questionId,
        answer: isLicenseQuestion ? JSON.stringify(serializedAnswer) : (serializedAnswer as string | string[]) || '',
        isRequired,
      };
    });

    try {
      const response = await submitSurvey({
        email,
        token,
        answers,
        surveyId,
      }).unwrap();

      const { success, message } = response as unknown as { success: boolean; message: string };

      if (success) {
        queueEncryptedSave(INVITATION_TOKEN, token);
        // Clear survey answers from encrypted storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(PROVIDER_SURVEY_ANSWERS);
        }
        // Clear state
        setSavedAnswers({});
        dispatch(setModal({ modalType: 'Provider Survey Thanks' }));
      } else {
        toast.error(message);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || 'An unexpected error occurred while submitting the form');
      } else {
        toast.error((error as Error).data.message || 'An unexpected error occurred while submitting the form');
      }
    }
  };

  const { currentQuestion, isLastQuestion, progressValue } = useMemo(() => {
    return {
      currentQuestion: questions[questionIndex],
      progressValue: ((questionIndex + 1) / questions.length) * 100,
      isLastQuestion: questionIndex === questions.length - 1,
    };
  }, [questions, questionIndex]);

  function getInitialValue(question: SurveyQuestion, email?: string) {
    const text = (question.questionText || '').toLowerCase();

    // License composite question expects an array of objects
    if (text.includes('licen')) return [];

    if (text.includes('provider group')) return [];

    if (text.includes('available to start')) return new Date(new Date().setDate(new Date().getDate() + 1));

    // Multi-select uses an array
    if (question.questionType === QuestionType.MULTIPLE_CHOICE) return [];

    // Single-select types use a string
    if ([QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question.questionType as QuestionType)) return '';

    if (email && (text.includes('email') || question.validation === 'email')) return email;

    if (question.validation === 'date') return null;

    return '';
  }

  const isLicenseQuestion = useMemo(() => {
    const text = (currentQuestion?.questionText || '').toLowerCase();
    return text.includes('licen');
  }, [currentQuestion]);

  const fieldName = currentQuestion?.id || 'field';

  const initialValues = useMemo(() => {
    const values: ProviderSurveyFormValues = {};
    questions.forEach((question) => {
      const questionId = question.id || '';
      let value: string | string[] | Date | LicenseQuestionAnswer[] | undefined | null =
        savedAnswers[questionId] ?? (getInitialValue(question, email) as string[]);

      // Convert date strings back to Date objects when restoring from storage
      const text = (question.questionText || '').toLowerCase();
      const isDateField = question.validation === 'date' || text.includes('available to start');
      const isLicenseField = text.includes('licen');

      if (isDateField && value && typeof value === 'string') {
        const parsedDate = new Date(value);
        value = isNaN(parsedDate.getTime()) ? null : parsedDate;
      }

      // Handle license arrays - convert expiry date strings back to Date objects
      if (isLicenseField && Array.isArray(value)) {
        value = (value as LicenseQuestionAnswer[]).map((license) => {
          if (license.expiryDate && typeof license.expiryDate === 'string') {
            const parsedDate = new Date(license.expiryDate);
            return {
              ...license,
              expiryDate: isNaN(parsedDate.getTime()) ? null : parsedDate,
            };
          }
          return license;
        });
      }

      // Convert null to undefined for form values
      values[questionId] = value ?? undefined;
    });
    return values;
  }, [questions, email, savedAnswers]);

  useEffect(() => {
    if (!token) return;

    try {
      const tokenExists = loadSync<string>(INVITATION_TOKEN);
      if (tokenExists && tokenExists === token) {
        setShowAlreadySubmittedModal(true);
      }
    } catch (e) {
      console.log(e);
    }
  }, [token]);

  // Restore answers from encrypted storage on component mount
  useEffect(() => {
    if (questions.length > 0 && !hasRestoredAnswers.current) {
      try {
        // Restore answers
        const storedAnswers = loadEncrypted<ProviderSurveyFormValues>(PROVIDER_SURVEY_ANSWERS);
        if (storedAnswers) {
          setSavedAnswers(storedAnswers);
        }
      } catch (e) {
        console.error('Error restoring provider survey answers:', e);
      }
      hasRestoredAnswers.current = true;
    }
  }, [questions]);

  if (!questions || questions.length === 0 || !token || !surveyId || showAlreadySubmittedModal) {
    return (
      <div className='container d-flex align-items-center justify-content-center py-5 mt-5'>
        <div className='text-center mt-4 max-w-477 mx-auto'>
          <Image src={Logo} alt='LumiMeds Logo' className='tw-mb-6 lg:tw-mb-10 tw-mx-auto' quality={100} />
          <h3 className='mb-3 text-danger'>😔 Sorry, we couldn&apos;t load your survey</h3>
          <p className='text-muted'>
            It looks like something went wrong on our end or your invitation link may be invalid or expired.
          </p>
          {message ? <p className='text-muted my-2'>{message}</p> : null}
          <p className='text-muted my-4'>
            Please try refreshing the page. If the survey still won&apos;t load, please contact support or try again
            later.
          </p>
          <div className='d-flex justify-content-center gap-3'>
            <button onClick={router.refresh} className='btn btn-outline-primary rounded-pill px-4 py-2'>
              Refresh
            </button>
            <Link href='/' className='btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2'>
              <FiArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='tw-mb-10 lg:tw-mb-14 tw-px-4'>
      <Formik
        enableReinitialize
        validationSchema={providerIntakeSurveySchema(currentQuestion)}
        initialValues={initialValues}
        onSubmit={handleUnifiedSubmit}
        validateOnMount
      >
        {({ setTouched, setErrors, values }) => (
          <Form>
            <Image src={Logo} alt='LumiMeds Logo' className='tw-mb-6 lg:tw-mb-10 tw-mx-auto' quality={100} />
            <div className='tw-max-w-[700px] mx-auto tw-w-full tw-relative'>
              {questionIndex > 0 && (
                <button
                  type='button'
                  onClick={() => {
                    setTimeout(() => {
                      setTouched({});
                      setErrors({});
                    }, 10);

                    // Save current form values before going back
                    const updatedAnswers = { ...savedAnswers, ...values };
                    setSavedAnswers(updatedAnswers);
                    saveEncrypted(PROVIDER_SURVEY_ANSWERS, updatedAnswers);

                    handlePrev();
                  }}
                  className='tw-flex tw-items-center tw-gap-2 tw-text-primary btn-no-style tw-mx-auto lg:tw-mx-0 tw-mb-4 md:tw-mb-6 lg:tw-mb-0 lg:tw-absolute lg:tw-top-[-11px] lg:tw-left-[-100px]'
                >
                  <FiArrowLeft size={16} />
                  Back
                </button>
              )}
              <div className='progress flex-grow-1 !tw-h-2'>
                <span className='progress-bar' role='progressbar' style={{ width: `${progressValue}%` }} />
              </div>
              <p className='md:tw-text-[22px] md:tw-leading-[27px] tw-font-medium tw-font-secondary tw-my-6 md:tw-mt-10 md:tw-mb-8'>
                {questions[questionIndex]?.questionText}
              </p>
            </div>

            <div
              className={
                'mx-auto tw-w-full' + (windowWidth > 1200 && isLicenseQuestion ? ' tw-container' : ' tw-max-w-[700px]')
              }
            >
              <QuestionForm
                key={`question-${questionIndex}`}
                question={questions[questionIndex]}
                email={email || undefined}
                name={fieldName}
              />

              {!isLicenseQuestion && (
                <ErrorMessage name={fieldName} component={'div'} className='invalid-feedback d-block' />
              )}
            </div>

            <div className='tw-max-w-[700px] mx-auto tw-w-full'>
              <button
                disabled={isLoading}
                type='submit'
                className='btn btn-primary rounded-pill md:!tw-text-lg !tw-py-2 md:!tw-py-3 d-flex align-items-center gap-3 justify-content-center tw-font-semibold tw-w-full tw-shadow-subtle tw-mt-8'
              >
                {isLastQuestion ? 'Submit Survey' : 'Next'}
                {isLoading ? <Spinner size='sm' /> : <FaArrowRight size={20} />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
