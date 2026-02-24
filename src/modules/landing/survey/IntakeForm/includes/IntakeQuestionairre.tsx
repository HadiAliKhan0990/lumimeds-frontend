'use client';

import { QuestionType } from '@/lib/enums';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { IntakeFormValues } from '@/types/survey';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { FaRegCircle } from 'react-icons/fa6';
import { SelectDatepicker } from 'react-select-datepicker';
import { HeightQuestion } from './HeightQuestion';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';
import { motion } from 'framer-motion';

interface Props {
  question?: SurveyQuestion;
  phone?: string;
  isNavigatingBack: boolean;
  isLastQuestion?: boolean;
  firstName?: string;
  lastName?: string;
}

export const IntakeQuestionairre = ({
  question,
  phone,
  isNavigatingBack,
  isLastQuestion = false,
  firstName,
  lastName,
}: Readonly<Props>) => {
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { values, setFieldValue, handleBlur, validateForm, submitForm, setFieldTouched, setFieldError } =
    useFormikContext<IntakeFormValues>();

  const fieldName = question?.id || 'field';
  const value = values[fieldName];
  const textKey = question?.questionText?.toLowerCase() ?? '';
  const isDateOfBirth = textKey.toLowerCase().includes('birth') || textKey.toLowerCase().includes('dob');
  const isHeight = textKey.includes('height');

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const isOther = val.toLowerCase().includes('other') || val.toLowerCase().includes('please list');

    // Check if the value has actually changed from the current value
    const currentValue = values[fieldName];
    const hasValueChanged = currentValue !== val;

    // Clear any existing auto-advance timer when user interacts
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Set the answer first
    await setFieldValue(fieldName, val);

    if (!isOther) {
      await setFieldValue('otherText', '');
      setFieldTouched('otherText', false);
      setFieldError('otherText', '');

      // Disable auto-click on the final screen
      if (isLastQuestion) {
        return;
      }

      // Don't auto-submit if user just navigated back AND hasn't changed the value
      // This allows users to go back multiple times without auto-submission
      // But if they change the answer, we should auto-submit
      if (isNavigatingBack && !hasValueChanged) {
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

      // Only auto-submit if the value has actually changed
      if (hasValueChanged) {
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
  }

  async function handleMultiChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    const current = (values[fieldName] as string[]) || [];
    const exists = current.includes(value);

    // Check if the clicked option is "None of the above"
    const isNoneOfTheAbove = value.toLowerCase().includes('none of the above');

    // Check if current selection has "None of the above"
    const hasNoneOfTheAbove = current.some((v) => v.toLowerCase().includes('none of the above'));

    let next: string[];

    if (isNoneOfTheAbove) {
      // If "None of the above" is clicked, only select it (or deselect if already selected)
      next = exists ? [] : [value];
    } else if (hasNoneOfTheAbove) {
      // If "None of the above" was selected and user selects another option, remove "None of the above"
      next = [value];
    } else {
      // Normal multi-select behavior
      next = exists ? current.filter((o) => o !== value) : [...current, value];
    }

    await setFieldValue(fieldName, next);

    // Check if any selected option is an "other" type
    const hasOtherSelected = next.some(
      (opt) => opt.toLowerCase().includes('other') || opt.toLowerCase().includes('please list')
    );

    if (!hasOtherSelected) {
      await setFieldValue('otherText', '');
      setFieldTouched('otherText', false);
      setFieldError('otherText', '');
    }
  }

  const handleChangeDate = useCallback(
    async (date: Date | null) => {
      await setFieldValue(fieldName, date);
    },
    [fieldName, setFieldValue]
  );

  const isInputDisabled = useMemo(() => {
    return (
      question?.validation == 'email' ||
      (question?.questionText?.toLowerCase().includes('first and last name') && firstName && lastName)
    );
  }, [question]);

  const minDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 100);
    return d;
  }, []);

  const eighteenYearsAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  if (question?.questionType === QuestionType.MULTIPLE_CHOICE) {
    const opts = question?.options || [];
    const selected = (value as string[]) || [];

    return (
      <div className='tw-flex tw-flex-col tw-gap-3'>
        {opts.map((opt) => {
          const isSelected = selected.includes(opt);
          const isOtherOption = opt.toLowerCase().includes('other') || opt.toLowerCase().includes('please list');
          const shouldShowInput = isSelected && isOtherOption;

          return (
            <div key={opt}>
              <motion.label
                className={`tw-rounded border tw-cursor-pointer tw-px-3 tw-py-2 md:tw-p-4 tw-text-sm md:tw-text-base tw-flex tw-select-none tw-items-center tw-justify-start tw-gap-x-4 ${
                  isSelected ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
              >
                <input
                  type='checkbox'
                  name={fieldName}
                  hidden
                  checked={isSelected}
                  onChange={handleMultiChange}
                  onBlur={handleBlur}
                  value={opt}
                />
                {isSelected ? (
                  <FaRegCheckCircle className='flex-shrink-0' color={isSelected ? 'white' : undefined} />
                ) : (
                  <FaRegCircle className='flex-shrink-0' />
                )}
                <span>{opt}</span>
              </motion.label>
              {shouldShowInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className='tw-mt-4'
                >
                  <Field name='otherText' className='form-control dark-input border-black rounded-1' />
                  <ErrorMessage name='otherText' component='div' className='text-danger small mt-1' />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if ([QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question?.questionType as QuestionType)) {
    const opts = question?.options || [];
    const selected = (value as string) || '';
    return (
      <div className='tw-flex tw-flex-col tw-gap-3'>
        {opts.map((opt) => {
          const isSelected = selected === opt;
          const isOtherOption = opt.toLowerCase().includes('other') || opt.toLowerCase().includes('please list');
          const shouldShowInput = isSelected && isOtherOption;

          return (
            <div key={opt}>
              <motion.label
                className={`tw-rounded border tw-cursor-pointer tw-px-3 tw-py-2 md:tw-p-4 tw-text-sm md:tw-text-base tw-flex tw-select-none tw-items-center tw-justify-start tw-gap-x-4 ${
                  isSelected ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
              >
                <input
                  type='radio'
                  name={fieldName}
                  hidden
                  checked={isSelected}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={opt}
                />
                {isSelected ? (
                  <FaRegCheckCircle className='flex-shrink-0' color={isSelected ? 'white' : undefined} />
                ) : (
                  <FaRegCircle className='flex-shrink-0' />
                )}
                <span>{opt}</span>
              </motion.label>
              {shouldShowInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className='tw-mt-4'
                >
                  <Field name='otherText' className='form-control dark-input border-black rounded-1' />
                  <ErrorMessage name='otherText' component='div' className='text-danger small mt-1' />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (question?.validation === 'phone') {
    const phoneValue = (values[fieldName] as string) || '';
    const shouldDisable = Boolean(phone?.trim());

    return (
      <CustomPhoneInput
        disabled={shouldDisable}
        value={phoneValue}
        onBlur={handleBlur}
        name={fieldName}
        onChange={(event) => {
          setFieldValue(fieldName, event.target.value);
        }}
      />
    );
  }

  if (question?.validation === 'date') {
    return (
      <SelectDatepicker
        selectedDate={values[fieldName] ? (values[fieldName] as Date) : null}
        onDateChange={(date) => handleChangeDate(date)}
        hideLabels
        minDate={isDateOfBirth ? minDob : undefined}
        maxDate={isDateOfBirth ? eighteenYearsAgo : undefined}
        labels={{ yearPlaceholder: 'Year', dayPlaceholder: 'Day', monthPlaceholder: 'Month' }}
      />
    );
  }

  if (isHeight) {
    return <HeightQuestion name={fieldName} />;
  }

  if (question?.validation === 'email') {
    return <div className='form-control dark-input border-black disabled rounded-1'>{values[fieldName] as string}</div>;
  }

  return (
    <Field disabled={isInputDisabled} name={fieldName} className='form-control dark-input border-black rounded-1' />
  );
};
