import { RootState } from '@/store';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { Field, useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { HeightQuestion } from '@/modules/landing/survey/PatientIntakeSurvey/includes/HeightQuestion';
import { useCallback, useMemo } from 'react';
import { TagsInput } from '@/components/PatientSurvey/SurveyInputBox/includes/TagsInput';
import { PatientIntakeFormValues } from '@/types/survey';
import { EmailQuestion } from '@/modules/landing/survey/PatientIntakeSurvey/includes/EmailQuestion';
import { PhoneQuestion } from '@/modules/landing/survey/PatientIntakeSurvey/includes/PhoneQuestion';
import { SelectDatepicker } from 'react-select-datepicker';

interface Props {
  question?: SurveyQuestion;
  position: number;
  showCalendlyStep: boolean;
  emailAgreement: boolean;
  setEmailAgreement: (emailAgreement: boolean) => void;
  phoneAgreement: boolean;
  setPhoneAgreement: (phoneAgreement: boolean) => void;
  disableEmail?: boolean;
}

export const InputQuestionBox = ({
  question,
  showCalendlyStep,
  position,
  emailAgreement,
  setEmailAgreement,
  phoneAgreement,
  setPhoneAgreement,
  disableEmail = false,
}: Props) => {
  const { values, setFieldValue, handleBlur, errors } = useFormikContext<PatientIntakeFormValues>();

  const answers = useSelector((state: RootState) => state.answers);

  const textKey = question?.questionText?.toLowerCase() ?? '';
  const isHeight = textKey.includes('height');
  const isDateOfBirth = textKey.toLowerCase().includes('birth') || textKey.toLowerCase().includes('dob');

  const handleChangeDate = useCallback(
    async (date: Date | null) => {
      setFieldValue('answer', date);
    },
    [setFieldValue]
  );

  const current = useMemo(() => answers.find((a) => a?.questionId === question?.id), [question, answers, position]);

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

  if (isHeight) {
    return showCalendlyStep ? (
      <p className='text-center text-primary fw-semibold tw-text-sm md:tw-text-base'>
        Schedule an optional 15-minute overview to assess your goals and create a plan tailored for you-or head straight
        to checkout to kickstart your journey today.
      </p>
    ) : (
      <HeightQuestion currentAnswer={current} />
    );
  }

  if (question?.validation === 'tags') {
    return (
      <TagsInput
        question={question}
        value={(values.answer as string) || ''}
        handleChange={(v) => setFieldValue('answer', v)}
        onBlur={handleBlur}
      />
    );
  }

  if (question?.validation === 'email') {
    return <EmailQuestion disabled={disableEmail} question={question} emailAgreement={emailAgreement} setEmailAgreement={setEmailAgreement} />;
  }

  if (question?.validation === 'phone') {
    return <PhoneQuestion question={question} phoneAgreement={phoneAgreement} setPhoneAgreement={setPhoneAgreement} />;
  }

  if (question?.validation === 'date') {
    return (
      <SelectDatepicker
        selectedDate={values.answer ? (values.answer as Date) : null}
        onDateChange={(date) => handleChangeDate(date)}
        hideLabels
        hasError={!!errors.answer}
        minDate={isDateOfBirth ? minDob : undefined}
        maxDate={isDateOfBirth ? eighteenYearsAgo : undefined}
        labels={{ yearPlaceholder: 'Year', dayPlaceholder: 'Day', monthPlaceholder: 'Month' }}
      />
    );
  }

  return (
    <Field
      autoFocus
      type={question?.validation}
      name='answer'
      className='form-control dark-input border-black rounded-1'
    />
  );
};
