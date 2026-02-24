'use client';

import React, { useMemo, useTransition } from 'react';
import Image, { StaticImageData } from 'next/image';
import './style.scss';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { Spinner } from 'react-bootstrap';
import { trackAddToCart } from '@/lib/tracking';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { useRouter } from 'next/navigation';
import { ProductPrice, ProductType } from '@/store/slices/productTypeSlice';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

// Assets (used as fallbacks to match the visual from the screenshot)
import PlanCard from './includes/PlanCard';
import GlpGipFallback from '@/assets/glow-up/Glp-Gip-1.png';
import TestimonialsGlpGip from './includes/TestimonialsGlpGip';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

type Props = { data: ProductTypesResponseData };

function getActivePriceAmount(product: ProductType): number {
  const activePrice = product.prices?.find((p: ProductPrice) => p.isActive);
  return activePrice ? activePrice.amount : 0;
}

function mapConfig(product: ProductType, fallbackImage: StaticImageData) {
  const amount = getActivePriceAmount(product);
  const { bulletDescription, dividedAmount, image, durationText, featureText, name } = product;
  const normalizedDuration = (durationText || '').trim();
  const imageSrc: string | StaticImageData =
    normalizedDuration === '3-Month Subscription' || normalizedDuration === '3-Month Supply'
      ? fallbackImage
      : image ?? fallbackImage;
  const supplyText =
    durationText === '3-Month Subscription' || durationText === '3-Month Supply'
      ? `${amount ? `$${getRoundedPrice(amount)}` : ''} upfront (${getRoundedPrice(dividedAmount)}/mo equivalent)`
      : 'One-month supply, renewed monthly';

  const showPerMonth =
    name?.toLowerCase().includes('value 3-month subscription') || name?.toLowerCase().includes('starter 3-month supply')
      ? false
      : true;

  return {
    imageSrc: imageSrc || fallbackImage,
    price: amount,
    dividedAmount,
    bulletDescription,
    durationText,
    featureText: featureText || '',
    supplyText,
    showPerMonth,
    name: name || '',
  };
}

export default function Glp1GipTreatment({ data }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const products = useMemo(() => {
    const p = data?.glp_1_gip_plans?.products || [];
    return p.filter((product) => Array.isArray(product.prices) && product.prices.some((pr) => pr.isActive));
  }, [data]);

  const starterProduct = useMemo(() => {
    return (
      products.find(
        (p) =>
          (p.durationText || '').toLowerCase().includes('3-month supply') ||
          (p.name || '').toLowerCase().includes('starter')
      ) || products[0]
    );
  }, [products]);

  const monthlyProduct = useMemo(() => {
    return (
      products.find((p) => p.metadata?.intervalCount === 1 || (p.durationText || '').toLowerCase().includes('month')) ||
      products[1] ||
      products[0]
    );
  }, [products]);

  const valueProduct = useMemo(() => {
    return (
      products.find(
        (p) =>
          (p.durationText || '').toLowerCase().includes('3-month') &&
          (p.name || '').toLowerCase().includes('subscription')
      ) ||
      products.find((p) => p.metadata?.intervalCount === 3) ||
      products[2] ||
      products[0]
    );
  }, [products]);

  const starterCfg = useMemo(() => mapConfig(starterProduct, GlpGipFallback), [starterProduct]);

  async function handleGetStarted(product: ProductType) {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.name ?? '',
      value: getActivePriceAmount(product),
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

  return (
    <section className='glp1-gip-treatment tw-py-32 lg:tw-py-24 xl:tw-py-28'>
      <div className='container'>
        {/* Starter 3-Month Supply - Hero Card */}
        <div className='product-card starter-card rounded-4 p-4 p-md-5 mb-4'>
          <div className='text-center mb-4'>
            <h1 className='page-title mb-1'>
              {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} <br /> Weight Loss Injection
            </h1>
            <div className='page-subtitle'>Starter 3-Month Supply</div>
          </div>

          <div className='row g-4 align-items-center'>
            {/* Left: Feature tiles */}
            <div className='col-12 col-lg-3'>
              <div className='d-flex flex-column gap-3'>
                {starterCfg.bulletDescription.slice(0, 3).map((text: string, i: number) => (
                  <div key={i} className='feature-tile rounded-3 p-3 text-center'>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Image */}
            <div className='col-12 col-lg-6'>
              <div className='vials-hero text-center'>
                {starterCfg.imageSrc && (
                  <Image
                    src={starterCfg.imageSrc}
                    alt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} vials`}
                    width={360}
                    height={360}
                  />
                )}
              </div>
            </div>

            {/* Right: Pricing & CTA */}
            <div className='col-12 col-lg-3'>
              <div className='starter-pricing text-center text-lg-start'>
                <div className='price-line d-flex align-items-end justify-content-center justify-content-lg-start'>
                  <span className='price-large'>$</span>
                  <span className='price-large'>{getRoundedPrice(starterCfg.dividedAmount)}</span>
                  <span className='per'>/mo</span>
                </div>
                <div className='upfront text-center text-lg-start mt-2'>
                  ${getRoundedPrice(starterCfg.price)} upfront
                  <div className='purchase-type'>One-Time Purchase</div>
                </div>
                <div className='mt-3'>
                  <button
                    disabled={isPending}
                    className='btn btn-cta d-inline-flex align-items-center justify-content-center gap-2'
                    onClick={() => handleGetStarted(starterProduct)}
                  >
                    {isPending && <Spinner className='border-2' size='sm' />}
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row with Monthly and Value Subscription */}
        <div className='row g-4'>
          <div className='col-12 col-lg-6'>
            <PlanCard
              product={monthlyProduct}
              footnote='Maximum flexibility with minimum commitment.'
              imageAlt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} vial`}
              fallbackImage={GlpGipFallback}
            />
          </div>

          <div className='col-12 col-lg-6'>
            <PlanCard
              product={valueProduct}
              footnote='Ensure consistent progress and lasting impact on overall wellness.'
              imageAlt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} multi-vials`}
              fallbackImage={GlpGipFallback}
            />
          </div>
        </div>
      </div>
      {/* Testimonials */}
      <TestimonialsGlpGip />
    </section>
  );
}
