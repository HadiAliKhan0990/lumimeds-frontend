'use client';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import Product1 from '@/assets/ads/longevity-microdosages/product-1.png';
import Product3 from '@/assets/ads/longevity-microdosages/product-2.png';

const features = [
  { text: 'Increased energy and reduced fatigue' },
  { text: 'May increase metabolism for healthy weight management' },
  { text: 'Can help boost your immune\nsystem' },
];

const products = [
  {
    id: 'onemonth',
    image: Product1,
    alt: 'Product one month',
    supply: '1-Month Supply',
    price: '$249/month',
    description: (
      <>
        1-month supply, renewed monthly. No long-term<span className='tw-block'>commitment</span>
      </>
    ),
    descriptionClassName: '',
  },
  {
    id: 'threemonth',
    image: Product3,
    alt: 'Product three month',
    supply: '3-Month Supply',
    price: '$166/month',
    description: '$499 upfront payment - Renews every 3 months.',
    descriptionClassName: 'md:tw-min-h-[33px]',
  },
];

interface ProductCardProps {
  product: (typeof products)[0];
  loadingProductId: string | null;
  onGetStarted: (productId: string) => void;
  titleClassName?: string;
}

function ProductCard({ product, loadingProductId, onGetStarted, titleClassName }: ProductCardProps) {
  const isLoading = loadingProductId === product.id;

  return (
    <>
      <div className='tw-relative'>
        <Image src={product.image} alt={product.alt} className='tw-w-full tw-h-full tw-object-cover' />
        <div className='tw-text-base tw-leading-[140%] tw-font-lumitype tw-font-bold tw-text-black-22 tw-bg-white tw-py-1 tw-px-5 tw-text-center tw-rounded-tl-lg tw-absolute tw-right-0 tw-bottom-0'>
          {product.supply}
        </div>
        <div className='tw-bg-[#F3FF53] md:tw-text-[15px] tw-text-xs tw-rounded-full tw-font-lumitype tw-text-black-22 tw-py-1 tw-px-2 tw-pr-4 tw-flex tw-items-center md:tw-gap-3 tw-gap-2 tw-text-center tw-absolute tw-top-3 tw-left-3 '>
          <div className='tw-rounded-full md:tw-w-5 md:tw-h-5 tw-w-4 tw-h-4 tw-bg-[#4685F4]'></div>
          Available Now
        </div>
      </div>
      <div className='tw-px-[22px] tw-pt-[30px] tw-pb-[23px]'>
        <h3
          className={`${titleClassName || 'lg:tw-text-[32px] tw-text-xl'
            } tw-font-bold tw-font-lumitype tw-text-black-22 tw-mb-0`}
        >
          NAD+ Injections
        </h3>
        <h5 className='lg:tw-text-xl tw-font-bold tw-font-lumitype tw-text-black-22 tw-leading-[121%]'>
          (nicotinamide adenine <span className='tw-block'>dinucleotide)</span>
        </h5>
        <h3 className='tw-text-[32px] tw-font-bold tw-font-lato tw-text-black-22 tw-mt-2 tw-mb-0'>{product.price}</h3>
        <p
          className={`${product.descriptionClassName} tw-text-xs tw-text-[#6E7179] tw-leading-[140%] tw-font-lato tw-font-normal tw-mb-0`}
        >
          {product.description}
        </p>
        <button
          type='button'
          onClick={() => onGetStarted(product.id)}
          disabled={isLoading}
          className='tw-flex tw-items-center tw-justify-center tw-my-6 tw-w-full tw-h-12 tw-bg-blue-46 tw-font-bold tw-text-white tw-text-xl tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-blue-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
        >
          {isLoading && <Spinner className='border-2' size='sm' />}
          <span className={isLoading ? 'tw-ml-2' : ''}>Get Started</span>
        </button>
        <ul className='tw-m-0 tw-p-0'>
          {features.map((feature, index) => (
            <li
              key={index}
              className={`tw-text-[15px] tw-font-lato tw-text-black-22 tw-flex tw-items-center tw-gap-4 ${index < features.length - 1 ? 'tw-mb-3' : 'tw-mb-0'
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
    </>
  );
}

export default function Products() {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const previousPathnameRef = useRef<string>(pathname);

  const handleGetStarted = (productId: string) => {
    setLoadingProductId(productId);
    setTimeout(() => {
      router.push(ROUTES.LONGEVITY_PATIENT_INTAKE);
    }, 0);
  };

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      setLoadingProductId(null);
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, products.length - 1));
  }, []);

  return (
    <section className='lg:tw-mt-8 tw-max-w-[868px] tw-w-full tw-mx-auto md:tw-px-[26px] tw-px-4 tw-py-0'>
      <h2 className='tw-flex tw-flex-col lg:tw-text-5xl tw-text-4xl tw-font-lumitype tw-leading-[120%] tw-text-black-22 tw-text-center tw-mb-0'>
        Longevity Plans,
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
          {products.map((product) => (
            <div
              key={product.id}
              className='tw-rounded-3xl tw-bg-white tw-shadow-[0_3.285px_6.241px_0_rgba(0,0,0,0.18)] tw-min-w-full tw-snap-center'
            >
              <ProductCard product={product} loadingProductId={loadingProductId} onGetStarted={handleGetStarted} />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className='tw-flex tw-justify-center tw-gap-2 tw-my-8'>
          {products.map((product, index) => (
            <span
              key={product.id}
              className={`tw-h-4 tw-w-4 tw-rounded-full tw-transition-all tw-duration-300 ${activeIndex === index ? 'tw-bg-blue-46' : 'tw-bg-blue-46/30'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Original grid layout */}
      <div className='tw-hidden md:tw-flex tw-flex-row lg:tw-gap-12 tw-gap-6 tw-mt-[73px] lg:tw-mb-28 md:tw-mb-12'>
        {products.map((product) => (
          <div
            key={product.id}
            className='tw-rounded-3xl tw-bg-white [filter:drop-shadow(0px_3.60367px_6.84696px_rgba(0,0,0,0.18))]'
          >
            <ProductCard
              product={product}
              loadingProductId={loadingProductId}
              onGetStarted={handleGetStarted}
              titleClassName='lg:tw-text-[32px] md:tw-text-2xl tw-text-xl'
            />
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
