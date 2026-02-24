'use client';

import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Offcanvas } from '@/components/elements';
import { Order } from '@/store/slices/orderSlice';
import { useGetSurveyQuery } from '@/store/slices/surveysApiSlice';
import { Formik, Form, ErrorMessage, FormikProps, FormikHelpers } from 'formik';
import { useMemo, useRef, useState } from 'react';
import { QuestionType } from '@/lib/enums';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { capitalizeFirst } from '@/lib/helper';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { AnswerValue, FormValues, OrderRefillSurveyPayload, AddressValues } from '@/types/refillForm';
import { QuestionFields } from '@/components/Dashboard/orders/RefillSurveyFormSidebar/includes/QuestionFields';
import { Error, OptionValue } from '@/lib/types';
import { isAxiosError } from 'axios';
import { RefillSurveyRequest, useSubmitOrderRefillSurveyMutation } from '@/store/slices/refillsApiSlice';
import { getCurrentStepValidation } from '@/schemas/refillSurveyForm';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { PlanType } from '@/types/medications';
import { User } from '@/store/slices/userSlice';
import { uploadSurveyFile } from '@/lib/fileUpload';

interface Props {
  isOpen: boolean;
  onClose: (refill?: RefillSurveyRequest | null) => void;
  selectedOrder: Order | null;
  patientId?: string; // Optional patientId for admin portal usage
  selectedPatient?: User | null; // Optional: For admin to display patient info
}

