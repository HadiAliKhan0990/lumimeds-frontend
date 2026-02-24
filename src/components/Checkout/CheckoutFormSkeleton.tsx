export const CheckoutFormSkeleton = () => (
  <div className='tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4 sm:tw-gap-8 lg:tw-gap-36 tw-pb-16 tw-mt-10 tw-animate-pulse'>
    <div className='tw-flex-grow tw-flex tw-flex-col tw-gap-y-6'>
      <div className='tw-flex tw-flex-col tw-gap-y-6'>
        {/* Contact Information Skeleton */}
        <div className='tw-flex tw-flex-col tw-gap-y-3'>
          <div className='tw-flex tw-justify-between tw-items-end'>
            <div className='tw-h-9 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-64'></div>
            <div className='tw-h-5 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-40'></div>
          </div>
          <div className='tw-space-y-2'>
            <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-16'></div>
            <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
          </div>
          <div className='tw-space-y-2'>
            <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-24'></div>
            <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
          </div>
        </div>

        {/* Shipping Address Skeleton */}
        <div className='tw-flex tw-flex-col tw-gap-y-3'>
          <div className='tw-h-9 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-48'></div>
          <div className='row g-3'>
            <div className='col-md-6'>
              <div className='tw-space-y-2'>
                <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-20'></div>
                <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
              </div>
            </div>
            <div className='col-md-6'>
              <div className='tw-space-y-2'>
                <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-20'></div>
                <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
              </div>
            </div>
            <div className='col-12'>
              <div className='tw-space-y-2'>
                <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-16'></div>
                <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
              </div>
            </div>
            <div className='col-12'>
              <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
            </div>
            <div className='col-md-4'>
              <div className='tw-space-y-2'>
                <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-12'></div>
                <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='tw-space-y-2'>
                <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-12'></div>
                <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='tw-space-y-2'>
                <div className='tw-h-4 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-16'></div>
                <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section Skeleton */}
        <div className='tw-flex tw-flex-col tw-gap-4'>
          <div className='tw-h-9 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-32'></div>
          <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
          <div className='tw-grid tw-grid-cols-2 tw-gap-3'>
            <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
            <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
          </div>
        </div>

        {/* Billing Address Skeleton */}
        <div className='tw-flex tw-flex-col tw-gap-3'>
          <div className='tw-flex tw-justify-between tw-items-center'>
            <div className='tw-h-6 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-32'></div>
            <div className='tw-h-5 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-48'></div>
          </div>
        </div>
      </div>
    </div>

    {/* Product Summary Skeleton */}
    <div className='tw-flex tw-flex-col tw-gap-y-4'>
      <div className='tw-h-10 tw-bg-gray-200 tw-cursor-wait tw-rounded tw-w-48'></div>
      <div className='tw-h-64 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
      <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
      <div className='tw-h-12 tw-bg-gray-200 tw-cursor-wait tw-rounded'></div>
    </div>
  </div>
);
