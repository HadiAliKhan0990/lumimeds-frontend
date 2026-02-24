'use client';

import toast from 'react-hot-toast';
import Dropzone from 'react-dropzone';
import { RefObject, useMemo, useState } from 'react';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Error, PatientSurveyAnswerType } from '@/lib/types';
import { QuestionType } from '@/lib/enums';
import { FaArrowRight } from 'react-icons/fa';
import { IoCloudUploadOutline, IoImageOutline } from 'react-icons/io5';
import { RiCloseLargeLine } from 'react-icons/ri';
import { MultipleChoice } from '@/modules/landing/survey/PatientIntakeSurvey/includes/MultipleChoice';
import { SingleChoice } from '@/modules/landing/survey/PatientIntakeSurvey/includes/SingleChoice';
import { Spinner } from 'react-bootstrap';
import { extractFileName, getAnswer } from '@/lib/helper';
import { AnimatePresence, motion } from 'framer-motion';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import {
  useSendPatientEmailConsentToHubspotMutation,
  useSendPatientToHubspotMutation,
} from '@/store/slices/hubspotApiSlice';
import { CheckoutItem, trackFormSubmission, trackInitiateCheckout } from '@/lib/tracking';
import { microsoftTrackFormSubmission, microsoftTrackInitiateCheckout } from '@/helpers/uetTracking';
import { getProductCategory } from '@/lib/trackingHelpers';
import { useCheckUserEmailMutation } from '@/store/slices/checkoutApiSlice';
import { isAxiosError } from 'axios';
import { LoginModal } from '@/modules/landing/survey/PatientIntakeSurvey/includes/LoginModal';
import { setAnswers } from '@/store/slices/answersSlice';
import { PatientIntakeFormValues } from '@/types/survey';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { validationSchema } from '@/schemas/patientIntakeSurvey';
import { getBmi } from '@/helpers/intakeSurvey';
import { InputQuestionBox } from '@/modules/landing/survey/PatientIntakeSurvey/includes/InputQuestionBox';

interface Props {
  question?: SurveyQuestion;
  handleSubmit: (
    answers: PatientSurveyAnswerType[],
    isSurveyCompleted: boolean,
    email: string,
    position?: number,
    id?: string
  ) => Promise<void>;
  loading?: boolean;
  answers: PatientSurveyAnswerType[];
  surveyId: string;
  position: number;
  showCalendlyStep: boolean;
  setShowCalendlyStep: (ag: boolean) => void;
  formikRef: RefObject<FormikProps<PatientIntakeFormValues> | null>;
  isNavigatingBack: boolean;
}

