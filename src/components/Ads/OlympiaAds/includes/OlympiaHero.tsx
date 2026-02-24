import { useTransition } from 'react';
import HeroImg from '@/assets/503b-hero.png';
import HeroImgMobile from '@/assets/503-hero-mobile.png';
import PlansImg from '@/assets/503b-plans.png';
import PlansImgMobile from '@/assets/503b-plans-mobile.png';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';

export default function OlympiaHero() {
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
    <>
      <section className='container'>
        <div className='position-relative'>
          <Image className='d-none d-md-block' src={HeroImg.src} width={2000} height={1000} alt='' />
          <div className='d-none d-md-block olympia-content-desktop hero-503b'>
            <p className='olympia-personalized'>Personalized</p>
            <p className='olympia-title'>
              GLP-1 therapy
              <br /> — made simple.
            </p>
            <button
              disabled={isPending}
              onClick={handleGetStarted}
              className='btn btn-secondary rounded-pill py-12 px-4 d-inline-flex align-items-center justify-content-center gap-2'
              data-tracking-id='get-started-hero-olympia-desktop'
            >
              Get Started
            </button>
          </div>
          <Image className='d-md-none' src={HeroImgMobile.src} width={768} height={600} alt='' />
          <div className='d-md-none olympia-content-mobile hero-503b-mobile'>
            <p className='olympia-personalized-mobile'>Personalized</p>
            <p className='olympia-title-mobile'>
              GLP-1 therapy
              <br /> — made simple.
            </p>
            <button
              disabled={isPending}
              onClick={handleGetStarted}
              className='btn btn-secondary rounded-pill py-12 px-4 d-inline-flex align-items-center justify-content-center gap-2'
              data-tracking-id='get-started-hero-olympia-mobile'
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
      <section className='container d-flex flex-column align-items-center'>
        <p className='text-center'>ALL PLANS INCLUDE</p>
        <Image className='mx-auto d-none d-lg-block' src={PlansImg.src} width={1000} height={1000} alt='' />
        <Image className='mx-auto d-lg-none' src={PlansImgMobile.src} width={300} height={300} alt='' />
      </section>
    </>
  );
}
