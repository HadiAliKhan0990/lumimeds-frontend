import BenefitsBg from '@/assets/benefits-bg.png';
import Image from 'next/image';
import { useTransition } from 'react';
import { RootState, AppDispatch } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Spinner } from 'react-bootstrap';

export default function BenefitsHero() {
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
    <section className='w-100 p-0 benefits-bg-hero'>
      <div className='container h-100'>
        <div className='d-flex flex-column align-items-center justify-content-between h-100 text-white text-center py-5 benefits-title-section'>
          <div>
            <p className='display-1 benefits-title'>BENEFITS OF</p>
            <p className='display-1 fst-italic benefits-subtitle'>GLP-1 Medication</p>
          </div>
          <Image src={BenefitsBg.src} width={700} height={1000} alt='' />
          <button
            disabled={isPending}
            className='btn btn-outline-light rounded-0 py-12 px-4 d-inline-flex align-items-center justify-content-center gap-2'
            onClick={handleGetStarted}
            data-tracking-id='get-started-hero-benefits'
          >
            {isPending && <Spinner className='border-2' size='sm' />}
            GET STARTED
          </button>
        </div>
      </div>
    </section>
  );
}