export const RefillSurveyFormSidebar = ({
  isOpen,
  onClose,
  selectedOrder,
  patientId,
  selectedPatient,
}: Readonly<Props>) => {
  const formRef = useRef<FormikProps<FormValues>>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const { medicalHistory, gender: patientGender } = useSelector((state: RootState) => state.patientProfile);
  const { allergies, medicalConditions, medications } = medicalHistory || {};
  const gender = patientGender || selectedPatient?.gender;
  const profile = useSelector((state: RootState) => state.patientProfile);

  const [submitOrderRefillSurvey, { isLoading }] = useSubmitOrderRefillSurveyMutation();
  const { data, isFetching } = useGetSurveyQuery(
    { surveyId: selectedOrder?.refillSurveyId || '' },
    {
      skip: !selectedOrder?.refillSurveyId || !isOpen,
    }
  );

  const { questions = [] } = data || {};

  // Helper function to check if a question is about pregnancy
  const isPregnancyQuestion = (question: SurveyQuestion) => {
    const text = question?.questionText?.toLowerCase() || '';
    return text.includes('pregnant') || text.includes('pregnancy');
  };

  // Helper function to check if a question requires "Yes" text field
  const requiresYesTextField = (question: SurveyQuestion) => {
    const text = question?.questionText?.trim() || '';
    const exactMatches = [
      'Have you experienced any side effects since your last dose?',
      'Severity of Side Effects (optional but recommended), If yes, how would you rate the severity?',
      'Since your last refill, have there been any changes to your medical history?',
      'Have you started any new medications or been diagnosed with any new medical conditions?',
    ];
    return exactMatches.includes(text);
  };

  // Sort and filter questions by position, excluding pregnancy questions for male patients
  const sortedQuestions = useMemo(() => {
    const sorted = [...questions].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    // Filter out pregnancy questions if patient is male (hide from UI)
    const isMale = gender?.toLowerCase() === 'male' || gender?.toLowerCase() === 'm';
    if (isMale) {
      return sorted.filter((question) => !isPregnancyQuestion(question));
    }

    return sorted;
  }, [questions, gender]);

  // Get all questions including filtered ones (for storing answers)
  const allQuestions = useMemo(() => {
    return [...questions].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [questions]);

  // Create initial values with questionId as field names
  const initialValues: FormValues = useMemo(() => {
    const values: FormValues = {
      includeAddress: false,
      address: {
        billingAddress: {
          firstName: '',
          lastName: '',
          street: '',
          street2: '',
          city: '',
          region: 'United States',
          state: '',
          zip: '',
        },
        shippingAddress: {
          firstName: '',
          lastName: '',
          street: '',
          street2: '',
          city: '',
          region: 'United States',
          state: '',
          zip: '',
        },
        sameAsBilling: false,
      },
    };

    // Use allQuestions to include pregnancy questions for males
    allQuestions?.forEach((question) => {
      if (!question.id) return;

      // For male users, auto-fill pregnancy questions with "does not apply" option
      const isMale = gender?.toLowerCase() === 'male' || gender?.toLowerCase() === 'm';
      if (isMale && isPregnancyQuestion(question)) {
        // Find the "does not apply" option
        const doesNotApplyOption = question.options?.find(
          (opt) =>
            opt.toLowerCase().includes('does not apply') ||
            opt.toLowerCase().includes('not applicable') ||
            opt.toLowerCase().includes('n/a')
        );
        if (doesNotApplyOption) {
          values[question.id] =
            question.questionType === QuestionType.MULTIPLE_CHOICE ? [doesNotApplyOption] : doesNotApplyOption;
          return; // Skip default initialization
        }
      }

      if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
        values[question.id] = [];
      } else if (question.questionType === QuestionType.FILE_UPLOAD) {
        values[question.id] = '';
      } else if (question.validation === 'tags') {
        if (
          question.questionText?.toLowerCase().includes('medical conditions') &&
          medicalConditions &&
          medicalConditions.length > 0
        ) {
          values[question.id] =
            (medicalConditions
              .split(',')
              .map((condition) => ({ label: condition.trim(), value: condition.trim() })) as unknown as AnswerValue) ||
            [];
        } else if (question.questionText?.toLowerCase().includes('allergies') && allergies && allergies.length > 0) {
          values[question.id] =
            (allergies
              .split(',')
              .map((allergy) => ({ label: allergy.trim(), value: allergy.trim() })) as unknown as AnswerValue) || [];
        } else if (
          question.questionText?.toLowerCase().includes('medications') &&
          medications &&
          medications.length > 0
        ) {
          values[question.id] =
            (medications.split(',').map((medication) => ({
              label: medication.trim(),
              value: medication.trim(),
            })) as unknown as AnswerValue) || [];
        } else {
          values[question.id] = [];
        }
      } else {
        values[question.id] = '';
      }
      // Initialize "other" text field for questions that might have "other" option
      if (question.questionType === QuestionType.DROPDOWN || question.questionType === QuestionType.CHECKBOXES) {
        values[`${question.id}_other_text`] = '';
      }
      // Initialize "yes" text field for questions that require it (all question types)
      if (requiresYesTextField(question)) {
        values[`${question.id}_yes_text`] = '';
      }
    });

    return values;
  }, [allQuestions, gender, medicalConditions, allergies, medications]);

  // Total steps = questions + address step
  const { totalSteps, isLastStep, currentQuestion } = useMemo(
    () => ({
      totalSteps: sortedQuestions?.length || 0,
      isLastStep: currentStep === sortedQuestions?.length - 1,
      currentQuestion: sortedQuestions ? sortedQuestions[currentStep] : null,
    }),
    [currentStep, sortedQuestions]
  );

  const handleSubmit = async (values: FormValues, { setSubmitting, setTouched }: FormikHelpers<FormValues>) => {
    if (!isLastStep) return;

    // Validate the last question before submitting
    const validation = getCurrentStepValidation(currentQuestion);
    try {
      await validation.validate(values, { abortEarly: false });
    } catch (err) {
      // Validation failed - mark fields as touched to show errors
      const touched: Record<string, boolean> = {};
      if (currentQuestion?.id) {
        touched[currentQuestion.id] = true;
      } else {
        touched.address = true;
      }
      setTouched(touched);
      // Show validation errors to user
      if (err instanceof Yup.ValidationError && err.errors && err.errors.length > 0) {
        toast.error(err.errors[0], { duration: 100000 });
      }
      return; // Don't proceed with submission if validation fails
    }

    try {
      setSubmitting(true);

      // Get patientId - prefer prop, then selectedPatient, then user state
      const resolvedPatientId = patientId || selectedPatient?.patientId || selectedOrder?.patient?.id || profile?.id;

      if (!resolvedPatientId) {
        toast.error('Patient ID is required for file uploads');
        setSubmitting(false);
        return;
      }

      // Get productId from selectedOrder (optional)
      const { productId, refillSurveyId } = selectedOrder || {};

      // Check if we have FILE_UPLOAD questions that require uploads
      const hasFileUploads = allQuestions?.some(
        (q) => q.questionType === QuestionType.FILE_UPLOAD && values[q.id || ''] instanceof File
      );

      if (hasFileUploads && !productId) {
        toast.error('Product ID is required for file uploads');
        setSubmitting(false);
        return;
      }

      // Upload files for FILE_UPLOAD questions before processing answers
      const uploadPromises: Promise<void>[] = [];
      const fileUploadMap: Record<string, string> = {}; // Maps questionId to file URL

      allQuestions?.forEach((question) => {
        if (question.questionType === QuestionType.FILE_UPLOAD && question.id) {
          const fileValue = values[question.id];

          // If it's a File object, upload it
          if (fileValue instanceof File) {
            const uploadPromise = uploadSurveyFile({
              surveyId: refillSurveyId || '',
              productId: productId || '',
              patientId: resolvedPatientId,
              file: fileValue,
            })
              .then((fileUrl) => {
                if (question.id) {
                  fileUploadMap[question.id] = fileUrl;
                }
              })
              .catch((error) => {
                throw error; // Re-throw to stop submission
              });

            uploadPromises.push(uploadPromise);
          } else if (typeof fileValue === 'string' && fileValue.length > 0) {
            // If it's already a URL, use it directly
            fileUploadMap[question.id] = fileValue;
          }
        }
      });

      // Wait for all file uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // Track if address should be included in payload
      let shouldIncludeAddress = false;
      let vialsRequested = 0;

      // Transform form values into the required payload format
      // Use allQuestions to include pregnancy questions for males
      const answers = allQuestions
        ?.map((question) => {
          if (!question.id) return null;
          let answer = values[question.id];

          // Handle FILE_UPLOAD questions - replace File with URL
          if (question.questionType === QuestionType.FILE_UPLOAD) {
            // Use uploaded URL if available, otherwise use existing value (if it's already a URL)
            if (question.id && fileUploadMap[question.id]) {
              answer = fileUploadMap[question.id];
            } else {
              // No file uploaded and not required, use empty string
              answer = '';
            }
            // If already a URL string, keep it as-is (no action needed)
            // Ensure answer is always a string for FILE_UPLOAD
            answer = typeof answer === 'string' ? answer : '';
          }

          // Check if this is an address-related question
          const isQuestionAddressType =
            question?.questionText?.toLowerCase().includes('update your new address') ||
            question?.questionText?.toLowerCase().includes('update your address') ||
            question?.questionText?.toLowerCase().includes('new address');

          // Check for supply question
          if (question?.questionText?.toLowerCase().includes('supply')) {
            // Extract number from answer like "1 Month Supply" or direct number
            const answerStr = answer as string;
            const numberRegex = /\d+/;
            const match = numberRegex.exec(answerStr || '');
            vialsRequested = match ? Number.parseInt(match[0], 10) : 0;
          }

          // Handle address question (all address questions are Yes/No questions now)
          if (isQuestionAddressType) {
            const selectedValue = (answer as string) || '';
            if (typeof selectedValue === 'string' && selectedValue.toLowerCase().includes('yes') && values.address) {
              // If "Yes" is selected, stringify the address and mark to include address
              shouldIncludeAddress = true;
              const { billingAddress, shippingAddress } = values.address;
              answer = JSON.stringify({ billingAddress, shippingAddress });
            } else if (typeof selectedValue === 'string' && selectedValue.toLowerCase().includes('no')) {
              // If "No" is selected, send "No" as the answer and don't include address
              answer = 'No';
            }
          }

          // Handle "other" option for DROPDOWN and CHECKBOXES (excluding address questions)
          if (
            !isQuestionAddressType &&
            [QuestionType.DROPDOWN, QuestionType.CHECKBOXES].includes(question.questionType as QuestionType) &&
            typeof answer === 'string' &&
            answer?.toLowerCase().includes('other')
          ) {
            const otherText = values[`${question.id}_other_text`];
            if (otherText && typeof otherText === 'string' && otherText.trim()) {
              // Include both the option and the custom text
              answer = otherText;
            }
          }

          // Handle "yes" option for specific questions that require additional text (DROPDOWN/CHECKBOXES only)
          // Works exactly like "other" option
          if (
            !isQuestionAddressType &&
            requiresYesTextField(question) &&
            [QuestionType.DROPDOWN, QuestionType.CHECKBOXES].includes(question.questionType as QuestionType) &&
            typeof answer === 'string' &&
            answer.toLowerCase().includes('yes')
          ) {
            const yesText = values[`${question.id}_yes_text`];
            if (yesText && typeof yesText === 'string' && yesText.trim()) {
              // Use the yes text field value as the answer (same as "other" option)
              answer = yesText;
            }
          }
          if (question.questionType === QuestionType.INPUT_BOX) {
            if (question.validation === 'tags') {
              answer = (answer as unknown as OptionValue[]).map((item) => item.value).join(', ');
            }

            // Convert answer to string format
            let stringAnswer = '';
            if (Array.isArray(answer)) {
              // For arrays (MULTIPLE_CHOICE), convert to comma-separated string
              stringAnswer = answer.join(', ');
            } else if (typeof answer === 'string') {
              stringAnswer = answer;
            } else if (answer !== null && answer !== undefined) {
              stringAnswer = String(answer);
            }

            return {
              questionId: question.id,
              isRequired: question.isRequired,
              answer: stringAnswer,
            };
          }

          // Handle FILE_UPLOAD - ensure answer is a string (URL)
          if (question.questionType === QuestionType.FILE_UPLOAD) {
            const fileAnswer: string = typeof answer === 'string' ? answer : '';
            return {
              questionId: question.id,
              isRequired: question.isRequired,
              answer: fileAnswer,
            };
          }

          // For all other question types, ensure answer is properly formatted
          // Safety check: ensure no File objects slip through
          let finalAnswer: string | string[] | AddressValues | boolean | Date | OptionValue | null | undefined;

          if (answer instanceof File) {
            finalAnswer = '';
          } else if (answer === null || answer === undefined) {
            finalAnswer = answer;
          } else if (typeof answer === 'string' || typeof answer === 'boolean') {
            finalAnswer = answer;
          } else if (Array.isArray(answer)) {
            finalAnswer = answer;
          } else if (answer instanceof Date) {
            finalAnswer = answer;
          } else {
            // For AddressValues or OptionValue, use type assertion
            finalAnswer = answer as AddressValues | OptionValue;
          }

          // Convert finalAnswer to string for DROPDOWN and CHECKBOXES if needed
          if ([QuestionType.DROPDOWN, QuestionType.CHECKBOXES].includes(question.questionType as QuestionType)) {
            if (typeof finalAnswer === 'string') {
              // Ensure answer is not empty - if it is, keep the original answer value
              const answerValue = finalAnswer.trim().length > 0 ? finalAnswer : (values[question.id] as string) || '';
              return {
                questionId: question.id,
                isRequired: question.isRequired,
                answer: answerValue,
              };
            }
            // If somehow it's not a string, convert it
            finalAnswer = String(finalAnswer || values[question.id] || '');
          }

          // Ensure answer is never empty for required questions
          const answerValue = finalAnswer || '';
          return {
            questionId: question.id,
            isRequired: question.isRequired,
            answer: answerValue,
          };
        })
        .filter((item) => item && item.answer !== undefined && item.answer !== null);

      const payload: OrderRefillSurveyPayload & { patientId?: string } = {
        orderId: selectedOrder?.id,
        surveyId: selectedOrder?.refillSurveyId,
        answers,
        vialsRequested,
        ...(patientId && { patientId }), // Include patientId if provided (for admin portal)
      };

      // Add address only if user selected "Yes" for address question
      if (shouldIncludeAddress && values.address) {
        const addr = values.address;
        payload.address = {
          billingAddress: addr.billingAddress,
          shippingAddress: addr.sameAsBilling ? addr.billingAddress : addr.shippingAddress,
        };
      } else {
        // If "No" is selected or no address question, set address to null
        payload.address = null;
      }

      const { success, message, data } = await submitOrderRefillSurvey(payload).unwrap();

      if (success) {
        toast.success(message);

        const { order } = data || {};

        const refillOrder = {
          id: order?.id || '',
          productName: order?.productType.name,
          category: order?.productType.category || '',
          dosageType: order?.productType.dosageType || '',
          planType: order?.productType.planType || PlanType.RECURRING,
          medicineType: order?.productType.medicineType || '',
          metadata: order?.productType.metadata,
        };

        handleClose({ ...data, order: refillOrder });
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data?.message || 'Failed to submit refill survey. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    // Prevent multiple simultaneous calls
    if (isAdvancing) return;

    const { values, setTouched } = formRef.current ?? {};

    const validation = getCurrentStepValidation(currentQuestion);
    try {
      setIsAdvancing(true);
      setIsNavigatingBack(false); // User is moving forward
      await validation.validate(values, { abortEarly: false });
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } catch (err) {
      // Validation failed - mark fields as touched to show errors
      const touched: Record<string, boolean> = {};
      if (currentQuestion?.id) {
        touched[currentQuestion.id] = true;
      } else {
        touched.address = true;
      }
      setTouched?.(touched);
      // Show validation errors to user
      if (err instanceof Yup.ValidationError && err.errors && err.errors.length > 0) {
        toast.error(err.errors[0]);
      }
    } finally {
      // Reset the advancing flag after a short delay to allow transition
      setTimeout(() => setIsAdvancing(false), 100);
    }
  };

  const handlePrevious = () => {
    setIsAdvancing(false);
    setIsNavigatingBack(true); // User is navigating back
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  function handleClose(refill?: RefillSurveyRequest | null) {
    formRef.current?.resetForm();
    setCurrentStep(0);
    setIsAdvancing(false);
    setIsNavigatingBack(false);
    onClose(refill);
  }

  const footer = (
    <div className='tw-flex tw-items-center tw-justify-between tw-flex-grow'>
      <button
        type='button'
        onClick={handlePrevious}
        disabled={currentStep === 0 || formRef?.current?.isSubmitting || isLoading}
        className='tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 md:tw-px-6 md:tw-py-3 tw-text-primary tw-bg-white tw-border tw-border-solid tw-border-primary tw-rounded-lg hover:tw-bg-primary/10 tw-transition-all disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-select-none'
      >
        <FiArrowLeft className='tw-w-5 tw-h-5' />
        Previous
      </button>

      {isLastStep ? (
        <button
          type='button'
          onClick={() => formRef.current?.submitForm()}
          disabled={formRef?.current?.isSubmitting || isLoading}
          className='tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 md:tw-px-6 md:tw-py-3 tw-text-white tw-bg-primary tw-rounded-lg hover:tw-bg-blue-700 tw-transition-all disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-select-none'
        >
          {(formRef?.current?.isSubmitting || isLoading) && <CircularProgress />}
          Submit Survey
        </button>
      ) : (
        <button
          type='button'
          disabled={formRef?.current?.isSubmitting || isLoading}
          onClick={handleNext}
          className='tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 md:tw-px-6 md:tw-py-3 tw-text-white tw-bg-primary tw-rounded-lg hover:tw-bg-blue-700 tw-transition-all disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-select-none'
        >
          Next
          <FiArrowRight className='tw-w-5 tw-h-5' />
        </button>
      )}
    </div>
  );

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent form submission on Enter key for ALL steps
    // Users must explicitly click Next or Submit Survey buttons
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      // Only auto-advance to next question if not on last step
      // On the last step, Enter does nothing - user must click Submit Survey button
      if (!isLastStep && currentQuestion?.validation !== 'tags') {
        handleNext();
      }
    }
  };

  return (
    <Formik innerRef={formRef} initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      <Form onKeyDown={handleFormKeyDown}>
        <Offcanvas
          isLoading={isFetching}
          size='xl'
          closeOnBackdropClick={false}
          closeOnEscape={false}
          onClose={() => handleClose()}
          isOpen={isOpen}
          title='Refill Request Form'
          footer={footer}
          showFooter={true}
          bodyClassName={currentQuestion?.validation === 'tags' ? 'tw-min-h-80' : ''}
        >
          {/* Progress Bar */}
          <div className='tw-mb-8'>
            <div className='tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2'>
              <div
                className='tw-bg-primary tw-h-2 tw-rounded-full tw-transition-all tw-duration-300'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Question Step */}
          {currentQuestion && (
            <>
              <div className='tw-my-6 md:tw-mt-10 md:tw-mb-8'>
                <p className='md:tw-text-[22px] md:tw-leading-[27px] tw-font-medium tw-font-secondary'>
                  {currentQuestion.questionText}
                  {currentQuestion.isRequired && <span className='tw-text-red-500 tw-ml-1'>*</span>}
                </p>
                {currentQuestion.description && (
                  <span className='tw-text-sm tw-text-gray-600'>{capitalizeFirst(currentQuestion.description)}</span>
                )}
              </div>

              <div className='tw-mt-6'>
                <QuestionFields
                  question={currentQuestion}
                  selectedOrder={selectedOrder}
                  onAutoNext={handleNext}
                  isLastStep={isLastStep}
                  isNavigatingBack={isNavigatingBack}
                />
              </div>

              {currentQuestion.id && (
                <ErrorMessage name={currentQuestion.id}>
                  {(msg) => (
                    <div className='tw-mt-4 tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg'>
                      <p className='tw-text-sm tw-text-red-600'>{msg}</p>
                    </div>
                  )}
                </ErrorMessage>
              )}
            </>
          )}
        </Offcanvas>
      </Form>
    </Formik>
  );
};
