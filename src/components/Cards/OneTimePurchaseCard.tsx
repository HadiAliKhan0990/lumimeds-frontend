'use client';

import AsyncImgLoader from '@/components/AsyncImgLoader';
import { ProductType } from '@/store/slices/productTypeSlice';
import { formatMonthDuration, handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useMemo, useTransition } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { Spinner } from 'react-bootstrap';

interface Props {
  product: ProductType;
}

export function OneTimePurchaseCard({ product }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  async function handleGetStarted() {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.name ?? '',
      value: product.prices?.[0].amount ?? 0,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      product.id ?? '',
      product.name ?? '',
      product.prices?.[0].amount ?? 0,
      'USD'
    );

    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  }

  const priceDetails = useMemo(() => {
    return product.prices?.find((item) => item.isActive);
  }, [product]);

  const monthDuration = useMemo(() => {
    return Number(formatMonthDuration(product.description || product.name)) || 1;
  }, [product]);

  return (
    <div className='bg-pale-rose p-3 rounded-12 h-100 d-flex flex-column'>
      <div className='d-flex align-items-center gap-2 flex-wrap justify-content-between mb-3 user-select-none'>
        <span className='text-xs bg-rose-brown text-white py-2 px-3 rounded-pill'>{product.durationText}</span>
        <span className='text-xs border border-rose-brown text-rose-brown py-2 px-3 rounded-pill'>
          One-Time Purchase
        </span>
      </div>

      <div className='text-center mb-3'>
        <h5 className='fw-normal text-4xl mb-1'>GLP-1 (503B)</h5>
        <p className='text-rose-brown mb-0'>Weight Loss Injections</p>
      </div>

      <div className='mb-4'>
        <AsyncImage
          className='w-100 h-280 async-image-contain'
          Transition={Blur}
          loader={<AsyncImgLoader />}
          src={product.image || ''}
          alt={product.name || 'Weight loss injection product'}
        />
        {/* <div className='p-3 bg-glass-gradient text-center'>
          <p className='text-dark mb-0 fw-medium'>{MONTH_TEXTS[monthDuration]}</p>
        </div> */}
      </div>

      <div className='text-center mb-4'>
        <p className='text-rose-brown mb-1'>
          <span className='text-lg'>
            Full {monthDuration}-month supply at <LuArrowRight className='align-middle' />
          </span>
          &nbsp;
          <span className='text-4xl fw-bold text-rose-brown align-middle'>${priceDetails?.amount}</span>
        </p>
      </div>

      <ul className='text-rose-brown flex-grow-1 mb-4 ps-3'>
        {product.bulletDescription.map((title) => (
          <li key={title} className='mb-2 d-flex align-items-start'>
            <span className='me-2'>•</span>
            <span>{title}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleGetStarted}
        disabled={isPending}
        className='w-100 btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 fw-medium'
      >
        {isPending && <Spinner className='border-2' size='sm' />}
        Get Started
      </button>
    </div>
  );
}
