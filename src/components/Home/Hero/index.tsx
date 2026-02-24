import Image from 'next/image';
import HeroBG from '@/assets/landing/smile-woman.png';
import TrustpilotWidget from '@/components/Home/Hero/TrustpilotWidget';
import { TrustpilotData } from '@/services/trustpilot';
// import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import './styles.css';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { setProductType, ProductType } from '@/store/slices/productTypeSlice';
import { ROUTES } from '@/constants';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { getProductCategory } from '@/lib/trackingHelpers';

interface Props {
  data?: ProductTypesResponseData;
  trustpilotData?: TrustpilotData;
}

export default function Hero({ trustpilotData, data }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, startTransition] = useTransition();

  const storedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};

  async function handleProductSurvey() {
    const tirzepatidePlans = data?.glp_1_gip_plans?.products || [];
    
    const threeMonthValuePlan = tirzepatidePlans.find(
      (product) =>
        product.metadata?.planTier === 'value' &&
        product.metadata?.intervalCount === 3 &&
        product.planType === 'recurring'
    );

    if (!threeMonthValuePlan) {
      console.error('3-month value plan for tirzepatide not found');
      startTransition(() => router.push(ROUTES.PATIENT_INTAKE));
      return;
    }

    const activePrice = threeMonthValuePlan.prices?.find((p) => p.isActive) || threeMonthValuePlan.prices?.[0];
    
    if (!activePrice) {
      console.error('No active price found for 3-month value plan');
      return;
    }

    const productWithPrice: ProductType = {
      ...threeMonthValuePlan,
      prices: [activePrice],
    };

    const productCategory = getProductCategory(productWithPrice);

    trackAddToCart({
      itemId: productWithPrice.id ?? '',
      itemName: productWithPrice.displayName ?? productWithPrice.name ?? '',
      value: activePrice.amount ?? 0,
      productCategory,
    });

    microsoftTrackAddToCart(
      productWithPrice.id ?? '',
      productWithPrice.displayName ?? productWithPrice.name ?? '',
      activePrice.amount ?? 0
    );

    await trackSurveyAnalytics({
      event: 'survey_get_started',
      payload: { product_id: productWithPrice.id ?? '', product_name: productWithPrice.name ?? '', amount: activePrice.amount ?? 0 },
    });

    dispatch(setProductType(productWithPrice));

    await handleVerifyRedirectToCheckout({
      selectedProduct: storedProduct,
      product: productWithPrice,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
      surveyCategory
    });
  }

  return (
    <section className='position-relative landing_hero' id='hero'>
      <div className='container pb-32 position-relative mt-5 mt-lg-0 z-1'>
        <div id='hero-weight-loss'>
          <div className='content d-flex flex-column gap-3 gap-md-4 align-items-start'>
            {/* <h2>
              Healthcare{' '}
              <span className='text-primary'>
                weight loss, <br />
              </span>
              <span className='fw-normal font-instrument-serif'>at the most competitive prices</span>
            </h2> */}
            <h1 className='tw-max-w-full md:tw-max-w-[475px] tw-text-[32px] md:tw-text-[48px] lg:tw-text-[64px] tw-leading-[40px] md:tw-leading-[60px] lg:tw-leading-[81px] tw-text-center md:tw-text-left'>
          <span className='tw-font-medium'> Weight Loss Solutions <br/>  </span> 
            <span className='!tw-font-[700]'>for Every Body</span>
            </h1>
            <p className='hero-text tw-max-w-[566px]'>No insurance required weight reduction and longevity injectables. Expert-led, backed by science, and never any hidden fees. How refreshing.</p>

            {/* Trustpilot Widget */}
            {trustpilotData && (
              <div className='trustpilot-container'>
                <TrustpilotWidget trustpilotData={trustpilotData} />
              </div>
            )}

            {/* <SurveyGetStartedButton className='btn-primary text-lg rounded-pill hero-get-started-btn' /> */}
            <button
              onClick={handleProductSurvey}
              disabled={isPending}
              className='btn-primary text-lg rounded-pill hero-get-started-btn btn py-12 px-4'
            >
              Let&lsquo;s Do This!
            </button>
          </div>
        </div>
      </div>
      <div className='smile_woman_img_container tw-left-0 tw-right-0 tw-top-20'>
        <div className='container d-flex align-items-end h-100'>
          <Image src={HeroBG} alt='' width={1258} height={1234} />
        </div>
      </div>
    </section>
  );
}
