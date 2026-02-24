'use client';

import { PatientSurveyAnswerType } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { Field, useFormikContext } from 'formik';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Props {
  question?: SurveyQuestion;
  isNavigatingBack: boolean;
  isLastQuestion: boolean;
}

export const SingleChoice = ({ question, isNavigatingBack, isLastQuestion }: Props) => {
  const { values, setFieldValue, setFieldTouched, setFieldError, submitForm, validateForm } =
    useFormikContext<PatientSurveyAnswerType>();
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOptionClick = async (opt: string) => {
    const isOther = opt.toLowerCase().includes('other') || opt.toLowerCase().includes('please list');

    // Check if the answer has actually changed from the current value
    const currentAnswer = values.answer;
    const hasAnswerChanged = currentAnswer !== opt;

    // Clear any existing auto-advance timer when user interacts
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Set the answer first
    await setFieldValue('answer', opt);

    if (!isOther) {
      await setFieldValue('otherText', '');
      setFieldTouched('otherText', false);
      setFieldError('otherText', '');

      // Disable auto-click on the final screen
      if (isLastQuestion) {
        return;
      }

      // Don't auto-submit if user just navigated back AND hasn't changed the answer
      // This allows users to go back multiple times without auto-submission
      // But if they change the answer, we should auto-submit
      if (isNavigatingBack && !hasAnswerChanged) {
        // Check if validation passes, if so set 2-minute timer
        const errors = await validateForm();
        const isFormValid = Object.keys(errors).length === 0;

        if (isFormValid) {
          // Set 2-minute timer to auto-advance
          autoAdvanceTimerRef.current = setTimeout(() => {
            submitForm();
          }, 120000); // 2 minutes = 120,000 milliseconds
        }
        return;
      }

      // Only auto-submit if the answer has actually changed
      if (hasAnswerChanged) {
        // Validate the form before auto-submitting
        const errors = await validateForm();
        const isFormValid = Object.keys(errors).length === 0;

        if (isFormValid) {
          // Auto-submit after a brief delay for smooth transition and user feedback
          setTimeout(() => {
            submitForm();
          }, 300);
        }
      }
    }
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className='tw-grid tw-grid-cols-1 tw-gap-3'>
      {question?.options?.map((opt, index) => {
        const isSelected = values.answer === opt;
        const isOtherOption = opt.toLowerCase().includes('other') || opt.toLowerCase().includes('please list');
        const shouldShowInput = isSelected && isOtherOption;

        return (
          <div key={opt + index}>
            <motion.button
              type='button'
              onClick={() => handleOptionClick(opt)}
              className={`tw-rounded border ${
                isSelected ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
              } tw-w-full tw-px-3 tw-py-2 md:tw-p-4 tw-flex tw-items-center tw-justify-start tw-gap-2 md:tw-gap-3 tw-text-sm md:tw-text-base tw-text-start`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {isSelected ? (
                <FaRegCheckCircle className='flex-shrink-0' color={isSelected ? 'white' : undefined} />
              ) : (
                <FaRegCircle className='flex-shrink-0' />
              )}
              {opt}
            </motion.button>
            {shouldShowInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Field 
                  name='otherText' 
                  className='form-control dark-input border-black rounded-1 mt-2'
                />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};
