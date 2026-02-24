'use client';

import Link from 'next/link';
import { FiHome } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className='tw-min-h-screen tw-bg-gradient-to-br tw-from-blue-50 tw-to-indigo-100 tw-flex tw-items-center tw-justify-center tw-px-4 tw-mt-[72px]'>
      <div className='tw-max-w-2xl tw-mx-auto tw-text-center'>
        {/* 404 Illustration */}
        <div className='tw-mb-12'>
          <div className='tw-relative tw-inline-block'>
            <div className='tw-text-9xl tw-font-bold tw-text-primary tw-opacity-20 tw-leading-none'>404</div>
          </div>
        </div>

        {/* Error Message */}
        <div className='tw-mb-8'>
          <h1 className='tw-text-4xl tw-font-bold tw-text-gray-900 tw-mb-4'>Page Not Found</h1>
          <p className='tw-text-xl tw-text-gray-600 tw-mb-2'>
            Oops! The page you&apos;re looking for seems to have wandered off.
          </p>
          <p className='tw-text-gray-500'>
            Don&apos;t worry, even the best healthcare journeys sometimes take unexpected turns.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center tw-items-center'>
          <Link
            href='/'
            className='tw-bg-primary hover:tw-bg-blue-700 !tw-text-white tw-px-8 tw-py-3 tw-rounded-full tw-font-semibold tw-transition-colors tw-duration-200 tw-flex tw-no-underline tw-items-center tw-gap-2 tw-shadow-lg hover:tw-shadow-xl tw-transform hover:tw-scale-105'
          >
            <FiHome className='tw-w-5 tw-h-5' />
            Back to Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className='tw-mt-12 tw-pt-8 tw-border-t tw-border-gray-200'>
          <p className='tw-text-gray-500 tw-mb-4'>Need help? Try these popular pages:</p>
          <div className='tw-flex tw-flex-wrap tw-gap-4 tw-justify-center'>
            <Link
              href='/products'
              className='tw-text-primary hover:tw-text-blue-700 tw-font-medium tw-transition-colors'
            >
              Our Products
            </Link>
            <Link href='/faqs' className='tw-text-primary hover:tw-text-blue-700 tw-font-medium tw-transition-colors'>
              FAQs
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='tw-absolute tw-top-10 tw-left-10 tw-w-20 tw-h-20 tw-bg-primary tw-opacity-10 tw-rounded-full tw-animate-pulse'></div>
        <div className='tw-absolute tw-bottom-10 tw-right-10 tw-w-16 tw-h-16 tw-bg-blue-400 tw-opacity-10 tw-rounded-full tw-animate-pulse tw-delay-1000'></div>
        <div className='tw-absolute tw-top-1/3 tw-right-20 tw-w-12 tw-h-12 tw-bg-indigo-300 tw-opacity-10 tw-rounded-full tw-animate-pulse tw-delay-500'></div>
      </div>
    </div>
  );
}
