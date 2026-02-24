'use client';

import Link from 'next/link';
import Image from 'next/image';
import VideoConsultation from '@/assets/svg/video-on.svg';
import AlertIcon from '@/assets/Alert_Icon.png';
import VideAppointmentModal from '@/components/Checkout/VideAppointmentModal';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { formatToUSD } from '@/lib/helper';
import { PopupAlertModal } from '@/components/Checkout/PopupAlertModal';
import { ROUTES } from '@/constants';
import { ProductType, resetProductType } from '@/store/slices/productTypeSlice';
import { ProductImage } from '@/components/ProductImage';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { PlanType } from '@/types/medications';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { microsoftTrackPurchase } from '@/helpers/uetTracking';
import { trackCheckoutCompleted } from '@/helpers/hotjarTracking';
import { shouldShowCalendlyFeature, shouldHideCalendlyFeature } from '@/helpers/featureFlags';
import { formatUSDateTimeCompactHyphen } from '@/helpers/dateFormatter';
import { FillIntakeFormModal } from './includes/FillIntakeFormModal';
import { client } from '@/lib/baseQuery';

export default function CheckoutSuccess() {
  const router = useRouter();
  const dispatch = useDispatch();
  const hasLoggedCheckoutSuccessRef = useRef(false);

  const checkout = useSelector((state: RootState) => state.checkout);

  const { product, showVideoConsultation, paymentMethod, userEmail } = checkout || {};
  
  // Get source and other params from URL
  const [source, setSource] = useState<string | null>(null);
  const hasPreservedParams = useRef(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasPreservedParams.current) {
      const params = new URLSearchParams(window.location.search);
      const sourceParam = params.get('source');
      setSource(sourceParam);
      
      // Preserve all URL params (priceId, mode, flow, source) in the URL
      const currentParams = new URLSearchParams(window.location.search);
      const paramsToPreserve = ['priceId', 'mode', 'flow', 'source'];
      
      // Check if we need to preserve any params that might be missing
      // (This ensures params are visible in the URL bar)
      const newParams = new URLSearchParams();
      paramsToPreserve.forEach(key => {
        const value = currentParams.get(key);
        if (value) {
          newParams.set(key, value);
        }
      });
      
      // If we have params to preserve, ensure they're in the URL
      if (newParams.toString() && newParams.toString() !== currentParams.toString()) {
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        router.replace(newUrl, { scroll: false });
        hasPreservedParams.current = true;
      } else if (newParams.toString() && window.location.search !== `?${newParams.toString()}`) {
        // Params exist but URL doesn't match - update it
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        router.replace(newUrl, { scroll: false });
        hasPreservedParams.current = true;
      } else {
        hasPreservedParams.current = true;
      }
    }
  }, [router]);

  const isCalendlyEnabled = shouldShowCalendlyFeature(userEmail);
  const isCalendlyDisabled = shouldHideCalendlyFeature(userEmail);

  const [showMedicalIntakeModal, setShowMedicalIntakeModal] = useState(true);
  const [showVideoConsultModal, setShowVideoConsultModal] = useState(false);
  const [showFillIntakeFormModal, setShowFillIntakeFormModal] = useState(true);

  const handleMedicalIntakeClose = () => {
    setShowMedicalIntakeModal(false);
  };

  const medicalIntakeContent = {
    icon: AlertIcon,
    title: 'Fill Intake Form',
    alertBox: {
      backgroundColor: '#BF3F44',
      title: 'Medical Intake Required',
      description: 'To complete your order, please fill out the Medical Intake Form first',
    },
    footerContent: {
      buttons: [
        {
          label: 'Step by step guide',
          onClick: handleMedicalIntakeClose,
        },
        {
          label: 'Fill Intake Form',
          onClick: () => {
            if (checkout.medicalFormUrl) {
              window.open(checkout.medicalFormUrl, '_blank');
            }
          },
        },
      ],
    },
  };

  // Helper function to get price amount from either product type
  const getProductPriceAmount = (product: ProductType | null): number => {
    if (product) {
      return product.prices?.[0]?.amount ?? 0;
    }
    return 0;
  };

  // Raw monetary values (already in USD)
  const rawAmount = checkout.originalAmount ?? getProductPriceAmount(product) ?? checkout.intakeAmount ?? 0;

  const rawDiscount = checkout.discountAmount ?? 0;

  // Calculate totals in USD
  const amountDollars = rawAmount;
  const discountDollars = rawDiscount;
  const totalDollars = amountDollars - discountDollars;

  // Format via helper (expects cents, so convert USD to cents)
  console.log('TOTAL DOLLARS IN AMOUNT DOLLARS BEFORE FORMAT ===>', amountDollars);
  // console.log('TOTAL DOLLARS IN DISCOUNT DOLLARS BEFORE FORMAT', discountDollars);
  // console.log('TOTAL DOLLARS IN TOTAL DOLLARS BEFORE FORMAT', totalDollars);

  const subtotalStr = formatToUSD(amountDollars * 100);
  const discountStr = formatToUSD(discountDollars * 100);
  const totalStr = formatToUSD(totalDollars * 100);
  
  // console.log('TOTAL DOLLARS IN SUBTOTAL STR AFTER FORMAT', subtotalStr);
  // console.log('TOTAL DOLLARS IN DISCOUNT STR AFTER FORMAT', discountStr);
  console.log('TOTAL DOLLARS IN TOTAL STR AFTER FORMAT ===>', totalStr);
  
  const totalLabel = product?.metadata
    ? `Total For ${product?.metadata.intervalCount} ${product?.metadata.billingInterval || 'month'}/s`
    : 'Total';

  async function logCheckoutSuccess() {
    try {
      // Firebase Analytics tracking
      console.log('TOTAL DOLLARS IN LOG CHECKOUT SUCCESS ===>', totalDollars);
      await trackSurveyAnalytics({
        event: 'checkout_success',
        payload: {
          invoice_id: checkout.invoiceId || '',
          value: totalDollars,
          currency: 'USD',
          product_id: product?.id || '',
          product_name: product?.name || '',
        },
      });

      // Microsoft UET Purchase tracking
      console.log('TOTAL DOLLARS IN MICROSOFT TRACK PURCHASE ===>', totalDollars);
      console.log('TYPE OF AMOUNT SENT TO MICROSOFT TRACK PURCHASE ===>', typeof totalDollars);
      microsoftTrackPurchase(checkout.invoiceId || '', totalDollars, 'USD', [
        {
          id: product?.id || '',
          name: product?.name || '',
          price: totalDollars,
          quantity: 1,
        },
      ]);

      // Hotjar tracking for checkout completion
      console.log('TOTAL DOLLARS IN HOTJAR TRACK CHECKOUT COMPLETED ===>', totalDollars);
      trackCheckoutCompleted([product?.id || ''], totalDollars, {
        invoiceId: checkout.invoiceId || '',
        productName: product?.name || '',
        paymentMethod: paymentMethod || 'Card',
      });

      hasLoggedCheckoutSuccessRef.current = true;
    } catch (error) {
      console.log('Error logging checkout success:', error);
    }
  }

  useEffect(() => {
    if (isCalendlyEnabled && showVideoConsultation) {
      setShowVideoConsultModal(true);
    } else {
      setShowVideoConsultModal(false);
    }
  }, [showVideoConsultation, isCalendlyEnabled, userEmail]);

  // Fire analytics event once on successful checkout
  useEffect(() => {
    if (checkout.invoiceId && !hasLoggedCheckoutSuccessRef.current) {
      logCheckoutSuccess();
    }
  }, [checkout.invoiceId]); // Only depend on invoiceId to prevent duplicate fires

  useEffect(() => {
    if (!checkout.invoiceId) {
      router.push(ROUTES.HOME);
    }
  }, [checkout.invoiceId, router]);

  useEffect(() => {
    if (checkout.medicalFormUrl) {
      setShowMedicalIntakeModal(!isCalendlyEnabled);
    }

    if (window) {
      window.scrollTo({ top: 0 });
    }
    // Check the flag for Intake Form step
  }, [router, checkout, isCalendlyEnabled, showVideoConsultation]);

  useEffect(() => {
    dispatch(resetProductType());
  }, []);

  // Check pending intake after successful checkout
  useEffect(() => {
    const checkPendingIntake = async () => {
      try {
        const email = userEmail;
        const medicineName = product?.medicineName;
        
        if (email && medicineName) {
          const response = await client.get('/patients/check-pending-intake', {
            params: { email, medicineName },
          });
          console.log('check-pending-intake response:', response.data);
        }
      } catch (error) {
        console.error('Error checking pending intake:', error);
      }
    };

    if (checkout.invoiceId && userEmail && product?.medicineName) {
      checkPendingIntake();
    }
  }, [checkout.invoiceId, userEmail, product?.medicineName]);

  if (!checkout.invoiceId) return null;

  return (
    <>
      <div className='tw-space-y-12 tw-flex tw-flex-col container tw-pb-16 tw-mt-[160px]'>
        <div className='row g-5'>
          <div className='col-lg-7'>
            <div className='tw-flex tw-flex-col tw-flex-grow tw-gap-y-4 pe-lg-5'>
              <p className='tw-text-3xl tw-font-bold'>Thank you for your purchase!</p>
              <div className='space-y-2'>
                <p className='tw-text-2xl tw-font-bold mb-2'>Payment Received!</p>
                <p className='m-0 tw-text-2xl'>Thank you for trusting LumiMeds. A receipt has been emailed to you.</p>
              </div>

              {/* Only show inline video consultation message when Calendly is NOT enabled */}
              {showVideoConsultation && isCalendlyEnabled ? (
                <div className='bg-dark d-flex gap-3 text-white p-3 rounded space-y-2'>
                  <Image src={VideoConsultation} alt='Video Consultation' className='-tw-mt-[52px]' />

                  <div className='d-flex flex-column gap-1'>
                    <span className='tw-font-semibold'>Video Consultation Required</span>
                    <span>
                      Your state requires a video consultation with a physician. You will receive an email shortly with
                      a link to schedule your video visit
                    </span>
                  </div>
                </div>
              ) : null}

              {isCalendlyDisabled ? (
                <div className='px-4 py-3 rounded text-white' style={{ backgroundColor: '#CE5E62' }}>
                  <div className='d-flex align-items-start gap-3 mb-4'>
                    <IoIosInformationCircleOutline size={24} className='flex-shrink-0 mt-1' />
                    <div>
                      <div className='fw-semibold h5 mb-2'>Medical Intake Required</div>
                      <div className='mb-0 opacity-75'>
                        To complete your order, please fill out the Medical Intake Form
                      </div>
                      <div className='py-3'>
                        <a
                          className='btn btn-primary rounded-pill px-4 py-2 fw-semibold'
                          target='_blank'
                          href={checkout.medicalFormUrl}
                        >
                          Fill Intake Form
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className='col-lg-5'>
            <div className='tw-flex tw-flex-col tw-flex-grow tw-gap-y-4 h-100'>
              <div className='tw-flex-grow border-bottom pb-3'>
                <p className='tw-text-3xl pb-4 mb-4 border-bottom'>Order Summary</p>
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center gap-3'>
                    <ProductImage
                      image={product?.image || ''}
                      className='checkout_product_image border rounded-2'
                      alt={product?.name || 'Product Image'}
                    />
                    <span>
                      <span className='fw-bold text-capitalize'>
                        {`${product?.category || ''} ${product?.medicineName || ''} ${
                          source === 'google-merchant' 
                            ? (product?.dosageType || '').replace(/\s*Injections?/gi, '')
                            : product?.dosageType || ''
                        }${source === 'google-merchant' ? '' : 's'}`}
                      </span>

                      <br />
                      <span className='text-sm text-capitalize'>
                        {product?.durationText}{' '}
                        {product?.planType === PlanType.RECURRING ? '- Cancel Anytime' : '- One-Time Purchase'}{' '}
                      </span>
                    </span>
                  </div>
                  <span className='fw-semibold text-nowrap'>{formatToUSD(getProductPriceAmount(product) * 100)}</span>
                </div>
                <div className='mt-4 d-flex align-items-center justify-content-between'>
                  <span className='fw-semibold'>Payment</span>
                  <span>{paymentMethod}</span>
                </div>
                <div className='mt-2 d-flex align-items-center justify-content-between'>
                  <span className='fw-semibold'>Date & Time</span>
                  <span>{formatUSDateTimeCompactHyphen(new Date())}</span>
                </div>
              </div>

              <div className='tw-flex tw-justify-between'>
                <span className='tw-text-base fw-semibold'>Subtotal</span>
                <span className='tw-text-base'>{subtotalStr}</span>
              </div>

              {discountDollars > 0 && (
                <div className='tw-flex tw-justify-between'>
                  <span className='tw-text-base fw-semibold'>Discount</span>
                  <span className='tw-text-base'>-{discountStr}</span>
                </div>
              )}

              <div className='tw-flex tw-justify-between'>
                <span className='tw-text-base fw-semibold'>{totalLabel}</span>
                <span className='tw-text-base'>{totalStr}</span>
              </div>

              <Link href={ROUTES.PATIENT_LOGIN} className='btn btn-primary py-2 rounded-pill fw-bold mt-2'>
                Login now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PopupAlertModal show={showMedicalIntakeModal} onHide={handleMedicalIntakeClose} content={medicalIntakeContent} />

      <VideAppointmentModal show={showVideoConsultModal} onHide={() => setShowVideoConsultModal(false)} />

      <FillIntakeFormModal isOpen={showFillIntakeFormModal} onClose={() => setShowFillIntakeFormModal(false)} />
    </>
  );
}
