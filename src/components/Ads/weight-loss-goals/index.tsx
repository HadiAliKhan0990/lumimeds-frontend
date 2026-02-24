'use client';

import Testimonials from '@/components/Home/Testimonials';
import ProductListSustainable from '@/components/Ads/glp1-program/includes/PlanSection2/ProductListSustainable';
import ProductListWeightLoss from '../glp1-program/includes/PlanSection/ProductListWeightLoss';
import HeroSection from '@/components/Ads/weight-loss-goals/HeroSection';
import CasperRight from '@/assets/weight-loss-goals/CasperRight.png';
import CasperLeft from '@/assets/weight-loss-goals/CasperLeft.png';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import './productListResponsive.css';

interface Props {
  data: ProductTypesResponseData;
}

export default function WeightLossGoals({ data }: Readonly<Props>) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <>
      <HeroSection />
      <ProductListWeightLoss
        productsData={data}
        backgroundColor='black'
        sectionClassName='!tw-bg-no-repeat !tw-bg-left-top !tw-pb-0 !tw-pt-40'
        sectionStyle={{ backgroundImage: `url(${CasperRight.src})`, backgroundSize: 'auto' }}
        withBorders={true}
        cardBackgroundColor='#FF7F3B'
        showHeading={true}
        showSubheading={true}
        showBottomSubheading={false}
        plansHeading='Compounded Tirzepatide (GLP-1/GIP)'
        plansSubheading='Injection Plans'
        plansBottomSubheading='Your bottom subheading text'
        textColor='#FFFFFF'
        headingFontSize='47px'
        headingFontFamily='Poppins'
        headingFontWeight='700'
        subHeadingFontSize='47px'
        subHeadingFontFamily='Poppins'
        subHeadingFontWeight='300'
        productTitle=''
        productSubtitle='Compounded Tirzepatide (GLP-1/GIP) Injections'
        productTitleClassName='tw-text-white tw-font-bold tw-text-[27px] tw-font-poppins'
        productSubtitleClassName='tw-text-white !tw-font-normal !tw-text-[13px] tw-font-poppins tw-text-center'
        productDescriptionClassName='tw-text-white tw-text-center tw-text-[17px] tw-text-sm tw-px-4 tw-py-2 tw-mb-4'
        productDescriptionByTier={{
          starter: 'Ideal for getting started at your own pace.',
          value: 'Our most popular plan — designed for consistent progress with steady support.',
          monthly: 'Flexible, month-to-month access with full support — designed to fit your schedule and lifestyle.',
        }}
        showProductDescription={true}
        showMultipleVials={true}
        productImageSectionClassName='!tw-mb-0'
        pricingSectionClassName='!tw-mb-2'
        showProductTitle={false}
        showProductTitleSuffix={false}
        priceColor='#FFFFFF'
        pricePeriodColor='#FFFFFF'
        getStartedButtonStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#FF7F3B',
          hoverBackgroundColor: '#FFFFF1',
        }}
        badgeStyle={{
          background: '#FF7F3B',
          textColor: '#FFFFFF',
        }}
        badgeClassName='!tw-shadow-none !tw-mb-0'
        badgeTextClassName='!tw-text-[27px] !tw-font-bold !tw-text-center !tw-uppercase'
        badgeTextSuffix=' Plan'
        glpHeaderClassName='tw-flex tw-flex-col tw-items-center tw-justify-center !tw-mb-0'
      />
      <ProductListSustainable
        productsData={data}
        backgroundColor='#000000'
        sectionClassName='!tw-bg-no-repeat !tw-bg-right-top !tw-pt-64 !tw-pb-0 sustainable-card-section'
        sectionStyle={{ backgroundImage: `url(${CasperLeft.src})`, backgroundSize: 'auto' }}
        cardBackgroundColor='#FAAB2B'
        headingColor='#FFFFFF'
        subHeadingColor='#FFFFFF'
        priceColor='#FFFFFF'
        pricePeriodColor='#FFFFFF'
        popularTagColor='#FFFFFF'
        showHeading={true}
        showSubheading={true}
        showBottomSubheading={true}
        plansHeading='Compounded Semaglutide (GLP-1)'
        plansSubheading='Injection Plans'
        plansBottomSubheading='Every LumiMeds plan is HSA and FSA eligible, and you can spread payments over time with Klarna, Affirm, or Afterpay, without hidden costs.'
        textColor='#FFFFFF'
        subHeadingFontSize='27px'
        subHeadingFontFamily='Poppins'
        subHeadingFontWeight='700'
        subHeadingLineHeight='133%'
        headingFontSize='47px'
        headingFontFamily='Poppins'
        headingFontWeight='700'
        productTitle=''
        productSubtitle='Compounded Semaglutide (GLP-1) Injections'
        productTitleClassName='tw-text-white !tw-font-bold !tw-text-[22px] xl:!tw-text-[27px] !tw-font-poppins'
        productSubtitleClassName='tw-text-white !tw-font-normal !tw-text-[10px] sm:!tw-text-[12px] lg:!tw-text-[8px] xl:!tw-text-[13px] !tw-font-poppins tw-text-center sm:!tw-block md:!tw-inline'
        productDescriptionClassName='tw-text-white tw-text-center tw-text-[17px] tw-text-sm tw-px-4 tw-py-2 tw-mb-4 mt-3'
        productDescriptionByTier={{
          value: 'A three-month start to your weight-loss journey — guided and personalized for steady results.',
          monthly: 'Flexible month-to-month access with full support — a plan that adapts to you.',
        }}
        showProductDescription={true}
        showMultipleVials={true}
        productImageSectionClassName='!tw-mb-0'
        pricingSectionClassName='!tw-mb-0'
        showProductTitle={false}
        showProductTitleSuffix={false}
        badgeStyle={{
          background: '#FAAB2B',
          textColor: '#FFFFFF',
        }}
        badgeClassName='!tw-shadow-none !tw-mb-0'
        badgeTextClassName='!tw-text-[27px] !tw-font-bold !tw-text-center !tw-uppercase'
        badgeTextSuffix=' Plan'
        glpHeaderClassName='tw-flex tw-flex-col tw-items-center tw-justify-center !tw-mb-0'
        titleContainerClassName='!tw-flex !tw-flex-row !tw-justify-between !tw-items-center !tw-w-full max-sm:!tw-flex-col max-sm:!tw-items-start max-sm:!tw-gap-1 max-sm:!tw-justify-start'
        useHorizontalLayout={true}
        buttonStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          hoverBackgroundColor: '#FFFFF1',
        }}
        buttonClassName='!tw-font-bold !tw-font-Inter !tw-text-[21px] tw-w-full tw-mx-16'
        customPricingText='one payment of $399'
        testimonialsIntroText='From haunted by diets to happy with results — meet the real people who trusted LumiMeds to guide their transformation.'
      />

      <Testimonials />

      {/* Book A Consultation Button Section */}
      <section className='consultation-button-section'>
        <div className='container'>
          <div className='text-center'>
            <a href='mailto:help@lumimeds.com' className='consultation-button'>
              Book A Consultation
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
