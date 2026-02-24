'use client';

import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { PatientIntakeFormValues } from '@/types/survey';
import { InputHTMLAttributes } from 'react';
import { ErrorMessage, useFormikContext } from 'formik';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  question: SurveyQuestion;
  emailAgreement: boolean;
  setEmailAgreement: (emailAgreement: boolean) => void;
}

export const EmailQuestion = ({ question, emailAgreement, setEmailAgreement, ...props }: Readonly<Props>) => {
  const { values, setFieldValue, handleBlur } = useFormikContext<PatientIntakeFormValues>();
  return (
    <>
      <input
        {...props}
        value={values.answer as string}
        onBlur={handleBlur}
        onChange={(e) => {
          const { value } = e.target;
          setFieldValue('answer', value);
        }}
        type={question?.validation || 'text'}
        name='answer'
        className='form-control dark-input border-black rounded-1'
      />
      <ErrorMessage name='answer' component='div' className='text-danger text-sm mt-2' />
      {question.description? <div className='text-primary user-select-none mt-4 text-lg text-center d-flex align-items-start gap-3'>
        <input
          type='checkbox'
          id='emailAgreement'
          checked={emailAgreement}
          onChange={(e) => setEmailAgreement(e.target.checked)}
          className='tw-w-4 tw-h-4 flex-shrink-0 tw-mt-1 tw-accent-primary'
        />
        <label htmlFor='emailAgreement' className='flex-grow-1 text-start tw-text-sm md:tw-text-lg'>
          By checking this box, I agree to receive newsletters, special offers, and other marketing communications from
          LumiMeds. I understand I can unsubscribe at any time using the link in any marketing email or by contacting
          Lumimeds directly.
        </label>
        </div>:null}
    </>
  );
};
