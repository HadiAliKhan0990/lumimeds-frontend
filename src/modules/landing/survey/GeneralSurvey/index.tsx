'use client';

import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { PatientSurveysResponse, useSubmitGeneralSurveyMutation } from '@/store/slices/surveysApiSlice';
import { Spinner as RBSpinner } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { QuestionType } from '@/lib/enums';
import { SurveyForm } from '@/components/PatientSurvey/SurveyForm';
import { uploadGeneralSurveyFile } from '@/lib/fileUpload';
import { Error, PatientSurveyAnswerType } from '@/lib/types';
import { isAxiosError } from 'axios';
import { AddressQuestionRenderer } from './includes/AddressQuestionRenderer';
import { AddressData } from '@/types/generalSurvey';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { PatientDataForRenewalSurveyResponse } from '@/services/survey/types';

/**
 * Checks if an option text represents an "other" or "please list" option.
 * Excludes options containing "another" (e.g., "Another reason").
 */
const isOtherOptionText = (option: string): boolean => {
  const lowerOption = option.toLowerCase();
  return (lowerOption.includes('other') && !lowerOption.includes('another')) || lowerOption.includes('please list');
};

/**
 * Checks if the current answer has an unspecified "other" option that requires text input.
 * Returns true if an "other"/"please list" option is selected but no text is provided.
 */
const hasUnspecifiedOtherOption = (
  question: SurveyQuestion | undefined,
  answer: PatientSurveyAnswerType | undefined
): boolean => {
  if (!answer?.answer || !question) return false;

  const otherTextValue = answer.otherText;

  // Handle MULTIPLE_CHOICE questions
  if (question.questionType === QuestionType.MULTIPLE_CHOICE && Array.isArray(answer.answer)) {
    const hasOtherOption = answer.answer.some((option: string) => isOtherOptionText(option));
    return hasOtherOption && (!otherTextValue || !otherTextValue.trim());
  }

  // Handle single choice questions (Dropdown/Checkbox)
  if (
    (question.questionType === QuestionType.DROPDOWN || question.questionType === QuestionType.CHECKBOXES) &&
    typeof answer.answer === 'string'
  ) {
    return isOtherOptionText(answer.answer) && (!otherTextValue || !otherTextValue.trim());
  }

  return false;
};

interface Props {
  surveyId: string;
  surveyEmail: string;
  data: PatientSurveysResponse['data'];
  orderAddress?: string;
  preventClose?: boolean;
  patientData?: PatientDataForRenewalSurveyResponse['data'];
  homeUrl: string;
}

