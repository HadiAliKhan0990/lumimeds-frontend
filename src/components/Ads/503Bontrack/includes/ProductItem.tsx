'use client';

import Image from 'next/image';
import GroupImage3 from '@/assets/503Bontrack/503B-Gorup-3.png';
import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { trackAddToCart } from '@/lib/tracking';
import { ProductType } from '@/store/slices/productTypeSlice';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

interface Props {
  product: ProductType;
}

export default function ProductItem({ product }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  async function handleGetStarted(product: ProductType) {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.name ?? '',
      value: product.prices?.[0].amount ?? 0,
    });

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

  const renderProductImage = () => {
    // If supply text includes 3-Month, show static image
    if (product.metadata.intervalCount === 3) {
      return (
        <Image
          src={GroupImage3}
          alt='GLP-1 (503B) Weight Loss Injection Vials'
          width={200}
          height={120}
          className='product-vial-image'
        />
      );
    } else if (product.image) {
      // Use provided image URL if available
      return (
        <Image
          src={product.image}
          alt='GLP-1 (503B) Weight Loss Injection Vial'
          width={80}
          height={120}
          className='product-vial-image'
        />
      );
    }
  };

  const benefit = useMemo(() => {
    if (product.metadata.intervalCount === 1) {
      return 'See and feel the difference in one month';
    } else if (product.metadata.intervalCount === 2) {
      return 'Set Yourself Up For Success';
    } else if (product.metadata.intervalCount === 3) {
      return 'More Time = Greater Progress';
    }
    return 'See and feel the difference in one month';
  }, [product]);
  return (
    <div className='product-item'>
      {/* Top-left Supply Banner */}
      <div className='supply-banner'>
        <h3 className='supply-text'>{product.durationText}</h3>
      </div>

      {/* Main Content */}
      <div className='product-content'>
        <div className='product-layout'>
          {/* Left Section - Pricing */}
          <div className='pricing-section'>
            <p className='pricing-intro'>Advanced Weight Care at</p>
            <div className='price-display'>
              <span className='price-amount'>${getRoundedPrice(product.dividedAmount)}</span>
              <span className='price-period'>/mo</span>
            </div>
            <p className='purchase-type'>One-Time Purchase</p>
            <button
              disabled={isPending}
              className='product-cta-button'
              onClick={() => handleGetStarted(product)}
              data-tracking-id={`product-card-503b-ontrack-${
                product.id || product.name?.toLowerCase().replace(/\s+/g, '-')
              }`}
            >
              {isPending && <Spinner className='border-2 me-2' size='sm' />}
              Get Started
            </button>
          </div>

          {/* Center - Product Image */}
          <div className='product-image-section'>
            <div className='product-images-container'>{renderProductImage()}</div>
          </div>

          {/* Right Section - Product Info */}
          <div className='product-info-section'>
            <h2 className='product-title'>GLP-1 (503B) Weight Loss Injections</h2>
            <p className='product-benefit'>{benefit}</p>
            <ul className='text-start product-features d-flex flex-column gap-2'>
              {product.bulletDescription.map((feature) => (
                <li key={feature} className='feature-text'>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
