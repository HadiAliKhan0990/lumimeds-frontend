'use client';

export const AdminOrdersPanelSkeleton = () => {
  return (
    <div className='tw-animate-pulse'>
      {/* Mobile Header Skeleton */}
      <div className='tw-flex tw-items-center tw-justify-between tw-gap-2 sm:tw-gap-4'>
        <div className='tw-flex-grow tw-min-w-0'>
          <div className='tw-h-6 sm:tw-h-8 tw-bg-gray-50 tw-cursor-wait tw-rounded tw-w-32 sm:tw-w-48 lg:tw-w-64' />
        </div>
        <div className='tw-h-8 sm:tw-h-10 tw-bg-gray-50 tw-cursor-wait tw-rounded tw-w-24 sm:tw-w-32 lg:tw-w-40 tw-hidden lg:tw-block' />
      </div>

      {/* Main Card Skeleton */}
      <div className='tw-relative tw-rounded-[12px] tw-mt-4 sm:tw-mt-5 tw-p-0 tw-bg-transparent tw-border-0 md:tw-p-4 md:tw-bg-white md:tw-border md:tw-border-gray-200'>
        {/* Tabs and Filters Section */}
        <div className='tw-grid tw-grid-cols-12 tw-gap-2 sm:tw-gap-3 tw-items-start'>
          {/* Tabs Skeleton */}
          <div className='tw-col-span-12 xl:tw-col-span-5 tw-overflow-x-auto'>
            <div className='tw-flex tw-items-center tw-gap-1.5 sm:tw-gap-2 tw-pb-1 tw-min-w-max'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`tab-skeleton-${idx}`}
                  className='tw-h-8 sm:tw-h-10 tw-w-20 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-flex-shrink-0'
                />
              ))}
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className='tw-col-span-12 xl:tw-col-span-7 tw-mt-2 xl:tw-mt-0'>
            <div className='tw-flex tw-flex-wrap tw-gap-2 tw-justify-start sm:tw-justify-end tw-items-center'>
              <div className='tw-h-8 sm:tw-h-10 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-full sm:tw-w-28 lg:tw-w-32' />
              <div className='tw-h-8 sm:tw-h-10 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-full sm:tw-w-28 lg:tw-w-32' />
              <div className='tw-h-8 sm:tw-h-10 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-full sm:tw-w-20 lg:tw-w-24' />
            </div>
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className='tw-mt-3 sm:tw-mt-4 tw-space-y-2 sm:tw-space-y-3'>
          {/* Table Header Skeleton - Hidden on mobile, shown on desktop */}
          <div className='tw-hidden sm:tw-flex tw-items-center tw-gap-2 sm:tw-gap-4 tw-py-2 sm:tw-py-3 tw-border-b tw-border-gray-200'>
            <div className='tw-h-3 sm:tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-16 sm:tw-w-20 lg:tw-w-24' />
            <div className='tw-h-3 sm:tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-20 sm:tw-w-24 lg:tw-w-32' />
            <div className='tw-h-3 sm:tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-[4.5rem] sm:tw-w-20 lg:tw-w-28' />
            <div className='tw-h-3 sm:tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-12 sm:tw-w-16 lg:tw-w-20' />
            <div className='tw-h-3 sm:tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-16 sm:tw-w-20 lg:tw-w-24 tw-ml-auto' />
          </div>

          {/* Table Rows Skeleton */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`row-skeleton-${idx}`}
              className='tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-2 sm:tw-gap-4 tw-py-3 sm:tw-py-4 tw-border-b tw-border-gray-100'
            >
              {/* Mobile: Stacked layout */}
              <div className='tw-flex tw-items-center tw-justify-between sm:tw-justify-start tw-gap-2 sm:tw-gap-4 sm:tw-w-auto'>
                <div className='tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-16 sm:tw-w-20' />
                <div className='tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-20 sm:tw-w-24 lg:tw-w-32' />
              </div>
              <div className='tw-flex tw-items-center tw-justify-between sm:tw-justify-start tw-gap-2 sm:tw-gap-4 sm:tw-w-auto'>
                <div className='tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-[4.5rem] sm:tw-w-20 lg:tw-w-28' />
                <div className='tw-h-5 sm:tw-h-6 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-12 sm:tw-w-16' />
              </div>
              <div className='tw-flex tw-items-center tw-justify-end sm:tw-justify-start tw-gap-2 sm:tw-gap-4 sm:tw-w-auto sm:tw-ml-auto'>
                <div className='tw-h-4 tw-bg-gray-50 md:tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-16 sm:tw-w-20 lg:tw-w-24' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
