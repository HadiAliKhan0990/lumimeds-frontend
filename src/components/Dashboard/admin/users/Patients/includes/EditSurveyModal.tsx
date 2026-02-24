'use client';

import toast from 'react-hot-toast';
import { Modal } from '@/components/elements';
import { UniversalSurveyForm } from '@/components/Survey/UniversalSurveyForm';
import { useMemo } from 'react';
import { useSubmitResponsesMutation, useUpdateRefillRequestResponsesMutation } from '@/store/slices/surveysApiSlice';
import { LicenseType, PatientAnswerType, PatientSurveyAnswerType, PatientSurveyResponseType } from '@/lib/types';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  preFilledResponses?: PatientSurveyResponseType[];
  submissionId?: string;
  patientId?: string;
  patientEmail?: string;
  productId?: string;
  type?: string;
}

export function EditSurveyModal({
  isOpen,
  onClose,
  surveyId,
  preFilledResponses = [],
  submissionId,
  patientId,
  productId,
  type,
}: Readonly<Props>) {
  const [submitResponses, { isLoading: isSubmitting }] = useSubmitResponsesMutation();
  const [updateRefillRequestResponses, { isLoading: isUpdatingRefill }] = useUpdateRefillRequestResponsesMutation();

  // Transform survey questions from preFilledResponses to UniversalSurveyForm format
  const questions = useMemo(() => {
    if (!preFilledResponses || preFilledResponses.length === 0) return [];

    return preFilledResponses.map((response) => {
      const textKey = (response.questionText || '').toLowerCase();
      const isDateOfBirth = textKey.includes('birth') || textKey.includes('dob');

      return {
        position: response.position,
        answer: '',
        questionId: response.questionId,
        questionText: response.questionText || '',
        questionType: response.questionType || 'text',
        options: response.options || [],
        isHighlighted: response.isHighlighted || false,
        validation: response.validation || (isDateOfBirth ? 'date' : undefined),
      };
    });
  }, [preFilledResponses]);

  // Transform pre-filled responses to PatientSurveyAnswerType format
  const initialAnswers = useMemo(() => {
    return preFilledResponses
      .filter((response) => {
        const answer = response.answer;
        return answer !== null && answer !== undefined && answer !== '';
      })
      .map((response) => {
        let answerValue: string | string[] | File | undefined;
        const answer: PatientAnswerType = response.answer;

        if (answer === null || answer === undefined) {
          answerValue = undefined;
        } else if (typeof answer === 'number') {
          answerValue = String(answer);
        } else if (typeof answer === 'string') {
          answerValue = answer;
        } else if (Array.isArray(answer)) {
          // Check if it's LicenseType[] or string[]
          if (answer.length > 0 && typeof answer[0] === 'object' && answer[0] !== null && 'state' in answer[0]) {
            // It's LicenseType[], convert to JSON string
            answerValue = JSON.stringify(answer as LicenseType[]);
          } else {
            // It's string[], keep as is
            answerValue = answer as string[];
          }
        } else if (typeof answer === 'object' && answer !== null) {
          // Handle Record<string, unknown> - convert to JSON string
          answerValue = JSON.stringify(answer);
        } else {
          answerValue = String(answer);
        }

        // Format phone numbers if validation is 'phone'
        if (response.validation === 'phone' && typeof answerValue === 'string') {
          answerValue = formatUSPhoneWithoutPlusOne(answerValue);
        }

        return {
          questionId: response.questionId,
          answer: answerValue,
          otherText: response.otherText ?? '',
        };
      });
  }, [preFilledResponses]);

  // Handle form submission
  const handleSubmit = async (answers: PatientSurveyAnswerType[]) => {
    // Default behavior: use the regular survey submission endpoint
    if (!patientId || !surveyId || !submissionId) {
      toast.error('Missing required information for submission');
      return;
    }

    try {
      // Transform answers to the format expected by submitResponses
      // Note: Files should already be uploaded and converted to URLs by UniversalSurveyForm
      const submitAnswers = answers
        .filter((answer) => answer.questionId && !(answer.answer instanceof File)) // Filter out invalid answers
        .map((answer) => {
          let processedAnswer: string | string[] | undefined;
          const answerValue = answer.answer;

          // Files should already be URLs at this point (uploaded by UniversalSurveyForm)
          // If we still have a File object, it means upload failed or wasn't attempted
          if (answerValue instanceof File) {
            toast.error('File upload failed. Please try uploading the file again.');
            throw new Error('File upload incomplete');
          } else if (Array.isArray(answerValue)) {
            processedAnswer = answerValue.map(String);
          } else if (answerValue !== null && answerValue !== undefined) {
            processedAnswer = String(answerValue);
          } else {
            processedAnswer = undefined;
          }

          return {
            questionId: answer.questionId || '',
            answer: processedAnswer,
            isRequired: answer?.isRequired ?? false,
            ...(answer?.otherText && { otherText: answer?.otherText }),
          };
        });

      let success = false;
      let message = '';
      if (type === 'PRODUCT_REFILL') {
        const result = await updateRefillRequestResponses({
          refillRequestId: surveyId,
          responses: submitAnswers,
        }).unwrap();
        success = result.success;
        message = result.message || '';
      } else {
        const result = await submitResponses({
          surveyId: surveyId,
          patientId: patientId,
          answers: submitAnswers,
          submissionId: submissionId,
        }).unwrap();
        success = result.success;
        message = result.message || '';
      }

      if (success) {
        toast.success(message || 'Survey responses updated successfully');
        onClose();
      } else {
        toast.error(message || 'Failed to update survey responses');
      }
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage || 'Failed to update survey responses');
      console.error('Error submitting survey:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Survey Responses'
      size='xl'
      className='tw-max-w-[60vw] tw-w-[60vw] tw-h-[800px] tw-max-h-[85vh] sm:tw-max-w-[60vw] sm:tw-w-[60vw] sm:tw-h-[800px] sm:tw-max-h-[85vh] max-[600px]:tw-max-w-[100vw] max-[600px]:tw-w-[100vw] max-[600px]:tw-h-[100vh] max-[600px]:tw-max-h-[100vh] max-[600px]:tw-rounded-none max-[600px]:tw-m-0'
      wrapperClassName='tw-p-0 max-[600px]:tw-p-0'
      bodyClassName='tw-flex-1 tw-overflow-y-auto tw-max-h-[calc(85vh-120px)] tw-h-auto max-[600px]:tw-max-h-[calc(100vh-120px)] max-[600px]:tw-p-4'
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      {questions.length > 0 ? (
        <UniversalSurveyForm
          questions={questions}
          onSubmit={handleSubmit}
          initialAnswers={initialAnswers}
          isLoading={isSubmitting || isUpdatingRefill}
          isEdit={true}
          surveyId={surveyId}
          patientId={patientId}
          productId={productId}
          surveyType={type}
        />
      ) : (
        <div className='text-center p-4'>
          <p>No questions available for this survey.</p>
        </div>
      )}
    </Modal>
  );
}
