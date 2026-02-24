'use client';
import Image from 'next/image';
import { useState, useRef, useCallback, useMemo } from 'react';
import Product1 from '@/assets/ads/longevity-microdosages/microdoseWhiteVials.png';
import Product3 from '@/assets/ads/longevity-microdosages/microdoseBlueVials.png';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import { getRoundedPrice } from '@/helpers/products';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';

interface Props {
  data: ProductTypesResponseData;
}

interface ProductDisplay {
  product: ProductType;
  image: typeof Product1;
  alt: string;
  title: string;
  features: Array<{ text: string }>;
}

export default function Products({ data }: Readonly<Props>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Get products and map them to display format
  const products = useMemo(() => {
    // Filter for 3-month subscription GLP-1 products (Semaglutide)
    const glp1Products =
      data?.glp_1_plans?.products?.filter(
        (product) =>
          product.prices?.some((price) => price.isActive) &&
          product.planType === 'recurring' &&
          product.metadata?.billingInterval === 'month' &&
          product.metadata?.intervalCount === 3
      ) || [];
    const glp1GipProducts =
      data?.glp_1_gip_plans?.products?.filter((product) => product.prices?.some((price) => price.isActive)) || [];

    const result: ProductDisplay[] = [];

    // Get first 3-month GLP-1 product (Semaglutide)
    if (glp1Products.length > 0) {
      const product = glp1Products[0];
      result.push({
        product,
        image: Product1,
        alt: 'Product one month',
        title: 'Compounded Semaglutide (GLP-1)',
        features: [
          { text: 'Minimize potential side effects of standard \nGLP-1 dosage' },
          { text: 'Help control blood sugar insulin \nresistance' },
          { text: 'May reduce your appetite' },
        ],
      });
    }

    // Get first GLP-1/GIP product (Tirzepatide)
    if (glp1GipProducts.length > 0) {
      const product = glp1GipProducts[0];
      result.push({
        product,
        image: Product3,
        alt: 'Product three month',
        title: 'Compounded Tirzepatide (GLP-1/GIP)',
        features: [
          { text: 'Decreased chance of gastrointestinal side \neffects' },
          { text: 'Sustainable progress from possible \nappetite control' },
          { text: 'Can improve A1C and insulin \nsensitivity' },
        ],
      });
    }

    return result;
  }, [data]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, products.length - 1));
  }, [products.length]);

  return (
    <section className='lg:tw-mt-36 md:tw-mt-16 tw-max-w-[868px] tw-w-full tw-mx-auto md:tw-px-[26px] tw-px-4 tw-py-0'>
      <h2 className='tw-flex tw-flex-col lg:tw-text-5xl tw-text-4xl tw-font-lumitype md:tw-leading-normal tw-leading-[120%] tw-text-black-22 tw-text-center tw-mb-0'>
        Weight Loss Plans,
        <span className='tw-text-blue-46 tw-block'>Customized For You</span>
      </h2>
      <div className='md:tw-hidden tw-block tw-text-sm tw-mt-5 tw-font-lato tw-text-black-22 tw-leading-[100%] tw-max-w-[830px] tw-text-center tw-px-5 lg:tw-mt-24 md:tw-mt-12 lg:tw-mb-32 md:tw-mb-12'>
        Prescription required. Your provider will determine whether a compounded drug product is right for you.
        Compounded drug products are not FDA-approved as they have not been evaluated by FDA for safety, effectiveness,
        or quality.
      </div>
      {/* Mobile: Horizontal scroll with snap */}
      <div className='md:tw-hidden tw-mt-[73px] tw-mb-12'>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className='tw-flex tw-overflow-x-auto tw-snap-x tw-snap-mandatory tw-gap-4 tw-scrollbar-hide tw-p-3'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((productDisplay, idx) => (
            <div
              key={productDisplay.product.id || idx}
              className='tw-rounded-3xl tw-bg-white tw-shadow-[0_3.285px_6.241px_0_rgba(0,0,0,0.18)] tw-min-w-full tw-snap-center'
            >
              <div className='tw-relative'>
                <Image
                  src={productDisplay.image}
                  alt={productDisplay.alt}
                  className='tw-w-full tw-h-80 tw-object-cover tw-rounded-t-[20px]'
                />
                <div className='tw-text-base tw-leading-[140%] tw-font-lumitype tw-font-bold tw-text-black-22 tw-bg-white tw-py-1 tw-px-5 tw-text-center tw-rounded-tl-lg tw-absolute tw-right-0 tw-bottom-0'>
                  {productDisplay.product.durationText || '3-month Supply'}
                </div>
                <div className='tw-bg-[#F3FF53] tw-text-xs tw-rounded-full tw-font-lumitype tw-text-black-22 tw-py-1 tw-px-2 tw-pr-4 tw-flex tw-items-center tw-gap-2 tw-text-center tw-absolute md:tw-top-4 md:tw-left-4 tw-top-3 tw-left-3'>
                  <div className='tw-rounded-full tw-w-4 tw-h-4 tw-bg-[#4685F4]'></div>
                  Available Now
                </div>
              </div>
              <div className='tw-px-[22px] tw-pt-[30px] tw-pb-[23px]'>
                <div className='tw-font-lumitype tw-font-bold'>Microdosed </div>
                <h3 className='lg:tw-text-[32px] tw-text-xl tw-font-bold tw-font-lumitype tw-text-black-22 tw-mb-0'>
                  Compounded
                  <br />
                  {productDisplay.title.replace('Compounded ', '')}
                </h3>
                <h3 className='tw-text-[32px] tw-font-bold tw-font-lato tw-text-black-22 tw-mt-2 tw-mb-0'>
                  ${getRoundedPrice(productDisplay.product.dividedAmount)}/month
                </h3>
                <p className='tw-text-xs tw-text-[#6E7179] tw-leading-[140%] tw-font-lato tw-font-normal tw-mb-0 tw-mt-2'>
                  {productDisplay.product.durationText?.toLowerCase() || '3-month supply'}.
                </p>
                <SurveyGetStartedButton
                  product={productDisplay.product}
                  className='!tw-flex !tw-items-center !tw-justify-center tw-my-6 tw-w-full !tw-h-12 !tw-bg-blue-46 tw-font-bold !tw-text-[#F3FF53] tw-text-xl tw-font-lumitype !tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-blue-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100 !tw-p-0'
                >
                  Get Started
                </SurveyGetStartedButton>
                <ul className='tw-m-0 tw-p-0'>
                  {productDisplay.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`tw-text-[15px] tw-font-lato tw-text-black-22 tw-flex tw-items-center tw-gap-4 ${
                        index < productDisplay.features.length - 1 ? 'tw-mb-3' : 'tw-mb-0'
                      }`}
                    >
                      <span className='tw-font-lato tw-font-bold tw-text-xl tw-text-blue-46 tw-self-start'>→</span>
                      <span className='tw-flex-1'>
                        {feature.text.split('\n').map((line, i, arr) => (
                          <span key={i}>
                            {line}
                            {i < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className='tw-flex tw-justify-center tw-gap-2 tw-my-8'>
          {products.map((productDisplay, index) => (
            <span
              key={productDisplay.product.id || index}
              className={`tw-h-4 tw-w-4 tw-rounded-full tw-transition-all tw-duration-300 ${
                activeIndex === index ? 'tw-bg-blue-46' : 'tw-bg-blue-46/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Original grid layout */}
      <div className='tw-hidden md:tw-flex tw-flex-row lg:tw-gap-12 tw-gap-6 tw-mt-[73px] lg:tw-mb-28 md:tw-mb-12'>
        {products.map((productDisplay, idx) => (
          <div
            key={productDisplay.product.id || idx}
            className='tw-rounded-3xl tw-bg-white [filter:drop-shadow(0px_3.60367px_6.84696px_rgba(0,0,0,0.18))]'
          >
            <div className='tw-relative'>
              <Image
                src={productDisplay.image}
                alt={productDisplay.alt}
                className='tw-w-full tw-h-full tw-object-cover'
              />
              <div className='tw-text-base tw-leading-[140%] tw-font-lumitype tw-font-bold tw-text-black-22 tw-bg-white tw-py-1 tw-px-5 tw-text-center tw-rounded-tl-lg tw-absolute tw-right-0 tw-bottom-0'>
                {productDisplay.product.durationText || '3-month Supply'}
              </div>
              <div className='tw-bg-[#F3FF53] tw-text-sm tw-rounded-full tw-font-lumitype tw-text-black-22 tw-py-1 tw-px-2 tw-pr-4 tw-flex tw-items-center tw-gap-2 tw-text-center tw-absolute tw-top-3 tw-left-3 '>
                <div className='tw-rounded-full tw-w-4 tw-h-4 tw-bg-[#4685F4]'></div>
                Available Now
              </div>
            </div>
            <div className='tw-px-[22px] tw-pt-[30px] tw-pb-[23px]'>
              <div className='tw-font-lumitype tw-font-bold'>Microdosed </div>
              <h3 className='lg:tw-text-[28px] md:tw-text-2xl tw-text-xl tw-font-bold tw-font-lumitype tw-text-black-22 tw-mb-0'>
                Compounded
                <br />
                {productDisplay.title.replace('Compounded ', '')}
              </h3>
              <h3 className='tw-text-[32px] tw-font-bold tw-font-lato tw-text-black-22 tw-mt-2 tw-mb-0'>
                ${getRoundedPrice(productDisplay.product.dividedAmount)}/month
              </h3>
              <p className='tw-text-xs tw-text-[#6E7179] tw-leading-[140%] tw-font-lato tw-font-normal tw-mb-0 tw-mt-2'>
                {productDisplay.product.durationText?.toLowerCase() || '3-month supply'}.
              </p>
              <SurveyGetStartedButton
                product={productDisplay.product}
                className='!tw-flex !tw-items-center !tw-justify-center tw-my-6 tw-w-full !tw-h-12 !tw-bg-blue-46 !tw-font-bold !tw-text-[#F3FF53] !tw-text-xl !tw-font-lumitype !tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-blue-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100 !tw-p-0'
              >
                Get Started
              </SurveyGetStartedButton>
              <ul className='tw-m-0 tw-p-0'>
                {productDisplay.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`tw-text-[15px] tw-font-lato tw-text-black-22 tw-flex tw-items-center tw-gap-4 ${
                      index < productDisplay.features.length - 1 ? 'tw-mb-1' : 'tw-mb-0'
                    }`}
                  >
                    <span className='tw-font-lato tw-font-bold tw-text-xl tw-text-blue-46 tw-self-start'>→</span>
                    <span className='tw-flex-1'>
                      {feature.text.split('\n').map((line, i, arr) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className='md:tw-block tw-hidden tw-text-sm tw-font-lato tw-text-black-22 tw-leading-[100%] tw-max-w-[830px] tw-text-center tw-px-5 lg:tw-mt-24 md:tw-mt-12 lg:tw-mb-32 md:tw-mb-12'>
        Prescription required. Your provider will determine whether a compounded drug product is right for you.
        Compounded drug products are not FDA-approved as they have not been evaluated by FDA for safety, effectiveness,
        or quality.
      </div>
    </section>
  );
}
