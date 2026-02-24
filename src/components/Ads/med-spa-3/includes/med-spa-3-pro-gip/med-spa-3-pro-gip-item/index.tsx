'use client';

import { useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';
import styles from '../../../styles.module.scss';
import { ProductType } from '@/store/slices/productTypeSlice';
import { RootState, AppDispatch } from '@/store';

interface MedSpa3ProductsItemProps {
  readonly product: ProductType;
  readonly t: (key: string) => string;
}

export default function MedSpa3ProductsItem({ product, t }: Readonly<MedSpa3ProductsItemProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async (product: ProductType) => {
    await handleVerifyRedirectToCheckout({
      selectedProduct: product,
      product: product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };

  const renderProductImage = () => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return (
        <div className={styles.multipleVialsContainer}>
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 1`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial1}`}
          />
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 2`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial2}`}
          />
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 3`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial3}`}
          />
        </div>
      );
    } else if (product.image) {
      return (
        <div className={styles.singleVialContainer}>
          <Image
            src={product.image}
            alt={`${product.name} Vial`}
            width={100}
            height={250}
            className={styles.vialImage}
          />
        </div>
      );
    }
  };

  const getPriceDisplay = (): number => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return getRoundedPrice(product.dividedAmount) || 0;
    }
    return getRoundedPrice(product.prices?.[0]?.amount) || 0;
  };

  const shouldShowMonthlySuffix = (): boolean => {
    return true;
  };

  return (
    <div className='tw-bg-[#C4D2FF] tw-p-4 md:tw-p-6 lg:tw-p-8 tw-py-8 md:tw-py-12 lg:tw-py-16 tw-rounded-2xl tw-w-full md:tw-w-auto'>
      <div>
        <div className='tw-flex sm:tw-flex-row tw-justify-between tw-gap-2 sm:tw-gap-4'>
          <h2 className='tw-text-[#3060FE] tw-text-xl sm:tw-text-2xl md:tw-text-3xl tw-w-full sm:tw-w-[80%]'>
            {t('products.glp1.title')}
          </h2>
          <h4 className='tw-font-bold tw-p-2 tw-text-sm sm:tw-text-2xl tw-whitespace-nowrap'>
            {t('products.glp1.valueBadge')}
          </h4>
        </div>
        <p className='tw-text-[#3060FE] tw-text-sm sm:tw-text-base'>{t('products.glp1.subtitle')}</p>
      </div>

      <div className={styles.productImageSection}>{renderProductImage()}</div>
      <div className={styles.pricingSection}>
        <div className={styles.priceDisplay}>
          <span className={styles.priceAmount} style={{ color: '#3060FE' }}>
            ${getPriceDisplay()}
          </span>
          {shouldShowMonthlySuffix() && (
            <span className={styles.pricePeriod} style={{ color: '#3060FE' }}>
              {t('priceMonthSuffix')}
            </span>
          )}
        </div>
      </div>

      <div className={styles.ctaSection}>
        <button
          className={`btn ${styles.ctaButton}`}
          style={{ width: '60%', borderRadius: '100px', color: 'white', backgroundColor: '#3060FE' }}
          onClick={() => handleGetStarted(product)}
          disabled={isPending}
        >
          {isPending && <Spinner className='-2 me-2' size='sm' />}
          {t('buttonText')}
        </button>
      </div>
    </div>
  );
}
