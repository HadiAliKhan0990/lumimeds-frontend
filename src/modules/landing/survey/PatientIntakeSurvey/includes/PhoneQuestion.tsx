'use client';

import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { PatientIntakeFormValues } from '@/types/survey';
import { ErrorMessage, useFormikContext } from 'formik';

interface Props {
  question: SurveyQuestion;
  phoneAgreement: boolean;
  setPhoneAgreement: (phoneAgreement: boolean) => void;
}

export const PhoneQuestion = ({ question, phoneAgreement, setPhoneAgreement }: Readonly<Props>) => {
  const { values, setFieldValue, handleBlur } = useFormikContext<PatientIntakeFormValues>();
  return (
    <>
      <CustomPhoneInput
        value={values.answer as string}
        onChange={(e) => {
          const phone = e.target.value;
          setFieldValue('answer', phone);
        }}
        onBlur={handleBlur}
        name='answer'
        className='form-control dark-input border-black rounded-1'
      />

      <ErrorMessage name='answer' component='div' className='text-danger text-sm mt-2' />

     {question.description? <div className='text-primary mt-4 text-lg text-center d-flex align-items-start gap-3' role='alert'>
        <input
          type='checkbox'
          id='phoneAgreement'
          checked={phoneAgreement}
          onChange={(e) => setPhoneAgreement(e.target.checked)}
          className='form-check-input p-2 mt-1 flex-shrink-0 shadow-none'
        />
        <label htmlFor='phoneAgreement' className='flex-grow-1 text-start tw-text-sm md:tw-text-lg'>
          {question.description}
        </label>
      </div>:null}
    </>
  );
};
