import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

export default function MaleHero() {
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
    <section className='male-hero-section bg-danger male-hero-bg'>
      <div className='row'>
        <div className='col-lg-6 d-none d-lg-block' />
        <div className='col-lg-6 d-flex flex-column align-items-center align-items-lg-start male-hero-content'>
          <div className='mb-5 mb-lg-0 text-center text-lg-start text-white male-hero-title'>
            <p className='m-0'>Drop Weight</p>
            <p className='m-0'>Stay Strong</p>
            <p className='m-0'>Dominate Life</p>
          </div>
          <p className='mb-5 display-4 display-lg-1 text-white male-hero-subtitle'>with GLP-1 medications</p>
          <button
            className='btn btn-light rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-2'
            onClick={handleGetStarted}
            disabled={isPending}
            data-tracking-id='get-started-hero-male'
          >
            {isPending && <Spinner className='border-2' size='sm' />}
            GET STARTED
          </button>
        </div>
      </div>
    </section>
  );
}
