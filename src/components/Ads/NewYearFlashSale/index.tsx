'use client';

import Hero from './includes/Hero';
import Products from './includes/Products';
import WhyLumimeds from './includes/WhyLumimeds';

export default function NewYearFlashSalePage() {
  return (
    <div className='tw-bg-[radial-gradient(49.95%_49.95%_at_50%_50.05%,_#303030_0%,_#212121_100%)] lg:tw-pt-[72px] tw-pt-[100px]'>
      <Hero />
      <Products />
      <WhyLumimeds />
    </div>
  );
}
