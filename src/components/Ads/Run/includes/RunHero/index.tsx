import styles from './styles.module.scss';
import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';

export const RunHero = () => {
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
    <section className={styles.joggingWomanInPark}>
      <div className={'container ' + styles.joggingWomanInParkContainer}>
        <div className={styles.containerTextContent}>
          <h1 className={`text-white fw-bold mb-4 ${styles.heroTitle}`}>
            503B GLP-1 Weight
            <br /> Loss Injection Specials
          </h1>
          <p className={`text-white ${styles.heroDescription}`}>
            Rev up your transformation — discover a personalized and <br /> more advanced approach to weight care.
          </p>
          <div>
            <button
              className={styles.heroButton}
              onClick={handleGetStarted}
              disabled={isPending}
              data-tracking-id='get-started-hero-run'
            >
              {isPending && <Spinner className='border-2 me-2' size='sm' />}
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
