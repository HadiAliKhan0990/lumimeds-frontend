'use client';
import MonthProductImage from '@/assets/ads/google-shopping/month-product.png';
import SupportIcon from '@/assets/ads/google-shopping/support-icon.svg';
import DosingIcon from '@/assets/ads/google-shopping/dosing-icon.svg';
import DeliveryIcon from '@/assets/ads/google-shopping/delivery-icon.svg';
import PortalIcon from '@/assets/ads/google-shopping/portal-icon.svg';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useTransition, useMemo } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import type { ProductType } from '@/store/slices/productTypeSlice';
import { Spinner } from 'react-bootstrap';
import { useGoogleMerchantConfig } from '@/hooks/useGoogleMerchantConfig';

type Feature = {
  icon: StaticImageData;
  title: string;
  description: string;
};

type Product = {
  id: string;
  image: StaticImageData;
  supplyLabel: string;
  headingLines: string[];
  features: Feature[];
  cta: string;
  finePrint: string;
};

interface MonthProductProps {
  totalPrice?: number;
  product?: ProductType; // ProductType from API for Google Merchant flow
}

export default function MonthProduct({ totalPrice = 399, product: productData }: MonthProductProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, startTransition] = useTransition();
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const { renderTextWRTGoogleMerchant } = useGoogleMerchantConfig();

  // Note: "Injections" text is hidden via CSS using data-injections-text attribute
  // The blocking script in layout.tsx sets data-try-subdomain attribute before React hydration

  // Always include "Injections" in the heading to prevent re-render flash
  // CSS will hide it on try subdomain
  // Split into separate lines so we can hide just "Injections" without affecting "(GLP-1/GIP)"
  const products: Product[] = useMemo(
    () => [
      {
        id: 'compounded-tirzepatide',
        image: MonthProductImage,
        supplyLabel: 'Once-A-Week Doses',
        headingLines: ['Compounded Tirzepatide', '(GLP-1/GIP)', 'Injections'],
        cta: 'Start Your Online Evaluation',
        finePrint: 'Medication is not guaranteed and is provided only following clinician evaluation.',
        features: [
          {
            icon: SupportIcon,
            title: 'Optional Support',
            description: 'Initial evaluation & ongoing support',
          },
          {
            icon: DosingIcon,
            title: 'Starter Dosing',
            description: 'Once-weekly doses of GLP-1/GIP',
          },
          {
            icon: DeliveryIcon,
            title: 'Pharmacy Delivery',
            description: 'Priority shipping from a U.S. pharmacy',
          },
          {
            icon: PortalIcon,
            title: 'Patient Portal',
            description: 'Optional access to patient support portal',
          },
        ],
      },
    ],
    []
  ); // Empty dependency array - products array never changes

  // Format price display - show total price for both variants
  const getPriceDisplay = () => {
    return {
      primary: `$${totalPrice} for 12 doses`,
    };
  };

  const priceDisplay = getPriceDisplay();
  return (
    <div className='tw-max-w-[1360px] tw-w-full tw-mx-auto md:tw-my-[87px] tw-my-16 tw-px-5'>
      {products.map((product) => (
        <div key={product.id} className='tw-flex md:tw-flex-row tw-flex-col lg:tw-gap-16 md:tw-gap-10'>
          <div>
            {/* For Mobile Heading */}
            <div className='tw-block md:tw-hidden tw-text-center'>
              <div className='tw-font-lato tw-font-normal md:tw-text-2xl tw-text-xs tw-text-[#1B2233] tw-mb-2'>
                {product.supplyLabel}
              </div>
              <h2 className='tw-font-lumitype tw-font-bold tw-text-[#3D77EA] tw-text-[32px] tw-leading-[100%] tw-tracking-[-0.05em] tw-mb-0'>
                {product.headingLines.map((line) => (
                  <span
                    key={line}
                    className='tw-block tw-leading-[100%]'
                    {...(line === 'Injections' ? { 'data-injections-text': 'true' } : {})}
                  >
                    {line}
                  </span>
                ))}
              </h2>
            </div>
            <div className='tw-max-w-[534px] tw-w-full md:tw-my-0 tw-my-8'>
              <Image src={product.image} alt='Month Product' />
            </div>
            <div className='tw-flex lg:tw-flex-row md:tw-flex-col tw-items-center tw-justify-center tw-gap-4 tw-font-lato tw-font-bold md:tw-whitespace-normal tw-whitespace-nowrap'>
              <div className='md:tw-text-4xl tw-text-[26px] tw-text-[#3D77EA]'>{priceDisplay.primary}</div>
            </div>
            <div className='tw-font-lato md:tw-font-medium tw-font-bold md:tw-text-xs tw-text-base tw-text-[#222A3F] tw-text-center tw-mt-2'>
              {renderTextWRTGoogleMerchant({
                text: 'Pricing reflects program cost; medication is only dispensed if prescribed.',
                googleMerchantText: 'Pricing reflects one-time cost; medication is only dispensed if prescribed.',
              })}
            </div>
          </div>
          <div>
            <div className='tw-hidden md:tw-block'>
              <div className='tw-font-lato tw-font-normal tw-text-2xl tw-text-[#1B2233] tw-mb-4'>
                {product.supplyLabel}
              </div>
              <h2 className='tw-font-lumitype tw-font-bold tw-text-[#3D77EA] xl:tw-text-[52px] md:tw-text-3xl tw-leading-[100%] tw-tracking-[-0.05em] tw-mb-0'>
                {product.headingLines.map((line) => (
                  <span
                    key={line}
                    className='tw-block tw-leading-[100%]'
                    {...(line === 'Injections' ? { 'data-injections-text': 'true' } : {})}
                  >
                    {line}
                  </span>
                ))}
              </h2>
            </div>

          
            <div className='tw-w-full tw-flex tw-gap-2 tw-mt-5'>
              <div className='tw-w-full tw-flex md:tw-hidden tw-items-center '>
                <div className='tw-w-full tw-h-0.5 tw-bg-gray-200'></div>
              </div>
              <span className='tw-flex-shrink-0'>{`What's included`}</span>
              <div className='tw-w-full tw-flex tw-items-center'>
                <div className='tw-w-full tw-h-0.5 tw-bg-gray-200'></div>
              </div>
            </div>
            <div></div>
            <div className='tw-grid md:tw-grid-cols-2 tw-grid-cols-1 tw-items-center tw-gap-4 tw-font-lato tw-my-8'>
              {product.features.map((feature) => (
                <div
                  key={feature.title}
                  className='tw-flex tw-flex-col tw-gap-2 md:tw-justify-start tw-justify-center md:tw-items-start tw-items-center'
                >
                  <Image src={feature.icon} alt={feature.title} />
                  <div className='tw-font-lato tw-font-semibold tw-text-xl tw-text-[#3D77EA]'>{feature.title}</div>
                  <div className='tw-font-lato tw-font-medium tw-text-base tw-text-[#222A3F]'>
                    {feature.description}
                  </div>
                </div>
              ))}
            </div>
            <button
              type='button'
              onClick={async () => {
                if (productData) {
                  await handleVerifyRedirectToCheckout({
                    selectedProduct: productData,
                    product: productData,
                    dispatch,
                    startTransition,
                    router,
                    isSurveyCompleted,
                    checkoutUser,
                  });
                }
              }}
              disabled={isPending || !productData}
              className='tw-bg-[#3D77EA] hover:tw-bg-[#2d5fc0] tw-text-white tw-font-lato tw-font-medium md:tw-h-12 tw-h-9 tw-text-[16px] md:tw-text-xl tw-py-3 md:tw-ml-0 tw-mx-auto tw-px-6 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-colors tw-duration-200 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
            >
              {isPending && <Spinner className='border-2' size='sm' />}
              <span>{product.cta}</span>
            </button>
            <div className='tw-font-lato tw-font-medium md:tw-text-xs tw-text-sm md:tw-max-w-full tw-max-w-[320px] tw-w-full md:tw-text-left tw-text-center tw-mx-auto tw-text-[#222A3F] tw-mt-8'>
              {product.finePrint}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
