'use client';

import HeroImage from '@/assets/med-spa1/Hero.png';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import ProductListWeightLoss from '@/components/Ads/glp1-program/includes/PlanSection/ProductListWeightLoss';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { useTranslations } from 'next-intl';

interface Props {
  data: ProductTypesResponseData;
  t: ReturnType<typeof useTranslations>;
}

export default function HeroSection({ data, t }: Readonly<Props>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const tProductListWeightLoss = useTranslations('productListWeightLoss');

  return (
    <>
      {/* Hero Section */}
      <section
        className='tw-relative tw-flex tw-items-center tw-py-0 lg:tw-py-8 2xl:tw-py-0'
        style={{
          backgroundImage: `url(${HeroImage.src})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Hero Content */}
        <div className='tw-relative tw-z-10 tw-container tw-mx-auto tw-px-4 2xl:tw-px-24 tw-pt-10 sm:tw-pt-40 2xl:tw-pt-0 tw-py-0 lg:tw-py-0 xl:tw-mt-[75px]'>
          <div className='tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-12 tw-items-center tw-min-h-[70vh]'>
            {/* Left Content */}
            <div className='tw-space-y-8 max-sm:tw-w-[60%] tw-text-left lg:tw-text-left'>
              <h1 className='tw-font-bold tw-leading-tight'>
                <span className='tw-text-[#3060FE] tw-text-4xl sm:tw-text-5xl lg:tw-text-7xl xl:tw-text-8xl tw-font-extrabold'>
                  {t('hero.title.stop')}{' '}
                </span>
                <span className='tw-bg-[#3060FE] tw-text-white tw-px-2 tw-text-nowrap tw-h-[50px] sm:tw-h-[56px] md:tw-h-[60px] lg:tw-h-[90px] xl:tw-h-[114px] tw-rounded tw-text-4xl sm:tw-text-5xl lg:tw-text-7xl xl:tw-text-8xl tw-font-extrabold tw-inline-block'>
                  {t('hero.title.overpaying')}
                </span>
                <span className='tw-text-[#3060FE] tw-text-4xl sm:tw-text-5xl lg:tw-text-8xl xl:tw-text-8xl tw-font-extrabold'>
                  {' '}
                  {t('hero.title.forWeightLossCare')}
                </span>
              </h1>

              <p className='tw-text-black tw-text-lg lg:tw-text-xl xl:tw-text-2xl tw-font-normal tw-leading-relaxed'>
                {t('hero.description')}
              </p>

              <button
                type='button'
                onClick={() => {
                  setIsLoading(true);
                  router.push(`${ROUTES.PATIENT_INTAKE}`);
                }}
                disabled={isLoading}
                className={
                  'tw-bg-black tw-text-nowrap tw-text-white tw-px-8 tw-py-4 tw-rounded-full tw-font-bold tw-text-[14px] md:tw-text-xl lg:tw-text-2xl xl:tw-text-[32px] tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all disabled:tw-opacity-60 disabled:tw-pointer-events-none hover:tw-bg-gray-800' +
                  (isLoading ? ' tw-translate-x-4 sm:tw-translate-x-[unset]' : '')
                }
              >
                {isLoading && <Spinner className='border-2' size='sm' />}
                {t('hero.buttonText')}
              </button>
            </div>

            {/* Right Content - Woman Image */}
            <div className='tw-flex tw-justify-center lg:tw-justify-end'>
              <div className='tw-w-full tw-max-w-md lg:tw-max-w-lg'>
                {/* The woman image is already part of the background image */}
              </div>
            </div>
          </div>

          {/* Product Cards - Desktop only (lg and above) */}
          <div className='tw-hidden xl:tw-block tw-z-20'>
            <ProductListWeightLoss
              productsData={data}
              backgroundColor='transparent'
              withBorders={false}
              cardBackgroundColor='#3060FE'
              showHeading={false}
              showSubheading={false}
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
        </div>
      </section>

      {/* Product Cards - Mobile and Tablet (below lg) */}
      <div className='tw-block tw-pt-6 xl:tw-hidden'>
        <ProductListWeightLoss
          productsData={data}
          backgroundColor='transparent'
          withBorders={false}
          cardBackgroundColor='#3060FE'
          showHeading={false}
          showSubheading={false}
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
    </>
  );
}
