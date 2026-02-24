'use client';

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import Link from 'next/link';
import { useGetRefillSurveyQuery } from '@/store/slices/surveysApiSlice';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefillForm } from '@/components/Survey/Refill';
import { RefillType } from '@/lib/types';

function RefillSurveyForm() {
  const params = useSearchParams();
  const token = params.get('token');
  const surveyId = params.get('surveyId');
  const orderId = params.get('orderId');
  const email = params.get('email');
  const refillType = params.get('refillType');

  const { data, isError, isFetching } = useGetRefillSurveyQuery({ surveyId, token }, { skip: !surveyId || !token });

  if (isError || (!isFetching && !data)) {
    return (
      <div className='container d-flex align-items-center justify-content-center py-5 mt-5'>
        <div className='text-center mt-5'>
          <Image src={Logo} className='tw-mx-auto mb-4' quality={100} alt='LumiMeds' />
          <h3 className='mb-3 text-danger'>🚫 Unable to load the survey</h3>
          <p className='text-muted'>
            {"We're sorry, but we couldn't load the survey at this time. This could be due to:"}
          </p>
          <ul className='text-muted text-start mx-auto max-w-400'>
            <li>The survey link is invalid or expired.</li>
            <li>Your email or token might be missing or incorrect.</li>
            <li>There was a problem connecting to the server.</li>
          </ul>
          <p className='my-4'>Please contact support or try again later.</p>
          <Link href='/' className='btn btn-primary rounded-pill px-4 py-2'>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='container mb-5 pb-5'>
      <div className='text-center mb-5'>
        <Image src={Logo} alt='LumiMeds Logo' className='tw-mx-auto' />
      </div>
      <RefillForm
        refillType={refillType as RefillType | null}
        questions={data?.questions || []}
        initialEmail={email ?? ''}
        orderId={orderId ?? ''}
        surveyId={surveyId ?? ''}
      />
    </div>
  );
}

export default function RefillSurvey() {
  return (
    <Suspense
      fallback={
        <div className='container d-flex align-items-center justify-content-center py-5 mt-5'>
          <div className='text-center'>
            <Image src={Logo} className='tw-mx-auto mb-4' quality={100} alt='LumiMeds' />
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <RefillSurveyForm />
    </Suspense>
  );
}
