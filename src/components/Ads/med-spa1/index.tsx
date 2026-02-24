'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import HeroSection from './HeroSection';
import MedSpa3Success from '../med-spa-3/includes/med-spa-3-success';
import ProductListSustainable from '@/components/Ads/glp1-program/includes/PlanSection2/ProductListSustainable';
import { useTranslations } from 'next-intl';
import './styles.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function MedSpa1Page({ data }: Readonly<Props>) {
  const t = useTranslations('medSpa1');
  const tAnalytics = useTranslations('medSpa1.analytics');
  const tProductListSustainable = useTranslations('productListSustainable');

  return (
    <>
      <HeroSection data={data} t={t} />
      <TestimonialsSection showTitle />
      <MedSpa3Success backgroundColor='linear-gradient(90deg, #3060FE, #90A4FF)' color='white' t={tAnalytics} />
      <div className='pt-5 pt-md-0 product-list-sustainable'>
        <ProductListSustainable
          showBottomSubheading={false}
          productsData={data}
          backgroundColor='#FFFFFF'
          cardBackgroundColor='#CFD2FF'
          headingColor='#3060FE'
          subHeadingColor='#3060FE'
          priceColor='#3060FE'
          popularTagColor='#000000'
          showHeading={false}
          showSubheading={false}
          buttonStyle={{
            backgroundColor: '#3060FE',
            textColor: '#FFFFFF',
            hoverBackgroundColor: '#1E4BCC',
          }}
          t={tProductListSustainable}
        />
      </div>
    </>
  );
}
