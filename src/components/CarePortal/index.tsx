'use client';

import { signUpSteps } from '@/components/CarePortal/constants';
import StepComponent from '@/components/CarePortal/StepComponent';

export const CarePortal = () => {
  return (
    <div className='container mb-5 pb-5'>
      <div className='row justify-content-center'>
        <div className='col-lg-10 col-xl-9'>
          <h1 className='text-4xl fw-medium mb-4'>Customer Sign-Up Process - Telepath</h1>

          <div className='d-flex flex-column gap-5'>
            {signUpSteps.map((step, index) => (
              <StepComponent key={index} step={step} stepNo={`Step ${index + 1}`} />
            ))}
          </div>

          {/* <h1 className='text-4xl fw-medium mt-5 mb-4'>Assigning Orders to Doctors - Telepath</h1>

          <div className='d-flex flex-column gap-5'>
            {doctorAssignmentSteps.map((step, index) => (
              <StepComponent key={index} step={step} stepNo={`Step ${index + 1}`} />
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};
