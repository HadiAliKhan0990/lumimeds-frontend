'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductItemWeightLoss from '@/components/Ads/glp1-program/includes/PlanSection/ProductItemWeightLoss';
import { ProductType } from '@/store/slices/productTypeSlice';
import HeroImage from '@/assets/med-spa2/Hero.png';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Props {
  data: ProductTypesResponseData;
  t: ReturnType<typeof useTranslations>;
}

export default function HeroSection({ data, t }: Readonly<Props>) {
  const tProductListWeightLoss = useTranslations('productListWeightLoss');

  // Filter for only the "value" product
  const valueProduct = data?.glp_1_gip_plans?.products?.find(
    (product: ProductType) => product.metadata?.planTier === 'value'
  );

  return (
    <div className='tw-bg-gradient-to-b tw-from-[#99B0FF] tw-to-[#3161FE]'>
      <section className='tw-relative tw-container tw-flex tw-flex-col tw-gap-16 lg:tw-gap-32 tw-mx-auto 2xl:tw-px-16 tw-px-5'>
        <div className='tw-flex md:tw-hidden tw-flex-col tw-items-center tw-gap-8'>
          <h1 className='tw-text-[78px] sm:tw-text-[120px] tw-font-black tw-text-white tw-leading-none tw-text-center'>
            {t('hero.title')}
          </h1>

          {/* <div className='tw-flex tw-justify-center tw-items-center'>
            <Image
              src={HeroImage}
              alt='Compounded GLP-1/GIP Bottle'
              className='tw-object-contain tw-max-w-[420px]'
              priority
            />
          </div> */}

          {valueProduct && (
            <div className='md:tw-scale-90 lg:tw-scale-100 tw-p-2 tw-bg-gradient-to-b tw-from-[#DEE6FF] tw-to-[#8CA6FF] tw-rounded-2xl'>
              <ProductItemWeightLoss
                product={valueProduct}
                className='!tw-bg-gradient-to-b !tw-from-[#99B0FF] !tw-to-[#3161FE]'
                getStartedButtonStyle={{
                  backgroundColor: '#FFC300',
                  textColor: '#3060FE',
                  hoverBackgroundColor: '#E6B000',
                }}
                badgeStyle={{
                  background: 'linear-gradient(90deg, #CAD6FF 7.8%, #FFFFFF 100%)',
                  textColor: '#3060FE',
                }}
                t={tProductListWeightLoss}
              />
            </div>
          )}
        </div>

        {/* Desktop Layout - Grid with overlay image */}
        <div className='tw-hidden md:tw-flex tw-justify-between tw-z-0 tw-align-middle'>
          <div className='tw-col-span-1 lg:tw-col-span-2 tw-items-center tw-justify-center tw-max-w-lg tw-flex'>
            <h1 className='tw-text-[clamp(80px,8vw,100px)] tw-font-black tw-text-white tw-leading-none'>
              {t('hero.title')}
            </h1>
          </div>
          <div
            className='lg:tw-w-[35vw] md:tw-w-[20vw] tw-hidden lg:tw-flex tw-items-center tw-justify-center tw-pointer-events-none tw-absolute tw-translate-y-[3vw] tw-translate-x-72'
            style={{ zIndex: 1 }}
          >
            <Image src={HeroImage} alt='Compounded GLP-1/GIP Bottle' className='tw-object-contain' priority />
          </div>
          <div className='tw-col-span-1 tw-items-center tw-justify-center'>
            {valueProduct && (
              <div className='md:tw-scale-90 lg:tw-scale-100 tw-p-2 tw-bg-gradient-to-b tw-from-[#DEE6FF] tw-to-[#8CA6FF] tw-rounded-2xl'>
                <ProductItemWeightLoss
                  product={valueProduct}
                  className='!tw-bg-gradient-to-b !tw-from-[#99B0FF] !tw-to-[#3161FE]'
                  getStartedButtonStyle={{
                    backgroundColor: '#FFC300',
                    textColor: '#3060FE',
                    hoverBackgroundColor: '#E6B000',
                  }}
                  badgeStyle={{
                    background: 'linear-gradient(90deg, #CAD6FF 7.8%, #FFFFFF 100%)',
                    textColor: '#3060FE',
                  }}
                  t={tProductListWeightLoss}
                  // borderStyle={{
                  //   border: '8px solid',
                  //   borderImageSource: 'linear-gradient(161.6deg, #DEE6FF 0.76%, #8CA6FF 100%)',
                  //   borderImageSlice: 1,
                  //   borderRadius: '16px'
                  // }}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <p className='tw-font-normal tw-text-white tw-text-[16px] sm:tw-text-[24px] lg:tw-text-[34px]'>
            {t('hero.description')}
          </p>
        </div>
      </section>
    </div>
  );
}
