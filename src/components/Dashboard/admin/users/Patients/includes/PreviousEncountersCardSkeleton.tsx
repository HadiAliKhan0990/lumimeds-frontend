'use client';

import React from 'react';

export const PreviousEncountersCardSkeleton: React.FC = () => {
  return (
    <div className='tw-rounded-lg tw-p-3 tw-border tw-border-gray-200 tw-h-full'>
      {/* Header Skeleton */}
      <div className='tw-flex tw-justify-between tw-items-center tw-mb-4'>
        <div className='tw-h-5 tw-w-48 tw-bg-gray-200 tw-rounded tw-animate-pulse'></div>
      </div>

      {/* Encounters List Skeleton */}
      <div className='tw-max-h-[400px] tw-overflow-y-auto tw-flex tw-flex-col tw-gap-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='tw-border tw-border-gray-200 tw-rounded-md tw-p-2 tw-bg-[#FFFDF6] tw-animate-pulse'
          >
            {/* Medication and Date Row Skeleton */}
            <div className='tw-flex tw-justify-between tw-items-start tw-mb-3'>
              <div className='tw-flex-1'>
                <div className='tw-h-5 tw-w-3/4 tw-bg-gray-300 tw-rounded tw-mb-2'></div>
                <div className='tw-h-4 tw-w-1/2 tw-bg-gray-200 tw-rounded'></div>
              </div>
              <div className='tw-h-5 tw-w-20 tw-bg-gray-300 tw-rounded tw-ml-4'></div>
            </div>

            {/* Directions and Notes Skeleton */}
            <div className='tw-mb-3 tw-space-y-2'>
              <div className='tw-h-4 tw-w-full tw-bg-gray-200 tw-rounded'></div>
              <div className='tw-h-4 tw-w-5/6 tw-bg-gray-200 tw-rounded'></div>
              <div className='tw-h-4 tw-w-4/6 tw-bg-gray-200 tw-rounded'></div>
              <div className='tw-h-4 tw-w-full tw-bg-gray-200 tw-rounded tw-mt-2'></div>
              <div className='tw-h-4 tw-w-3/4 tw-bg-gray-200 tw-rounded'></div>
            </div>

            {/* Order ID Section Skeleton */}
            <div className='tw-flex tw-justify-between tw-items-center tw-mb-2 tw-gap-2'>
              <div className='tw-flex tw-items-center tw-gap-2'>
                <div className='tw-w-4 tw-h-4 tw-bg-gray-300 tw-rounded'></div>
                <div className='tw-h-4 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
              </div>
              <div className='tw-h-4 tw-w-24 tw-bg-gray-300 tw-rounded'></div>
            </div>

            {/* Prescriber and View Action Skeleton */}
            <div className='tw-flex tw-justify-between tw-items-start sm:tw-items-center'>
              <div className='tw-flex tw-items-start sm:tw-items-center tw-gap-2'>
                <div className='tw-w-4 tw-h-4 tw-bg-gray-300 tw-rounded tw-flex-shrink-0'></div>
                <div className='tw-h-4 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
              </div>
              <div className='tw-h-4 tw-w-10 tw-bg-gray-300 tw-rounded tw-flex-shrink-0'></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousEncountersCardSkeleton;
