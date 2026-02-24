'use client';

import { IntakeInitialStep } from '@/lib/types';
import { FaArrowRight } from 'react-icons/fa';
import { FORM_STEP } from '@/constants/intakeSurvey';

interface Props {
  setFormStep: (arg: IntakeInitialStep) => void;
  preventPersistance?: boolean;
}

export const IntakeFormInitialStep = ({ setFormStep, preventPersistance }: Readonly<Props>) => {
  return (
    <>
      <p className='display-3 mb-4 font-instrument-serif'>{`Let's get started with your care.`}</p>
      <p className='text-primary fw-semibold mb-5'>
        This brief form helps us understand your needs and health history before connecting you with a provider.
        <br />
        <br />
        All information is confidential and secure under HIPAA
      </p>
      <button
        onClick={() => {
          if (!preventPersistance) {
            localStorage.setItem(FORM_STEP, 'intake');
          }

          setFormStep('intake');
        }}
        type='button'
        className='btn btn-primary rounded-pill text-lg py-12 d-flex align-items-center gap-3 justify-content-center fw-semibold w-100'
      >
        Continue
        <FaArrowRight />
      </button>
    </>
  );
};
