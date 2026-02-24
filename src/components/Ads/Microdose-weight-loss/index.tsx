import Hero from './includes/Hero';
import Products from './includes/Products';
import MicrodoseBanner from './includes/Microdose-banner';
import SocialProof from '@/components/Ads/SocialProof';
import WhyLumimeds from '@/components/Ads/WhyLumimeds';
import HowItWorks from '@/components/Ads/HowItWorks';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import FAQ from './includes/FAQ';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface Props {
  data: ProductTypesResponseData;
}

export default function MicrodoseWeightLossPage({ data }: Readonly<Props>) {
  return (
    <div>
      <div className='tw-bg-[#EDF3FF] lg:tw-pt-[72px] tw-pt-[100px]'>
        <Hero />
        <Products data={data} />
        <MicrodoseBanner />
        <SocialProof backgroundColor='#EDF3FF' />
        <div className='md:tw-bg-[linear-gradient(180deg,_#EDF3FF_15%,_#5E81BC_100%)] tw-bg-[#EDF3FF]'>
          <WhyLumimeds
            title='Why Lumimeds for'
            titleHighlight='Weight-Loss?'
            titleHighlightColor='tw-text-blue-46'
            textColor='tw-text-black-22'
            padding='tw-pt-24 tw-pb-20'
          />
          <TestimonialsSection
            backgroundColor='tw-bg-white'
            showTitle={false}
            titleTextClassName='tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[37px] tw-font-bold tw-leading-[133%] tw-text-black tw-mt-4 tw-font-poppins tw-text-center'
            className='tw-pt-0 tw-pb-0'
          />
          <p className='tw-text-black-22 tw-text-center tw-text-[13px] tw-tracking-[0.01%] tw-m-0 tw-font-lato tw-font-normal'>
            Individual results may vary.
          </p>
        </div>
        <div className='md:tw-bg-[#6082BD] tw-bg-[#EDF3FF]'>
          <HowItWorks
            productName='microdosed'
            backgroundColor='md:tw-bg-[#6082BD] tw-bg-[#EDF3FF]'
            numberColorDesktop='tw-text-white'
            subtitleStartColor='md:tw-text-white tw-text-blue-46'
            subtitleFinishColor='md:tw-text-white tw-text-blue-46'
          />
          <FAQ />
        </div>
      </div>
    </div>
  );
}
