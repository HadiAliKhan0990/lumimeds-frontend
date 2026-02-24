import BackgroundImage from '@/assets/503Bontrack/503bchoice.jpg';
import { AppDispatch, RootState } from '@/store';
import { useSelector, useDispatch } from 'react-redux';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Spinner } from 'react-bootstrap';

export default function HeroImage() {
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
    <section
      className='hero-section position-relative d-flex align-items-center'
      style={{ backgroundImage: `url(${BackgroundImage.src})` }}
    >
      {/* Content wrapper */}
      <div className='container position-relative'>
        <div className='row'>
          <div className='col-md-8 col-sm-10'>
            <div className='hero-content text-white'>
              <h1 className='hero-title fw-bold mb-4'>503B GLP-1 Weight Loss Injection Plans</h1>

              <p className='hero-description mb-5'>
                A more advanced approach to weight care with our exclusive GLP-1 treatments compounded in a highly
                regarded 503B facility.
              </p>

              <button
                onClick={handleGetStarted}
                disabled={isPending}
                className='hero-cta-button btn btn-outline-light btn-lg px-5 py-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-2'
              >
                {isPending && <Spinner className='border-2' size='sm' />}
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
