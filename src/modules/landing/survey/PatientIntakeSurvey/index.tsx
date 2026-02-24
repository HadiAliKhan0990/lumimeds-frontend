'use client';

import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { SingleSurveyResponse, useSubmitResponsesMutation } from '@/store/slices/surveysApiSlice';
import { FiArrowLeft } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Error, IntakeInitialStep, PatientSurveyAnswerType } from '@/lib/types';
import { isAxiosError } from 'axios';
import {
  setCheckoutUser,
  setIsSurveyCompleted,
  setSubmissionId,
  setSurveyCategory,
  SurveyCategoryType,
} from '@/store/slices/checkoutSlice';
import { uploadSurveyFile } from '@/lib/fileUpload';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { setAnswers } from '@/store/slices/answersSlice';
import { QuestionType } from '@/lib/enums';
import { setSurveyQuestions } from '@/store/slices/surveyQuestionsSlice';
import {
  FORM_STEP,
  STORAGE_STEP_KEY,
  SURVEY_ANSWERS,
  SURVEY_ANSWERS_META,
  IS_SURVEY_COMPLETED,
  SUBMISSION_ID,
} from '@/constants/intakeSurvey';
import { ROUTES } from '@/constants';
import { useCreateCheckoutSessionMutation } from '@/store/slices/checkoutApiSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import { getSurveyProgressState, restoreUserPosition, saveSurveyProgress } from '@/helpers/surveyProgress';
import { getAnswer } from '@/lib/helper';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { trackSurveyComplete, trackSurveyStart, trackSurveyStep } from '@/helpers/hotjarTracking';
import { IntakeFormInitialStep } from '@/components/ui/IntakeForm/IntakFormInitialStep';
import { QuestionairreForm } from '@/modules/landing/survey/PatientIntakeSurvey/includes/QuestionairreForm';
import { FormikProps } from 'formik';
import { PatientIntakeFormValues } from '@/types/survey';
import { AnimatePresence } from 'framer-motion';

interface Props {
  data: SingleSurveyResponse['data'];
  flow?: string;
  category?: SurveyCategoryType;
}

