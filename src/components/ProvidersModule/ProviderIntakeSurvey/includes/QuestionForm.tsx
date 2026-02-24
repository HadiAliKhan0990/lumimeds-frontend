'use client';

import ProviderGroupSelector from '@/components/ProvidersModule/ProviderIntakeSurvey/includes/ProviderGroupSelector';
import { Field, useFormikContext } from 'formik';
import { QuestionType } from '@/lib/enums';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { ProviderSurveyFormValues } from '@/services/providerIntake/types';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { SelectDatepicker } from 'react-select-datepicker';
import { LicenseQuestion } from '@/components/ProvidersModule/ProviderIntakeSurvey/includes/LicenseQuestion';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';

interface Props {
  question: SurveyQuestion;
  email?: string;
  name: string;
  isAdminEdit?: boolean;
}

export default function QuestionForm({ question, name, isAdminEdit = false }: Readonly<Props>) {
  const { values, setFieldValue, handleBlur } = useFormikContext<ProviderSurveyFormValues>();

  const value = values[name];

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setFieldValue(name, val);
  }

  function handleMultiChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    const current = (values[name] as string[] | string) || [];

    const isArray = Array.isArray(current);
    const exists = isArray ? current.includes(value) : current === value;

    let next: string[];
    if (exists) {
      next = isArray ? current.filter((o) => o !== value) : [];
    } else {
      next = isArray ? [...current, value] : [...(current ? [current] : []), value];
    }

    setFieldValue(name, next);
  }

  const handleChangeDate = useCallback((date: Date | null) => {
    setFieldValue(name, date);
  }, []);

  const isLicenseQuestion = useMemo(() => (question.questionText || '').toLowerCase().includes('licen'), [question]);

  const isEmailQuestion = useMemo(() => {
    return question?.questionText?.includes('your email address');
  }, [question]);

  const isMaxYearExperienceQuestion = useMemo(() => {
    return question?.questionText?.includes('What areas of care have you worked in, and for how many years?');
  }, [question]);

  const isJoiningDateQuestion = useMemo(
    () => (question.questionText || '').toLowerCase().includes('available to start'),
    [question]
  );

  const isProviderGroupQuestion = useMemo(
    () => (question.questionText || '').toLowerCase().includes('provider group'),
    [question]
  );

  if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
    if (isProviderGroupQuestion) {
      return <ProviderGroupSelector question={question} name={name} />;
    }

    const opts = question.options || [];
    const selected = (value as string[]) || [];

    return (
      <div className='tw-flex tw-flex-col tw-gap-3'>
        {opts.map((opt) => (
          <label
            key={opt}
            className={`tw-flex tw-items-center tw-gap-2 tw-rounded tw-cursor-pointer tw-select-none border tw-w-full tw-px-3 py-3 tw-justify-start tw-gap-x-4 ${
              selected.includes(opt) ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
            }`}
          >
            <input
              type='checkbox'
              name={name}
              hidden
              checked={selected.includes(opt)}
              onChange={handleMultiChange}
              onBlur={handleBlur}
              value={opt}
            />
            {selected.includes(opt) ? (
              <FaRegCheckCircle className='flex-shrink-0' color={selected.includes(opt) ? 'white' : undefined} />
            ) : (
              <FaRegCircle className='flex-shrink-0' />
            )}
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if ([QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question.questionType as QuestionType)) {
    if (isProviderGroupQuestion) {
      return <ProviderGroupSelector question={question} name={name} />;
    }

    const opts = question.options || [];
    const selected = (value as string) || '';
    return (
      <div className='tw-flex tw-flex-col tw-gap-3'>
        {opts.map((opt) => (
          <label
            key={opt}
            className={`tw-rounded border tw-cursor-pointer w-100 tw-px-3 py-3 tw-flex tw-select-none tw-items-center tw-justify-start tw-gap-x-4 ${
              selected === opt ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
            }`}
          >
            <input
              type='radio'
              name={name}
              hidden
              checked={selected === opt}
              onChange={handleChange}
              onBlur={handleBlur}
              value={opt}
            />
            {selected === opt ? (
              <FaRegCheckCircle className='flex-shrink-0' color={selected === opt ? 'white' : undefined} />
            ) : (
              <FaRegCircle className='flex-shrink-0' />
            )}
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.questionType === QuestionType.INPUT_BOX) {
    if (question.validation === 'phone') {
      return (
        <CustomPhoneInput
          value={values[name] as string}
          onChange={({ target: { value } }) => {
            setFieldValue(name, value);
          }}
          onBlur={handleBlur}
          name={name}
          className='form-control dark-input border-black rounded-1'
        />
      );
    }

    if (question.validation === 'date') {
      // Set maxDate to allow future years (e.g., 10 years from now)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 10);

      const dateValue = values[name] instanceof Date ? (values[name] as Date) : null;

      return (
        <SelectDatepicker
          selectedDate={dateValue}
          onDateChange={(date) => handleChangeDate(date)}
          hideLabels
          minDate={isAdminEdit ? undefined : isJoiningDateQuestion ? new Date() : undefined}
          maxDate={maxDate}
          labels={{ yearPlaceholder: 'Year', dayPlaceholder: 'Day', monthPlaceholder: 'Month' }}
        />
      );
    }

    if (isLicenseQuestion) {
      return <LicenseQuestion name={name} question={question} />;
    }

    // For email fields, render as a non-editable display instead of input
    if (isEmailQuestion) {
      return (
        <div className='form-control dark-input border-black rounded-1 disabled'>
          {typeof values[name] === 'string' ? values[name] : 'Email will be verified from your invitation'}
        </div>
      );
    }

    if (isMaxYearExperienceQuestion) {
      const currentLength = (values[name] as string)?.length || 0;
      const maxLength = 500;

      return (
        <div className='position-relative'>
          <Field
            as='textarea'
            className='form-control dark-input border-black rounded-1'
            name={name}
            rows={6}
            maxLength={maxLength}
          />
          <div className='text-end text-muted small mt-1'>
            {currentLength}/{maxLength} characters
          </div>
        </div>
      );
    }

    return <Field className='form-control dark-input border-black rounded-1' name={name} />;
  }
}

// const countries = defaultCountries.filter((country) => {
//   const { iso2 } = parseCountry(country);
//   return ['us'].includes(iso2);
// });
