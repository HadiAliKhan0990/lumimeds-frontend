import ProductsSummary from '@/components/ProductsSummary';
import { fetchProducts } from '@/services/products';
import { Metadata } from 'next';
import '@/app/products/summary/styles.css';
import { getProductKeysForCategory } from '@/constants/productCategories';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Choose Your Weight Loss Plan | Lumimeds Pricing & Options',
    description:
      'Compare Lumimeds weight-loss treatment plans and choose the option that fits your goals. Review pricing, monthly and 3-month plans, and what each includes.',
    robots: 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/products/summary',
    },
    openGraph: {
      title: 'Choose Your Weight Loss Plan | Lumimeds Pricing & Options',
      description:
        'Compare Lumimeds weight-loss treatment plans and choose the option that fits your goals. Review pricing, monthly and 3-month plans, and what each includes.',
      type: 'website',
      url: 'https://www.lumimeds.com/products/summary',
    },
  };
}

interface Props {
  searchParams: Promise<{
    flow?: string;
    error?: string;
    sale_type?: string;
    overrideTime?: string;
    source?: string;
  }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { flow, error, sale_type, overrideTime, source } = await searchParams;

  const weightLossKeys = getProductKeysForCategory('weight_loss') ?? [];
  const isNadEnabled = process.env.NEXT_PUBLIC_NAD_ENABLED === 'true';
  const longevityKeys = isNadEnabled ? (getProductKeysForCategory('longevity') ?? []) : [];
  const keys = [...weightLossKeys, ...longevityKeys];

  const data = await fetchProducts({ keys });
  return (
    <div className='product-summary-bg product-summary-container pt-2 position-relative paginate'>
      <ProductsSummary error={error} data={data} flow={flow} source={source} saleType={sale_type} overrideTime={overrideTime === 'true'} />
    </div>
  );
}
