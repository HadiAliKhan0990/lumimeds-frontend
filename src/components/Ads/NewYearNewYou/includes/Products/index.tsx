'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState, useMemo, useTransition } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { getRoundedPrice } from '@/helpers/products';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import klarna from '@/assets/ads/new-year-new-you/klarna.png';
import b1Image from '@/assets/ads/new-year-new-you/b-1.png';
import b2Image from '@/assets/ads/new-year-new-you/b-2.png';
import b3Image from '@/assets/ads/new-year-new-you/b-3.png';
import b4Image from '@/assets/ads/new-year-new-you/b-4.png';
import b5Image from '@/assets/ads/new-year-new-you/b-5.png';

// Static product configuration templates
const productConfigs = [
  {
    id: 1,
    backgroundImage: b1Image,
    gradient:
      'linear-gradient(131deg, rgba(131,172,240,0.78) 15.05%, rgba(201,215,249,0.78) 55%, rgba(172,210,255,0.78) 96.67%)',
    paddingY: 'tw-py-11',
    badge: null,
    subtitle: null,
    title: {
      prefix: 'Compounded',
      main: 'Semaglutide',
      suffix: '(GLP-1)',
      suffixBlock: false,
    },
    description: 'Weight Loss Injection',
    priceSectionMargin: 'tw-mt-6',
    textColor: 'tw-text-#222A3F',
    buttonBg: 'tw-bg-[#F3FF53]',
    buttonTextColor: '',
    // Product matching criteria
    productType: 'glp_1',
    isMicrodose: false,
    intervalCount: 1,
  },
  {
    id: 2,
    backgroundImage: b2Image,
    gradient:
      'linear-gradient(131deg, rgba(131,172,240,0.78) 15.05%, rgba(201,215,249,0.78) 55%, rgba(172,210,255,0.78) 96.67%)',
    paddingY: 'tw-py-11',
    badge: null,
    subtitle: null,
    title: {
      prefix: 'Compounded',
      main: 'Tirzepatide',
      suffix: '(GLP-1/GIP)',
      suffixBlock: false,
    },
    description: 'Weight Loss Injection',
    priceSectionMargin: 'tw-mt-6',
    textColor: 'tw-text-#222A3F',
    buttonBg: 'tw-bg-[#F3FF53]',
    buttonTextColor: '',
    // Product matching criteria
    productType: 'glp_1_gip',
    isMicrodose: false,
    intervalCount: 1,
  },
  {
    id: 3,
    backgroundImage: b3Image,
    gradient: 'linear-gradient(131deg, #222A3F 15.05%, #7D92C8 55.26%, #FFF 97.47%)',
    paddingY: 'tw-py-6',
    badge: { text: 'NEW! Microdose', bg: 'tw-bg-blue-46' },
    subtitle: 'Microdosed',
    title: {
      prefix: 'Compounded',
      main: 'Semaglutide',
      suffix: '(GLP-1)',
      suffixBlock: false,
    },
    description: null,
    priceSectionMargin: 'tw-mt-6',
    textColor: 'tw-text-white',
    buttonBg: 'tw-bg-[#F3FF53]',
    buttonTextColor: '',
    // Product matching criteria
    productType: 'glp_1',
    isMicrodose: true,
    intervalCount: 1,
  },
  {
    id: 4,
    backgroundImage: b4Image,
    gradient: 'linear-gradient(131deg, #222A3F 15.05%, #7D92C8 55.26%, #FFF 97.47%)',
    paddingY: 'tw-py-6',
    badge: { text: 'NEW! Microdose', bg: 'tw-bg-blue-46' },
    subtitle: 'Microdosed',
    title: {
      prefix: 'Compounded',
      main: 'Tirzepatide',
      suffix: '(GLP-1/GIP)',
      suffixBlock: true,
    },
    description: null,
    priceSectionMargin: 'tw-mt-2',
    textColor: 'tw-text-white',
    buttonBg: 'tw-bg-[#F3FF53]',
    buttonTextColor: '',
    // Product matching criteria
    productType: 'glp_1_gip',
    isMicrodose: true,
    intervalCount: 1,
  },
  {
    id: 5,
    backgroundImage: b5Image,
    gradient: 'linear-gradient(131deg, rgba(70, 133, 244, 0.78) 25.74%, rgba(243, 255, 83, 0.78) 75.96%)',
    paddingY: 'tw-py-6',
    badge: { text: 'NEW! Longevity', bg: 'tw-bg-black-22' },
    subtitle: null,
    title: {
      prefix: 'NAD+',
      main: 'Injections',
      suffix: '(nicotinamide',
      suffixBlock: true,
      suffix2: 'adenine dinucleotide)',
      isSpecial: true,
    },
    description: null,
    priceSectionMargin: 'tw-mt-6',
    textColor: 'tw-text-white',
    buttonBg: 'tw-bg-blue-46',
    buttonTextColor: 'tw-text-white',
    // NAD+ product - static for now as it may not be in API
    isNAD: true,
    staticPrice: '$166',
  },
];

