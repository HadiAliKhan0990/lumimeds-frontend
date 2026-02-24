'use client';

import Image from 'next/image';
import OlympiaVial from '@/assets/vial_olympia.png';
import OlympiaVialAll from '@/assets/vial_olympia_all.png';
import { ProductType, setProductType } from '@/store/slices/productTypeSlice';
import { setAnswers } from '@/store/slices/answersSlice';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import './styles.css';
import { ROUTES } from '@/constants';
import { STORAGE_STEP_KEY, STORED_PRODUCT } from '@/constants/intakeSurvey';

interface Props {
  product: ProductType;
  isOlympia: boolean;
}

export function OlympiaCard({ product, isOlympia }: Readonly<Props>) {
  const dispatch = useDispatch();
  const router = useRouter();

  const match = (product.name ?? '').match(/(\d+\s*Month?)$/);
  const monthInterval = match ? parseInt(match[1].split(' ')[0]) : 1;

  // Extract the number from product.description
  const monthValue = product?.description?.match(/(\d+)/)?.[1];

  const [storedProduct, setStoredProduct] = useState<ProductType>();
  const [isPending, startTransition] = useTransition();

  const handleProductSurvey = (product: ProductType) => {
    const price = product.prices![0];

    // Fire Add to Cart tracking event
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.displayName ?? product.name ?? '',
      value: price.amount ?? 0,
      currency: 'USD',
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      product.id ?? '',
      product.displayName ?? product.name ?? '',
      price.amount ?? 0,
      'USD'
    );

    dispatch(
      setProductType({
        ...product,
        surveyId: product.surveyId,
        createdAt: null,
        updatedAt: null,
        prices: [price],
      })
    );

    if (storedProduct?.prices?.[0].priceId !== price.priceId) {
      dispatch(setAnswers([]));
      localStorage.setItem(STORAGE_STEP_KEY, '1');
    }

    startTransition(() => router.push(ROUTES.PATIENT_INTAKE));
  };

  useEffect(() => {
    const product = JSON.parse(localStorage.getItem(STORED_PRODUCT) ?? '{}') as ProductType;
    setStoredProduct(product);
  }, [router]);
  return (
    <div key={product.id} className='olympia-plan mb-5'>
      <div className='col-6'>
        {/* Use default image size for all products */}
        <Image
          src={product.image || (monthInterval === 1 ? OlympiaVial : OlympiaVialAll)}
          alt={product.name || ''}
          width={150}
          height={150}
        />
        <div>
          <div>
            <p className='m-0'>{product.name}</p>
            <p className='m-0'>{monthValue}-Month Plan</p>
          </div>
          <div>
            <p className='m-0'>${product.prices?.[0].amount}</p>
            <p className='m-0 purchase-tag'>One time Purchase</p>
            {monthValue && !isNaN(Number(monthValue)) && Number(monthValue) > 0 && (
              <p className='per-month-price m-0'>
                (${((product.prices?.[0].amount ?? 1) / Number(monthValue)).toFixed(2)}/month)
              </p>
            )}
            {monthInterval > 1 && (
              <span>(${((product.prices?.[0].amount ?? 1) / monthInterval).toFixed(2)}/month)</span>
            )}
          </div>
          <button
            disabled={isPending}
            className='btn btn-light px-4 py-12 text-lg fw-medium rounded-pill text-primary get-started'
            onClick={() => handleProductSurvey(product)}
            data-tracking-id={`get-started-home-special-offer-${
              product.id || product.name?.toLowerCase().replace(/\s+/g, '-')
            }`}
          >
            Get Started
          </button>
        </div>
      </div>
      <div className='col-6'>
        <p>
          {monthInterval === 1
            ? 'A flexible introduction to your weight care journey. This plan is the perfect entry point to our science-backed program—designed for those seeking full flexibility without any long-term commitment.'
            : 'Perfect for those beginning a GLP-1 routine, this plan provides a multi-month supply of compounded medication—offering an affordable and flexible way to stay consistent as you start your weight care journey.'}
        </p>
        <ul className='bullet-adjustment description3 ps-0'>
          <li>{product.prices?.[0]?.description}</li>
          <li>One Time Purchase</li>
        </ul>
        {/* Only show for Olympia products */}
        {isOlympia && <p className='description2'>Available in all states except MS and CA. BUD 9/10 or later.</p>}
        {!isOlympia && <p className='description2'>Available in all states except MS, CA and AL</p>}
      </div>
    </div>
  );
}
