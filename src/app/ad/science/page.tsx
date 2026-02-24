import { redirect } from 'next/navigation';
import ScienceAd from '@/components/Ads/science';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'GLP-1 GIP Weight Loss Plans With Clear Pricing and Trusted Care | Lumimeds',
    description:
      'Start a clear GLP-1 GIP weight loss plan with simple pricing and licensed support. Choose a plan that fits your goals and get guided care from trusted providers.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/science',
    },
    openGraph: {
      title: 'GLP-1 GIP Weight Loss Plans With Clear Pricing and Trusted Care | Lumimeds',
      description:
        'Start a clear GLP-1 GIP weight loss plan with simple pricing and licensed support. Choose a plan that fits your goals and get guided care from trusted providers.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/science',
    },
  };
}

export default async function ScienceAdPage() {
  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_recurring', 'weight_loss_glp_1_gip_injection_one_time'],
        planTypeSort: PlanType.RECURRING,
      },
    ],
  });

  const hasProducts = data?.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;

  if (!hasProducts) {
    redirect('/');
  }

  return <ScienceAd data={data} />;
}
