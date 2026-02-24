import CreatableSelect from 'react-select/creatable';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { AnswerValue, FormValues } from '@/types/refillForm';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { QuestionType } from '@/lib/enums';
import { SelectDatepicker } from 'react-select-datepicker';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import { AddressQuestion } from '@/components/Dashboard/orders/RefillSurveyFormSidebar/includes/AddressQuestion';
import { Order } from '@/store/slices/orderSlice';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { UploadFileQuestion } from './UploadFileQuestion';

interface Props {
  question: SurveyQuestion;
  selectedOrder: Order | null;
  onAutoNext: () => Promise<void>;
  isLastStep: boolean;
  isNavigatingBack: boolean;
}

export const QuestionFields = ({
  question,
  selectedOrder,
  onAutoNext,
  isLastStep,
  isNavigatingBack,
}: Readonly<Props>) => {
  const { values, setFieldValue, handleBlur } = useFormikContext<FormValues>();

  // Track auto-advance timer
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const otherTextFieldRef = useRef<HTMLDivElement | null>(null);
  const yesTextFieldRef = useRef<HTMLDivElement | null>(null);

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

  // Clear timer on unmount or question change
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [question.id]);

  // Helper to auto-advance after validation
  const handleAutoAdvance = useCallback(
    async (currentValue: AnswerValue, newValue: AnswerValue, delay: number = 300) => {
      if (isLastStep) return;

      // Clear any existing timer
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      // Check if value actually changed
      const hasValueChanged = JSON.stringify(currentValue) !== JSON.stringify(newValue);

      // If navigating back and value hasn't changed, set 2-minute timer
      if (isNavigatingBack && !hasValueChanged) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          onAutoNext();
        }, 120000); // 2 minutes
        return;
      }

      // If value changed, auto-advance after short delay
      if (hasValueChanged) {
        setTimeout(() => {
          onAutoNext();
        }, delay);
      }
    },
    [isLastStep, isNavigatingBack, onAutoNext]
  );

  function handleChangeAddress(option: string) {
    const currentValue = values[question.id || ''];

    // Set the radio button value
    setFieldValue(question.id || '', option);

    if (option === 'Yes') {
      setFieldValue('address', selectedOrder?.address);
    } else {
      // Properly reset all address fields when "No" is selected
      setFieldValue('address', {
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
      });

      // Auto-advance when "No" is selected
      handleAutoAdvance(currentValue, option, 200);
    }
  }

  const handleChangeDate = useCallback(
    (date: Date | null) => {
      // Simply set the field value without any auto-advance logic
      setFieldValue(question.id || '', date);
    },
    [question.id, setFieldValue]
  );

  const isQuestionAddressType = useMemo(
    () =>
      question?.questionText?.toLowerCase().includes('update your new address') ||
      question?.questionText?.toLowerCase().includes('update your address') ||
      question?.questionText?.toLowerCase().includes('new address'),
    [question.questionText]
  );

  const isLastInjectionDateQuestion = useMemo(
    () => question?.questionText?.toLowerCase().includes('last injection') && question?.validation === 'date',
    [question.questionText, question.validation]
  );

  // If it's an address question, ALWAYS render custom radio buttons for Yes/No
  if (isQuestionAddressType) {
    // Check if "Yes" is selected for address question
    const selectedValue = (values[question.id || ''] as string) || '';
    const isYesSelected = selectedValue.toLowerCase().includes('yes');

    // If no options are provided, create default Yes/No options
    const addressOptions = ['Yes', 'No'] as const;

    return (
      <div className='tw-space-y-6 tw-animate-fade-in'>
        {/* Custom Radio Buttons for Yes/No */}
        <div>
          <div className='tw-space-y-3'>
            {addressOptions.map((option: string) => {
              const isSelected = selectedValue === option;
              const optionId = `${question.id}_${option.toLowerCase().replaceAll(/\s+/g, '_')}`;

              return (
                <label
                  key={option}
                  htmlFor={optionId}
                  onClick={() => handleChangeAddress(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleChangeAddress(option);
                    }
                  }}
                  className={
                    'tw-rounded border tw-cursor-pointer tw-px-3 tw-py-2 md:tw-p-4 tw-text-sm md:tw-text-base tw-flex tw-select-none tw-items-center tw-justify-start tw-gap-x-4' +
                    (isSelected ? ' tw-border-primary tw-text-white tw-bg-primary' : ' tw-bg-white')
                  }
                >
                  <Field type='radio' hidden id={optionId} name={question.id} value={option} />

                  {isSelected ? (
                    <FaRegCheckCircle className='flex-shrink-0' color={isSelected ? 'white' : undefined} />
                  ) : (
                    <FaRegCircle className='flex-shrink-0' />
                  )}
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Show AddressQuestion when "Yes" is selected */}
        {isYesSelected && <AddressQuestion />}

        <ErrorMessage name={question.id || ''}>
          {(msg) => <div className='tw-mt-2 tw-text-sm tw-text-red-600'>{msg}</div>}
        </ErrorMessage>
      </div>
    );
  }

  switch (question.questionType) {
    case QuestionType.MULTIPLE_CHOICE: {
      const selected = (values[question.id || ''] as string[]) || [];

      const handleMultipleChoiceChange = (option: string) => {
        const isNoneOfTheAbove =
          option.toLowerCase().includes('none of the above') || option.toLowerCase().includes('does not apply');
        const currentSelected = [...selected];

        if (isNoneOfTheAbove) {
          // If "none of the above" is clicked, clear all other selections
          if (currentSelected.includes(option)) {
            setFieldValue(question.id || '', []);
          } else {
            setFieldValue(question.id || '', [option]);
          }
        } else {
          // If any other option is clicked, remove "none of the above"
          const filteredSelected = currentSelected.filter(
            (item) =>
              !item.toLowerCase().includes('none of the above') && !item.toLowerCase().includes('does not apply')
          );

          if (filteredSelected.includes(option)) {
            setFieldValue(
              question.id || '',
              filteredSelected.filter((item) => item !== option)
            );
          } else {
            setFieldValue(question.id || '', [...filteredSelected, option]);
          }
        }
      };

      return (
        <div className='tw-space-y-3 tw-animate-fade-in'>
          {question.options?.map((option: string) => (
            <button
              key={option}
              type='button'
              onClick={() => handleMultipleChoiceChange(option)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMultipleChoiceChange(option);
                }
              }}
              className={
                'tw-rounded tw-cursor-pointer tw-transition-all tw-text-left border tw-w-full tw-px-3 py-3 tw-flex tw-items-center tw-justify-start tw-gap-x-4' +
                (selected.includes(option) ? ' tw-border-primary tw-text-white tw-bg-primary' : ' tw-bg-white')
              }
            >
              {selected.includes(option) ? (
                <FaRegCheckCircle className='flex-shrink-0' color={selected.includes(option) ? 'white' : undefined} />
              ) : (
                <FaRegCircle className='flex-shrink-0' />
              )}
              {option}
            </button>
          ))}
        </div>
      );
    }

    case QuestionType.DROPDOWN:
    case QuestionType.CHECKBOXES: {
      const selectedOption = (values[question.id || ''] as string) || '';
      const isOtherSelected = selectedOption.toLowerCase().includes('other');
      const isYesSelected = selectedOption.toLowerCase().includes('yes');
      const needsYesTextField = requiresYesTextField(question);
      const otherTextFieldName = `${question.id}_other_text`;
      const yesTextFieldName = `${question.id}_yes_text`;

      const handleDropdownChange = (option: string) => {
        const currentValue = selectedOption;
        const isOptionOther = option.toLowerCase().includes('other');
        const isOptionYes = option.toLowerCase().includes('yes');

        // If clicking the already selected option, unselect it
        if (selectedOption === option) {
          setFieldValue(question.id || '', '');
          // Clear the "other" text field when unselecting "other"
          if (isOtherSelected) {
            setFieldValue(otherTextFieldName, '');
          }
          // Clear the "yes" text field when unselecting "yes"
          if (isYesSelected && needsYesTextField) {
            setFieldValue(yesTextFieldName, '');
          }
        } else {
          setFieldValue(question.id || '', option);
          // Clear the "other" text field when switching from "other" to another option
          if (isOtherSelected && !isOptionOther) {
            setFieldValue(otherTextFieldName, '');
          }
          // Clear the "yes" text field when switching from "yes" to another option
          if (isYesSelected && needsYesTextField && !isOptionYes) {
            setFieldValue(yesTextFieldName, '');
          }

          if (isOptionOther) {
            setTimeout(() => {
              if (otherTextFieldRef.current) {
                otherTextFieldRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });
              }
            }, 150);
          }

          if (isOptionYes && needsYesTextField) {
            setTimeout(() => {
              if (yesTextFieldRef.current) {
                yesTextFieldRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });
              }
            }, 150);
          }

          // Auto-advance for single-choice selection (but not if "other" or "yes" is selected for questions that need it)
          if (!isOptionOther && !(isOptionYes && needsYesTextField)) {
            handleAutoAdvance(currentValue, option, 200);
          }
        }
      };

      return (
        <div className='tw-space-y-3 tw-animate-fade-in'>
          {question.options?.map((option: string) => (
            <button
              key={option}
              type='button'
              onClick={() => handleDropdownChange(option)}
              className={
                'tw-rounded tw-cursor-pointer tw-transition-all tw-text-left border tw-w-full tw-select-none tw-px-3 py-3 tw-flex tw-items-center tw-justify-start tw-gap-x-4' +
                (selectedOption === option ? ' tw-border-primary tw-text-white tw-bg-primary' : ' tw-bg-white')
              }
            >
              {selectedOption === option ? (
                <FaRegCheckCircle className='flex-shrink-0' color={selectedOption === option ? 'white' : undefined} />
              ) : (
                <FaRegCircle className='flex-shrink-0' />
              )}
              {option}
            </button>
          ))}
          {isOtherSelected && (
            <div
              ref={(el) => {
                otherTextFieldRef.current = el;
              }}
              className='tw-mt-4 !tw-mb-4 tw-animate-fade-in'
            >
              <label
                htmlFor={otherTextFieldName}
                className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'
              >
                Please specify: <span className='tw-text-red-500'>*</span>
              </label>
              <Field
                id={otherTextFieldName}
                name={otherTextFieldName}
                type='text'
                placeholder='Enter your answer'
                className='form-control'
                autoFocus
              />
              <ErrorMessage name={otherTextFieldName}>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>
          )}
          {isYesSelected && needsYesTextField && (
            <div
              ref={(el) => {
                yesTextFieldRef.current = el;
              }}
              className='tw-mt-4 !tw-mb-4 tw-animate-fade-in'
            >
              <label
                htmlFor={yesTextFieldName}
                className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'
              >
                Please provide details: <span className='tw-text-red-500'>*</span>
              </label>
              <Field
                id={yesTextFieldName}
                name={yesTextFieldName}
                type='text'
                placeholder='Enter your answer'
                className='form-control'
                autoFocus
              />
              <ErrorMessage name={yesTextFieldName}>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>
          )}
        </div>
      );
    }

    case QuestionType.FILE_UPLOAD: {
      return <UploadFileQuestion question={question} />;
    }

    case QuestionType.INPUT_BOX:
      switch (question.validation) {
        case 'date':
          return (
            <div className='tw-animate-fade-in'>
              <SelectDatepicker
                selectedDate={values[question.id || ''] ? (values[question.id || ''] as Date) : null}
                onDateChange={(date) => handleChangeDate(date)}
                hideLabels
                maxDate={isLastInjectionDateQuestion ? new Date() : undefined}
                labels={{ yearPlaceholder: 'Year', dayPlaceholder: 'Day', monthPlaceholder: 'Month' }}
              />
            </div>
          );
        case 'phone':
          return (
            <div className='tw-animate-fade-in'>
              <CustomPhoneInput
                autoFocus
                value={values[question.id || ''] as string}
                onChange={(e) => {
                  setFieldValue(question.id || '', formatUSPhoneWithoutPlusOne(e.target.value));
                }}
                onBlur={handleBlur}
                name={question.id || ''}
                className='form-control border-black rounded-1'
              />
            </div>
          );
        case 'number':
          return (
            <div className='tw-animate-fade-in'>
              <Field
                name={question.id}
                type='number'
                placeholder='Enter a number'
                className='form-control'
                min='0'
                step='0.01'
              />
            </div>
          );
        case 'tags':
          return (
            <div className='tw-space-y-3 tw-mb-10 tw-animate-fade-in'>
              {/* Helper message for tags */}
              <div className='tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-3 tw-flex tw-items-center tw-gap-2'>
                <FiInfo className='tw-w-5 tw-h-5 tw-text-blue-600 tw-flex-shrink-0' />
                <p className='tw-text-sm tw-text-blue-800 tw-m-0'>
                  Type and press <strong>Enter</strong> to add tags. Click <strong>×</strong> to remove.
                </p>
              </div>

              {/* Tags input */}
              <CreatableSelect
                isMulti
                isClearable
                name={question.id || ''}
                options={[]}
                value={values[question.id || '']}
                onChange={(value) => setFieldValue(question.id || '', value)}
                onBlur={handleBlur}
                placeholder='Type and press Enter to add tags...'
                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                classNames={{
                  control: () => 'w-100 rounded',
                  indicatorSeparator: () => 'd-none',
                }}
                noOptionsMessage={() => 'Type to create a new tag'}
              />
            </div>
          );
        default:
          return (
            <div className='tw-animate-fade-in'>
              <Field
                type={question.validation}
                name={question.id}
                placeholder='Enter your answer'
                className='form-control'
              />
            </div>
          );
      }

    default:
      return (
        <div className='tw-animate-fade-in'>
          <Field
            type={question.validation}
            name={question.id}
            placeholder='Enter your answer'
            className='form-control'
          />
        </div>
      );
  }
};
