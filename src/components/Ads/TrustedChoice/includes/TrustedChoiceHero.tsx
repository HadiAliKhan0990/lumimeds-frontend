import { useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

export default function TrustedChoiceHero() {
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
    <section className='w-100 p-0 trusted-choice-bg trusted-choice-bg-responsive trusted-choice-hero trusted-choice-hero-with-overlay'>
      <div className='container d-flex flex-column align-items-center justify-content-center text-center text-white trusted-choice-content'>
        <p className='display-1 fw-bold trusted-choice-title'>
          GLP-1 Injections: <br />A Trusted Choice
        </p>
        <p className='display-1 trusted-choice-subtitle'>
          Personalized GLP-1 therapy <br />
          that works
        </p>
        <p className='h2 trusted-choice-description'>
          Designed to support a healthy weight loss and long-term success.&nbsp;
        </p>
        <button
          disabled={isPending}
          className='btn btn-primary trusted-choice-btn d-flex align-items-center justify-content-center gap-2 py-12 px-4'
          onClick={handleGetStarted}
          data-tracking-id='get-started-hero-trusted-choice'
        >
          {isPending && <Spinner className='border-2' size='sm' />}
          GET STARTED
        </button>
      </div>
    </section>
  );
}
