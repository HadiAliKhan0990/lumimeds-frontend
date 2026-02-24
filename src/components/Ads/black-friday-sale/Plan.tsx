import { useState, useMemo, useRef, useEffect } from 'react';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import ProductCard from './ProductCard';
interface Props {
  data: ProductTypesResponseData;
}

export default function Plans({ data }: Readonly<Props>) {
  const [activeSlide, setActiveSlide] = useState(0);
  const mobileSliderRef = useRef<HTMLDivElement>(null);

  // Get products for each category - only 3-Month Subscription
  const semaglutideProducts = useMemo(() => {
    const products = data?.glp_1_plans?.products || [];
    return products.filter(
      (product) =>
        product.prices?.some((price) => price.isActive) &&
        product.planType === 'recurring' &&
        product.metadata?.billingInterval === 'month' &&
        product.metadata?.intervalCount === 3
    );
  }, [data?.glp_1_plans]);

  const tirzepatideProducts = useMemo(() => {
    const products = data?.glp_1_gip_plans?.products || [];
    return products.filter(
      (product) =>
        product.prices?.some((price) => price.isActive) &&
        product.planType === 'recurring' &&
        product.metadata?.billingInterval === 'month' &&
        product.metadata?.intervalCount === 3
    );
  }, [data?.glp_1_gip_plans]);

  // Combine all products
  const currentProducts = useMemo(() => {
    return [...semaglutideProducts, ...tirzepatideProducts];
  }, [semaglutideProducts, tirzepatideProducts]);

  // Helper to determine product category
  const getProductCategory = (product: ProductType) => {
    const isSemaglutide = semaglutideProducts.some((p) => p.id === product.id || p.name === product.name);
    return isSemaglutide ? 'semaglutide' : 'tirzepatide';
  };

  // Determine plan type for each product
  const getPlanType = (product: ProductType): 'monthly' | 'starter' => {
    if (
      product.planType === 'one_time' ||
      (product.durationText || '').toLowerCase().includes('starter') ||
      (product.name || '').toLowerCase().includes('starter') ||
      product.metadata?.intervalCount === 3
    ) {
      return 'starter';
    }
    return 'monthly';
  };

  // Determine grid columns based on number of products
  const getGridCols = (count: number): string => {
    if (count === 1) return 'tw-grid-cols-1';
    if (count === 2) return 'tw-grid-cols-1 lg:tw-grid-cols-2';
    return 'tw-grid-cols-1 lg:tw-grid-cols-2 xl:tw-grid-cols-3';
  };

  // const hasProducts = currentProducts.length > 0;

  // if (!hasProducts) {
  //   return null;
  // }

  useEffect(() => {
    const slider = mobileSliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const width = slider.clientWidth;
      if (!width) return;
      const newIndex = Math.round(slider.scrollLeft / width);
      const clampedIndex = Math.max(0, Math.min(currentProducts.length - 1, newIndex));
      setActiveSlide(clampedIndex);
    };

    slider.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      slider.removeEventListener('scroll', handleScroll);
    };
  }, [currentProducts.length]);

  useEffect(() => {
    setActiveSlide(0);
    if (mobileSliderRef.current) {
      mobileSliderRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [currentProducts.length]);

  return (
    <>
      <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4 lg:tw-max-w-[1640px] md:tw-max-w-full tw-mx-auto tw-w-full'>
        <div className='tw-w-full'>
          {/* Header Section */}
          <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-mb-0'>
            <div className='tw-relative tw-w-full tw-text-center tw-flex tw-items-center tw-justify-center tw-my-8'>
              <h2 className='tw-font-[400] xl:tw-text-[52px] md:tw-text-4xl tw-text-[32px] tw-leading-[100%] tw-text-black tw-bg-[#FCFAF7] xl:tw-max-w-[610px] tw-max-w-md tw-w-2/3 tw-z-10 tw-m-0'>
                Discounted Plans
              </h2>
              <div
                className="tw-w-full tw-h-[1px] tw-bg-[#001B55] tw-top-1/2 tw-left-0 tw-transform tw-translate-y-1/2
              tw-before:tw-content-[''] tw-before:tw-absolute tw-before:tw-inset-0
              tw-before:tw-border tw-before:tw-border-[#001B55] tw-before:tw-pointer-events-none tw-absolute"
              ></div>
            </div>
          </div>

          {/* Product Cards - Mobile Slider */}
          <div className='md:tw-hidden'>
            <div
              ref={mobileSliderRef}
              className='tw-flex tw-overflow-x-auto tw-gap-4 tw-scroll-smooth tw-snap-x tw-snap-mandatory tw-py-2'
            >
              {currentProducts.map((product) => {
                const category = getProductCategory(product);
                return (
                  <div key={product.id || product.name} className='tw-flex-shrink-0 tw-w-full tw-snap-center'>
                    <ProductCard
                      product={product}
                      planType={getPlanType(product)}
                      categoryName={
                        category === 'semaglutide'
                          ? 'Compounded Semaglutide (GLP-1)'
                          : 'Compounded Tirzepatide (GLP-1/GIP)'
                      }
                      categoryImage={
                        category === 'semaglutide' ? data?.glp_1_plans?.image : data?.glp_1_gip_plans?.image
                      }
                    />
                  </div>
                );
              })}
            </div>
            {currentProducts.length > 1 && (
              <div className='tw-flex tw-justify-center tw-gap-2 tw-mt-4'>
                {currentProducts.map((product, index) => (
                  <span
                    key={`dot-${product.id || product.name || index}`}
                    className={`tw-h-2.5 tw-w-2.5 tw-rounded-full ${
                      index === activeSlide ? 'tw-bg-[#002C8C]' : 'tw-bg-[#D9D9D9]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Cards - Desktop Grid */}
          <div className={`tw-hidden md:tw-grid ${getGridCols(currentProducts.length)} tw-gap-3`}>
            {currentProducts.map((product) => {
              const category = getProductCategory(product);
              return (
                <ProductCard
                  key={product.id || product.name}
                  product={product}
                  planType={getPlanType(product)}
                  categoryName={
                    category === 'semaglutide' ? 'Compounded Semaglutide (GLP-1)' : 'Compounded Tirzepatide (GLP-1/GIP)'
                  }
                  categoryImage={category === 'semaglutide' ? data?.glp_1_plans?.image : data?.glp_1_gip_plans?.image}
                />
              );
            })}
          </div>
        </div>
        <div className='tw-text-[#737D97] md:tw-text-base tw-text-xs tw-w-full md:tw-max-w-full tw-max-w-xs tw-text-center md:tw-pt-8 tw-py-6'>
          Prescription required. Your provider will determine whether a compounded drug product is right for you.
        </div>
      </div>
    </>
  );
}
