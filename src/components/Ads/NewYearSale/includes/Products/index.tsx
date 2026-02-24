'use client';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from 'react-bootstrap';
import { useState, useMemo, useTransition } from 'react';
import { ROUTES } from '@/constants';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductType, setProductType } from '@/store/slices/productTypeSlice';
import klarna from '@/assets/ads/new-year-new-you/klarna.png';
import b1Image from '@/assets/ads/new-year-new-you/b-1.png';
import b2Image from '@/assets/ads/new-year-new-you/b-2.png';
import b5Image from '@/assets/ads/new-year-new-you/b-5.png';
import {
  GLP1_PRODUCT_NAME,
  GLP1_LABEL,
  GLP1_GIP_PRODUCT_NAME,
  GLP1_GIP_LABEL,
  WEIGHT_LOSS_INJECTIONS_LABEL,
  NAD_PRODUCT_NAME,
  INJECTIONS_LABEL,
} from '@/constants/factory';

interface ProductTitle {
  prefix?: string;
  main?: string;
  suffix?: string;
  suffix2?: string;
  suffixBlock?: boolean;
  isSpecial?: boolean;
}

interface ProductBadge {
  text: string;
  bg: string;
}

interface ProductConfig {
  id: string;
  backgroundImage: typeof b1Image;
  gradient: string;
  paddingY: string;
  badge: ProductBadge | null;
  subtitle: string | null;
  title: ProductTitle;
  description: string | null;
  priceSectionMargin: string;
  textColor: string;
  buttonBg: string;
  buttonTextColor: string;
  upfrontPayment?: string;
  isNAD?: boolean;
  price: string;
  discountedPrice?: string | null;
}