export default function GeneralSurvey({
  surveyId,
  surveyEmail,
  data,
  orderAddress,
  preventClose = false,
  patientData,
  homeUrl,
}: Readonly<Props>) {
  const allQuestions = data?.questions || [];

  const [answers, setAnswers] = useState<PatientSurveyAnswerType[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({ sameAsBilling: false });
  const [showSuccess, setShowSuccess] = useState(false);

  const [submitSurvey, { isLoading }] = useSubmitGeneralSurveyMutation();

  // Helper function to check if a question is about pregnancy
  const isPregnancyQuestion = (question: (typeof allQuestions)[0]) => {
    const text = question?.questionText?.toLowerCase() || '';
    return text.includes('pregnant') || text.includes('pregnancy');
  };

  // Filter questions: exclude pregnancy questions for male patients
  const questions = useMemo(() => {
    const gender = patientData?.gender?.toLowerCase();
    const isMale = gender === 'male' || gender === 'm';

    if (isMale) {
      return allQuestions.filter((question) => !isPregnancyQuestion(question));
    }

    return allQuestions;
  }, [allQuestions, patientData?.gender]);

  /**
   * Detects if the current question is an address type question.
   * Uses pattern matching on question text to identify address questions.
   * Patterns: "update your new address", "update your address", "new address"
   *
   * @see docs/ADDRESS_QUESTION_IMPLEMENTATION.md for details
   */
  const isQuestionAddressType = useMemo(() => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) return false;
    const text = currentQuestion?.questionText?.toLowerCase() || '';
    return (
      text.includes('update your new address') || text.includes('update your address') || text.includes('new address')
    );
  }, [questions, questionIndex]);

  const currentAnswer = answers.find((a) => a.questionId === questions[questionIndex]?.id);
  const isAnswerEmpty = Array.isArray(currentAnswer?.answer)
    ? currentAnswer?.answer.length === 0
    : currentAnswer?.answer === '';

  const isLastQuestion = questionIndex === questions.length - 1;
  const progressValue = ((questionIndex + 1) / questions.length) * 100;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!surveyId || !data?.id) return;

      let email = '';

      if (surveyEmail) {
        email = surveyEmail;
      } else {
        const emailQuestionId = allQuestions.find((item) => item.questionText?.toLowerCase().includes('email'))?.id;
        email = answers.find((item) => item.questionId === emailQuestionId)?.answer as string;
      }

      if (!email) {
        toast.error('Email is required');
        return;
      }

      // Check if there is an address question and get its ID to exclude it from regular processing
      const addressQuestion = allQuestions.find(
        (question) =>
          question?.questionText?.toLowerCase().includes('update your new address') ||
          question?.questionText?.toLowerCase().includes('update your address') ||
          question?.questionText?.toLowerCase().includes('new address')
      );

      const sanitizedAnswers = await Promise.all(
        answers.map(async ({ questionId, answer, otherText }) => {
          const question = questions.find((q) => q.id === questionId);
          const { isRequired } = question || {};

          // Check if answer is a File object
          const isFileObject = answer instanceof File;
          const hasFileProperties =
            typeof answer === 'object' && answer !== null && 'name' in answer && 'size' in answer && 'type' in answer;

          // More robust File check
          if (isFileObject || (hasFileProperties && answer instanceof Blob)) {
            const fileUrl = await uploadGeneralSurveyFile({ surveyId, file: answer as File, email });
            return { questionId, answer: fileUrl, isRequired };
          }

          // Get otherText from the answer object being processed, not from currentAnswer
          const otherValue = otherText;

          if (otherValue && otherValue.trim()) {
            if (question?.questionType === QuestionType.MULTIPLE_CHOICE && Array.isArray(answer)) {
              // Filter out "other" options (but not "another") and "please list" options
              const answerWithoutOther = answer.filter((option) => !isOtherOptionText(option));

              // Combine filtered answers with the other text value
              return { questionId, answer: [...answerWithoutOther, otherValue.trim()], isRequired };
            }

            return { questionId, answer: otherValue.trim(), isRequired };
          }

          return { questionId, answer: answer as string, isRequired };
        })
      );

      // Handle address question separately
      // Address objects are stored temporarily during form interaction
      // Before submission, they must be serialized to JSON strings
      if (addressQuestion) {
        const { isRequired, id } = addressQuestion;
        const { selectedOption, billingAddress, shippingAddress } = addressData;

        if (selectedOption === 'Yes') {
          // Serialize the entire addressData object when "Yes" is selected
          sanitizedAnswers.unshift({
            questionId: id || '',
            answer: JSON.stringify({ billingAddress, shippingAddress }),
            isRequired,
          });
        } else if (selectedOption === 'No') {
          // Store "No" when "No" is selected
          sanitizedAnswers.unshift({ questionId: id || '', answer: 'No', isRequired });
        }
        // If selectedOption is not set, the address question won't be included
        // This is handled by validation in handleNext
      }

      const { success, message } = await submitSurvey({
        id: surveyId,
        data: { email, answers: sanitizedAnswers },
      }).unwrap();

      if (success) {
        // Only close tab if preventClose is not set to true
        if (!preventClose) {
          toast.success(message || 'Intake form submitted successfully');
          // Try multiple methods to close the tab/window
          // Method 1: Standard window.close()
          if (typeof globalThis.window !== 'undefined') {
            globalThis.window.close();
          }

          // Method 2: Try to close with self reference (works in some browsers)
          setTimeout(() => {
            if (typeof globalThis.window !== 'undefined') {
              globalThis.window.open('', '_self', '');
              globalThis.window.close();
            }
          }, 500);

          // Method 3: If still open after 1 second, navigate to blank page
          setTimeout(() => {
            if (typeof globalThis.window !== 'undefined' && !globalThis.window.closed) {
              globalThis.window.location.href = 'about:blank';
            }
          }, 1000);
        } else {
          // If preventClose is true, show success message without redirecting
          setShowSuccess(true);
        }
      } else {
        toast.error(message || 'Failed to submit the survey, Please try again later.');
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || 'Failed to submit the survey, Please try again later.');
      } else {
        toast.error((error as Error).data?.message || 'Failed to submit the survey, Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleNext = async () => {
    const currentQuestion = questions[questionIndex];

    // Handle address question separately
    if (isQuestionAddressType) {
      const { selectedOption } = addressData;

      if (!selectedOption) {
        toast.error('Please select an option before proceeding');
        return;
      }
    } else {
      // Handle regular questions
      const answer = answers.find((a) => a.questionId === currentQuestion?.id);

      if (!answer) {
        toast.error('Please answer the question before proceeding');
        return;
      }

      // Validate "other" option requires text input (button should be disabled, but double-check)
      if (hasUnspecifiedOtherOption(currentQuestion, answer)) {
        toast.error('Please specify your answer in the text field');
        return;
      }
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const isButtonDisabled = useMemo(() => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) return false;

    // Handle required questions - check basic requirements first
    if (currentQuestion.isRequired) {
      if (!currentAnswer || isAnswerEmpty || currentAnswer?.isValid === false) {
        return true;
      }
    }

    // Handle "other" or "please list" options for ALL questions (required and non-required)
    return hasUnspecifiedOtherOption(currentQuestion, currentAnswer);
  }, [questions, questionIndex, currentAnswer, isAnswerEmpty]);

  useEffect(() => {
    if (allQuestions.length > 0 && answers.length === 0) {
      const gender = patientData?.gender?.toLowerCase();
      const isMale = gender === 'male' || gender === 'm';

      const _answers: PatientSurveyAnswerType[] = allQuestions.map((question): PatientSurveyAnswerType => {
        let initialAnswer: string | string[] = question.questionType === QuestionType.MULTIPLE_CHOICE ? [] : '';

        // For male users, auto-fill pregnancy questions with "does not apply" option
        if (isMale && isPregnancyQuestion(question)) {
          const doesNotApplyOption = question.options?.find(
            (opt) => opt.toLowerCase().includes('does not apply') || opt.toLowerCase().includes('not applicable')
          );
          if (doesNotApplyOption) {
            initialAnswer =
              question.questionType === QuestionType.MULTIPLE_CHOICE ? [doesNotApplyOption] : doesNotApplyOption;
            return {
              questionId: question.id ?? '',
              answer: initialAnswer,
              isValid: true,
            };
          }
        }

        // Check if this is a medication-related question
        const questionText = question.questionText?.toLowerCase() || '';
        const isMedicationQuestion = questionText.includes('current medication');
        const isMedicalConditionsQuestion = questionText.includes('medical conditions');

        // Prefill medication question from patientData.medication if available
        if (isMedicationQuestion && patientData?.medication) {
          if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
            question.options?.forEach((option) => {
              if (option.toLowerCase().includes(patientData.medication.toLowerCase())) {
                initialAnswer = [String(option)];
              }
            });
          } else {
            question.options?.forEach((option) => {
              if (option.toLowerCase().includes(patientData.medication.toLowerCase())) {
                initialAnswer = String(option);
              }
            });
          }
        } else if (isMedicalConditionsQuestion && patientData?.medicalConditions) {
          initialAnswer = patientData.medicalConditions;
        }
        // Extract pre-filled answer from renewalData using question mapping
        else if (patientData?.renewalData && question.mapping) {
          const mapping = question.mapping;
          const model = mapping.model?.toLowerCase();
          const fieldName = mapping.field || mapping.tag;

          if (model && fieldName) {
            const renewalData = patientData.renewalData as Record<string, Record<string, unknown>>;
            const modelData = renewalData[model];

            if (modelData && typeof modelData === 'object' && fieldName in modelData) {
              const renewalValue = modelData[fieldName];

              if (renewalValue !== undefined && renewalValue !== null) {
                // Handle different answer types based on question type
                if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
                  // For multiple choice, check if value is comma-separated string or array
                  if (Array.isArray(renewalValue)) {
                    initialAnswer = renewalValue.map((item) => String(item));
                  } else if (typeof renewalValue === 'string' && renewalValue.includes(',')) {
                    initialAnswer = renewalValue
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean);
                  } else if (typeof renewalValue === 'object') {
                    // Handle object values - convert to JSON string then wrap in array
                    initialAnswer = [JSON.stringify(renewalValue)];
                  } else {
                    initialAnswer = [String(renewalValue)];
                  }
                } else {
                  // For single answer questions, convert to string
                  if (Array.isArray(renewalValue)) {
                    initialAnswer = renewalValue.map((item) => String(item)).join(', ');
                  } else if (typeof renewalValue === 'object') {
                    // Handle object values - convert to JSON string
                    initialAnswer = JSON.stringify(renewalValue);
                  } else {
                    initialAnswer = String(renewalValue);
                  }
                }
              }
            }
          }
        }

        return {
          questionId: question.id ?? '',
          answer: initialAnswer,
          isValid: (isMedicationQuestion || isMedicalConditionsQuestion) && initialAnswer.length > 0 ? true : false,
        };
      });

      setAnswers(_answers);
    }
  }, [allQuestions, orderAddress, patientData]);

  useEffect(() => {
    if (orderAddress) {
      const address = JSON.parse(orderAddress) as AddressData;

      setAddressData((p) => ({
        ...p,
        billingAddress: address.billingAddress,
        shippingAddress: address.shippingAddress,
      }));
    }
  }, [orderAddress]);

  // Initialize addressData from patientData if available (for renewal surveys)
  useEffect(() => {
    if (patientData?.address) {
      setAddressData((p) => ({
        ...p,
        billingAddress: patientData.address.billingAddress,
        shippingAddress: patientData.address.shippingAddress,
      }));
    }
  }, [patientData]);

  // Reset questionIndex if it's out of bounds after filtering
  useEffect(() => {
    if (questionIndex >= questions.length && questions.length > 0) {
      setQuestionIndex(0);
    }
  }, [questions.length, questionIndex]);

  if (!data || questions.length === 0) {
    return (
      <div className='container d-flex align-items-center justify-content-center'>
        <div className='text-center mt-5'>
          <Image src={Logo} className='mb-4 tw-mx-auto' quality={100} alt='LumiMeds' />
          <h3 className='mb-3 text-danger'>🚫 Unable to load the survey</h3>
          <p className='text-muted'>
            {"We're sorry, but we couldn't load the survey at this time. This could be due to:"}
          </p>
          <ul className='text-muted text-start mx-auto max-w-400'>
            <li>The survey link is invalid or expired.</li>
            <li>Your email or token might be missing or incorrect.</li>
            <li>There was a problem connecting to the server.</li>
          </ul>
          <p className='my-4'>Please contact support or try again later.</p>
          <Link href={homeUrl} className='btn btn-primary rounded-pill px-4 py-2'>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show success message after form submission (not on page load)
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
            <Link href={homeUrl} className='btn btn-primary rounded-pill px-4 py-2'>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='tw-px-4 tw-mb-10 lg:tw-mb-20'>
      <Image src={Logo} className='tw-mb-6 lg:tw-mb-10 tw-mx-auto' quality={100} alt='LumiMeds' />
      <div className='tw-max-w-[700px] tw-mx-auto tw-relative'>
        {questionIndex !== 0 && (
          <button
            disabled={isLoading || isSubmitting}
            onClick={handlePrev}
            type='button'
            className='tw-flex tw-items-center tw-gap-2 tw-text-primary btn-no-style tw-mx-auto lg:tw-mx-0 tw-mb-4 md:tw-mb-6 lg:tw-mb-0 lg:tw-absolute lg:-tw-top-1.5 lg:tw-left-[-100px]'
          >
            <FaArrowLeft />
            <span className='text-sm'>Back</span>
          </button>
        )}

        <div className='progress flex-grow-1 !tw-h-2'>
          <div className='progress-bar' style={{ width: `${progressValue}%` }} aria-label='Survey progress' />
        </div>

        <p className='md:tw-text-[22px] md:tw-leading-[27px] tw-font-medium tw-font-secondary tw-my-6 md:tw-mt-10 md:tw-mb-8'>
          {questions[questionIndex]?.questionText}
        </p>
        {questions.length > 0 && isQuestionAddressType ? (
          <AddressQuestionRenderer addressData={addressData} setAddressData={setAddressData} />
        ) : (
          <SurveyForm
            key={`question-${questionIndex}`}
            question={questions[questionIndex]}
            answers={answers}
            setAnswers={setAnswers}
            patientId={data?.patientId || ''}
            surveyEmail={surveyEmail}
          />
        )}
        <button
          disabled={isButtonDisabled || isLoading || isSubmitting}
          onClick={handleNext}
          className='btn btn-primary rounded-pill md:!tw-text-lg !tw-py-2 md:!tw-py-3 d-flex align-items-center gap-3 justify-content-center tw-font-semibold tw-w-full tw-shadow-subtle tw-mt-8'
        >
          <span>{isLastQuestion ? 'Submit Intake' : 'Next'}</span>
          {isLoading || isSubmitting ? <RBSpinner size='sm' /> : <FaArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
