import { redirect } from 'next/navigation';
import SustainedAd from '@/components/Ads/Sustained';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tirzepatide Weight Loss Injection Plans With Clear Pricing | Lumimeds',
    description:
      'Start a Tirzepatide weight loss plan with clear monthly or 3 month pricing. Get guided care from licensed providers and stay on track with steady support.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/sustained',
    },
    openGraph: {
      title: 'Tirzepatide Weight Loss Injection Plans With Clear Pricing | Lumimeds',
      description:
        'Start a Tirzepatide weight loss plan with clear monthly or 3 month pricing. Get guided care from licensed providers and stay on track with steady support.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/sustained',
    },
  };
}

export default async function SustainedPage() {
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

  return <SustainedAd data={data} />;
}
