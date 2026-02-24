import Christmas from '@/components/Ads/holiday-weight-goals';
import { redirect } from 'next/navigation';
import { fetchProducts } from '@/services/products';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Holiday Weight Loss Plans | LumiMeds',
    description:
      'Achieve your weight goals with LumiMeds this holiday season. Get personalized injection plans and support to stay on track and feel great entering the new year.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/holiday-weight-goals',
    },
    openGraph: {
      title: 'Holiday Weight Loss Plans | LumiMeds',
      description:
        'Achieve your weight goals with LumiMeds this holiday season. Get personalized injection plans and support to stay on track and feel great entering the new year.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/holiday-weight-goals',
    },
  };
}

export default async function Page() {
  const [data] = await Promise.all([
    fetchProducts({
      keys: [
        {
          name: 'glp_1_gip_plans',
          categories: ['weight_loss_glp_1_gip_injection_one_time', 'weight_loss_glp_1_gip_injection_recurring'],
        },
        {
          name: 'glp_1_plans',
          categories: ['weight_loss_glp_1_injection_recurring'],
        },
      ],
    }),
  ]);

  // Check if any products are available - redirect immediately if no products
  const hasGLP1GIPProducts = data?.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasGLP1Products = data?.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasProducts = hasGLP1GIPProducts || hasGLP1Products;

  if (!hasProducts) {
    redirect('/');
  }

  return <Christmas data={data} />;
}