const productConfigs: ProductConfig[] = [
  {
    id: 'Tirzepatide-2',
    backgroundImage: b2Image,
    gradient:
      'linear-gradient(131deg, rgba(131,172,240,0.78) 15.05%, rgba(201,215,249,0.78) 55%, rgba(172,210,255,0.78) 96.67%)',
    paddingY: 'tw-py-11',
    badge: null,
    subtitle: null,
    title: {
      main: GLP1_GIP_PRODUCT_NAME,
      suffix: GLP1_GIP_LABEL,
      suffixBlock: false,
    },
    description: WEIGHT_LOSS_INJECTIONS_LABEL,
    priceSectionMargin: 'tw-mt-6',
    textColor: 'tw-text-#222A3F',
    buttonBg: 'tw-bg-[#F3FF53]',
    buttonTextColor: '',
    upfrontPayment: '$649 $599 upfront payment.',
    price: '$216',
    discountedPrice: '$199',
  },
  {
    id: 'Semaglutide',
    backgroundImage: b1Image,
    gradient:
      'linear-gradient(131deg, rgba(131,172,240,0.78) 15.05%, rgba(201,215,249,0.78) 55%, rgba(172,210,255,0.78) 96.67%)',
    paddingY: 'md:tw-py-11 tw-py-8',
    badge: null,
    subtitle: null,
    title: {
      main: GLP1_PRODUCT_NAME,
      suffix: GLP1_LABEL,
      suffixBlock: false,
    },
    description: WEIGHT_LOSS_INJECTIONS_LABEL,
    priceSectionMargin: 'tw-mt-6',
    textColor: 'tw-text-#222A3F',
    buttonBg: 'tw-bg-[#F3FF53]',
    buttonTextColor: '',
    upfrontPayment: '$399 $349 upfront payment.',
    price: '$133',
    discountedPrice: '$116',
  },
  {
    id: 'NAD+ Injections',
    backgroundImage: b5Image,
    gradient: 'linear-gradient(131deg, rgba(70, 133, 244, 0.78) 25.74%, rgba(243, 255, 83, 0.78) 75.96%)',
    paddingY: 'tw-py-11',
    badge: { text: 'NEW! Longevity', bg: 'tw-bg-black-22' },
    subtitle: null,
    title: {
      prefix: NAD_PRODUCT_NAME + ' ' + INJECTIONS_LABEL,
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
    isNAD: true,
    upfrontPayment: '$499 $449 upfront payment.',
    price: '$166',
    discountedPrice: '$149',
  },
];

interface Props {
  data: ProductTypesResponseData;
}

const renderProductTitle = (title: ProductTitle, textColor: string) => {
  const renderPrefix = () => {
    if (title.prefix && title.prefix.startsWith('NAD+')) {
      const rest = title.prefix.replace('NAD+', '').trim();
      return (
        <>
          NAD+
          <br />
          {rest}
        </>
      );
    }
    return title.prefix;
  };

  const renderMain = () => {
    if (title.main && title.main.includes('Compounded Tirzepatide')) {
      return (
        <>
          Compounded
          <br />
          Tirzepatide
        </>
      );
    }
    return title.main;
  };

  return (
    <h4
      className={`md:tw-text-[28px] tw-text-[5.581vw] tw-font-bold tw-font-lumitype tw-mb-0 md:tw-w-full tw-w-[88%] ${textColor}`}
    >
      {title.prefix && renderPrefix()}
      <span className='tw-inline'>
        {renderMain()}{' '}
        <span className={`tw-text-[13px] tw-inline ${title.suffixBlock ? 'tw-block' : ''}`}>{title.suffix}</span>
        {title.suffix2 && (
          <span className={`tw-text-[13px] ${title.suffixBlock ? 'tw-block' : ''}`}>{title.suffix2}</span>
        )}
      </span>
    </h4>
  );
};

export default function Products({ data }: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};

  // Map product configs to actual products from API
  const mappedProducts = useMemo(() => {
    const glp1Products =
      data?.glp_1_plans?.products?.filter(
        (p) =>
          p.prices?.some((price) => price.isActive) &&
          p.planType === 'recurring' &&
          p.metadata?.billingInterval === 'month' &&
          p.metadata?.intervalCount === 3
      ) || [];

    const glp1GipProducts =
      data?.glp_1_gip_plans?.products?.filter(
        (p) =>
          p.prices?.some((price) => price.isActive) &&
          p.planType === 'recurring' &&
          p.metadata?.billingInterval === 'month' &&
          p.metadata?.intervalCount === 3
      ) || [];

    const nadProducts =
      data?.nad_plans?.products?.filter(
        (p) =>
          p.prices?.some((price) => price.isActive) &&
          p.planType === 'recurring' &&
          p.metadata?.billingInterval === 'month' &&
          p.metadata?.intervalCount === 3
      ) || [];

    return productConfigs.map((config) => {
      let matchedProduct: ProductType | null = null;
      let price = null;

      if (config.id === 'Tirzepatide-2') {
        // Find 3-month value plan Tirzepatide (GLP-1/GIP)
        matchedProduct =
          glp1GipProducts.find((p) => p.planType === 'recurring' && p.metadata?.intervalCount === 3) || null;
      } else if (config.id === 'Semaglutide') {
        // Find 3-month value plan Semaglutide (GLP-1)
        matchedProduct =
          glp1Products.find((p) => p.planType === 'recurring' && p.metadata?.intervalCount === 3) || null;
      } else if (config.id === 'NAD+ Injections') {
        // Find 3-month value plan NAD+
        matchedProduct = nadProducts.find((p) => p.planType === 'recurring' && p.metadata?.intervalCount === 3) || null;
      }

      if (matchedProduct) {
        price = matchedProduct.prices?.find((p) => p.isActive) || matchedProduct.prices?.[0] || null;
      }

      return {
        ...config,
        product: matchedProduct,
        price,
      };
    });
  }, [data]);

  const handleNavigation = async (productId: string) => {
    setLoadingProductId(productId);
    const mappedProduct = mappedProducts.find((p) => p.id === productId);
    const product = mappedProduct?.product;
    const price = mappedProduct?.price;
    const productConfig = productConfigs.find((p) => p.id === productId);

    if (!product || !price) {
      // Fallback to old behavior if product not found
      const baseRoute = productConfig?.isNAD ? ROUTES.LONGEVITY_PATIENT_INTAKE : ROUTES.PATIENT_INTAKE;
      const params = new URLSearchParams();
      params.set('sale_type', 'general_sale');
      const overrideTime = searchParams.get('overrideTime');
      if (overrideTime === 'true') {
        params.set('overrideTime', 'true');
      }
      const route = `${baseRoute}?${params.toString()}`;
      setTimeout(async () => {
        try {
          await router.push(route);
        } catch (error) {
          console.error('Navigation error:', error);
          setLoadingProductId(null);
        }
      }, 300);
      return;
    }

    try {
      // Select the product in store before redirecting
      dispatch(setProductType({ ...product, prices: [price] }));
      await handleVerifyRedirectToCheckout({
        selectedProduct,
        product: { ...product, prices: [price] },
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
        surveyCategory: surveyCategory,
        saleType: 'general_sale',
        overrideTime: searchParams.get('overrideTime') === 'true',
      });
    } catch (error) {
      console.error('Navigation error:', error);
      setLoadingProductId(null);
    }
  };

  return (
    <>
      <div className='tw-pt-24 md:tw-pb-32 tw-pb-24 tw-px-4 lg:tw-max-w-[1300px] md:tw-max-w-full tw-mx-auto'>
        <h2 className='tw-font-normal md:tw-text-5xl tw-text-[40px] tw-leading-[120%] tw-text-black-22 tw-text-center tw-font-lumitype'>
          Transform Your Body, Not Your Budget.
        </h2>
        <h5 className='tw-font-normal md:tw-text-xl tw-text-[4.651vw] tw-leading-normal tw-text-black-22 tw-text-center tw-font-lato'>
          <span className='tw-block'>LumiMeds offers a variety of injectables that help with</span>
          <span className='tw-block'>weight loss and longevity.</span>
          <span className='tw-mt-4 tw-flex tw-items-center tw-justify-center tw-gap-2'>
            <Image src={klarna} alt='klarna' className='tw-w-[44px] tw-h-[25px]' />
            available on 3-Month Value Plans.
          </span>
        </h5>
        <div
          className='tw-flex flex-wrap tw-gap-8 tw-mt-12 tw-mx-auto'
          style={{ maxWidth: '832px' }}
          id='new-year-sale-products'
        >
          {productConfigs.map((product) => (
            <div
              key={product.id}
              className={`${product.paddingY} md:tw-px-7 tw-px-6 tw-rounded-[29px] tw-h-[356px] mx-auto tw-w-[400px] tw-bg-right tw-bg-no-repeat tw-relative tw-z-10`}
              style={{
                backgroundImage: `url(${product.backgroundImage.src}), ${product.gradient}`,
                backgroundSize: 'auto 100%',
              }}
            >
              <div>
                {product.badge && (
                  <div
                    className={`${product.badge.bg} tw-hidden md:tw-block tw-font-lato tw-text-sm tw-text-[#F3FF53] tw-rounded-full tw-py-2 tw-px-5 tw-justify-self-start tw-absolute tw-top-[-16px] tw-left-1/2 tw-transform -tw-translate-x-1/2 tw-z-20`}
                  >
                    {product.badge.text}
                  </div>
                )}
                {product.subtitle && (
                  <div className={`${product.textColor} tw-font-bold tw-leading-normal`}>{product.subtitle}</div>
                )}
                <div className={`${product.textColor} tw-font-lumitype tw-text-base`}>
                  {product.id === 'Tirzepatide-starter' ? (
                    <>
                      3-Month <span className='tw-font-[800]'>Starter Pack</span>
                    </>
                  ) : (
                    '3-Month Value Plan'
                  )}
                </div>
                {renderProductTitle(product.title, product.textColor)}
                {product.description && (
                  <p className={`tw-text-xs tw-mb-0 ${product.textColor}`}>{product.description}</p>
                )}
              </div>
              <div className={`${product.priceSectionMargin} tw-relative`}>
                <h3
                  className={`tw-font-lato tw-font-bold md:tw-text-[40px] tw-text-[35px] tw-mb-0 ${product.textColor}`}
                >
                  {product.price}
                  <span className='tw-text-base'>/month</span>
                </h3>
                {product.discountedPrice && (
                  <div className='tw-absolute tw-top-4 tw-left-0'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='151' height='26' fill='none'>
                      <path stroke='#FE3030' strokeWidth={4} d='m.291 23.979 149.5-22' />
                    </svg>
                  </div>
                )}
              </div>
              {product.discountedPrice && (
                <h3 className={`tw-font-lato tw-font-bold md:tw-text-[40px] tw-text-[35px] ${product.textColor}`}>
                  {product.discountedPrice}
                  <span className='tw-text-base'>/month</span>
                </h3>
              )}
              {product.upfrontPayment &&
                (() => {
                  const parts = product.upfrontPayment.split(' ');
                  const oldPrice = parts[0];
                  const newPrice = parts[1];
                  const text = parts.slice(2).join(' ');

                  // If discount is applied, show strikethrough old price and new price
                  // If no discount, show only the old price without strikethrough
                  if (product.discountedPrice) {
                    return (
                      <p className={`tw-font-lato tw-text-sm tw-mt-2 tw-mb-0 tw-flex tw-flex-col ${product.textColor}`}>
                        <span>
                          <span className='tw-line-through'>{oldPrice}</span> {newPrice}
                        </span>
                        <span>{text}</span>
                      </p>
                    );
                  } else {
                    return (
                      <p className={`tw-font-lato tw-text-sm tw-mt-2 tw-mb-0 tw-flex tw-flex-col ${product.textColor}`}>
                        <span>
                          {oldPrice} {text}
                        </span>
                      </p>
                    );
                  }
                })()}
              <button
                type='button'
                onClick={() => handleNavigation(product.id)}
                disabled={loadingProductId === product.id}
                className={`tw-text-xl tw-font-bold tw-py-2 tw-px-[22px] tw-h-12 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-absolute tw-bottom-[16px] tw-right-[17px] tw-rounded-[54.859px] ${product.buttonBg} ${product.buttonTextColor} tw-shadow-[0_4px_4px_rgba(0,0,0,0.25)] tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100`}
              >
                {loadingProductId === product.id && <Spinner className='border-2' size='sm' />}
                <span>Get Started</span>
              </button>
            </div>
          ))}
        </div>
        <div className='tw-block md:tw-hidden tw-text-sm tw-font-lato tw-text-black-22 tw-leading-[100%] md:tw-max-w-[70%] tw-max-w-full tw-mx-auto tw-text-center tw-mt-12 tw-px-4'>
          Prescription required. Your provider will determine whether a compounded drug product is right for you.
          Compounded drug products are not FDA-approved as they have not been evaluated by FDA for safety,
          effectiveness, or quality.
        </div>
      </div>
    </>
  );
}
