'use client';

import Certification from '@/components/Certification';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { IoChevronBackOutline } from 'react-icons/io5';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { SummaryProductCard } from '@/components/ProductsSummary/includes/SummaryProductCard';
import { BottomPopup } from '@/components/ProductsSummary/includes/BottomPopup';
import { ProductType, setProductType } from '@/store/slices/productTypeSlice';
import { STORED_PRODUCT } from '@/constants/intakeSurvey';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { Spinner } from 'react-bootstrap';
import { ROUTES, GOOGLE_MERCHANT_SOURCE } from '@/constants';
import { usePromoCoupons, ProductDiscounts, PatientType } from '@/hooks/usePromoCoupons';
import { useGoogleMerchantConfig } from '@/hooks/useGoogleMerchantConfig';

interface Props {
  data: ProductTypesResponseData;
  flow?: string;
  error?: string;
  source?: string;
  saleType?: string;
  overrideTime?: boolean;
}

export default function ProductsSummary({ data, flow, error, source, saleType, overrideTime = false }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [displayName, setDisplayName] = useState('');
  const [product, setProduct] = useState<ProductType>();
  const [discounts, setDiscounts] = useState<ProductDiscounts>({});

  const [isPending, startTransition] = useTransition();

  const { renderTextWRTGoogleMerchant } = useGoogleMerchantConfig();

  // Promo coupons hook for auto-applying discounts
  // If saleType is provided, only apply coupons that have that sale type
  // Users on products/summary are new patients (completing intake flow)
  // If overrideTime is true, ignores start/end time checks for coupons
  const patientType: PatientType = 'new';
  const { fetchDiscountsForProducts, isLoading: isLoadingCoupons } = usePromoCoupons(saleType, patientType, overrideTime);

  // Get selected product from Redux store
  const selectedProduct = useSelector((state: RootState) => state.productType);

  // Survey data from Redux
  const checkout = useSelector((state: RootState) => state.checkout);

  const handleClose = () => {
    localStorage.removeItem(STORED_PRODUCT);
    // Reset to default state by setting id to null
    if (selectedProduct) {
      dispatch(
        setProductType({
          ...selectedProduct,
          id: null,
        })
      );
    }
    setProduct(undefined);
    setDisplayName('');
  };

  function handleBack() {
    const intake = checkout.surveyCategory === 'longevity' ? ROUTES.LONGEVITY_PATIENT_INTAKE : ROUTES.PATIENT_INTAKE;

    // Get params from props or URL
    const sourceParam = source || (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('source')
      : null);
    const saleTypeParam = saleType || (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('sale_type')
      : null);
    const overrideTimeParam = overrideTime || (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('overrideTime') === 'true'
      : false);

    // Build URL with preserved params
    const params = new URLSearchParams();
    if (sourceParam) params.set('source', sourceParam);
    if (saleTypeParam) params.set('sale_type', saleTypeParam);
    if (overrideTimeParam) params.set('overrideTime', 'true');
    if (flow) params.set('flow', flow);

    const intakeUrl = params.toString() ? `${intake}?${params.toString()}` : intake;
    startTransition(() => router.push(intakeUrl));
  }

  const products = useMemo(() => {
    const surveyCategory = checkout?.surveyCategory;

    // Show products based on survey category
    if (surveyCategory === 'longevity') {
      return [data.nad_plans].filter(Boolean);
    }

    if (surveyCategory === 'weight_loss') {
      return [data.olympiaPlans, data.glp_1_gip_plans, data.glp_1_plans].filter(Boolean);
    }

    // If no category, show all products
    return [data.olympiaPlans, data.glp_1_gip_plans, data.glp_1_plans, data.nad_plans].filter(Boolean);
  }, [data, checkout?.surveyCategory]);

  useEffect(() => {
    // Update product whenever selectedProduct changes (not just when product is empty)
    // This ensures that when a user selects a new product on an ad page, it's reflected here
    if (selectedProduct?.id && selectedProduct.id !== product?.id) {
      // Get all products based on survey category
      const surveyCategory = checkout?.surveyCategory;
      let allProducts;

      if (surveyCategory === 'longevity') {
        allProducts = [data.nad_plans].filter(Boolean);
      } else if (surveyCategory === 'weight_loss') {
        allProducts = [data.olympiaPlans, data.glp_1_gip_plans, data.glp_1_plans].filter(Boolean);
      } else {
        // No category - search all products
        allProducts = [data.olympiaPlans, data.glp_1_gip_plans, data.glp_1_plans, data.nad_plans].filter(Boolean);
      }

      for (const planGroup of allProducts) {
        if (planGroup) {
          const foundProduct = planGroup.products.find((p) => p.id === selectedProduct.id);
          if (foundProduct) {
            setProduct(selectedProduct);
            setDisplayName(planGroup.summaryText);
            break;
          }
        }
      }
    }
  }, [selectedProduct, data, product?.id, checkout?.surveyCategory]);

  // Handle error messages from query params
  useEffect(() => {
    if (error === 'checkout_token_expired') {
      toast.error(
        'Your checkout session has expired. Please select a plan to continue or start a new checkout session.',
        {
          duration: 5000,
        }
      );
      // Clean up the URL by removing the error param, but preserve other params
      const shouldUseGoogleMerchant = source === GOOGLE_MERCHANT_SOURCE;
      const baseUrl = shouldUseGoogleMerchant
        ? ROUTES.PRODUCT_SUMMARY_GOOGLE_MERCHANT
        : ROUTES.PRODUCT_SUMMARY;

      // Preserve sale_type and overrideTime
      const params = new URLSearchParams();
      if (shouldUseGoogleMerchant) params.set('source', GOOGLE_MERCHANT_SOURCE);
      if (saleType) params.set('sale_type', saleType);
      if (overrideTime) params.set('overrideTime', 'true');

      const cleanUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
      router.replace(cleanUrl);
    }
  }, [error, router, source, saleType, overrideTime]);

  // Fetch flash sale discounts for all products
  useEffect(() => {
    if (isLoadingCoupons) return;

    // Collect all priceIds from all products
    const allPriceIds: string[] = [];
    const allProducts = [data.olympiaPlans, data.glp_1_gip_plans, data.glp_1_plans, data.nad_plans].filter(Boolean);

    for (const planGroup of allProducts) {
      if (planGroup?.products) {
        for (const prod of planGroup.products) {
          const priceId = prod.prices?.[0]?.priceId;
          if (priceId) {
            allPriceIds.push(priceId);
          }
        }
      }
    }

    if (allPriceIds.length > 0) {
      fetchDiscountsForProducts(allPriceIds).then(setDiscounts);
    }
  }, [data, isLoadingCoupons, fetchDiscountsForProducts]);

  return (
    <>
      <div className='container'>
        <button
          type='button'
          onClick={handleBack}
          disabled={isPending}
          className={
            (isPending ? '' : 'text-primary ') + 'd-inline-flex cursor-pointer align-items-center gap-2 btn-no-style'
          }
        >
          {isPending ? <Spinner className='border-2' size='sm' /> : <IoChevronBackOutline size={20} />}
          Back
        </button>
      </div>

      {/* <div className='product-summary-stepper'>
        <div className='product-summary-step'>
          <div className='product-summary-step-circle active'>1</div>
          <div>Program</div>
        </div>
        <div className='product-summary-step'>
          <div className='product-summary-step-circle'>2</div>
          <div>Payment</div>
        </div>
        <div className='product-summary-step'>
          <div className='product-summary-step-circle'>3</div>
          <div>Confirmation</div>
        </div>
      </div> */}
      <div className='container row d-flex- align-items-center justify-content-center mx-auto md:tw-mb-5 tw-mb-0'>
        <div className='col-12 col-lg-7'>
          <h1 className='tw-text-center md:tw-text-[40px] tw-text-[32px] tw-font-bold tw-mb-4 md:tw-font-primary tw-font-lumitype md:tw-mt-0 tw-mt-4'>
            {renderTextWRTGoogleMerchant({
              text: 'Choose a plan that fits your journey',
              googleMerchantText: 'Choose What Fits Your Journey',
            })}
          </h1>
          <p className='product-summary-subheading'>
            {`${renderTextWRTGoogleMerchant({
              text: 'Select a plan',
              googleMerchantText: 'Select what works',
            })} based on your goals and commitment level—whether you're just starting out or aiming for
            long-term results.`}
          </p>
        </div>
      </div>

      <div className='container d-flex flex-column gap-5 mb-5'>
        {products.map(
          (p) =>
            p && (
              <SummaryProductCard
                key={p.displayName}
                displayName={displayName}
                product={p}
                selectedSummaryProduct={product}
                source={source}
                discounts={discounts}
                onSelect={(name, prod) => {
                  if (prod) {
                    dispatch(setProductType(prod));
                    setProduct(prod);
                    setDisplayName(name);
                  }
                }}
              />
            )
        )}
      </div>

      {/* Bottom Popup */}
      {selectedProduct?.id && product?.id && (
        <BottomPopup
          displayName={displayName}
          product={product}
          onClose={handleClose}
          flow={flow}
          source={source}
          discount={product.prices?.[0]?.priceId ? discounts[product.prices[0].priceId] : undefined}
          overrideTime={overrideTime}
          saleType={saleType}
        />
      )}
      <div className='product-summary-cta-wrapper'>
        <section id='cta' className='container py-5'>
          <div className='fs-5 text-dark mb-5'>
            <p className='mb-5 Question-title-bar'>Have Questions?</p>
            <p className='text-center'>
              Book a free appointment with one
              <br className='d-md-none' /> of our experts.
            </p>
            {/* <link href='https://assets.calendly.com/assets/external/widget.css' rel='stylesheet' /> */}
            <button
              onClick={() => {
                window.open('https://calendly.com/lumimeds/15min', '_blank');
              }}
              className='btn btn-primary rounded-pill text-lg px-4 py-3 fw-medium appointment-button product-summary-book-appointment-btn'
            >
              Book an Appointment
            </button>
          </div>
        </section>
        <Certification />
      </div>
    </>
  );
}
