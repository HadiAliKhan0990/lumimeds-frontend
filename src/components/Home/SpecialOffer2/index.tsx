'use client';

import './styles.css';
import { OlympiaCard2 } from './includes/OlympiaCard2';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface Props {
  data: ProductTypesResponseData;
}

const olympiaPlansV2 = [
  {
    id: '1',
    planLabel: 'Full 1-month supply at',
    description:
      'Start your journey with confidence. This plan offers a flexible, commitment-free introduction to our science-backed weight care program.',
  },
  {
    id: '2',
    planLabel: 'Full 2-month supply at',
    description:
      'Continue your momentum with two months of medication delivered all at once. Maintain flexibility while securing your progress.',
  },
  {
    id: '2',
    planLabel: 'Full 2-month supply at',
    description:
      '  Our best-value option for serious starters. Get three months of medication in one shipment and save while staying in control.',
  },
];

export default function SpecialOffer2({ data }: Readonly<Props>) {
  return (
    <section className='container olympia-plans'>
      <p className='text-center lumi-special'>503B GLP-1 Weight Loss Injection Specials</p>
      <p className='text-center description'>Discover a more advanced approach to weight care.</p>
      <p className='text-center description mb-4'>
        Our exclusive GLP-1 plan - compounded in a highly regarded 503B facility and GLP-1 Weight Loss Injections
        Monthly Subscription fulfilled by Olympia&apos;s trusted 503A pharmacy
      </p>
      {data.olympiaPlans?.products.map((product, index) => (
        <OlympiaCard2 key={product.id} product={product} staticDescription={olympiaPlansV2[index]?.description || ''} />
      ))}

      <p className='text-center mb-0 text-sm'>
        Compounded medications are available by prescription only. They are not FDA approved and have not been evaluated
        for safety and effectiveness by the FDA.&nbsp;
      </p>
    </section>
  );
}
