'use client';

import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import '@/components/Ads/503-bglp-1/style.scss';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductListBglp from '@/components/Ads/503-bglp-1/ProductCards/ProductListBglp';
import { TestimonialsBglp } from '@/components/Ads/503-bglp-1/includes/TestimonialsBglp';

interface Props {
  data: ProductTypesResponseData;
}

export default function Bglp1({ data }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async () => {
    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product: selectedProduct,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };

  return (
    <section className='bglp-section py-0'>
      <div className='ad-503b-hero'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-12 text-center'>
              <h1 className='ad-503b-hero__title fw-bold text-white mt-4'>
                503B GLP-1 Weight Loss Injection <span className='ad-503b-hero__title-italic'>Specials</span>
              </h1>

              <p className='ad-503b-hero__subtitle text-white mx-auto'>
                Rev up your transformation — discover a personalized and more advanced approach to weight care.
              </p>

              <div className='mt-3'>
                <button
                  className='btn btn-light rounded-pill px-4 py-3 ad-503b-hero__cta'
                  onClick={handleGetStarted}
                  disabled={isPending}
                  data-tracking-id='get-started-hero-503b-bglp'
                >
                  {isPending && <Spinner className='me-2' size='sm' />}Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-12 text-center'>
            <h1 className='ad-503b-hero__title fw-bold text-white mt-4'>Our exclusive GLP-1 plan</h1>

            <p className='ad-503b-hero__subtitle text-white mx-auto'>
              GLP-1 weight loss injections compounded in a highly regarded 503B facility and fulfilled by Olympia&apos;s
              trusted 503A pharmacy.
            </p>
          </div>
        </div>
        <ProductListBglp productsData={data} />
      </div>
      <TestimonialsBglp />
    </section>
  );
}