export const QuestionairreForm = ({
  question,
  answers,
  position,
  handleSubmit,
  surveyId,
  loading,
  setShowCalendlyStep,
  showCalendlyStep,
  formikRef,
  isNavigatingBack,
}: Props) => {
  const dispatch = useDispatch();

  const questions = useSelector((state: RootState) => state.surveyQuestions);
  const product = useSelector((state: RootState) => state.productType);
  const surveyCategory = useSelector((state: RootState) => state.checkout.surveyCategory);

  const [phoneAgreement, setPhoneAgreement] = useState<boolean>(true);
  const [emailAgreement, setEmailAgreement] = useState<boolean>(true);
  const [showPortalLoginModal, setShowPortalLoginModal] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [isProceedLoading, setIsProceedLoading] = useState<boolean>(false);
  const [isSkipLoading, setIsSkipLoading] = useState<boolean>(false);

  const [checkUserEmail, { isLoading }] = useCheckUserEmailMutation();
  const [sendPatientToHubspot, { isLoading: isSending }] = useSendPatientToHubspotMutation();
  const [sendPatientEmailConsentToHubspot] = useSendPatientEmailConsentToHubspotMutation();

  const textKey = question?.questionText?.toLowerCase() ?? '';

  const isHeight = textKey.includes('height');
  const isDateOfBirth = textKey.toLowerCase().includes('birth') || textKey.toLowerCase().includes('dob');

  const images = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
  };
  const fileTypes = { ...images, 'application/pdf': ['.pdf'] };

  const current = useMemo(() => answers.find((a) => a?.questionId === question?.id), [question?.id, answers]);

  // Extracted to avoid nested ternary and memoized for stability
  const initialAnswer: PatientIntakeFormValues['answer'] = useMemo(() => {
    if (isDateOfBirth && current?.answer) {
      // Handle both Date objects and date strings
      if (current.answer instanceof Date) {
        return current.answer;
      }
      // Ensure we create a valid Date from the string
      const dateStr = current.answer as string;
      const date = new Date(dateStr);
      // Return the date if valid, otherwise return the original string
      // This allows the DatePicker to receive the stored date string
      return Number.isNaN(date.getTime()) ? current.answer : date;
    }
    if (question?.validation === 'email') {
      return (current?.answer as string) || '';
    }
    return current?.answer ?? (question?.questionType === QuestionType.MULTIPLE_CHOICE ? [] : '');
  }, [isDateOfBirth, current?.answer, question?.validation, question?.questionType]);

  const initialValues: PatientIntakeFormValues = {
    answer: initialAnswer,
    otherText: current?.otherText ?? '',
  };

  const trackCheckoutIfNeeded = async (email: string) => {
    // Fire InitiateCheckout even if product data is not fully available (for first-time users)
    // This ensures tracking fires for all users, not just returning users with saved product data
    const hasProductData = product?.id && product?.prices?.[0];

    // Get product and survey categories
    const productCategory = getProductCategory(product);
    const surveyCategoryValue = surveyCategory || undefined;

    let item: CheckoutItem;
    let checkoutValue: number;

    if (hasProductData) {
      // Use actual product data if available
      item = {
        id: product.id ?? 'unknown',
        name: product.displayName || product.name || '',
        price: product.prices[0].amount ?? 0,
        quantity: 1,
      };
      checkoutValue = product.prices[0].amount ?? 0;
    } else {
      // Fallback for first-time users when product data isn't loaded yet
      // Use generic values to ensure tracking still fires
      const fallbackName = surveyCategoryValue === 'longevity'
        ? 'Longevity Plan'
        : surveyCategoryValue === 'weight_loss'
        ? 'Weight Loss Plan'
        : 'Product Plan';
      item = {
        id: 'unknown',
        name: fallbackName,
        price: 0,
        quantity: 1,
      };
      checkoutValue = 0;
    }

    // Always fire tracking (for both new and returning users)
    trackInitiateCheckout({
      value: checkoutValue,
      currency: 'USD',
      items: [item],
      productCategory,
      surveyCategory: surveyCategoryValue,
    });

    // Microsoft UET InitiateCheckout tracking
    const checkoutItems: { id: string; name: string; price: number; quantity: number }[] = [
      {
        id: item.id,
        name: item.name,
        price: item.price ?? 0,
        quantity: item.quantity ?? 1,
      },
    ];
    microsoftTrackInitiateCheckout(checkoutValue, 'USD', checkoutItems, undefined);

    await trackSurveyAnalytics({
      event: 'survey_email_submitted',
      payload: {
        ...(product?.id && {
          product_id: product.id,
          product_name: product.name || '',
          amount: product.prices?.[0]?.amount ?? 0,
          currency: 'USD',
        }),
        email,
      },
    });
  };

  async function handleLogin(email: string): Promise<void> {
    setEmail(email);
    dispatch(setAnswers([]));
    setShowPortalLoginModal(true);
  }

  async function handleCheckUserEmail(value: string, newPosition: number): Promise<boolean> {
    try {
      const { success, message, statusCode } = await checkUserEmail({ email: value, surveyId }).unwrap();

      if (success) {
        const defaultAnswer = [{ answer: value, questionId: question?.id || '' }];
        await handleSubmit(defaultAnswer, false, value, newPosition);
        return true;
      } else {
        if (statusCode === 403) {
          handleLogin(value);
          return false;
        }

        toast.error(message || 'Email check failed');
        return false;
      }
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : (error as Error).data?.message;
      const status = isAxiosError(error) ? error.response?.status : (error as Error).data?.statusCode;

      if (status === 403) {
        handleLogin(value);
        return false;
      }

      toast.error(message || 'Email validation error');
      return false;
    }
  }

  const handleNext = async (
    values: PatientIntakeFormValues,
    { setTouched }: FormikHelpers<PatientIntakeFormValues>,
    isSkip: boolean = false
  ) => {
    setTouched({});

    // Set loading state based on which button was clicked
    if (isSkip) {
      setIsSkipLoading(true);
    } else {
      setIsProceedLoading(true);
    }

    let updatedAnswers = [];
    let value: PatientSurveyAnswerType['answer'];

    let newPosition = position;

    if (isHeight && !showCalendlyStep) {
      setShowCalendlyStep(true);
      setIsProceedLoading(false);
      setIsSkipLoading(false);
      return;
    }

    newPosition = position + 1;

    if (isDateOfBirth && values.answer) {
      // Handle both Date objects and date strings
      const date = values.answer instanceof Date ? values.answer : new Date(values.answer as string);
      if (Number.isNaN(date.getTime())) {
        // If date is invalid, use the raw value as string
        value = typeof values.answer === 'string' ? values.answer : '';
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        value = `${year}-${month}-${day}`;
      }
    } else {
      value = values.answer as PatientSurveyAnswerType['answer'];
    }

    if (question?.validation === 'email' && typeof value === 'string') {
      // Fire InitiateCheckout tracking when user enters email (fires for all users, new and returning)
      await trackCheckoutIfNeeded(value);

      const emailCheckSuccess = await handleCheckUserEmail(value, newPosition);
      if (!emailCheckSuccess) {
        // Reset loading states before returning
        setIsProceedLoading(false);
        setIsSkipLoading(false);
        return; // Stop the flow if email check failed
      }

      // Send consent after successful email check and wait for completion
      try {
        await sendPatientEmailConsentToHubspot({ email: value, optIn: emailAgreement }).unwrap();
      } catch (error) {
        console.log(error);
        // Optionally show error to user
        // toast.error('Failed to save email preferences');
      }

      // Reset loading states before returning
      setIsProceedLoading(false);
      setIsSkipLoading(false);
      // If email check was successful, return early to prevent duplicate submission
      return;
    } else if (question?.validation === 'phone') {
      const { answer } = values;
      const email = getAnswer('email', answers, questions) || '';

      // Find the question with 'first and last name' in questionText
      const firstNameAnswer = getAnswer('your first name', answers, questions) || '';
      const lastNameAnswer = getAnswer('your last name', answers, questions) || '';

      const hubspotPayload = { phone: answer as string, firstName: firstNameAnswer, lastName: lastNameAnswer, email, optIn: phoneAgreement, medicineType: surveyCategory };
      await sendPatientToHubspot(hubspotPayload);
    }

    const patientEmail = question?.validation === 'email' ? (value as string) : '';
    const answer = answers.find((item) => item.questionId === question?.id);
    const otherText = values.otherText ? values.otherText : answer?.otherText;

    // Fix: Handle otherText properly for CHECKBOXES and DROPDOWN
    let finalOtherText = otherText;

    // If it's a CHECKBOXES or DROPDOWN question and the selected value is not an "other" option,
    // clear the otherText to prevent it from being preserved incorrectly
    if (
      [QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question?.questionType as QuestionType) &&
      !question?.questionText?.toLowerCase().includes('gender')
    ) {
      const isOtherOption = question?.options?.some(
        (option) =>
          (option.toLowerCase().includes('other') || option.toLowerCase().includes('please list')) && value === option
      );

      // If the selected value is not an "other" option, clear otherText
      if (!isOtherOption) {
        finalOtherText = '';
      }
    }

    if (answer) {
      updatedAnswers = [
        ...answers.filter((a) => a.questionId !== question?.id),
        {
          ...answer,
          answer: value,
          ...(finalOtherText && { otherText: finalOtherText }),
          // Remove otherText if it's empty or undefined
          ...(!finalOtherText && { otherText: undefined }),
        },
      ];
    } else {
      updatedAnswers = [
        ...answers.filter((a) => a.questionId !== question?.id),
        {
          questionId: question?.id || '',
          answer: value,
          ...(finalOtherText && { otherText: finalOtherText }),
        },
      ];
    }

    const isLastStep = position === questions.length;

    if (isLastStep) {
      // --- Form Submission Tracking ---
      // Always fire FormSubmission tracking (for both new and returning users)
      // Use product data if available, otherwise use fallback values
      const formSubmissionValue = product?.prices?.[0]?.amount ?? 0;
      const productCategory = getProductCategory(product);
      const surveyCategoryValue = surveyCategory || undefined;

      trackFormSubmission({
        formName: 'Intake Form',
        productCategory,
        surveyCategory: surveyCategoryValue,
      });

      // Microsoft UET Lead tracking
      microsoftTrackFormSubmission('Intake Form', formSubmissionValue, undefined, undefined, undefined);
      // --- End Form Submission Tracking ---

      await handleSubmit(updatedAnswers, true, patientEmail);
    } else {
      await handleSubmit(updatedAnswers, false, patientEmail, newPosition);
      if (isHeight && showCalendlyStep) {
        setShowCalendlyStep(false);
      }
    }

    // Reset loading states
    setIsProceedLoading(false);
    setIsSkipLoading(false);
  };

  const handleSkip = async (values: PatientIntakeFormValues) => {
    if (formikRef.current) {
      await handleNext(values, formikRef.current, true);
    }
  };

  function getTitle(answer: string) {
    if (isHeight) {
      return showCalendlyStep
        ? `Your BMI of ${getBmi(answer)} pre-qualifies you for our weight loss programs.`
        : 'What is your current height & weight?';
    }
    return question?.questionText;
  }

  return (
    <>
      <Formik
        key={question?.id}
        innerRef={formikRef}
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema(question, current)}
        onSubmit={handleNext}
      >
        {({ values, isSubmitting, isValid, errors }) => (
          <Form>
            <AnimatePresence mode='wait'>
              <motion.div
                key={position}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <p className='md:tw-text-[22px] md:tw-leading-[27px] tw-font-medium tw-font-secondary tw-my-6 md:tw-mt-10 md:tw-mb-8'>
                  {getTitle(values.answer as string)}
                </p>

                {question?.questionType === QuestionType.MULTIPLE_CHOICE && <MultipleChoice question={question} />}

                {[QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question?.questionType as QuestionType) && (
                  <SingleChoice
                    question={question}
                    isNavigatingBack={isNavigatingBack}
                    isLastQuestion={position === questions.length}
                  />
                )}

                {question?.questionType === QuestionType.INPUT_BOX && (
                  <InputQuestionBox
                    question={question}
                    showCalendlyStep={showCalendlyStep}
                    position={position}
                    emailAgreement={emailAgreement}
                    setEmailAgreement={setEmailAgreement}
                    phoneAgreement={phoneAgreement}
                    setPhoneAgreement={setPhoneAgreement}
                  />
                )}

                {question?.questionType === QuestionType.FILE_UPLOAD && (
                  <Field name={'answer'}>
                    {({ field, form }: FieldProps) => {
                      const answer = field.value;

                      const isString = typeof answer === 'string';

                      const onDrop = async (files: File[]) => {
                        form.setFieldValue('answer', files[0]);
                      };

                      function handleRemove() {
                        form.setFieldValue('answer', undefined);
                      }

                      const allowedExtensions = Object.values(fileTypes).flat().join(', ');
                      return (
                        <>
                          <Dropzone onDrop={onDrop}>
                            {({ getRootProps, getInputProps, isDragActive }) => (
                              <div
                                {...getRootProps()}
                                className={
                                  'tw-p-12 tw-rounded-lg file-dropzone tw-bg-white tw-flex tw-flex-col tw-items-center tw-gap-y-3 ' +
                                  (isDragActive ? 'drag-active' : '')
                                }
                              >
                                <input {...getInputProps()} />
                                <IoCloudUploadOutline size={24} />
                                <span>Click or drag file to this area to upload</span>
                                <p className='tw-text-sm tw-text-gray-500'>Allowed file types: {allowedExtensions}</p>
                              </div>
                            )}
                          </Dropzone>

                          {answer instanceof File ||
                          (answer && typeof answer === 'object' && 'name' in answer) ||
                          (isString && extractFileName(answer)) ? (
                            <div className='rounded-2 file-name-container tw-flex tw-justify-between tw-items-center tw-bg-white mt-4'>
                              <div className='tw-inline-flex tw-items-center tw-gap-x-2'>
                                <IoImageOutline size={24} />
                                <span>{isString ? extractFileName(answer) : (answer as File).name}</span>
                              </div>
                              <RiCloseLargeLine className='cursor-pointer' onClick={handleRemove} />
                            </div>
                          ) : null}
                        </>
                      );
                    }}
                  </Field>
                )}

                {question?.questionType === QuestionType.FILE_UPLOAD
                  ? errors.answer && <div className='text-danger text-sm mt-2'>{errors.answer}</div>
                  : question?.validation !== 'phone' &&
                    question?.validation !== 'email' && (
                      <ErrorMessage name='answer' component='div' className='text-danger text-sm mt-2' />
                    )}

                <ErrorMessage name='otherText' component='div' className='text-danger text-sm mt-2' />

                <div className='tw-mt-8'>
                  {isHeight && showCalendlyStep ? (
                    <div className='tw-flex tw-gap-3'>
                      <button
                        type='button'
                        onClick={() => handleSkip(values)}
                        disabled={
                          getBmi((values.answer || '') as string) < 18 ||
                          isSkipLoading ||
                          isProceedLoading ||
                          loading ||
                          isLoading ||
                          isSending ||
                          !isValid
                        }
                        className='btn btn-outline-primary rounded-pill md:!tw-text-lg !tw-py-2 md:!tw-py-3 d-flex align-items-center gap-3 justify-content-center fw-semibold tw-w-full'
                      >
                        Skip
                        {isSkipLoading && <Spinner size='sm' className='border-2' />}
                      </button>
                      <button
                        type='submit'
                        disabled={
                          getBmi((values.answer || '') as string) < 18 ||
                          isProceedLoading ||
                          isSkipLoading ||
                          loading ||
                          isLoading ||
                          isSending ||
                          !isValid
                        }
                        className='btn btn-primary rounded-pill md:!tw-text-lg !tw-py-2 md:!tw-py-3 d-flex align-items-center gap-3 justify-content-center tw-font-semibold tw-w-full tw-shadow-subtle'
                      >
                        Proceed
                        {isProceedLoading ? <Spinner size='sm' className='border-2' /> : <FaArrowRight />}
                      </button>
                    </div>
                  ) : (
                    <button
                      type='submit'
                      disabled={
                        isHeight
                          ? getBmi((values.answer || '') as string) < 18 ||
                            isSubmitting ||
                            loading ||
                            isLoading ||
                            isSending ||
                            !isValid
                          : isSubmitting || loading || isLoading || isSending || !isValid
                      }
                      className='btn btn-primary rounded-pill md:!tw-text-lg !tw-py-2 md:!tw-py-3 d-flex align-items-center gap-3 justify-content-center tw-font-semibold tw-w-full tw-shadow-subtle'
                    >
                      {position === questions.length ? (
                        <span className='submit-proceed-btn'>Submit & Proceed to Checkout</span>
                      ) : (
                        'Next'
                      )}
                      {isSubmitting || loading || isLoading || isSending ? (
                        <Spinner size='sm' className='border-2' />
                      ) : (
                        <FaArrowRight />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </Form>
        )}
      </Formik>
      <LoginModal email={email} openModal={showPortalLoginModal} handleClose={() => setShowPortalLoginModal(false)} />
    </>
  );
};
