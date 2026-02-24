'use client';

import styles from '../styles.module.scss';
import Image from 'next/image';
import { ProductType } from '@/store/slices/productTypeSlice';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  product: ProductType;
}

export const ForWomenProductCard = ({ product }: Readonly<Props>) => {
  return (
    <article className={`tw-h-full tw-flex tw-flex-col ${styles.card}`}>
      <div className={`tw-w-full tw-flex tw-justify-left ${styles.cardHeader}`}>
        <span className={`tw-capitalize ${styles.badge}`}>
          {product.metadata.planTier == 'starter'
            ? 'Starter 3-Month Supply'
            : product.metadata.planTier == 'value'
            ? '3-Month Subscription'
            : product.metadata.planTier == null
            ? 'Monthly'
            : product.metadata.planTier}
        </span>
      </div>
      <div className='tw-flex tw-flex-col tw-justify-start tw-items-start tw-gap-2 tw-mt-5 tw-mb-6'>
        <h3 className='tw-mb-0 tw-flex tw-flex-col tw-justify-start tw-items-start lg:tw-text-[23px] xl:tw-text-[26px]'>
          {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} Injections
        </h3>
        <h4 className='tw-mb-0 tw-text-sm tw-flex tw-flex-col tw-justify-start tw-items-start'>
          Weight Loss Injection
        </h4>
      </div>
      <div className={`${styles.cardImageContainer}`}>
        <div className={`tw-flex-grow tw-mb-10 ${styles.cardImageHolder}`}>
          {product?.image && (
            <Image
              src={product.image}
              alt={product.name || 'Product'}
              fill
              className='tw-object-contain !tw-static tw-h-full tw-w-full'
            />
          )}
        </div>
      </div>
      <SurveyGetStartedButton className='btn-light rounded-pill tw-w-full !tw-font-semibold lg:!tw-text-lg !tw-text-primary' />
    </article>
  );
};
