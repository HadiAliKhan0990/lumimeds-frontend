import { useTransition } from 'react';
import Image from 'next/image';
import HeroImage from '@/assets/glow-up/HeroImage.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

export default function HeroSection2() {
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
    <section className='heroSection2'>
      <div className='container-fluid'>
        <div className='row'>
          {/* Left Section - Text Content */}
          <div className='col-lg-6 hero-content2'>
            <div className='hero-text-wrapper'>
              <h1 className='hero-title2'>Your Glow-Up Starts Here</h1>
              <p className='hero-text2'>
                {`More than weight loss—it's about finding balance, building confidence, and creating a healthier version
                of you.`}
              </p>
              <button
                disabled={isPending}
                onClick={handleGetStarted}
                className='btn btn-light hero-button2 d-inline-flex align-items-center justify-content-center gap-2'
                data-tracking-id='get-started-hero-glow-up'
              >
                {isPending && <Spinner className='border-2' size='sm' />}
                Get Started
              </button>
            </div>
          </div>

          {/* Right Section - Hero Image */}
          <div className='col-lg-6 hero-images2'>
            <div className='hero-image-container'>
              <Image
                src={HeroImage}
                alt='Hero section image'
                width={600}
                height={600}
                className='hero-image'
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
