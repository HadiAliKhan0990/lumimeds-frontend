'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import WellsImg from '@/assets/wells_vial.png';
import './styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { ProductType, setProductType } from '@/store/slices/productTypeSlice';
import { setAnswers } from '@/store/slices/answersSlice';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { ROUTES } from '@/constants';
import { STORAGE_STEP_KEY, STORED_PRODUCT } from '@/constants/intakeSurvey';
import { loadSync } from '@/lib/encryptedStorage';

const WellsProduct = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const products = useSelector((state: RootState) => state.productTypes);
  const wellsProduct = products.find((product) => product.name?.includes('Wells'));

  const [storedProduct, setStoredProduct] = useState<ProductType>();

  const handleProductSurvey = (product: ProductType) => {
    const price = product.prices?.[0];

    if (!price) return;

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

    router.push(ROUTES.PATIENT_INTAKE);
  };

  useEffect(() => {
    const product = loadSync<ProductType>(STORED_PRODUCT) || ({} as ProductType);
    setStoredProduct(product);
  }, [router]);

  if (!wellsProduct) return null;

  const match = /(\d+\s*Month?)$/.exec(wellsProduct.name ?? '');
  const monthInterval = match ? parseInt(match[1].split(' ')[0]) : 1;

  return (
    <div className='container' style={{ paddingTop: 48, paddingBottom: 32 }}>
      <div className='row' style={{ columnGap: 24 }}>
        <div className='col-12 col-lg-5' style={{ display: 'flex', justifyContent: 'center' }}>
          <Image src={WellsImg} alt='' style={{ transform: 'rotate(-15deg)', width: 250, height: 420 }} />
        </div>
        <div id='wells-offer-text' className='col-12 col-lg-5'>
          <p className='mb-5'>
            What&apos;s <span style={{ color: '#3060FE' }}>New</span>
          </p>
          <p className='mb-5'>{wellsProduct.name}</p>
          <p className='mb-3'>${wellsProduct?.prices?.[0].amount}</p>
          <p className='mb-3'>${(wellsProduct.prices?.[0].amount ?? 1) / monthInterval}/mo. (One-time purchase)</p>
          <p className='mb-3'>
            5mg vial{monthInterval > 1 ? 's' : ''} - 4 vial{monthInterval > 1 ? 's' : ''}
          </p>
          <p className='mb-5 text-center text-lg-start'>
            Available in All doses. Not eligible for promo codes. Available across the US except CA.
          </p>
          {/* <a href="/products/summary"> */}
          <button className='btn btn-primary rounded-pill px-4 py-2' onClick={() => handleProductSurvey(wellsProduct)}>
            Learn More
          </button>
          {/* </a> */}
        </div>
      </div>
    </div>
  );
};

export default WellsProduct;
