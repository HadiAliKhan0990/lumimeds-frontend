import Image from 'next/image';
import { PlanType } from '@/types/medications';
import { ProductType } from '@/store/slices/productTypeSlice';
import { formatToUSD } from '@/lib/helper';
import {
  GLP1_PRODUCT_NAME,
  GLP1_GIP_PRODUCT_NAME,
  GLP1_LABEL,
  GLP1_GIP_LABEL,
  WEIGHT_LOSS_LABEL,
  NAD_PRODUCT_NAME,
  NAD_LABEL,
  WELLNESS_LABEL,
} from '@/constants/factory';

interface CheckoutProductProps {
  product: ProductType;
  checked?: boolean;
  source?: string;
}

export const CheckoutProduct = ({ product, checked = true, source }: Readonly<CheckoutProductProps>) => {
  const getProductName = () => {
    if (product.name?.toLowerCase().includes('nad')) {
      return NAD_PRODUCT_NAME;
    }
    if (product.name?.toLowerCase().includes('glp-1/gip')) {
      return GLP1_GIP_PRODUCT_NAME;
    }
    return GLP1_PRODUCT_NAME;
  };

  const getProductLabel = () => {
    if (product.name?.toLowerCase().includes('nad')) {
      return NAD_LABEL;
    }
    if (product.name?.toLowerCase().includes('glp-1/gip')) {
      return GLP1_GIP_LABEL;
    }
    return GLP1_LABEL;
  };

  return (
    <div
      className={`px-4 py-3 w-100 tw-flex tw-flex-row-reverse sm:tw-flex-row tw-items-center tw-gap-x-6 justify-content-between border border-2 ${
        checked ? 'border-primary' : 'border-secondary'
      } rounded-2 bg-white`}
    >
      <div className='flex-grow-1 tw-flex tw-flex-col tw-gap-1'>
        <div className='text-capitalize tw-flex tw-flex-col 2xl:tw-flex-row 2xl:tw-gap-1'>
          <span className='tw-text-sm tw-leading-4 tw-font-semibold'>{getProductName()}</span>
          <span className='tw-text-sm tw-leading-4 tw-font-semibold'>
            {(() => {
              const dosageType = product?.dosageType || '';
              const cleanedDosageType = source === 'google-merchant' 
                ? dosageType.replace(/\s*Injections?/gi, '')
                : dosageType;
              const suffix = source === 'google-merchant' || !dosageType ? '' : 's';
              return `${getProductLabel()} ${product.name?.toLowerCase().includes('nad') ? WELLNESS_LABEL : WEIGHT_LOSS_LABEL} ${cleanedDosageType}${suffix}`;
            })()}
          </span>
        </div>

        {product?.durationText && (
          <span className='tw-text-xs text-capitalize text-primary'>
            {`${product?.metadata?.planTier || ''} ${product?.durationText} `}{' '}
            {product?.planType === PlanType.RECURRING ? '' : '- One-Time Purchase'}
          </span>
        )}

        {product?.prices?.[0] && product?.metadata?.billingInterval && (
          <div className='tw-w-fit text-lg sm:text-sm tw-text-black custom-badge custom-badge-sm badge-warning-light badge-oulined tw-font-normal'>
            {formatToUSD((product?.prices?.[0]?.amount || 0) * 100)}
          </div>
        )}
      </div>

      <Image
        src={product?.image || ''}
        alt={product?.name || ''}
        fill
        className='!tw-w-[70px] tw-py-1 !tw-static tw-flex-shrink-0 tw-border tw-bg-[#EAEAEA] tw-border-solid tw-border-[#EAEAEA] !tw-h-[70px] rounded-2 tw-object-contain'
      />
    </div>
  );
};
