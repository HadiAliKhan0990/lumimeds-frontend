import { redirect } from 'next/navigation';
import SustainableWeightLoss from '@/components/Ads/sustainable-weight-loss';
import { fetchProducts } from '@/services/products';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Semaglutide Weight Loss Plans With Simple Pricing and Guided Support | Lumimeds',
    description:
      'Start a Semaglutide weight loss plan with clear pricing and licensed support. Pick a monthly or value option and follow a guided program built to fit your goals.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/sustainable-weight-loss',
    },
    openGraph: {
      title: 'Semaglutide Weight Loss Plans With Simple Pricing and Guided Support | Lumimeds',
      description:
        'Start a Semaglutide weight loss plan with clear pricing and licensed support. Pick a monthly or value option and follow a guided program built to fit your goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/sustainable-weight-loss',
    },
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [
      { name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] },
      { name: 'glp_1_gip_plans', categories: ['weight_loss_glp_1_gip_injection_one_time'] },
      { name: 'glp_1_plans', categories: ['weight_loss_glp_1_injection_recurring'] },
    ],
  });

  // Check if any products are available - redirect immediately if no products
  const hasProducts =
    (data?.glp_1_plans?.products && data.glp_1_plans.products.length > 0) ||
    (data?.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0) ||
    (data?.olympiaPlans?.products && data.olympiaPlans.products.length > 0);

  if (!hasProducts) {
    redirect('/');
  }

  return <SustainableWeightLoss data={data} />;
}