export default function PatientIntakeSurvey({ data, flow, category }: Readonly<Props>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const formikRef = useRef<FormikProps<PatientIntakeFormValues>>(null);

  // Ref to track if initial position restoration has been done
  const hasRestoredPosition = useRef(false);

  // Ref to track last tracked step to prevent duplicate tracking
  const lastTrackedStep = useRef<string>('');

  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(1);
  const [email, setEmail] = useState('');
  const [formStep, setFormStep] = useState<IntakeInitialStep>('initial');
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const [showCalendlyStep, setShowCalendlyStep] = useState(false);

  const questions = useSelector((state: RootState) => state.surveyQuestions);
  const answers = useSelector((state: RootState) => state.answers);
  const question = questions.find((item) => item.position === position);
  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const surveyCategory = useSelector((state: RootState) => state.checkout.surveyCategory);
  const { checkoutUser } = checkout || {};

  const [submitResponse, { isLoading: isSubmittingResponse }] = useSubmitResponsesMutation();
  const [createCheckoutSession, { isLoading: isCreatingCheckoutSession }] = useCreateCheckoutSessionMutation();

  const pId = useMemo(() => uuidv4(), []);

  async function updateStep(adjustedNext: number) {
    formikRef.current?.setTouched({});
    formikRef.current?.setErrors({});
    saveSurveyProgress(adjustedNext);
    setPosition(adjustedNext);
    setIsNavigatingBack(false);
  }

  // Function to handle product summary redirection when survey is completed
  const handleProductSummaryRedirect = async (emailArg?: string) => {
    const fallbackEmail = emailArg || getAnswer('email', answers, questions) || email;
    // In PFA flow with a selected product, redirect directly to checkout

    if (flow?.toLowerCase() === 'pfa' && selectedProduct?.id) {
      await handleCheckoutRedirect(selectedProduct, fallbackEmail);
      return;
    }

    // Check if user came from /ad/how-to-start or has source=google-merchant
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sourceParam = searchParams?.get('source');
    const saleTypeParam = searchParams?.get('sale_type');
    const overrideTimeParam = searchParams?.get('overrideTime');

    const baseUrl = sourceParam === 'google-merchant' ? ROUTES.PRODUCT_SUMMARY_GOOGLE_MERCHANT : ROUTES.PRODUCT_SUMMARY;

    const urlParams = new URLSearchParams();
    if (sourceParam === 'google-merchant') urlParams.set('source', 'google-merchant');
    if (saleTypeParam) urlParams.set('sale_type', saleTypeParam);
    if (overrideTimeParam === 'true') urlParams.set('overrideTime', 'true');

    const summaryUrl = urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl;

    await trackSurveyAnalytics({ event: 'survey_submitted', payload: { email: fallbackEmail } });
    startTransition(() => router.push(summaryUrl));
  };

  async function handleCheckoutRedirect(product: ProductType, emailArg?: string) {
    try {
      const checkoutEmail = emailArg || email;
      const { priceId = '', checkoutType: mode } = product.prices?.[0] || {};

      // Get sale_type and overrideTime from URL params
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const overrideTimeParam = searchParams?.get('overrideTime') === 'true';

      const {
        data: resp,
        success,
        message,
      } = await createCheckoutSession({
        priceId,
        currency: 'usd',
        email: checkoutEmail,
        productId: product.id,
        surveyId: product.surveyId || data?.id || '',
        mode,
        ...(overrideTimeParam && { overrideTime: overrideTimeParam }),
      }).unwrap();

      if (success) {
        await trackSurveyAnalytics({ event: 'survey_submitted', payload: { email: checkoutEmail } });

        const { mode: checkoutMode, secure_token, line_items } = resp || {};
        const sourceParam = searchParams?.get('source');
        const saleTypeParam = searchParams?.get('sale_type');

        // Use URLSearchParams for consistent URL construction
        const checkoutUrlParams = new URLSearchParams({
          priceId: line_items[0].price_id,
          mode: checkoutMode,
        });
        if (flow) {
          checkoutUrlParams.set('flow', flow);
        }
        if (sourceParam) {
          checkoutUrlParams.set('source', sourceParam);
        }
        if (saleTypeParam) {
          checkoutUrlParams.set('sale_type', saleTypeParam);
        }
        if (overrideTimeParam) {
          checkoutUrlParams.set('overrideTime', 'true');
        }

        const checkoutUrl = `${ROUTES.CHECKOUT}/${secure_token}?${checkoutUrlParams.toString()}`;
        startTransition(() => router.push(checkoutUrl));
      } else {
        toast.error(message);
      }
    } catch {
      toast.error('Unable to start checkout. Please try again.');
    }
  }

  async function handleSurveyInCompleted(
    answers: PatientSurveyAnswerType[],
    isSurveyCompleted: boolean,
    userEmail: string,
    position?: number,
    id?: string
  ) {
    const { patientId: checkoutPatientId, email: checkoutEmail } = checkoutUser || {};
    let patientId = id || pId;

    if (userEmail) setEmail(userEmail);

    if (checkoutEmail && checkoutPatientId && (checkoutEmail === userEmail || checkoutEmail === email)) {
      patientId = checkoutPatientId;
    }

    const payload = await Promise.all(
      answers.map(async ({ answer, questionId, otherText }) => {
        const q = questions.find((item) => item.id === questionId);
        const { isRequired } = q || {};
        if (answer instanceof File) {
          const url = await uploadSurveyFile({
            surveyId: data?.id || '',
            patientId,
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
          return { questionId, answer, isRequired: true };
        }

        return { questionId, answer, isRequired };
      })
    );

    const {
      success,
      message,
      data: { id: submissionId },
    } = await submitResponse({
      answers: payload,
      patientId,
      surveyId: data?.id ?? '',
      isSurveyCompleted,
      patientEmail: userEmail || email,
    }).unwrap();

    if (success) {
      dispatch(setAnswers(answers));

      if (position) {
        await updateStep(position);
      } else {
        dispatch(setSubmissionId(submissionId));
        const email = getAnswer('email', answers, questions) || '';
        const phone = getAnswer('phone', answers, questions) || '';
        const user = { email, phone, patientId };
        dispatch(setCheckoutUser(user));

        // Track survey completion in Hotjar (non-blocking)
        if (isSurveyCompleted) {
          try {
            // Convert answers to Hotjar format - only include answered questions
            const surveyData = answers.map((answerItem) => {
              const question = questions.find((q) => q.id === answerItem.questionId);
              return {
                questionText: question?.questionText || 'Unknown Question',
                answer: answerItem.answer,
              };
            });

            trackSurveyComplete('patient_intake_survey', questions.length, {
              flow: flow,
              email: email,
              surveyData: surveyData,
              isSurveyCompleted: true,
              totalAnswered: surveyData.length,
            });
          } catch (error) {
            // Silently fail - don't disrupt survey flow
            console.error('Hotjar tracking error (non-critical):', error);
          }
        }

        handleProductSummaryRedirect();
      }
    } else {
      toast.error(message || 'Submission failed');
    }
  }

  async function handleSubmit(
    answers: PatientSurveyAnswerType[],
    isSurveyCompleted: boolean,
    userEmail: string,
    position?: number,
    id?: string
  ) {
    try {
      setLoading(true);

      // Check if survey is completed before submission
      if (isSurveyCompleted) {
        const progressState = getSurveyProgressState(answers, questions);

        if (progressState.isCompleted) {
          // If survey is completed but no submissionId, submit first then redirect
          await handleSurveyInCompleted(answers, isSurveyCompleted, userEmail, position, id);
          dispatch(setIsSurveyCompleted(isSurveyCompleted));
          if (category) dispatch(setSurveyCategory(category));

          // After successful submission, redirect based on flow
          await handleProductSummaryRedirect();
          return;
        }
      }

      // For incomplete surveys or regular flow
      await handleSurveyInCompleted(answers, isSurveyCompleted, userEmail, position, id);
      dispatch(setIsSurveyCompleted(isSurveyCompleted));
      if (category) dispatch(setSurveyCategory(category));
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data.message : (err as Error).data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  const progress = useMemo(() => {
    const progressState = getSurveyProgressState(answers, questions);
    const adjustedStep = Math.min(position, progressState.totalSteps);
    return progressState.totalSteps > 0 ? ((adjustedStep / progressState.totalSteps) * 100).toFixed(1) : '0';
  }, [position, questions, answers]);

  const isHeightQuestion = useMemo(() => {
    return question?.questionText?.toLowerCase().includes('height');
  }, [question]);

  useEffect(() => {
    if (questions && answers) {
      const emailQuestion = questions?.find((q) => q?.validation === 'email');
      const emailAnswer = answers?.find((q) => q?.questionId === emailQuestion?.id);
      if (emailAnswer) {
        setEmail((emailAnswer?.answer ?? '') as string);
      }
    }
  }, [questions, answers]);

  // Clear old data when category changes
  useEffect(() => {
    if (surveyCategory && category !== surveyCategory) {
      // Clear all survey-related localStorage items FIRST
      localStorage.removeItem(FORM_STEP);
      localStorage.removeItem(STORAGE_STEP_KEY);
      localStorage.removeItem(SURVEY_ANSWERS);
      localStorage.removeItem(SURVEY_ANSWERS_META);
      localStorage.removeItem(IS_SURVEY_COMPLETED);
      localStorage.removeItem(SUBMISSION_ID);

      // Clear Redux store
      dispatch(setSurveyQuestions([]));
      dispatch(setAnswers([]));
      dispatch(setSubmissionId(''));
      dispatch(setIsSurveyCompleted(false));

      // Reset local state
      setPosition(1);
      setFormStep('initial');

      // Mark as restored so the restore useEffect won't override our reset
      hasRestoredPosition.current = true;
    }
  }, [category, surveyCategory, dispatch]);

  useEffect(() => {
    dispatch(setSurveyQuestions(data?.questions || []));

    // Track survey start when questions are loaded
    if (data?.questions && data.questions.length > 0) {
      trackSurveyStart('patient_intake_survey', data.name, {
        totalQuestions: data.questions.length,
        flow: flow,
      });
    }
  }, [data, flow]);

  // Restore user position and form step on initial component mount only
  useEffect(() => {
    const localFormstep = (localStorage.getItem(FORM_STEP) ?? 'initial') as IntakeInitialStep;
    setFormStep(localFormstep);
  }, []);

  useEffect(() => {
    // Only restore position if we have questions loaded and haven't restored yet
    if (questions.length > 0 && !hasRestoredPosition.current && answers.length > 0) {
      const restoredPosition = restoreUserPosition(answers, questions);
      updateStep(restoredPosition);
      hasRestoredPosition.current = true;
    }
  }, [questions, answers]);

  // Track survey progress whenever answers change (after Redux update)
  useEffect(() => {
    // Skip tracking if no questions loaded or still on initial step
    if (questions.length === 0 || formStep === 'initial') return;

    // Skip if no answers yet
    if (answers.length === 0) return;

    // Skip if survey is completed (completion will be tracked separately)
    const progressState = getSurveyProgressState(answers, questions);
    if (progressState.isCompleted) {
      return;
    }

    // Skip if we've already tracked this exact state
    const trackingKey = `${position}-${answers.length}`;
    if (lastTrackedStep.current === trackingKey) return;

    try {
      const currentQuestion = questions.find((item) => item.position === position);

      // Convert answers to Hotjar format - include all current answers
      const surveyData = answers.map((answerItem) => {
        const question = questions.find((q) => q.id === answerItem.questionId);
        return {
          questionText: question?.questionText || 'Unknown Question',
          answer: answerItem.answer,
        };
      });

      if (currentQuestion) {
        trackSurveyStep(
          'patient_intake_survey',
          position,
          currentQuestion.questionText || `Step ${position}`,
          questions.length,
          {
            questionType: currentQuestion.questionType,
            flow: flow,
            surveyData: surveyData,
            isSurveyCompleted: false,
            totalAnswered: surveyData.length,
          }
        );

        // Mark this step as tracked
        lastTrackedStep.current = trackingKey;
      }
    } catch (error) {
      // Silently fail - don't disrupt survey flow
      console.error('Hotjar tracking error (non-critical):', error);
    }
  }, [answers, position, questions, flow, formStep]);

  // Reset scroll position when question changes with a slight delay to work with animations
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, [position, isHeightQuestion, showCalendlyStep]);

  if (!data || data?.questions?.length === 0) {
    return (
      <div className='container d-flex align-items-center justify-content-center py-5 mt-5'>
        <div className='text-center mt-5 max-w-477 mx-auto'>
          <Image src={Logo} className='mb-5 tw-mx-auto' quality={100} alt='LumiMeds' />
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

  return (
    <div className='d-flex flex-column align-items-center pb-5 tw-px-4'>
      <Image src={Logo} quality={100} alt='LumiMeds Logo' className='tw-mb-6 lg:tw-mb-10' />
      <div className={'row w-100' + (isHeightQuestion && showCalendlyStep ? ' gy-5 gx-0 gx-lg-5' : '')}>
        <div className={isHeightQuestion && showCalendlyStep ? 'col-lg-6' : 'col-12'}>
          <div className='tw-max-w-[700px] mx-auto w-100 tw-relative'>
            <AnimatePresence mode='wait'>
              {formStep === 'initial' ? (
                <IntakeFormInitialStep key='initial-step' setFormStep={setFormStep} />
              ) : (
                <>
                  {position > 1 && (
                    <button
                      type='button'
                      onClick={() => {
                        if (showCalendlyStep) {
                          setShowCalendlyStep(false);
                        } else {
                          setPosition(question?.metaData?.previous || position - 1);
                        }
                        setIsNavigatingBack(true);
                      }}
                      className={
                        'tw-flex tw-items-center tw-gap-2 tw-text-primary btn-no-style tw-mx-auto lg:tw-mx-0 tw-mb-4 md:tw-mb-6' +
                        (isHeightQuestion && showCalendlyStep
                          ? ''
                          : ' lg:tw-mb-0 lg:tw-absolute lg:tw-top-[-11px] lg:tw-left-[-100px]')
                      }
                    >
                      <FiArrowLeft size={16} />
                      Back
                    </button>
                  )}

                  {/* <button
                        type='button'
                        className='fw-semibold p-0 d-flex align-items-center gap-2 text-primary'
                        onClick={async () => {
                          setShowCalendlyStep(false);
                          await updateStep(1);
                          setFormStep('initial');
                          dispatch(setAnswers([]));
                          setGeneratedPatientId(uuidv4());
                        }}
                      >
                        Reset <RiResetLeftLine size={14} />
                      </button> */}

                  <div className='progress !tw-h-2'>
                    <div className='progress-bar' style={{ width: `${progress}%` }} aria-label='Survey progress' />
                  </div>

                  <QuestionairreForm
                    formikRef={formikRef}
                    surveyId={data?.id || ''}
                    handleSubmit={handleSubmit}
                    loading={loading || isPending || isSubmittingResponse || isCreatingCheckoutSession}
                    answers={answers}
                    position={position}
                    question={question}
                    setShowCalendlyStep={setShowCalendlyStep}
                    showCalendlyStep={showCalendlyStep}
                    isNavigatingBack={isNavigatingBack}
                  />
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className={'col-lg-6' + (isHeightQuestion && showCalendlyStep ? '' : ' position-fixed tw-z-[-2] top-0')}>
          <iframe
            id='calendlyForm'
            src='https://calendly.com/lumimeds/15min?hide_event_type_details=1&hide_gdpr_banner=1'
            className='d-block w-100 border-0 rounded-2 calendly-iframe'
            title='Book a 15 minute appointment with Lumimeds via Calendly'
          />

          {isHeightQuestion && showCalendlyStep ? null : (
            <div className='tw-absolute tw-top-0 tw-bottom-0 tw-right-0 tw-left-0 bg-light' />
          )}
        </div>
      </div>
    </div>
  );
}
