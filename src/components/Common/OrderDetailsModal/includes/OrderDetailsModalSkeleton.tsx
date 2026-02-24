export function OrderDetailsModalSkeleton() {
  return (
    <div className='tw-text-sm tw-px-2 tw-animate-pulse'>
      {/* Heading */}
      <div className='tw-flex tw-justify-between tw-items-start tw-mb-4'>
        <div className='tw-h-7 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
        <div className='tw-h-6 tw-w-6 tw-bg-gray-200 tw-rounded'></div>
      </div>

      {/* Medication Section */}
      <div className='tw-mb-3 tw-py-1 tw-flex tw-items-center tw-gap-3'>
        <div className='tw-w-1/4 sm:tw-w-1/6 md:tw-w-1/6'>
          <div className='tw-h-[50px] tw-bg-gray-200 tw-rounded-lg'></div>
        </div>
        <div className='tw-w-3/4 sm:tw-w-5/6 md:tw-w-5/6 tw-flex tw-flex-col tw-gap-2'>
          <div className='tw-h-4 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
          <div className='tw-h-5 tw-w-40 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>

      {/* Order Details Table */}
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-28 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-36 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5 tw-flex tw-items-center'>
          <div className='tw-h-4 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-9 tw-w-full tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5 tw-flex tw-items-center'>
          <div className='tw-h-4 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-9 tw-w-full tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-28 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-28 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-28 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-40 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>

      {/* Prescription Approval Details Section */}
      <div className='tw-my-4 tw-py-4 tw-border-y'>
        <div className='tw-h-6 tw-w-64 tw-bg-gray-200 tw-rounded tw-mb-4'></div>
        <div className='tw-space-y-4'>
          <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
            <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
              <div className='tw-h-4 tw-w-36 tw-bg-gray-200 tw-rounded'></div>
            </div>
            <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
              <div className='tw-h-5 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
            </div>
          </div>
          <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
            <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
              <div className='tw-h-4 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
            </div>
            <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
              <div className='tw-h-5 tw-w-40 tw-bg-gray-200 tw-rounded'></div>
            </div>
          </div>
          <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
            <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
              <div className='tw-h-4 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
            </div>
            <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
              <div className='tw-h-5 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
            </div>
          </div>
          <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
            <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
              <div className='tw-h-4 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
            </div>
            <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
              <div className='tw-h-5 tw-w-48 tw-bg-gray-200 tw-rounded'></div>
            </div>
          </div>
          <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
            <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
              <div className='tw-h-4 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
            </div>
            <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
              <div className='tw-h-5 tw-w-28 tw-bg-gray-200 tw-rounded'></div>
            </div>
          </div>
          <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
            <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
              <div className='tw-h-4 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
            </div>
            <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
              <div className='tw-h-5 tw-w-32 tw-bg-gray-200 tw-rounded'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Section */}
      <div className='tw-mb-3 tw-py-1'>
        <div className='tw-flex tw-justify-between tw-items-center'>
          <div className='tw-h-5 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
          <div className='tw-h-5 tw-w-12 tw-bg-gray-200 tw-rounded'></div>
          <div className='tw-h-5 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-3 tw-border-b tw-pb-3'>
        <div className='tw-flex tw-justify-between tw-items-center'>
          <div className='tw-h-5 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
          <div className='tw-h-5 tw-w-8 tw-bg-gray-200 tw-rounded'></div>
          <div className='tw-h-5 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>

      {/* Order Summary */}
      <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-28 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-16 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-3 tw-border-b tw-pb-3 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-12 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-20 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-28 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
      <div className='tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
        <div className='md:tw-col-span-5'>
          <div className='tw-h-4 tw-w-12 tw-bg-gray-200 tw-rounded'></div>
        </div>
        <div className='md:tw-col-span-7'>
          <div className='tw-h-5 tw-w-24 tw-bg-gray-200 tw-rounded'></div>
        </div>
      </div>
    </div>
  );
}
