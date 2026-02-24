import FavoriteSnackBg from '@/assets/fav-snack-bg.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

export default function FavoriteSnackHero() {
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
      className='w-100 p-0 favorite-snack-hero favorite-snack-bg'
      style={{
        backgroundImage: `url(${FavoriteSnackBg.src})`,
      }}
    >
      <div className='container h-100'>
        <div className='d-flex flex-column align-items-center justify-content-between h-100 text-white text-center py-5'>
          <div className='favorite-snack-title-section'>
            <p className='display-1 favorite-snack-title'>Your New Favorite Snack</p>
            <p className='display-4 favorite-snack-subtitle'>Thanks to GLP-1 Medication</p>
          </div>
          <div>
            <p className='h2 mb-5 favorite-snack-description'>
              {`With GLP-1, you're in control of your appetite and your journey toward a healthier, lighter you.`}
            </p>
            <button
              onClick={handleGetStarted}
              disabled={isPending}
              className='btn btn-light text-primary rounded-pill get-started-add d-inline-flex align-items-center justify-content-center gap-2'
              data-tracking-id='get-started-hero-favorite-snack'
            >
              {isPending && <Spinner className='border-2' size='sm' />}
              GET STARTED
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
