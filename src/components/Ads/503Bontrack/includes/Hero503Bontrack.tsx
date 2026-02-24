import HeroImg from '@/assets/503Bontrack/heroImage.jpg';
import Image from 'next/image';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { Spinner } from 'react-bootstrap';

export default function Hero503Bontrack() {
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
    <section className='hero-section p-0'>
      <div className='row align-items-center'>
        <div className='col-lg-6 col-10 d-flex flex-column justify-content-center hero-title-container py-5 py-lg-0'>
          <h1 className='hero-title'>
            503B GLP-1
            <br />
            Weight Loss
            <br />
            Injection Plans
          </h1>
          <p className='hero-description'>
            A more advanced approach to weight care with our exclusive GLP-1 treatments compounded in a highly regarded
            503B facility.
          </p>
          <div className='button-container'>
            <button
              onClick={handleGetStarted}
              disabled={isPending}
              className='cta-button gap-2'
              data-tracking-id='get-started-hero-503b-ontrack'
            >
              {isPending && <Spinner className='border-2' size='sm' />}
              Get Started
            </button>
          </div>
        </div>

        <div className='col-lg-6 hero-image-container'>
          <Image
            className='hero-image img-fluid object-fit-cover'
            src={HeroImg}
            width={1280}
            height={1919}
            alt='Woman relaxing outdoors in red swimsuit'
          />
        </div>
      </div>
    </section>
  );
}