const planFeatures = [
  {
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' fill='none'>
        <path
          stroke='#3060FE'
          strokeLinecap='round'
          strokeWidth='2.36'
          d='M4.72 15.731v6.293c0 2.966 0 4.45.922 5.37.922.922 2.405.922 5.371.922h15.731c2.966 0 4.45 0 5.371-.921.922-.922.922-2.405.922-5.371v-7.866c0-4.45 0-6.674-1.383-8.056-1.382-1.383-3.607-1.383-8.056-1.383h-9.439c-4.45 0-6.674 0-8.056 1.383-.77.77-1.112 1.803-1.263 3.337M34.61 33.035h-9.438m-22.024 0H18.88M23.597 23.597h-9.439'
        />
      </svg>
    ),
    text: 'Initial Telehealth Visit',
  },
  {
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' fill='none'>
        <path
          stroke='#3060FE'
          strokeWidth='2.221'
          d='M12.586 5.506a2.36 2.36 0 0 1 2.36-2.36h7.865a2.36 2.36 0 0 1 2.36 2.36v1.573a2.36 2.36 0 0 1-2.36 2.36h-7.865a2.36 2.36 0 0 1-2.36-2.36V5.506Z'
        />
        <path
          stroke='#3060FE'
          strokeLinecap='round'
          strokeWidth='2.221'
          d='M23.597 20.45h-4.72m0 0h-4.719m4.72 0v-4.719m0 4.72v4.719M33.037 25.17c0 4.45 0 6.674-1.383 8.057-1.382 1.382-3.607 1.382-8.056 1.382h-9.439c-4.45 0-6.674 0-8.056-1.382-1.382-1.383-1.382-3.607-1.382-8.057v-4.72M25.17 6.297c3.422.019 5.275.17 6.483 1.38 1.383 1.381 1.383 3.606 1.383 8.056v3.146M12.587 6.296c-3.422.019-5.275.17-6.484 1.38-1.209 1.208-1.36 3.06-1.38 6.482'
        />
      </svg>
    ),
    text: 'Prescription + Medication delivered to your door',
  },
  {
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' fill='none'>
        <path
          fill='#3060FE'
          d='M1.967 16.518a1.18 1.18 0 0 0 2.36 0h-2.36Zm2.868 8.064a1.18 1.18 0 0 0-2.18.903l2.18-.903Zm16.767 9.664.853-1.44-2.03-1.203-.853 1.441 2.03 1.202Zm-6.302-1.44.853 1.44 2.03-1.202-.852-1.44-2.03 1.201Zm4.272.238c-.303.512-1.085.512-1.389 0l-2.03 1.202c1.217 2.056 4.233 2.056 5.45 0l-2.031-1.202ZM16.518 4.326h4.72v-2.36h-4.72v2.36ZM33.43 16.518v1.573h2.36v-1.573h-2.36ZM12.275 28.696c-1.975-.034-3.01-.16-3.821-.496l-.903 2.18c1.266.525 2.708.641 4.683.675l.04-2.36Zm-9.62-3.211a9.046 9.046 0 0 0 4.896 4.895l.903-2.18a6.686 6.686 0 0 1-3.619-3.618l-2.18.903ZM33.43 18.09c0 1.848 0 3.176-.072 4.223-.07 1.037-.207 1.713-.437 2.268l2.18.903c.369-.89.532-1.853.611-3.01.078-1.147.078-2.568.078-4.384h-2.36Zm-7.908 12.964c1.975-.034 3.418-.15 4.684-.675l-.903-2.18c-.811.336-1.846.462-3.821.496l.04 2.36Zm7.4-6.473A6.686 6.686 0 0 1 29.3 28.2l.904 2.18a9.046 9.046 0 0 0 4.895-4.895l-2.18-.903ZM21.236 4.326c2.598 0 4.463.001 5.918.14 1.438.136 2.352.398 3.081.845L31.47 3.3c-1.162-.712-2.48-1.03-4.09-1.183-1.593-.15-3.59-.15-6.142-.15v2.36ZM35.79 16.518c0-2.552 0-4.55-.15-6.142-.154-1.61-.471-2.928-1.183-4.09l-2.012 1.232c.447.73.709 1.644.845 3.082.139 1.455.14 3.32.14 5.918h2.36ZM30.236 5.31a6.684 6.684 0 0 1 2.208 2.207l2.012-1.233A9.045 9.045 0 0 0 31.469 3.3l-1.233 2.012ZM16.518 1.966c-2.552 0-4.549 0-6.141.15-1.61.154-2.929.471-4.091 1.183l1.233 2.012c.73-.447 1.644-.709 3.081-.845 1.455-.139 3.32-.14 5.918-.14v-2.36ZM4.326 16.518c0-2.598.002-4.463.14-5.918.137-1.438.399-2.352.846-3.082L3.3 6.285c-.712 1.163-1.03 2.481-1.183 4.091-.151 1.593-.15 3.59-.15 6.142h2.36Zm1.96-13.219A9.045 9.045 0 0 0 3.3 6.285l2.012 1.233a6.686 6.686 0 0 1 2.207-2.207L6.286 3.3Zm11.045 28.304c-.32-.54-.6-1.015-.873-1.39-.287-.393-.616-.748-1.073-1.014L14.2 31.24c.074.043.176.122.352.364.191.262.407.624.75 1.202l2.03-1.202Zm-5.097-.548c.69.012 1.128.02 1.462.058.311.034.432.085.503.126l1.186-2.04c-.46-.268-.94-.377-1.43-.432-.468-.051-1.034-.06-1.68-.071l-.041 2.36Zm10.221 1.75c.342-.578.558-.94.749-1.202.176-.242.278-.32.352-.364l-1.186-2.04c-.457.266-.786.62-1.073 1.014-.273.375-.553.85-.872 1.39l2.03 1.202Zm3.026-4.11c-.647.012-1.213.02-1.681.072-.49.055-.97.164-1.43.432l1.186 2.04c.071-.041.192-.092.504-.126.333-.037.77-.046 1.461-.058l-.04-2.36Z'
        />
        <path
          stroke='#3060FE'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2.221'
          d='M12.586 17.304h.014m6.264 0h.014m6.279 0h.014'
        />
      </svg>
    ),
    text: 'Real-Time Physician Support',
  },
  {
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' fill='none'>
        <path
          stroke='#3060FE'
          strokeLinecap='round'
          strokeWidth='2.221'
          d='M28.318 25.17h-3.146m0 0h-3.147m3.147 0v-3.146m0 3.146v3.146M11.012 6.293v-2.36M26.744 6.293v-2.36M33.824 14.158H16.913m-13.765 0h6.096M22.026 34.609h-6.293c-5.932 0-8.899 0-10.742-1.843-1.843-1.843-1.843-4.81-1.843-10.742v-3.146c0-5.933 0-8.9 1.843-10.742 1.843-1.843 4.81-1.843 10.742-1.843h6.293c5.932 0 8.899 0 10.742 1.843 1.843 1.843 1.843 4.809 1.843 10.742v3.146c0 5.932 0 8.899-1.843 10.742-1.028 1.027-2.405 1.482-4.45 1.683'
        />
      </svg>
    ),
    text: 'Remote Monthly Check-Ins',
  },
];

