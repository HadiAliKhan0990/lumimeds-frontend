import { redirect } from 'next/navigation';
import FreeAds from '@/components/Ads/Free';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Compounded Tirzepatide GLP-1 GIP Weight Loss Injections | Lumimeds',
    description:
      'Start your treatment with Compounded Tirzepatide. You get clear dosing, simple plans, and support from licensed medical providers. Choose a monthly option or a multi month supply that fits your goals.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/free',
    },
    openGraph: {
      title: 'Compounded Tirzepatide GLP-1 GIP Weight Loss Injections | Lumimeds',
      description:
        'Start your treatment with Compounded Tirzepatide. You get clear dosing, simple plans, and support from licensed medical providers. Choose a monthly option or a multi month supply that fits your goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/free',
    },
  };
}

export default async function Page() {
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

  return <FreeAds data={data} />;
}
