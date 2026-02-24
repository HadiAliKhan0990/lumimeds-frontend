'use client';

import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { AppDispatch, RootState } from '@/store';
import { ProductType, setProductType } from '@/store/slices/productTypeSlice';
import { usePathname, useRouter } from 'next/navigation';
import { ButtonHTMLAttributes, useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  product?: ProductType;
}

export const SurveyGetStartedButton = ({ product, children, ...props }: Readonly<Props>) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};

  const handleGetStarted = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await trackSurveyAnalytics({
        event: 'survey_get_started',
        payload: { url: pathname },
      });

      // Get the product to use (prefer prop over selectedProduct from store)
      const productToUse = product || selectedProduct;

      // Update Redux store with the selected product before redirecting
      // This ensures the correct product is selected when navigating to product summary page
      if (productToUse) {
        dispatch(setProductType(productToUse));
      }

      await handleVerifyRedirectToCheckout({
        selectedProduct: productToUse, // Use the product we just set in store
        product: productToUse,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
        surveyCategory
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      {...props}
      className={`${props.className} btn py-12 px-4 d-flex align-items-center justify-content-center gap-2`}
      type='button'
      onClick={handleGetStarted}
      disabled={isPending || isLoading}
      data-tracking-id='get-started-survey-button'
    >
      {(isPending || isLoading) && <Spinner className='border-2' size='sm' />}
      {children || 'Get Started'}
    </button>
  );
};
