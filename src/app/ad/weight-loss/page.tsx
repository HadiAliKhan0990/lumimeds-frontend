import { redirect } from 'next/navigation';
import WeightLoss from '@/components/Ads/weight-loss';
import { fetchProducts } from '@/services/products';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Personalized Tirzepatide Weight Loss Plans With Clear Pricing | Lumimeds',
    description:
      'Start a personalized Tirzepatide weight loss plan with simple pricing and licensed provider support. Get steady guidance and move toward your goals.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/weight-loss',
    },
    openGraph: {
      title: 'Personalized Tirzepatide Weight Loss Plans With Clear Pricing | Lumimeds',
      description:
        'Start a personalized Tirzepatide weight loss plan with simple pricing and licensed provider support. Get steady guidance and move toward your goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/weight-loss',
    },
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_one_time', 'weight_loss_glp_1_gip_injection_recurring'],
      },
    ],
  });

  // Check if any products are available - redirect immediately if no products
  const hasProducts = data?.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;

  if (!hasProducts) {
    redirect('/');
  }

  return <WeightLoss data={data} />;
}
