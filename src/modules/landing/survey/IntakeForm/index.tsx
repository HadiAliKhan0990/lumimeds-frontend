'use client';

import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/assets/logo.svg';
import toast from 'react-hot-toast';
import { IntakeFormSearchParams } from '@/services/survey/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';
import { QuestionType } from '@/lib/enums';
import { IntakeFormValues } from '@/types/survey';
import { Error, IntakeInitialStep } from '@/lib/types';
import { IntakeFormInitialStep } from '@/components/ui/IntakeForm/IntakFormInitialStep';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import { IntakeQuestionairre } from '@/modules/landing/survey/IntakeForm/includes/IntakeQuestionairre';
import { FaArrowRight } from 'react-icons/fa6';
import { AnimatePresence, motion } from 'framer-motion';
import { SubmitPendingIntakeAnswer, useSubmitPendingIntakeResponsesMutation } from '@/store/slices/surveysApiSlice';
import { uploadGeneralSurveyFile } from '@/lib/fileUpload';
import { isAxiosError } from 'axios';
import { Spinner } from 'react-bootstrap';
import { validationSchema } from '@/schemas/pendingIntakeSurvey';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';

interface Props {
  questions: SurveyQuestion[];
  searchParams: IntakeFormSearchParams;
  surveyId: string;
}

