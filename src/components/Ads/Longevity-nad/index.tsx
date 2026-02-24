import Hero from './includes/HeroBanner';
import Products from './includes/Products';
import NadBanner from './includes/NadBanner';
import SocialProof from '@/components/Ads/SocialProof';
import WhyLumimeds from '@/components/Ads/WhyLumimeds';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import HowItWorks from '@/components/Ads/HowItWorks';
import FAQ from './includes/FAQ';
import { ROUTES } from '@/constants';

export default function LongevityNadPage() {
  return (
    <div className='tw-bg-white tw-pt-[72px]'>
      <Hero />
      <Products />
      <NadBanner />
      <SocialProof backgroundColor='#D7E9FF' />
      <div className='md:tw-py-[6.944vw] tw-pt-24 tw-pb-16 tw-bg-blue-46'>
        <WhyLumimeds title='Why Lumimeds for Longevity?' textColor='tw-text-white' padding='tw-pb-0' />
        <div className='tw-max-w-[1200px] tw-w-full tw-mx-auto tw-px-5'>
          <TrustpilotReviews className='trustpilot-testimonials-dark' theme='dark' />
        </div>
        <p className='tw-text-white tw-text-center tw-text-[13px] tw-tracking-[0.01em] tw-m-0 tw-font-lato tw-font-normal'>
          Individual results may vary.
        </p>
      </div>
      <HowItWorks
        productName='NAD+'
        backgroundColor='tw-bg-white'
        buttonBackgroundColor='tw-bg-blue-46 hover:tw-bg-blue-400'
        buttonBackgroundColorMobile='tw-bg-blue-46 hover:tw-bg-blue-400'
        formRoute={ROUTES.LONGEVITY_PATIENT_INTAKE}
        numberColor='tw-text-[#4685F4]'
        numberColorDesktop='tw-text-[#4685F4]'
        subtitleStartColor='tw-text-[#4685F4]'
        subtitleFinishColor='tw-text-[#4685F4]'
      />
      <FAQ />
    </div>
  );
}
