'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import HeroSection from './HeroSection';
import Specialities from '../easy-weight-loss/includes/Specialities';
import ProductCards from '../easy-weight-loss/includes/ProductCards';
import PaymentAdvertisement from '../easy-weight-loss/includes/PaymentAdvertisement';
import ContactSection from '../easy-weight-loss/includes/ContactSection';
import TestimonialsSection from '../easy-weight-loss/includes/TestimonialSection';
import '../easy-weight-loss/style.scss';
import PlansSection from '../WeightLossTreatment/includes/PlansSection';
import AdvertisementSectionIcon from '../../../assets/ads/healthy-weight-loss/AdvertisemenySectionIcon.png';
import ContactSectionBackground from '../../../assets/ads/healthy-weight-loss/ContactSectionBackground.png';

interface Props {
  data: ProductTypesResponseData;
}

export default function HealthyWeightLoss({ data }: Readonly<Props>) {
  return (
    <div className='tw-bg-[#FCFAF7] pt-6-custom'>
      <HeroSection />
      <PlansSection
        data={data.glp_1_gip_plans?.products ?? []}
        planLabelClassName='!tw-text-black !tw-bg-[#FCB545] !tw-font-normal'
        priceClassName='!tw-text-black !tw-font-normal'
        ctaButtonClassName='!tw-bg-black hover:!tw-bg-gray-800 !tw-rounded-[2222px]'
        planTitleClassName='!tw-capitalize'
        planSubtitle='Compounded Tirzepatide (GLP-1/GIP injections)'
        planSubtitleClassName='!tw-text-[16px] !tw-font-normal !tw-mb-3 !-tw-translate-y-4'
      />
      <Specialities font='font-dm-sans' />
      <ProductCards
        data={data}
        weightLossBadgeClassName='!tw-bg-black !tw-rounded-[222px]'
        inStockBadgeClassName='!tw-text-black !tw-border-black !tw-rounded-[222px]'
        productTitleClassName='!tw-text-black'
        getStartedButtonClassName='!tw-bg-black hover:!tw-bg-gray-800'
        learnMoreButtonClassName='hover:!tw-bg-gray-800 hover:!tw-text-white'
      />
      <PaymentAdvertisement
        containerClassName='!tw-bg-none !tw-bg-white !tw-border !tw-border-solid'
        font='!tw-font-normal'
        iconImage={AdvertisementSectionIcon}
      />
      <TestimonialsSection />
      <ContactSection backgroundImage={ContactSectionBackground} />
    </div>
  );
}
