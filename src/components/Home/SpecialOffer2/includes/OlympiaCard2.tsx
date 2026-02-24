'use client';

import Image from 'next/image';
import { ProductType } from '@/store/slices/productTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

interface Props {
  product: ProductType;
  staticDescription: string;
}

export function OlympiaCard2({ product, staticDescription }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  async function handleGetStarted() {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.displayName ?? product.name ?? '',
      value: product.prices?.[0].amount ?? 0,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      product.id ?? '',
      product.displayName ?? product.name ?? '',
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

  return (
    <div key={product.id} className='olympia-plan mb-5'>
      <div className='col-6 blue_area'>
        <Image src={product.image || ''} alt={product.name || ''} width={150} height={150} className='med_img' />
        <div className='d-flex flex-column align-items-start'>
          <div>
            <p className='m-0 text-black'>{product.name}</p>
            <p className='m-0'>{product.displayName}</p>
          </div>
          <div>
            <p className='m-0 text-black'>${getRoundedPrice(product.prices?.[0].amount)}</p>
            <p className='m-0 purchase-tag text-black'>One time Purchase</p>
            {product.metadata.intervalCount && product.metadata.intervalCount > 1 && (
              <p className='per-month-price m-0 text-black'>({`$${getRoundedPrice(product.dividedAmount)}/month`})</p>
            )}
          </div>
          <button
            disabled={isPending}
            onClick={handleGetStarted}
            className='btn btn-primary px-4 py-12 text-lg fw-medium rounded-pill d-inline-flex align-items-center justify-content-center gap-2'
            data-tracking-id='get-started-home-special-offer-2'
          >
            {isPending && <Spinner className='border-2' size='sm' />}
            Get Started
          </button>
        </div>
      </div>
      <div className='col-6'>
        <p className='text-lg'>{staticDescription}</p>
        <ul className='bullet-adjustment description3 ps-0'>
          {product.bulletDescription.map((feature, idx) => (
            <li key={idx} className='feature-item'>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
