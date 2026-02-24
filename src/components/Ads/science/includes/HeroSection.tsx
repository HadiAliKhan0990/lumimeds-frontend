import { useTransition, useState, useMemo } from 'react';
import Image from 'next/image';
import HeroImg from '@/assets/science-hero.png';
import ArrowUpCorner from '@/assets/svg/arrow-up-corner.svg';
import scienceVial from '@/assets/science-product.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import { ProductType } from '@/store/slices/productTypeSlice';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  data: ProductType[];
}

export default function HeroSection({ data }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isArrowLoading, setIsArrowLoading] = useState(false);
  const [clickedByArrow, setClickedByArrow] = useState(false);

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser } = checkout || {};

  // Calculate the lowest divided amount from all products
  const lowestDividedAmount = useMemo(() => {
    if (!data || data.length === 0) return 133; // Fallback value for testing

    const dividedAmounts = data.map((product) => product.dividedAmount).filter((amount) => amount && amount > 0);

    const result = dividedAmounts.length > 0 ? Math.min(...dividedAmounts) : 133;
    return result;
  }, [data]);

  const handleGetStarted = async () => {
    setClickedByArrow(false);
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

  const handleArrowClick = async () => {
    setClickedByArrow(true);
    setIsArrowLoading(true);

    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product: selectedProduct,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });

    // Don't set loading to false here - let the redirect happen
    // The component will unmount when redirect occurs
  };

  return (
    <div
      className='hero container rounded-5 overflow-hidden tw-pt-16 md:tw-pt-24'
      style={{ backgroundImage: `url(${HeroImg.src})` }}
    >
      <div className='row g-0 align-items-center'>
        <div className='col-12 col-lg-6 px-4 px-md-5 py-5 py-lg-5'>
          <div className='copy-wrap'>
            <h1 className='display-5 fw-bold mb-2 text-white lh-1'>
              <span className='d-block fw-normal'>Smarter science.</span>
              <span className='d-block strong'>Stronger results.</span>
            </h1>
            <p className='lead text-white mb-4 pe-lg-5'>
              Whether you&apos;re starting out or leveling up, our GLP-1 and GLP-1/GIP plans are personalized to your
              goals all guided by licensed medical providers.
            </p>
            <button
              disabled={isPending && !clickedByArrow}
              onClick={handleGetStarted}
              className='btn btn-lg btn-started rounded-pill px-4 d-inline-flex align-items-center justify-content-center gap-2'
              data-tracking-id='get-started-hero-science'
            >
              {isPending && !clickedByArrow && <Spinner className='border-2' size='sm' />}
              Get Started
            </button>
          </div>
        </div>
        <div className='col-12 col-lg-6 position-relative hero-media'>
          <div className='hero-media' />
          <div className='product-card shadow-lg rounded-4 p-3 p-md-4'>
            <div className='d-flex justify-content-between align-items-center'>
              <small className='text-white'>{GLP1_GIP_LABEL.replace('(', '{').replace(')', '}')}</small>
              <span
                className='icon-circle cursor-pointer'
                onClick={handleArrowClick}
                style={{ cursor: 'pointer', opacity: isArrowLoading ? 0.7 : 1 }}
                data-tracking-id='get-started-hero-science-arrow'
              >
                {isArrowLoading ? (
                  <Spinner className='border-2' size='sm' style={{ width: '20px', height: '20px' }} />
                ) : (
                  <Image src={ArrowUpCorner} alt='' width={40} height={40} />
                )}
              </span>
            </div>
            <h6 className='text-white mb-3'>Weight Loss Injections</h6>
            <div className='product-card-image rounded-4 overflow-hidden bg-white'>
              <div className='w-100 h-100 d-flex align-items-center justify-content-between px-4'>
                {/* Image on the left */}
                <div className='d-flex align-items-center justify-content-center'>
                  <Image
                    src={scienceVial}
                    alt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Compounded Medication Vial`}
                    width={174}
                    height={221}
                  />
                </div>

                {/* Price on the right */}
                <div className='hero-product-price'>
                  <span className='dollar'>$</span>
                  <span className='price-dollar'>{getRoundedPrice(lowestDividedAmount)}</span>
                  <span className='month'>/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