export default function IntakeForm({ questions, searchParams, surveyId }: Readonly<Props>) {
  const { email, firstName = '', lastName = '', phone = '' } = searchParams;

  const router = useRouter();

  const [position, setPosition] = useState(1);
  const [formStep, setFormStep] = useState<IntakeInitialStep>('initial');
  const [loading, setLoading] = useState(false);
  const [allAnswers, setAllAnswers] = useState<IntakeFormValues>({});
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [submitPendingIntakeResponses, { isLoading: isSubmittingResponse }] = useSubmitPendingIntakeResponsesMutation();

  const currentQuestion = useMemo(() => questions.find((item) => item.position === position), [questions, position]);

  function getInitialValue(question: SurveyQuestion) {
    const text = (question.questionText || '').toLowerCase();

    if (question.validation === 'phone') return formatUSPhoneWithoutPlusOne(phone);

    if (text.includes('first and last name') || text.includes('last name')) return firstName + ' ' + lastName;

    if (question.questionType === QuestionType.MULTIPLE_CHOICE) return [];

    if ([QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question.questionType as QuestionType)) return '';

    if (question.validation === 'email') return email;

    if (question.validation === 'date') return null;

    return '';
  }

  const fieldName = currentQuestion?.id || 'field';

  async function submitSurvey(answersToSubmit: SubmitPendingIntakeAnswer[], isSurveyCompleted: boolean) {
    try {
      setLoading(true);

      const answers = await Promise.all(
        answersToSubmit.map(async ({ answer, questionId = '', otherText, isRequired }) => {
          const q = questions.find((item) => item.id === questionId);

          if (answer instanceof File) {
            const url = await uploadGeneralSurveyFile({
              surveyId,
              email: email || '',
              file: answer,
            });
            return { questionId, answer: url, isRequired: true };
          } else if (Array.isArray(answer)) {
            let arr = [...answer];
            if (otherText) arr = arr.map((a) => (a.toLowerCase().includes('other') ? otherText : a));
            return { questionId, answer: arr, isRequired };
          } else if (otherText) {
            return { questionId, answer: otherText, isRequired };
          } else if (q?.questionType === QuestionType.FILE_UPLOAD) {
            return { questionId, answer, isRequired };
          }

          return { questionId, answer, isRequired };
        })
      );

      const { success, message } = await submitPendingIntakeResponses({
        answers,
        surveyId,
        isSurveyCompleted,
        patientEmail: email,
      }).unwrap();

      if (success) {
        if (!isLastQuestion) {
          setPosition(position + 1);
          setIsNavigatingBack(false);
        }

        if (isSurveyCompleted) {
          // Show success message without closing the window
          setShowSuccess(true);
        }
      } else {
        toast.error(message || 'Submission failed');
      }
    } catch (err) {
      toast.error(
        isAxiosError(err) ? err.response?.data?.message : (err as Error).data?.message || 'Submission failed'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values: IntakeFormValues, { setTouched }: FormikHelpers<IntakeFormValues>) {
    await setTouched({});

    const textKey = currentQuestion?.questionText?.toLowerCase() ?? '';
    const isDateOfBirth = textKey.includes('birth') || textKey.includes('dob');

    let value: SubmitPendingIntakeAnswer['answer'];

    // Process value based on question type
    if (isDateOfBirth && values[fieldName] instanceof Date) {
      const date = values[fieldName];
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      value = `${year}-${month}-${day}`;
    } else {
      const rawValue = values[fieldName];
      if (rawValue instanceof Date) {
        // Handle Date type that shouldn't be here
        value = rawValue.toISOString();
      } else {
        value = rawValue ?? '';
      }
    }

    // Get otherText for current question
    const otherTextValue = values.otherText || '';

    // Handle otherText for CHECKBOXES and DROPDOWN
    let finalOtherText = otherTextValue;
    if (
      [QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(currentQuestion?.questionType as QuestionType) &&
      !textKey.includes('gender')
    ) {
      const isOtherOption = currentQuestion?.options?.some(
        (option) =>
          (option.toLowerCase().includes('other') || option.toLowerCase().includes('please list')) && value === option
      );

      if (!isOtherOption) {
        finalOtherText = '';
      }
    }

    // Handle otherText for MULTIPLE_CHOICE
    if (currentQuestion?.questionType === QuestionType.MULTIPLE_CHOICE && Array.isArray(value)) {
      const hasOtherSelected = value.some(
        (v) => typeof v === 'string' && (v.toLowerCase().includes('other') || v.toLowerCase().includes('please'))
      );

      if (!hasOtherSelected) {
        finalOtherText = '';
      }
    }

    // Update allAnswers with current question's answer
    const updatedAllAnswers = {
      ...allAnswers,
      [fieldName]: value,
      ...(finalOtherText && { [`${fieldName}_otherText`]: finalOtherText }),
    };
    setAllAnswers(updatedAllAnswers);

    // Build answers array from all accumulated answers
    const answers: SubmitPendingIntakeAnswer[] = [];

    Object.keys(updatedAllAnswers).forEach((key) => {
      if (key.endsWith('_otherText')) return; // Skip otherText keys, handled separately

      const answerValue = updatedAllAnswers[key];
      const question = questions.find((q) => q.id === key);
      const { isRequired } = question || {};
      const otherTextKey = `${key}_otherText`;
      const otherText = updatedAllAnswers[otherTextKey] as string | undefined;

      // Include answer if it has a value OR if it's not required (to allow empty answers for optional questions)
      const hasValue =
        answerValue !== null &&
        answerValue !== undefined &&
        answerValue !== '' &&
        (!Array.isArray(answerValue) || answerValue.length > 0);

      if (hasValue || !isRequired) {
        answers.push({
          questionId: key,
          answer: answerValue ?? '',
          isRequired: isRequired || false,
          ...(otherText && { otherText }),
        });
      }
    });

    const isLastQuestion = position === questions.length;

    // Submit to backend
    await submitSurvey(answers, isLastQuestion);
  }

  const initialValues = useMemo(() => {
    const values: IntakeFormValues = {};
    questions.forEach((question) => {
      const questionId = question.id || '';

      if (question.validation === 'date') {
        values[questionId] = allAnswers[questionId]
          ? new Date(allAnswers[questionId] as string)
          : getInitialValue(question);
      } else {
        // Use saved answer if available, otherwise use initial value
        values[questionId] = allAnswers[questionId] ?? getInitialValue(question);
      }
    });

    // Add otherText for current question only
    if (currentQuestion?.id) {
      const otherTextKey = `${currentQuestion.id}_otherText`;
      values.otherText = allAnswers[otherTextKey] as string | undefined;
    }

    return values;
  }, [questions, currentQuestion, allAnswers, email, firstName, lastName, phone, position]);

  const progress = useMemo(() => {
    const adjustedStep = Math.min(position, questions.length);
    return questions.length > 0 ? ((adjustedStep / questions.length) * 100).toFixed(1) : '0';
  }, [position, questions]);

  const isLastQuestion = position === questions.length;

  // Reset scroll position when question changes with a slight delay to work with animations
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, [position]);

  if (!questions || questions?.length === 0) {
    return (
      <div className='container d-flex align-items-center justify-content-center py-5 mt-5'>
        <div className='text-center mt-5 max-w-477 mx-auto'>
          <Image src={Logo} className='patient-dashboard__navbar__logo tw-mx-auto mb-5' quality={100} alt='LumiMeds' />
          <h3 className='mb-3 text-danger'>😔 Sorry, we couldn&apos;t load your survey</h3>
          <p className='text-muted'>
            It looks like something went wrong on our end or you may have not selected any product.
          </p>
          <p className='text-muted my-4'>
            Please try refreshing the page. If the survey still won&apos;t load, please contact support or try again
            later.
          </p>
          <div className='d-flex justify-content-center gap-3'>
            <button onClick={router.refresh} className='btn btn-outline-primary rounded-pill px-4 py-2'>
              Refresh
            </button>
            <Link href='/public' className='btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2'>
              <FiArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after form submission
  if (showSuccess) {
    return (
      <div className='tw-px-4 tw-mb-10 lg:tw-mb-20'>
        <Image src={Logo} className='tw-mb-6 lg:tw-mb-10 tw-mx-auto' quality={100} alt='LumiMeds' />
        <div className='tw-max-w-[700px] tw-mx-auto tw-text-center'>
          <div className='tw-mb-6'>
            <div className='tw-w-20 tw-h-20 tw-mx-auto tw-mb-4 tw-rounded-full tw-bg-green-100 tw-flex tw-items-center tw-justify-center'>
              <svg
                className='tw-w-10 tw-h-10 tw-text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-4'>Intake Form Submitted Successfully!</h2>
            <p className='tw-text-lg tw-text-gray-600 tw-mb-6'>
              Thank you for completing the intake form. Your responses have been received and will be reviewed shortly.
            </p>
            <Link href='/' className='btn btn-primary rounded-pill px-4 py-2'>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className='tw-px-4 tw-mb-10 lg:tw-mb-14'>
      <Image src={Logo} alt='LumiMeds Logo' className='tw-mb-6 lg:tw-mb-10 tw-mx-auto' quality={100} />
      <div className='tw-max-w-[700px] tw-mx-auto tw-relative'>
        {formStep === 'initial' ? (
          <IntakeFormInitialStep key='initial-step' preventPersistance={true} setFormStep={setFormStep} />
        ) : (
          <Formik
            key={currentQuestion?.id}
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema(currentQuestion, allAnswers)}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, isValid, setTouched }) => (
              <Form>
                {position > 1 && (
                  <button
                    type='button'
                    onClick={async () => {
                      await setTouched({});
                      setPosition(position - 1);
                      setIsNavigatingBack(true);
                    }}
                    className='tw-flex tw-items-center tw-gap-2 tw-text-primary btn-no-style tw-mx-auto lg:tw-mx-0 tw-mb-4 md:tw-mb-6 lg:tw-mb-0 lg:tw-absolute lg:tw-top-[-11px] lg:tw-left-[-100px]'
                  >
                    <FiArrowLeft size={16} />
                    Back
                  </button>
                )}

                <div className='progress flex-grow-1 !tw-h-2'>
                  <div className='progress-bar' style={{ width: `${progress}%` }} aria-label='Survey progress' />
                </div>

                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentQuestion?.id}
                    id={currentQuestion?.id || ''}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  >
                    <p className='md:tw-text-[22px] md:tw-leading-[27px] tw-font-medium tw-font-secondary tw-my-6 md:tw-mt-10 md:tw-mb-8'>
                      {currentQuestion?.questionText}
                    </p>
                    <IntakeQuestionairre
                      question={currentQuestion}
                      phone={phone}
                      firstName={firstName}
                      lastName={lastName}
                      isNavigatingBack={isNavigatingBack}
                      isLastQuestion={isLastQuestion}
                    />

                    <ErrorMessage name={fieldName} component='div' className='text-danger small mt-2' />
                    <button
                      type='submit'
                      disabled={isSubmitting || !isValid || loading || isSubmittingResponse}
                      className='btn btn-primary rounded-pill md:!tw-text-lg !tw-py-2 md:!tw-py-3 d-flex align-items-center gap-3 justify-content-center tw-font-semibold tw-w-full tw-shadow-subtle tw-mt-8'
                    >
                      {isLastQuestion ? 'Submit' : 'Next'}
                      {loading || isSubmittingResponse ? <Spinner className='border-2' size='sm' /> : <FaArrowRight />}
                    </button>
                  </motion.div>
                </AnimatePresence>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </main>
  );
}
