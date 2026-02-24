import { PROGRAM_SUMMARY_ITEMS } from '@/constants/checkoutTryProgramSummary';

export const ProductSummaryItems = () => {
  return (
    <div className='tw-grid tw-grid-cols-2 tw-gap-y-0 sm:tw-gap-y-6 tw-gap-x-2 sm:tw-gap-x-4 tw-mt-8 tw-px-4 sm:tw-px-0'>

      {PROGRAM_SUMMARY_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const [text, price] = item.label.split(' - ');
        return (
          <div key={item.id} className='tw-flex tw-items-center tw-gap-2 md:tw-gap-4'>


            <div className='tw-flex-shrink-0'>
              <IconComponent className='tw-text-gray-700 tw-w-4 tw-h-4 md:tw-w-6 md:tw-h-6' />
            </div>

            <span className='tw-text-[0.74rem] sm:tw-text-sm tw-font-medium tw-text-gray-900 tw-flex-1'>
              {text} - <strong>{price}</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
};
