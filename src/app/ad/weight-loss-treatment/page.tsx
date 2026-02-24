import { redirect } from 'next/navigation';
import WeightLossTreatment from '@/components/Ads/WeightLossTreatment';
import { fetchProducts } from '@/services/products';
import { fetchTrustpilotData } from '@/services/trustpilot';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Compounded Tirzepatide Weight Loss Treatment With Simple Plans | Lumimeds',
    description:
      'Start a clear Tirzepatide weight loss treatment plan with simple pricing and steady provider support. Get organized care built for your goals and your pace.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/weight-loss-treatment',
    },
    openGraph: {
      title: 'Compounded Tirzepatide Weight Loss Treatment With Simple Plans | Lumimeds',
      description:
        'Start a clear Tirzepatide weight loss treatment plan with simple pricing and steady provider support. Get organized care built for your goals and your pace.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/weight-loss-treatment',
    },
  };
}

export default async function Page() {
  const [data, trustpilotData] = await Promise.all([
    fetchProducts({
      keys: [
        {
          name: 'glp_1_plans',
          categories: ['weight_loss_glp_1_injection_recurring'],
          planTypeSort: PlanType.RECURRING,
        },
        {
          name: 'glp_1_gip_plans',
          categories: ['weight_loss_glp_1_gip_injection_recurring', 'weight_loss_glp_1_gip_injection_one_time'],
          planTypeSort: PlanType.RECURRING,
        },
      ],
    }),
    fetchTrustpilotData(),
  ]);

  // Check if both product categories are empty
  const hasGlp1Products = data.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasGlp1GipProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;

  // If both categories are empty, redirect to home page
  if (!hasGlp1Products && !hasGlp1GipProducts) {
    redirect('/');
  }

  return <WeightLossTreatment data={data} trustpilotData={trustpilotData} />;
}