interface Props {
  data: ProductTypesResponseData;
}

export default function Products({ data }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [, startTransition] = useTransition();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  // Helper function to check if product is microdose
  const isMicrodoseProduct = (product: ProductType): boolean => {
    const name = (product.name || '').toLowerCase();
    const displayName = (product.displayName || '').toLowerCase();
    const medicineName = (product.medicineName || '').toLowerCase();
    return name.includes('microdose') || displayName.includes('microdose') || medicineName.includes('microdose');
  };

  // Map API products to static configurations
  const mappedProducts = useMemo(() => {
    const glp1Products = data?.glp_1_plans?.products || [];
    const glp1GipProducts = data?.glp_1_gip_plans?.products || [];

    // Filter products with active prices
    const activeGLP1Products = glp1Products.filter((p) => p.prices?.some((price) => price.isActive));
    const activeGLP1GipProducts = glp1GipProducts.filter((p) => p.prices?.some((price) => price.isActive));

    return productConfigs.map((config) => {
      let matchedProduct: ProductType | null = null;
      let price = config.staticPrice || '$0';

      if (config.isNAD) {
        // NAD+ product - use static price for now
        price = config.staticPrice || '$166';
      } else {
        // Find matching product based on criteria
        const sourceProducts = config.productType === 'glp_1' ? activeGLP1Products : activeGLP1GipProducts;

        // For cards 1 and 2 (GLP-1 and GLP-1/GIP), prioritize starter plans
        if (config.id === 1 || config.id === 2) {
          // Find starter plan first
          const starterProduct = sourceProducts.find((product) => {
            const matchesType = true; // Already filtered by source
            const matchesMicrodose = config.isMicrodose === isMicrodoseProduct(product);
            const matchesStarter = product.metadata?.planTier === 'starter';
            return matchesType && matchesMicrodose && matchesStarter;
          });

          if (starterProduct) {
            matchedProduct = starterProduct;
            price = `$${getRoundedPrice(starterProduct.dividedAmount)}`;
          } else {
            // Fallback to existing logic if no starter plan found
            matchedProduct =
              sourceProducts.find((product) => {
                const matchesType = true; // Already filtered by source
                const matchesMicrodose = config.isMicrodose === isMicrodoseProduct(product);
                const matchesInterval = product.metadata?.intervalCount === config.intervalCount;
                const isMonthly =
                  product.metadata?.intervalCount === 1 && product.metadata?.billingInterval === 'month';

                return matchesType && matchesMicrodose && (matchesInterval || isMonthly);
              }) || null;

            if (matchedProduct) {
              price = `$${getRoundedPrice(matchedProduct.dividedAmount)}`;
            } else {
              // Fallback: find any product of the same type
              const fallbackProduct =
                sourceProducts.find((product) => {
                  const matchesMicrodose = config.isMicrodose === isMicrodoseProduct(product);
                  return matchesMicrodose;
                }) || sourceProducts[0];

              if (fallbackProduct) {
                matchedProduct = fallbackProduct;
                price = `$${getRoundedPrice(fallbackProduct.dividedAmount)}`;
              }
            }
          }
        } else {
          // Existing logic for other cards (3, 4, 5)
          matchedProduct =
            sourceProducts.find((product) => {
              const matchesType = true; // Already filtered by source
              const matchesMicrodose = config.isMicrodose === isMicrodoseProduct(product);
              const matchesInterval = product.metadata?.intervalCount === config.intervalCount;
              const isMonthly = product.metadata?.intervalCount === 1 && product.metadata?.billingInterval === 'month';

              return matchesType && matchesMicrodose && (matchesInterval || isMonthly);
            }) || null;

          if (matchedProduct) {
            price = `$${getRoundedPrice(matchedProduct.dividedAmount)}`;
          } else {
            // Fallback: find any product of the same type
            const fallbackProduct =
              sourceProducts.find((product) => {
                const matchesMicrodose = config.isMicrodose === isMicrodoseProduct(product);
                return matchesMicrodose;
              }) || sourceProducts[0];

            if (fallbackProduct) {
              matchedProduct = fallbackProduct;
              price = `$${getRoundedPrice(fallbackProduct.dividedAmount)}`;
            }
          }
        }
      }

      return {
        ...config,
        product: matchedProduct,
        price,
      };
    });
  }, [data]);

  const handleNavigation = async (productId: number) => {
    const mappedProduct = mappedProducts.find((p) => p.id === productId);
    const product = mappedProduct?.product;

    // Set loading state using config id (works for all products including NAD+)
    setLoadingProductId(productId.toString());

    if (!product) {
      // If no product matched (e.g., NAD+), just navigate to intake
      try {
        startTransition(() => router.push(ROUTES.PATIENT_INTAKE));
        // Don't reset loading state on success - keep spinner visible until navigation completes
      } catch (error) {
        console.error('Navigation error:', error);
        setLoadingProductId(null);
      }
      return;
    }

    try {
      await handleVerifyRedirectToCheckout({
        selectedProduct,
        product,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
      });

      // Don't reset loading state on success - keep spinner visible until navigation completes
    } catch (error) {
      console.error('Navigation error:', error);
      setLoadingProductId(null);
    }
  };

  const renderProductTitle = (title: (typeof productConfigs)[0]['title'], textColor: string) => {
    if (title.isSpecial) {
      return (
        <h4 className={`md:tw-text-[28px] tw-text-[25px] tw-font-bold tw-mb-0 ${textColor}`}>
          {title.prefix}
          <div className='tw-block'>
            {title.main} <span className='tw-text-base'>({title.suffix}</span>
            <span className='tw-block tw-text-base'>{title.suffix2})</span>
          </div>
        </h4>
      );
    }

    return (
      <h4 className={`md:tw-text-[28px] tw-text-[25px] tw-font-bold tw-mb-0 ${textColor}`}>
        {title.prefix}
        <span className='tw-block'>
          {title.main} <span className={`tw-text-[13px] ${title.suffixBlock ? 'tw-block' : ''}`}>{title.suffix}</span>
        </span>
      </h4>
    );
  };

  return (
    <div className='tw-bg-[#E8F0FF]'>
      <div className='tw-flex tw-flex-col tw-px-5 lg:tw-max-w-[1440px] md:tw-max-w-full tw-mx-auto tw-w-full md:tw-pt-28 md:tw-pb-32 tw-pb-16 tw-pt-16 tw-text-#222A3F'>
        <div className='tw-w-full'>
          <h2 className='tw-font-normal tw-text-5xl tw-leading-[120%] tw-text-#222A3F tw-text-center md:tw-mb-3 tw-mb-8'>
            Discover the Right Plan For You.
          </h2>
          <div className='tw-max-w-[668px] tw-w-full tw-mx-auto'>
            <p className='tw-font-normal tw-text-xl tw-font-lato tw-leading-normal tw-text-#222A3F tw-text-center tw-mb-3'>
              LumiMeds offers a variety of injectables that help with weight loss.
            </p>
            <div className='tw-flex tw-justify-center tw-gap-4 tw-items-center'>
              <Image src={klarna} alt='klarna' className='tw-w-[44px] tw-h-[25px]' />
              <p className='tw-font-normal tw-font-lato tw-text-xl tw-leading-normal tw-text-#222A3F tw-text-center tw-mb-0'>
                available on select plans.
              </p>
            </div>
          </div>
        </div>

        <div className='tw-w-full tw-max-w-[834px] tw-mx-auto tw-my-8'>
          <div className='tw-grid md:tw-grid-cols-2 tw-grid-cols-1 tw-gap-8'>
            {mappedProducts.filter((product) => product.id === 1 || product.id === 2).map((product) => (
              <div
                key={product.id}
                className={`${product.paddingY} tw-px-7 tw-rounded-[29px] tw- tw-h-[356px] tw-w-full tw-bg-right tw-bg-no-repeat tw-relative tw-z-10`}
                style={{
                  backgroundImage: `url(${product.backgroundImage.src}), ${product.gradient}`,
                  backgroundSize: 'auto 100%',
                }}
              >
                <div>
                  {product.badge && (
                    <div
                      className={`${product.badge.bg} tw-font-lato tw-text-sm tw-text-[#F3FF53] tw-rounded-full tw-py-2 tw-px-5 tw-flex tw-justify-self-start tw-mb-3`}
                    >
                      {product.badge.text}
                    </div>
                  )}
                  {product.subtitle && (
                    <div className={`${product.textColor} tw-font-bold tw-leading-normal`}>{product.subtitle}</div>
                  )}
                  {renderProductTitle(product.title, product.textColor)}
                  {product.description && (
                    <p className={`tw-text-[13px] tw-mb-0 tw-font-bold ${product.textColor}`}>{product.description}</p>
                  )}
                </div>
                <div className={product.priceSectionMargin}>
                  <h6 className={`${product.textColor} tw-font-lato tw-uppercase tw-mb-0`}>Starting at</h6>
                  <h3 className={`tw-font-lato tw-font-bold md:tw-text-[40px] tw-text-[35px] ${product.textColor}`}>
                    {product.price}
                    <span className='tw-text-base'>/month</span>
                  </h3>
                </div>
                <button
                  type='button'
                  onClick={() => handleNavigation(product.id)}
                  disabled={loadingProductId === product.id.toString()}
                  className={`tw-text-xl tw-font-bold tw-py-2 tw-px-[22px] tw-h-12 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-absolute tw-bottom-[16px] tw-right-[17px] tw-rounded-[54.859px] ${product.buttonBg} ${product.buttonTextColor} tw-shadow-[0_4px_4px_rgba(0,0,0,0.25)] tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100`}
                >
                  {loadingProductId === product.id.toString() && <Spinner className='border-2' size='sm' />}
                  <span>Get Started</span>
                </button>
              </div>
            ))}

            <div className='md:tw-col-span-2 md:tw-py-12 md:tw-px-16 tw-py-11 tw-px-7 tw-rounded-[29px] tw-h-[356px] tw-w-full tw-bg-[linear-gradient(131deg,#D8E6FF_25.74%,#9FC1E9_75.96%)]'>
              <h4 className='md:tw-text-[28px] tw-text-[25px] tw-font-bold tw-mb-6'>All Plans Include:</h4>
              {planFeatures.map((feature, index) => (
                <div key={index} className='tw-flex tw-items-center tw-gap-4 tw-mb-4'>
                  <div>{feature.icon}</div>
                  <div className='md:tw-text-xl tw-text-lg tw-font-lato tw-font-bold'>{feature.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='tw-w-full tw-max-w-[810px] tw-mx-auto tw-text-center tw-text-sm tw-text-#222A3F tw-font-lato'>
          Prescription required. Your provider will determine whether a compounded drug product is right for you. Compounded drug products are not FDA-approved as they have not been evaluated by FDA for safety, effectiveness, or quality.
        </div>
      </div>
    </div>
  );
}
