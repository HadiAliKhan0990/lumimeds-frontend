import { ReactDatePicker } from '@/components/elements';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';
import { PatientSurveyAnswerType } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useEffect, useMemo, useRef } from 'react';
import { TagsInput } from './TagsInput';
import { INPUT_TYPES } from '@/constants';
import { HeightQuestion } from './HeightQuestion';
import { HeightWeightQuestion } from './HeightWeightQuestion';
import { formatDateToMMDDYYYY } from '@/lib/helper';
import { toast } from 'react-hot-toast';

interface Props {
  question: SurveyQuestion;
  answers: PatientSurveyAnswerType[];
  patientId: string;
  handleChange: (raw: string) => void;
  handleBlur: () => void;
  surveyEmail: string;
}

export const InputTypeQuestionFields = ({
  question,
  answers,
  patientId,
  handleChange,
  handleBlur,
  surveyEmail,
}: Readonly<Props>) => {
  const answerEntry = useMemo(() => answers.find((a) => a.questionId === question.id), [answers, question.id]);
  const value = answerEntry?.answer as string;

  const textKey = question.questionText?.toLowerCase() ?? '';
  const isDateOfBirth = textKey.includes('date of birth') || textKey.includes('dob');
  // Check for height/weight question: must contain BOTH "height" AND "weight"
  const isHeightWeight = textKey.includes('height') && textKey.includes('weight');
  // Check for simple height question: contains "height" but NOT "weight"
  const isHeight = textKey.includes('height') && !textKey.includes('weight');
  const shouldPrefillSurveyEmail = !!surveyEmail && (question.validation === 'email' || textKey.includes('email'));

  const hasAppliedDefaultNoneRef = useRef(false);

  const eighteenYearsAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  const isLastInjectionDateQuestion = useMemo(
    () => question?.questionText?.toLowerCase().includes('last injection') && question?.validation === 'date',
    [question]
  );

  useEffect(() => {
    if (question.validation === 'tags' && !value && !hasAppliedDefaultNoneRef.current) {
      handleChange('none');
      hasAppliedDefaultNoneRef.current = true;
    }
  }, [question.validation, value, handleChange]);

  useEffect(() => {
    if (shouldPrefillSurveyEmail && !value) {
      handleChange(surveyEmail);
    }
  }, [shouldPrefillSurveyEmail, value, handleChange, surveyEmail]);

  if (question.options && question.options.length > 0) {
    return (
      <div className='tw-flex tw-flex-col tw-gap-2'>
        {question.options.map((opt) => (
          <label key={opt} className='tw-flex tw-items-center tw-gap-2'>
            <input
              type={question.validation === 'radio' ? 'radio' : 'checkbox'}
              name={question.id || ''}
              value={opt}
              checked={question.validation === 'radio' ? value === opt : (value ?? '').split(',').includes(opt)}
              onChange={(e) => {
                if (question.validation === 'radio') {
                  handleChange(opt);
                } else {
                  const prev = (value ?? '').split(',').filter(Boolean);
                  if (e.target.checked) handleChange([...prev, opt].join(','));
                  else handleChange(prev.filter((v) => v !== opt).join(','));
                }
              }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.validation === 'phone') {
    return (
      <CustomPhoneInput
        name='contactNumber'
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
      />
    );
  }

  

  if (isDateOfBirth) {
    return (
      <ReactDatePicker
        selected={value ? new Date(value) : null}
        onChange={(date: Date | null) => {
          try {
            handleChange(formatDateToMMDDYYYY(date));
          } catch (error) {
         if (error instanceof Error) toast.error(error.message);
            // If formatting fails, just store empty string
            handleChange('');
          }
        }}
        allowManualDateEntry={true}
        onBlur={handleBlur}
        dateFormat='MM/dd/yyyy'
        placeholderText='MM/DD/YYYY'
        className='dark-input border-black rounded-1'
        maxDate={eighteenYearsAgo}
      />
    );
  }

  if (['date', 'datetime'].includes(question.validation || '') && !isDateOfBirth && !patientId) {
    return (
      <ReactDatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) =>
          handleChange(
            date
              ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
              : ''
          )
        }
        onBlur={handleBlur}
        maxDate={isLastInjectionDateQuestion ? new Date() : undefined}
        dateFormat='MM/dd/yyyy'
        className='dark-input border-black rounded-1'
        placeholderText='MM/DD/YYYY'
        showTimeSelect={question.validation === 'datetime'}
        timeFormat='HH:mm'
        timeIntervals={15}
        timeCaption='Time'
      />
    );
  }

  if (question.validation === 'tags') {
    return (
      <TagsInput
        question={question}
        value={value || ''}
        handleChange={(v) => {
          hasAppliedDefaultNoneRef.current = true;
          handleChange(v);
        }}
        onBlur={handleBlur}
      />
    );
  }

  if (isHeightWeight) {
    return <HeightWeightQuestion value={value} handleChange={handleChange} handleBlur={handleBlur} />;
  }

  if (isHeight) {
    return <HeightQuestion value={value} handleChange={handleChange} handleBlur={handleBlur} />;
  }

  return (
    <input
      type={INPUT_TYPES.includes(question.validation || '') ? question.validation! : 'text'}
      className='form-control dark-input border-black rounded-1'
      value={value || ''}
      onChange={(e) => {
        handleChange(e.target.value);
      }}
      onBlur={handleBlur}
      placeholder={question.description || ''}
      maxLength={(question.validationRules as { max?: number })?.max}
    />
  );
};
