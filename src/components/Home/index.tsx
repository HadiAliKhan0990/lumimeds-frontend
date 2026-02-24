'use client';

import CTABanner from '@/components/Home/CTABanner';
import FeaturedSlider from '@/components/Home/FeaturedSlider';
import Hero from '@/components/Home/Hero';
import AllPlans from '@/components/Home/AllPlans';
import Benefits from '@/components/Home/Benefits';
import HowItWorks from '@/components/Home/HowItWorks';
import Testimonials from '@/components/Home/Testimonials';
import WeightLossProgram from '@/components/Home/WeightLossProgram';
import AboutUs from '@/components/Home/AboutUs';
import Certification from '@/components/Certification';
import { useEffect} from 'react';
import { useIntercom } from 'react-use-intercom';
import { WeightLossSpecials } from '@/components/Home/WeightLossSpecials';
import { ProductsPlans } from '@/components/Home/ProductsPlans';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { useDispatch } from 'react-redux';
import { setMedicationsProductsData } from '@/store/slices/medicationsProductsDataSlice';
import { TrustpilotData } from '@/services/trustpilot';



interface HomeProps {
  data: ProductTypesResponseData;
  trustpilotData?: TrustpilotData;
}

export default function Home({ data, trustpilotData }: Readonly<HomeProps>) {
  const dispatch = useDispatch();
  const { boot } = useIntercom();

  useEffect(() => {
    dispatch(setMedicationsProductsData(data));
  }, [data, dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      boot();
    }, 1000); // Adjust the delay as needed

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  return (
    <>
      <Hero trustpilotData={trustpilotData} data={data}/>
      <CTABanner data={data} />
      <ProductsPlans data={data} />

      <FeaturedSlider />
      <WeightLossSpecials data={data} />

      <AllPlans />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      {/* <TrustpilotReviews /> */}
      <WeightLossProgram data={data} />
      <AboutUs />
      <Certification />
    </>
  );
}
