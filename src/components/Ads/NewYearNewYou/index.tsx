import Hero from './includes/Hero';
import Products from './includes/Products';
import SocialProof from './includes/SocialProof';
import WhyLumimeds from './includes/WhyLumimeds';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import HowItWorks from './includes/HowItWorks';
import FAQ from './includes/FAQ';
import GoodFit from './includes/GoodFit';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface Props {
  data: ProductTypesResponseData;
}

export default function NewYearNewYouPage({ data }: Readonly<Props>) {
  return (
    <div className='tw-bg-[#EDF3FF] lg:tw-pt-[72px] tw-pt-[100px] tw-font-lumitype'>
      <Hero />
      <Products data={data} />
      <SocialProof />
      <WhyLumimeds />
      <div className='tw-max-w-[1200px] tw-w-full tw-mx-auto tw-px-5'>
        <TrustpilotReviews className='trustpilot-testimonials-light' theme='light' />
      </div>
      <HowItWorks />
      <GoodFit />
      <FAQ />
    </div>
  );
}
