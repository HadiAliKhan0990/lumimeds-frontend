import Glp1GipTreatment from '@/components/Ads/glp1-gip-treatment';
import { redirect } from 'next/navigation';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Compounded Tirzepatide GLP-1 GIP Weight Loss Treatment Plans | Lumimeds',
    description:
      'Start your treatment with Compounded Tirzepatide. You get clear dosing, simple pricing, and support from licensed providers. Choose a starter plan or a multi month option with steady progress and organized care.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/glp1-gip-treatment',
    },
    openGraph: {
      title: 'Compounded Tirzepatide GLP-1 GIP Weight Loss Treatment Plans | Lumimeds',
      description:
        'Start your treatment with Compounded Tirzepatide. You get clear dosing, simple pricing, and support from licensed providers. Choose a starter plan or a multi month option with steady progress and organized care.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/glp1-gip-treatment',
    },
  };
}

export default async function Glp1GipTreatmentPage() {
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

  return <Glp1GipTreatment data={data} />;
}
