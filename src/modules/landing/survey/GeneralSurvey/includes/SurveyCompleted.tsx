'use client';

import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/assets/logo.svg';
import { ROUTES } from '@/constants';

interface Props {
  title?: string;
  message?: string;
  homeUrl?: string;
}

export function SurveyCompleted({
  title = 'Intake Form Already Submitted!',
  message = 'You have already submitted your intake form.',
  homeUrl = ROUTES.HOME,
}: Readonly<Props>) {
  return (
    <div className='tw-px-4 tw-mb-10 lg:tw-mb-20'>
      <Image src={Logo} className='tw-mb-6 lg:tw-mb-10 tw-mx-auto' quality={100} alt='LumiMeds' />
      <div className='tw-max-w-[700px] tw-mx-auto tw-text-center'>
        <div className='tw-mb-6'>
          <div className='tw-w-20 tw-h-20 tw-mx-auto tw-mb-4 tw-rounded-full tw-bg-green-100 tw-flex tw-items-center tw-justify-center'>
            <svg
              className='tw-w-10 tw-h-10 tw-text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <h2 className='tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-4'>{title}</h2>
          <p className='tw-text-lg tw-text-gray-600 tw-mb-6'>{message}</p>
          <Link href={homeUrl} className='btn btn-primary rounded-pill px-4 py-2'>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
