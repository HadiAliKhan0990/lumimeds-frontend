import EasyWeightLoss from "@/components/Ads/easy-weight-loss";
import { fetchProducts } from '@/services/products';
import { redirect } from 'next/navigation';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Safe GLP-1 Weight Loss Injections and Personalized Plans | Lumimeds',
    description:
      'Lose weight with GLP-1 and GLP-1/GIP injections, physician support, and simple monthly delivery. Choose an affordable plan with clear pricing and no hidden fees. Start your journey today.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/easy-weight-loss',
    },
    openGraph: {
      title: 'Safe GLP-1 Weight Loss Injections and Personalized Plans | Lumimeds',
      description:
        'Lose weight with GLP-1 and GLP-1/GIP injections, physician support, and simple monthly delivery. Choose an affordable plan with clear pricing and no hidden fees. Start your journey today.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/easy-weight-loss',
    },
  };
}

export default async function EasyWeightLossPage() {
  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_recurring', 'weight_loss_glp_1_gip_injection_one_time'],
        planTypeSort: PlanType.RECURRING,
      },
      {
        name: 'glp_1_plans',
        categories: ['weight_loss_glp_1_injection_recurring'],
        planTypeSort: PlanType.RECURRING,
      },
    ],
  });

  // Check if any products are available in either category
  const hasGLP1Products = data.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasAnyProducts = hasGLP1Products || hasGLP1GIPProducts;

  // Redirect to home page if no products are available
  if (!hasAnyProducts) {
    redirect('/');
  }

  return <EasyWeightLoss data={data} />;
}
