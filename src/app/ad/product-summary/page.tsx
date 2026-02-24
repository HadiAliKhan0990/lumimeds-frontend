import ProductsSummary from '@/components/ProductsSummary';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';
import '@/app/ad/product-summary/styles.css';
import { GOOGLE_MERCHANT_SOURCE } from '@/constants';
import Navbar from '@/components/Navbar';
import GoogleShoppingTryFooter from '@/components/Ads/GoogleShoppingTry/includes/Footer';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Choose Your Weight Loss Plan | GLP-1/GIP Options | Lumimeds',
  description:
    'Compare GLP-1/GIP weight-loss treatment plans and choose the option that fits your goals. Transparent pricing, telehealth consults, and ongoing support.',
  robots: 'noindex, nofollow',
  alternates: {
    canonical: 'https://www.lumimeds.com/ad/product-summary',
  },
  openGraph: {
    title: 'Choose Your Weight Loss Plan | GLP-1/GIP Options | Lumimeds',
    description:
      'Compare GLP-1/GIP weight-loss treatment plans and choose the option that fits your goals. Transparent pricing, telehealth consults, and ongoing support.',
    type: 'website',
    url: 'https://www.lumimeds.com/ad/product-summary',
  },
};

interface Props {
  searchParams: Promise<{
    flow?: string;
    error?: string;
    source?: string;
    sale_type?: string;
    overrideTime?: string;
  }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { flow, error, source, sale_type, overrideTime } = await searchParams;

  const isGoogleMerchant = source === GOOGLE_MERCHANT_SOURCE;

  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_one_time'],
        planTypeSort: PlanType.ONE_TIME,
        sortOrder: 'DESC',
      },
    ],
  });

  if (isGoogleMerchant) {
    return (
        <div className='tw-relative'>
          <Navbar />
          <div
            className={`product-summary-bg product-summary-container position-relative paginate${
              isGoogleMerchant ? ' google-merchant-product-summary' : ''
            }`}
          >
            <ProductsSummary error={error} data={data} flow={flow} source={source} saleType={sale_type} overrideTime={overrideTime === 'true'} />
          </div>
          <GoogleShoppingTryFooter logoColor='#4685F4' variant='light' />
        </div>
    );
  }

  return (
    <div
      className={`product-summary-bg product-summary-container position-relative paginate${
        isGoogleMerchant ? ' google-merchant-product-summary' : ''
      }`}
    >
    <ProductsSummary error={error} data={data} flow={flow} source={source} saleType={sale_type} overrideTime={overrideTime === 'true'} />
  </div>  
  )
}

